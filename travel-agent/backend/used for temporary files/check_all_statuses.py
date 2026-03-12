import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.db_service import initialize_db_pool, get_db_session
from sqlalchemy import text

async def check_all():
    await initialize_db_pool()
    async with get_db_session() as session:
        result = await session.execute(text('SELECT "tripPlanId", status, "currentStep", error FROM trip_plan_status'))
        rows = result.all()
        for row in rows:
            print(f"ID: {row[0]}, Status: {row[1]}, Step: {row[2]}, Error: {row[3]}")

if __name__ == "__main__":
    asyncio.run(check_all())
