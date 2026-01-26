import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.db_service import initialize_db_pool, get_db_session
from sqlalchemy import text
from datetime import datetime, timezone

async def reset_status():
    await initialize_db_pool()
    async with get_db_session() as session:
        # Reset the stuck trip plan status to failed
        await session.execute(text(
            'UPDATE trip_plan_status '
            'SET status = \'failed\', '
            'error = \'Previous generation was interrupted. Please retry.\', '
            '"completedAt" = NOW() '
            'WHERE "tripPlanId" = \'cmkutczx300012ub08jlsob7k\' '
            'AND status = \'processing\''
        ))
        await session.commit()
        print('Trip plan status reset to failed. User can now retry.')

asyncio.run(reset_status())
