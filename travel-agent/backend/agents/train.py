"""
Train Search Agent
Uses station codes (like airport codes) to search for Indian Railway trains.
The AI converts city names to station codes automatically.
"""

from agno.agent import Agent
from tools.indian_train_mcp import get_mcp_tools, TRAIN_MCP_AGENT_INSTRUCTIONS
from config.llm import model


# --- TRAIN SEARCH AGENT ---
train_search_agent = Agent(
    name="Train Search Assistant",
    model=model,
    tools=[
        get_mcp_tools(),
    ],
    instructions=TRAIN_MCP_AGENT_INSTRUCTIONS,
    expected_output="""
      Detailed train list including:
      - train_number (str): The train number (e.g., '12951')
      - train_name (str): The train name (e.g., 'Mumbai Rajdhani Express')
      - departure_station (str): Station with code (e.g., 'New Delhi (NDLS)')
      - arrival_station (str): Station with code (e.g., 'Mumbai Central (BCT)')
      - departure_time (str): Departure time (e.g., '04:55 PM')
      - arrival_time (str): Arrival time (e.g., '08:35 AM (+1 day)')
      - duration (str): Journey duration (e.g., '15h 40m')
      - distance (str): Total distance (e.g., '1,384 km')
      - running_days (str): Days train runs (e.g., 'Mon, Wed, Fri, Sun')
      - classes_available (list): Available classes (e.g., ['1A', '2A', '3A', 'SL'])
      - fare_1ac, fare_2ac, fare_3ac, fare_sleeper, fare_general (str): Fares for each class
      - train_type (str): Type of train (e.g., 'Rajdhani')
      - pantry_available (str): Food service (e.g., 'Yes')
      - stops (int): Number of stops
      - booking_url (str): URL for booking (e.g., 'https://www.irctc.co.in/')
    """,
    markdown=True,
)
