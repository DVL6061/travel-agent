r"""
Test script for Train Search Agent
Run this to test train search without starting the full backend server.

Usage:
    cd backend
    .\venv\Scripts\activate
    python test_train.py
"""

r'''
# IMPORTANT: Load .env FIRST before any imports that use environment variables
from dotenv import load_dotenv
load_dotenv()

import asyncio
from agno.agent import Agent
from tools.new_logic_Indian_train import get_indian_trains
from config.llm import model


# --- UPDATED ORCHESTRATION INSTRUCTIONS ---
TRAIN_AGENT_INSTRUCTIONS = [
    "You are a Senior Developer for a Trip Planning Agent. Your goal is to fetch real-time Indian Railway data using a multi-step verification flow.",
    "",
    "1. STEP 1: DISCOVERY (GET TRAIN NUMBERS)",
    "   - Use the tool to query 'site:erail.in trains between [Source] and [Destination]'.",
    "   - Extract the 5-digit Train Numbers first. This is your primary key for all other data.",
    "",
    "2. STEP 2: FARE & CLASS VALIDATION",
    "   - For the identified train numbers, use the tool to query 'site:ixigo.com [Train Number] fares'.",
    "   - Extract class-specific pricing (SL, 3A, 2A, 1A) and any dynamic pricing alerts.",
    "",
    "3. STEP 3: REAL-TIME AVAILABILITY & PREDICTION",
    "   - Use the tool to query 'site:confirmtkt.com [Train Number] availability [Date]'.",
    "   - Identify if seats are AVAILABLE or WL (Waitlisted).",
    "   - If waitlisted, look for 'Confirmation Probability' percentages.",
    "",
    "4. STEP 4: LIVE STATUS (LATENCY CHECK)",
    "   - Use the tool to query 'site:enquiry.indianrail.gov.in live status [Train Number]'.",
    "   - Check if the train is currently running on time or has frequent delays.",
    "",
    "5. REQUIRED OUTPUT FORMAT (JSON-LIKE MARKDOWN):",
    "   - Present each train in a clear, structured table including:",
    "     - train_number: (e.g., '12952')",
    "     - train_name: (e.g., 'Mumbai Rajdhani')",
    "     - availability_status: (e.g., 'Available 0045' or 'WL 12 - 80% Chance')",
    "     - fare_breakdown: (e.g., '3A: ₹2100, 2A: ₹2800')",
    "     - live_delay_info: (e.g., 'Usually on time' or '15m avg delay')",
    "     - source_url: The direct link to the data source for the user to book.",
    "",
    "6. STATION CODE CONVERSION:",
    "   - Delhi=NDLS, Mumbai Central=MMCT, Mumbai CST=CSMT, Ahmedabad=ADI, Bangalore=SBC, etc.",
    "",
    "7. FORBIDDEN BEHAVIOR:",
    "   - NEVER give up after one search. If one site (e.g., Erail) fails, try another (e.g., Trainman).",
    "   - ALWAYS prioritize data from site:confirmtkt.com for availability as it is the most scraper-friendly.",
]


async def test_train():
    """Test the train search agent with a sample domestic India route."""
    
    agent = Agent(
        model=model,
        tools=[get_indian_trains],
        instructions=TRAIN_AGENT_INSTRUCTIONS,
        expected_output="""
        A structured itinerary report with:
        - Train Number & Name
        - Route details (Stations/Times)
        - Real-time Availability (from ConfirmTkt)
        - Accurate Fares (from Ixigo/MMT)
        - Performance/Delay info (from NTES)
        
        Format as a professional developer-style markdown table.
        """,
        markdown=True,
    )
    
    # Updated query to trigger the sequential logic
    query = """
    Plan a trip from Delhi to Mumbai for February 15, 2026.
    
    DEVELOPER WORKFLOW:
    1. First, find all train numbers between NDLS and MMCT for this date using erail.in.
    2. Then, pick the top 3 fastest trains and check their seat availability on confirmtkt.com.
    3. Finally, get the exact fares for 3A and 2A classes from ixigo.com.
    
    Provide a combined table with all this data.
    """
    
    print("=" * 70)
    print("🚂 TRAIN AGENT: MULTI-SOURCE ORCHESTRATION TEST")
    print("=" * 70)
    print(f"Query: Delhi → Mumbai (Orchestrated Search)")
    print("=" * 70)
    print("\n⏳ Agent is now sequencing multiple data sources...\n")
    
    response = await agent.arun(query)
    
    print("=" * 70)
    print("📋 FINAL CONSOLIDATED ITINERARY DATA")
    print("=" * 70)
    print(response.messages[-1].content)
    print("=" * 70)

if __name__ == "__main__":
    print("\n" + "🚂" * 35 + "\n")
    asyncio.run(test_train())
'''

