from prisma import Prisma
import asyncio
import json

async def check_last_plan():
    prisma = Prisma()
    await prisma.connect()
    
    # Get the latest trip plan
    plan = await prisma.trip_plan.find_first(order={'createdAt': 'desc'})
    if not plan:
        print("No plans found")
        return
        
    print(f"Plan ID: {plan.id}")
    print(f"Destination: {plan.destination}")
    
    # Get the output
    output = await prisma.trip_plan_output.find_first(
        where={'tripPlanId': plan.id},
        order={'createdAt': 'desc'}
    )
    
    if not output:
        print("No output found for this plan")
        return
        
    itinerary_data = json.loads(output.itinerary)
    
    print("\n--- AGENT RESPONSES ---")
    for key in itinerary_data.keys():
        if key.endswith("_agent_response"):
            content = itinerary_data[key]
            print(f"{key}: {len(content)} chars")
            if len(content) < 100:
                print(f"  Content: {content}")

    print("\n--- CONVERTED ITINERARY (json_response_output) ---")
    try:
        itinerary = json.loads(itinerary_data['itinerary'])
        print(f"Day-by-day count: {len(itinerary.get('day_by_day_plan', []))}")
        print(f"Hotels count: {len(itinerary.get('hotels', []))}")
        print(f"Flights count: {len(itinerary.get('flights', []))}")
        print(f"Attractions count: {len(itinerary.get('attractions', []))}")
        print(f"Restaurants count: {len(itinerary.get('restaurants', []))}")
    except Exception as e:
        print(f"Error parsing itinerary JSON: {e}")

    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(check_last_plan())
