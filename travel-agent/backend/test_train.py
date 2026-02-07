r"""
Test script for Train Search Agent
Run this to test train search without starting the full backend server.

Usage:
    cd backend
    .\venv\Scripts\activate
    python test_train.py
"""

# IMPORTANT: Load .env FIRST before any imports that use environment variables
from dotenv import load_dotenv
load_dotenv()

import asyncio
from agno.agent import Agent
from tools.indian_train import get_indian_trains
from config.llm import model


# --- IMPROVED INSTRUCTIONS (Same as website agent in agents/train.py) ---
TRAIN_AGENT_INSTRUCTIONS = [
    "You are an expert Indian Railways train search assistant. Your job is to find trains and EXTRACT structured data from the search results.",
    "",
    "1. STATION CODE CONVERSION:",
    "   - Convert city names to Indian Railway station codes before searching",
    "   - Common codes: Delhi=NDLS, Mumbai Central=BCT, Mumbai CST=CSMT, Chennai=MAS, Kolkata=HWH, Bangalore=SBC",
    "   - Ahmedabad=ADI, Pune=PUNE, Jaipur=JP, Hyderabad=HYB, Goa=MAO, Lucknow=LKO, Varanasi=BSB",
    "",
    "2. PARSING RAW SEARCH RESULTS:",
    "   - The search tool returns raw content from railway websites (indiarailinfo.com, railyatri.in, erail.in, trainman.in)",
    "   - You MUST parse this raw content and extract structured train information",
    "   - Look for patterns like '12952MMCT TEJAS RAJ' which means Train#12952 named 'MMCT Tejas Rajdhani'",
    "   - Duration is usually in format like '15.40 hr' or '15h 40m'",
    "   - Departure times are in 24hr format like '16:55' or 12hr like '4:55 PM'",
    "",
    "3. REQUIRED OUTPUT FORMAT - Extract these fields for EACH train:",
    "   - train_number: The 5-digit train number (e.g., '12952')",
    "   - train_name: Full train name (e.g., 'Mumbai Rajdhani Express')",
    "   - departure_station: Station with code (e.g., 'New Delhi (NDLS)')",
    "   - arrival_station: Station with code (e.g., 'Mumbai Central (BCT)')",
    "   - departure_time: When train leaves (e.g., '16:55' or '4:55 PM')",
    "   - arrival_time: When train arrives (e.g., '08:35 (+1 day)')",
    "   - duration: Journey time (e.g., '15h 40m')",
    "   - classes_available: Available classes (e.g., '1A, 2A, 3A, SL')",
    "   - fare_estimate: Approximate fare if available (e.g., '₹2,500 - ₹5,000')",
    "   - running_days: Which days train runs (e.g., 'Daily' or 'Mon, Wed, Fri')",
    "   - booking_url: The SOURCE URL from search results where user can find more info",
    "",
    "4. PRESENTATION FORMAT:",
    "   - Present each train in a clear, structured format",
    "   - Use markdown tables or bullet points",
    "   - Include the source URL for each train so users can verify/book",
    "   - List top 5 trains sorted by fastest duration or earliest departure",
    "",
    "5. FORBIDDEN BEHAVIOR:",
    "   - NEVER say 'I could not find trains' if the search returned results",
    "   - NEVER just return links without extracting train data",
    "   - NEVER skip parsing the raw content - you MUST extract structured info",
    "   - ALWAYS provide at least 3-5 trains if search results contain train data",
]


async def test_train():
    """Test the train search agent with a sample domestic India route."""
    
    agent = Agent(
        model=model,
        tools=[get_indian_trains],
        instructions=TRAIN_AGENT_INSTRUCTIONS,
        expected_output="""
        A structured list of trains with the following details for each:
        - Train Number and Name
        - Departure and Arrival stations (with codes)
        - Departure and Arrival times
        - Duration
        - Available classes
        - Approximate fares
        - Running days
        - Source URL for booking/more info
        
        Format as a clear markdown table or structured list.
        """,
        markdown=True,
    )
    
    # Test route: Delhi to Mumbai (popular domestic route)
    query = """
    Find me trains from Delhi to Mumbai for February 15, 2026.
    I need trains with AC classes available.
    Please provide top 3-5 trains with their schedules and fares.
    
    IMPORTANT: Parse the search results and extract structured train data.
    Do NOT just return links - extract actual train numbers, names, times, and fares.
    """
    
    print("=" * 70)
    print("🚂 TRAIN SEARCH AGENT TEST (with improved parsing instructions)")
    print("=" * 70)
    print(f"Query: Delhi → Mumbai on Feb 15, 2026")
    print("=" * 70)
    print("\n⏳ Searching for trains and parsing results...\n")
    
    response = await agent.arun(query)
    
    print("=" * 70)
    print("📋 STRUCTURED RESPONSE")
    print("=" * 70)
    print(response.messages[-1].content)
    print("=" * 70)


async def test_train_with_custom_route():
    """Test with a custom route - you can modify this."""
    
    agent = Agent(
        model=model,
        tools=[get_indian_trains],
        instructions=TRAIN_AGENT_INSTRUCTIONS,
        expected_output="Structured train list with all details in markdown format.",
        markdown=True,
    )
    
    # Change these values to test different routes
    source = "Ahmedabad"
    destination = "Mumbai"
    date = "2026-02-10"
    
    query = f"""
    Find trains from {source} to {destination} on {date}.
    Show top 5 trains with complete details.
    
    IMPORTANT: Parse the raw search results and extract:
    - Train numbers and names
    - Departure/arrival times
    - Duration
    - Fares for different classes
    - Source URLs
    """
    
    print("=" * 70)
    print("🚂 CUSTOM ROUTE TEST")
    print("=" * 70)
    print(f"Query: {source} → {destination} on {date}")
    print("=" * 70)
    print("\n⏳ Searching for trains...\n")
    
    response = await agent.arun(query)
    
    print("=" * 70)
    print("📋 RESPONSE")
    print("=" * 70)
    print(response.messages[-1].content)
    print("=" * 70)


if __name__ == "__main__":
    print("\n" + "🚂" * 35 + "\n")
    
    # Run default test (Delhi to Mumbai)
    asyncio.run(test_train())
    
    # Uncomment below to test Ahmedabad → Mumbai
    # asyncio.run(test_train_with_custom_route())