r"""
EXPERT TRAIN SEARCH AGENT - PRODUCTION GRADE
Optimized for resilience, multi-source fallback, and high-precision parsing.
"""

# IMPORTANT: Load .env FIRST
from dotenv import load_dotenv
load_dotenv()

import asyncio
from agno.agent import Agent
from tools.new_logic_Indian_train import get_indian_trains
from config.llm import model

# --- ADVANCED RESILIENT INSTRUCTIONS ---
# These instructions handle the "Wall of Text" and "Timeouts" seen in terminal logs.
TRAIN_AGENT_INSTRUCTIONS = [
    "OPERATING CONTEXT: You are a Senior Railway Data Engineer. You process raw HTML snippets into precise itineraries.",
    "",
    "1. MULTI-STEP RESILIENCE STRATEGY (CRITICAL):",
    "   - PHASE 1 (Discovery): Use 'site:erail.in' or 'site:indiarailinfo.com' to get 5-digit Train Numbers.",
    "   - PHASE 2 (Availability): Query 'site:confirmtkt.com [Train Number]'. If it fails, IMMEDIATELY try 'site:railyatri.in'.",
    "   - PHASE 3 (Fares): Query 'site:ixigo.com [Train Number] fares'. If it times out, use 'site:trainman.in' or 'site:makemytrip.com'.",
    "",
    "2. RAW TEXT DATA EXTRACTION RULES:",
    "   - AVAILABILITY: Scan for keywords: 'AVL', 'AVAILABLE', 'CURR_AVBL', 'RAC', or 'WL'. Extract the number following these.",
    "   - FARES: Look for the '₹' symbol. If all sites time out, provide a 'Calculated Estimate' based on distance (~2.5/km for 2A, ~1.8/km for 3A) and label it clearly.",
    "   - IGNORE: Discard irrelevant alert text about past dates or 'reached destination' if it contradicts your target date.",
    "",
    "3. STATION CODE PROTOCOL:",
    "   - Convert all cities to codes: Delhi=NDLS, Mumbai=MMCT/CSMT, Ahmedabad=ADI, Bangalore=SBC, Pune=PUNE, Chennai=MAS.",
    "",
    "4. FINAL OUTPUT SPECIFICATION:",
    "   - You MUST provide a Markdown Table with these columns: | Train No/Name | Dept/Arr | 3A Fare | 2A Fare | Availability | Live Status |",
    "   - Below the table, include a 'Data Confidence' section: Mention which sites provided the data and which were estimated.",
]

async def test_train():
    """Execute the high-precision train search orchestration."""
    
    agent = Agent(
        model=model,
        tools=[get_indian_trains],
        instructions=TRAIN_AGENT_INSTRUCTIONS,
        expected_output="""
        A structured Markdown Table with verified data from multiple sources.
        Must include Class-wise Fares, Availability Status, and a Resilience Note.
        """,
        markdown=True,
    )
    
    # This query uses an 'Engineering Prompt' to force the Agent to handle failures
    query = """
    Target Route: Delhi (NDLS) to Mumbai (MMCT)
    Target Date: February 15, 2026
    
    ENGINEERING WORKFLOW:
    1. Search erail.in for the top 3 fastest trains (Rajdhani/Tejas/Vande Bharat).
    2. For each train, fetch current seat availability from ConfirmTkt or RailYatri.
    3. Fetch exact fares. If Ixigo times out, use Trainman or MMT.
    4. Verify the 'Live Running Status' to check typical punctuality.
    
    Note: If any specific site fails, DO NOT stop. Use an alternative site to complete the data row.
    """
    
    print("=" * 80)
    print("🚂 STARTING RESILIENT TRAIN SEARCH (Expert Orchestration)")
    print("=" * 80)
    print(f"Route: NDLS → MMCT | Date: 15-Feb-2026")
    print("=" * 80)
    print("\n⏳ Agent is navigating multiple railway data silos...\n")
    
    try:
        response = await agent.arun(query)
        
        print("\n" + "=" * 80)
        print("📋 FINAL CONSOLIDATED DATA REPORT")
        print("=" * 80)
        # Using a safer way to access content depending on Agno's response structure
        content = response.messages[-1].content if hasattr(response, 'messages') else str(response)
        print(content)
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Execution Error: {str(e)}")

if __name__ == "__main__":
    # Standard entry point for the script
    asyncio.run(test_train())
