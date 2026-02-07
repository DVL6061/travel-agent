"""
Train Search Agent
Uses station codes (like airport codes) to search for Indian Railway trains.
The AI converts city names to station codes automatically.
"""

from agno.agent import Agent
from tools.indian_train import get_indian_trains
from config.llm import model


# --- TRAIN SEARCH AGENT ---
train_search_agent = Agent(
    name="Train Search Assistant",
    model=model,
    tools=[
        get_indian_trains,
    ],
    instructions=[
        "You are an expert Indian Railways train search tool. You MUST follow these STRICT RULES when calling the 'get_trains' tool:",
        "",
        "1. STRICT PARAMETER MAPPING:",
        "   - 'source': Use Indian railway station code (e.g., 'NDLS' for New Delhi, 'BCT' for Mumbai Central)",
        "   - 'destination': Use Indian railway station code",
        "   - 'date': Use ONLY 'YYYY-MM-DD' format",
        "   - 'adults': MUST be an integer",
        "   - 'children': MUST be an integer",
        "   - 'preferred_class': MUST be one of: '1A', '2A', '3A', 'SL', 'GEN', or 'any'",
        "",
        "2. COMMON STATION CODES (use your knowledge for others):",
        "   - New Delhi: NDLS",
        "   - Delhi Junction: DLI",
        "   - Mumbai Central: BCT",
        "   - Mumbai CST: CSMT",
        "   - Chennai Central: MAS",
        "   - Kolkata Howrah: HWH",
        "   - Bangalore City: SBC",
        "   - Hyderabad: HYB / SC (Secunderabad)",
        "   - Ahmedabad: ADI",
        "   - Pune: PUNE",
        "   - Jaipur: JP",
        "   - Goa Madgaon: MAO",
        "   - Lucknow: LKO",
        "   - Varanasi: BSB",
        "",
        "3. WORKFLOW:",
        "   - First, convert city names to station codes using your knowledge",
        "   - Then, call 'get_trains' with the correctly formatted station codes",
        "   - Finally, extract and format train details for the final report",
        "",
        "4. TRAIN DATA TO EXTRACT:",
        "   - train_number, train_name",
        "   - departure_station, arrival_station (with codes)",
        "   - departure_time, arrival_time",
        "   - duration, distance",
        "   - classes_available (1A, 2A, 3A, SL, GEN)",
        "   - fare_1ac, fare_2ac, fare_3ac, fare_sleeper, fare_general",
        "   - train_type (Rajdhani, Shatabdi, Express, etc.)",
        "   - pantry_available, running_days",
        "   - booking_url (use the source URL from search results, e.g. indiarailinfo.com, railyatri.in, erail.in, trainman.in, etc.)",
        "",
        "5. FORBIDDEN BEHAVIOR:",
        "   - NEVER use city names directly as station codes",
        "   - NEVER skip fare information if available",
        "   - NEVER return trains that don't run on the requested date",
    ],
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
      - booking_url (str): Source URL from search results (indiarailinfo.com, railyatri.in, erail.in, trainman.in, etc.)
    """,
    markdown=True,
)
