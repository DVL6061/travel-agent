import asyncio
from agno.agent import Agent
from tools.google_flight import get_google_flights
from config.llm import model
from dotenv import load_dotenv

load_dotenv()

async def test_flight():
    agent = Agent(
        model=model,
        tools=[get_google_flights],
        instructions=["You are a flight assistant. Find a flight from HYD to DEL for 2026-03-01."]
    )
    
    response = await agent.arun("Find me a flight from Hyderabad to Delhi on March 1st, 2026.")
    print("--- RESPONSE ---")
    print(response.messages[-1].content)

if __name__ == "__main__":
    asyncio.run(test_flight())
