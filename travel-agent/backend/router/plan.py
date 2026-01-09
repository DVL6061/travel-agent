import asyncio
import traceback
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from loguru import logger
from models.travel_plan import TravelPlanAgentRequest, TravelPlanResponse
from models.plan_task import TaskStatus
from services.plan_service import generate_travel_plan
from repository.plan_task_repository import create_plan_task, update_task_status
from typing import List

router = APIRouter(prefix="/api/plan", tags=["Travel Plan"])


def handle_task_exception(task: asyncio.Task):
    """Callback to handle exceptions from background tasks."""
    try:
        exc = task.exception()
        if exc:
            logger.error(f"Background task failed with exception: {exc}")
            logger.error(f"Traceback: {''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))}")
    except asyncio.CancelledError:
        logger.warning("Background task was cancelled")
    except Exception as e:
        logger.error(f"Error in exception handler: {e}")


@router.post(
    "/trigger",
    response_model=TravelPlanResponse,
    summary="Trigger Trip Craft Agent",
    description="Triggers the travel plan agent with the provided travel details",
)
async def trigger_trip_craft_agent(
    request: TravelPlanAgentRequest,
) -> TravelPlanResponse:
    """
    Trigger the trip craft agent to create a personalized travel itinerary.

    Args:
        request: Travel plan request containing trip details and plan ID

    Returns:
        TravelPlanResponse: Success status and trip plan ID
    """
    try:
        logger.info(f"Triggering travel plan agent for trip ID: {request.trip_plan_id}")
        logger.info(f"Travel plan details: {request.travel_plan}")

        # Create initial task
        task = await create_plan_task(
            trip_plan_id=request.trip_plan_id,
            task_type="travel_plan_generation",
            input_data=request.travel_plan.model_dump(),
        )

        logger.info(f"Task created: {task.id}")

        # Create background task for plan generation
        async def generate_plan_with_tracking():
            try:
                logger.info(f"[Task {task.id}] Starting plan generation for trip: {request.trip_plan_id}")
                
                # Update task status to in progress when service starts
                await update_task_status(task.id, TaskStatus.in_progress)
                logger.info(f"[Task {task.id}] Status updated to in_progress")

                result = await generate_travel_plan(request)

                # Update task with success status and output
                await update_task_status(
                    task.id, TaskStatus.success, output_data={"travel_plan": result}
                )
                logger.info(f"[Task {task.id}] Completed successfully!")
                
            except Exception as e:
                error_msg = f"{type(e).__name__}: {str(e)}"
                logger.error(f"[Task {task.id}] Error generating travel plan: {error_msg}")
                logger.error(f"[Task {task.id}] Full traceback:\n{traceback.format_exc()}")
                
                # Update task with error status
                try:
                    await update_task_status(
                        task.id, TaskStatus.error, error_message=error_msg
                    )
                    logger.info(f"[Task {task.id}] Status updated to error")
                except Exception as update_error:
                    logger.error(f"[Task {task.id}] Failed to update error status: {update_error}")

        # Create background task with exception handler
        background_task = asyncio.create_task(generate_plan_with_tracking())
        background_task.add_done_callback(handle_task_exception)

        logger.info(
            f"Travel plan agent triggered successfully for trip ID: {request.trip_plan_id}"
        )

        return TravelPlanResponse(
            success=True,
            message="Travel plan agent triggered successfully",
            trip_plan_id=request.trip_plan_id,
        )

    except Exception as e:
        logger.error(f"Error triggering travel plan agent: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger travel plan agent: {str(e)}",
        )
