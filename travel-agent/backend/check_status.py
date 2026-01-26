import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.db_service import initialize_db_pool, get_db_session
from sqlalchemy import text

async def check_status():
    await initialize_db_pool()
    async with get_db_session() as session:
        result = await session.execute(text(
            'SELECT status, "currentStep", error, "startedAt", "completedAt" '
            'FROM trip_plan_status '
            'WHERE "tripPlanId" = \'cmkp2umxh00012ukg65fpv2t2\''
        ))
        row = result.fetchone()
        if row:
            print(f'Status: {row[0]}')
            print(f'Current Step: {row[1]}')
            print(f'Error: {row[2]}')
            print(f'Started At: {row[3]}')
            print(f'Completed At: {row[4]}')
        else:
            print('No status found for this trip')

asyncio.run(check_status())
