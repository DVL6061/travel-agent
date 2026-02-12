r"""
Test Script for Indian Railway MCP Integration
================================================
Tests the Indian Railway MCP server connection via Agno MCPTools.

This script tests 5 tools:
  1. Search-trains        → Find trains between stations
  2. Get-seat-availability → Real-time availability + fares
  3. Get-train-info        → Detailed train info
  7. Get-station-code      → Station code lookup
  8. Get-train-code        → Train number lookup

Usage:
    cd backend
    .\venv\Scripts\activate
    python test_train_mcp.py

Prerequisites:
    pip install mcp
    (Node.js NOT required)

Author: Travel Agent Project
"""

# IMPORTANT: Load .env FIRST before any imports that use environment variables
from dotenv import load_dotenv
load_dotenv()

import asyncio
import sys
import time
import os
from agno.agent import Agent
from agno.models.groq import Groq
from tools.indian_train_mcp import (
    get_mcp_tools,
    TRAIN_MCP_AGENT_INSTRUCTIONS,
)
# from config.llm import model # Commented out to use local Groq fallback

# Initialize Groq model using environment variable
# Ensure GROQ_API_KEY is set in your .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY not found in environment!")
    print("   Please make sure it is set in your .env file.")
    # Fallback to a placeholder or raise error if critical
    
model = Groq(id="llama-3.3-70b-versatile", api_key=GROQ_API_KEY)


# ============================================
# TEST 1: Full Agent Test (Delhi → Mumbai)
# ============================================
async def test_full_agent_search():
    """
    Full end-to-end test: Agent uses MCP tools to search trains, 
    check availability, and present structured results.
    """
    print("\n" + "=" * 70)
    print("🚂 TEST 1: Full Agent Search (Delhi → Mumbai)")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        # Connect to MCP server
        print("⏳ Connecting to Indian Railway MCP server...")
        start_time = time.time()
        await mcp_tools.connect()
        connect_time = time.time() - start_time
        print(f"✅ Connected in {connect_time:.1f}s")
        
        # List available tools (diagnostic)
        print(f"🔧 Available tools: {list(mcp_tools.functions.keys())}")
        
        # Create agent with MCP tools
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=TRAIN_MCP_AGENT_INSTRUCTIONS,
            expected_output="""
            A structured list of trains with the following details for each:
            - Train Number and Name
            - Departure and Arrival stations (with codes)
            - Departure and Arrival times
            - Duration
            - Available classes
            - Seat availability status
            - Approximate fares
            - Running days
            
            Format as a clear markdown table or structured list.
            """,
            markdown=True,
        )
        
        # Test query
        query = """
        Find me trains from Delhi to Mumbai for February 20, 2026.
        I need trains with AC classes available.
        Please show top 3-5 trains with schedules, availability, and fares.
        
        IMPORTANT: 
        1. First use Get-station-code to find codes for Delhi and Mumbai.
        2. Then use Search-trains with those codes and date 20260220.
        3. Then use Get-seat-availability for the top trains to check availability and fares.
        4. Present everything in a clear structured format.
        """
        
        print(f"\n📝 Query: Delhi → Mumbai on Feb 20, 2026")
        print("⏳ Agent is searching and processing...\n")
        
        start_time = time.time()
        response = await agent.arun(query)
        elapsed = time.time() - start_time
        
        print("=" * 70)
        print("📋 AGENT RESPONSE")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        print(f"⏱️  Total time: {elapsed:.1f}s")
        
    except Exception as e:
        print(f"\n❌ Error in test_full_agent_search: {e}")
        print("💡 The MCP server might be down or unreachable.")
        print("   Try again in a few minutes, or check: https://railway-mcp.amithv.xyz/mcp")
        import traceback
        traceback.print_exc()
    finally:
        print("\n🔌 Closing MCP connection...")
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# TEST 2: Station Code Lookup Only
# ============================================
async def test_station_code_lookup():
    """
    Simple test: Just look up station codes.
    This is the quickest test to verify MCP connection works.
    """
    print("\n" + "=" * 70)
    print("🚂 TEST 2: Station Code Lookup")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting to Indian Railway MCP server...")
        await mcp_tools.connect()
        print("✅ Connected!")
        print(f"🔧 Available tools: {list(mcp_tools.functions.keys())}")
        
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=[
                "You are a station code lookup assistant.",
                "Use the Get-station-code tool to find station codes.",
                "Return the results clearly.",
            ],
            markdown=True,
        )
        
        query = "Find the station codes for: New Delhi, Mumbai, Chennai, Kolkata, Bangalore, Ahmedabad"
        
        print(f"\n📝 Looking up station codes...")
        print("⏳ Processing...\n")
        
        response = await agent.arun(query)
        
        print("=" * 70)
        print("📋 STATION CODES")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 The MCP server might be down. Try again later.")
    finally:
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# TEST 3: Train Code / Number Lookup
# ============================================
async def test_train_code_lookup():
    """
    Test: Look up train numbers by train name.
    """
    print("\n" + "=" * 70)
    print("🚂 TEST 3: Train Code Lookup")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting...")
        await mcp_tools.connect()
        print("✅ Connected!")
        
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=[
                "You are a train lookup assistant.",
                "Use the Get-train-code tool to find train numbers by name.",
                "Return the results clearly.",
            ],
            markdown=True,
        )
        
        query = "Find the train numbers for: Rajdhani Express, Shatabdi Express, Duronto Express"
        
        print(f"\n📝 Looking up train codes...")
        print("⏳ Processing...\n")
        
        response = await agent.arun(query)
        
        print("=" * 70)
        print("📋 TRAIN CODES")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# TEST 4: Specific Train Info
# ============================================
async def test_train_info():
    """
    Test: Get detailed info about a specific train.
    """
    print("\n" + "=" * 70)
    print("🚂 TEST 4: Train Info (12952 Mumbai Rajdhani)")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting...")
        await mcp_tools.connect()
        print("✅ Connected!")
        
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=[
                "You are a train information assistant.",
                "Use the Get-train-info tool to get detailed train information.",
                "Present the route, schedule, classes, and other details clearly.",
            ],
            markdown=True,
        )
        
        query = "Get detailed information about train number 12952 (Mumbai Rajdhani Express)"
        
        print(f"\n📝 Getting train info for 12952...")
        print("⏳ Processing...\n")
        
        response = await agent.arun(query)
        
        print("=" * 70)
        print("📋 TRAIN INFO")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# TEST 5: Seat Availability with Fares
# ============================================
async def test_seat_availability():
    """
    Test: Check seat availability and fares for a specific train.
    This is the key test for real-time data + fare info.
    """
    print("\n" + "=" * 70)
    print("🚂 TEST 5: Seat Availability + Fares (12952 NDLS→BCT)")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting...")
        await mcp_tools.connect()
        print("✅ Connected!")
        
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=[
                "You are a seat availability checker.",
                "Use the Get-seat-availability tool to check availability.",
                "Show availability status and fares for each class.",
                "The date format should be YYYYMMDD (e.g., 20260220).",
            ],
            markdown=True,
        )
        
        query = """
        Check seat availability for train 12952 (Rajdhani Express) 
        from NDLS (New Delhi) to BCT (Mumbai Central) 
        for February 20, 2026.
        Show availability for all AC classes (1A, 2A, 3A).
        """
        
        print(f"\n📝 Checking availability for 12952 NDLS→BCT on Feb 20, 2026...")
        print("⏳ Processing...\n")
        
        response = await agent.arun(query)
        
        print("=" * 70)
        print("📋 SEAT AVAILABILITY + FARES")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# TEST 6: Connection Health Check (Quick)
# ============================================
async def test_connection_health():
    """
    Quick health check: Just verify the MCP server is reachable
    and list available tools. Fastest test to run first.
    """
    print("\n" + "=" * 70)
    print("🏥 TEST 6: MCP Connection Health Check")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting to Indian Railway MCP server...")
        print(f"   URL: https://railway-mcp.amithv.xyz/mcp")
        print(f"   Transport: Streamable HTTP")
        
        start_time = time.time()
        await mcp_tools.connect()
        elapsed = time.time() - start_time
        
        print(f"\n✅ CONNECTION SUCCESSFUL! (took {elapsed:.1f}s)")
        print(f"\n🔧 Available MCP Tools:")
        for name, func in mcp_tools.functions.items():
            print(f"   • {name}: {func.description[:80]}...")
        
        # Quick ping test
        is_alive = await mcp_tools.is_alive()
        print(f"\n💓 Server alive: {'YES ✅' if is_alive else 'NO ❌'}")
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED!")
        print(f"   Error: {e}")
        print(f"\n💡 Possible causes:")
        print(f"   1. MCP server is down (community-hosted, not guaranteed uptime)")
        print(f"   2. Network/firewall blocking the connection")
        print(f"   3. Rate limiting from too many requests")
        print(f"\n   Try again in a few minutes.")
    finally:
        await mcp_tools.close()
        print("\n🔌 Connection closed.")


# ============================================
# TEST 7: Custom Route Test
# ============================================
async def test_custom_route():
    """
    Test with a custom route - modify these values to test different routes.
    """
    # ========= CHANGE THESE VALUES =========
    source = "Ahmedabad"
    destination = "Mumbai"
    date = "February 25, 2026"
    # =======================================
    
    print("\n" + "=" * 70)
    print(f"🚂 TEST 7: Custom Route ({source} → {destination})")
    print("=" * 70)
    
    mcp_tools = get_mcp_tools()
    
    try:
        print("⏳ Connecting...")
        await mcp_tools.connect()
        print("✅ Connected!")
        
        agent = Agent(
            model=model,
            tools=[mcp_tools],
            instructions=TRAIN_MCP_AGENT_INSTRUCTIONS,
            markdown=True,
        )
        
        query = f"""
        Find trains from {source} to {destination} on {date}.
        
        Steps:
        1. Look up station codes for {source} and {destination}
        2. Search for trains on the given date
        3. Check seat availability and fares for the top 3 trains
        4. Present everything in a structured format with fares
        """
        
        print(f"\n📝 Query: {source} → {destination} on {date}")
        print("⏳ Agent is searching...\n")
        
        start_time = time.time()
        response = await agent.arun(query)
        elapsed = time.time() - start_time
        
        print("=" * 70)
        print("📋 RESPONSE")
        print("=" * 70)
        print(response.messages[-1].content)
        print("=" * 70)
        print(f"⏱️  Total time: {elapsed:.1f}s")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await mcp_tools.close()
        print("✅ Connection closed.")


# ============================================
# MAIN: Run Tests
# ============================================
if __name__ == "__main__":
    print("\n" + "🚂" * 35)
    print("\n  INDIAN RAILWAY MCP INTEGRATION TEST SUITE")
    print("  Using: https://railway-mcp.amithv.xyz/mcp")
    print("  Transport: Streamable HTTP (via Agno MCPTools)")
    print("\n" + "🚂" * 35)
    
    # Parse command line for specific test
    if len(sys.argv) > 1:
        test_num = sys.argv[1]
        tests = {
            "1": test_full_agent_search,
            "2": test_station_code_lookup,
            "3": test_train_code_lookup,
            "4": test_train_info,
            "5": test_seat_availability,
            "6": test_connection_health,
            "7": test_custom_route,
        }
        if test_num in tests:
            print(f"\n▶️  Running Test {test_num} only...\n")
            asyncio.run(tests[test_num]())
        else:
            print(f"\n❌ Unknown test number: {test_num}")
            print("   Valid: 1-7")
            print("   Usage: python test_train_mcp.py [test_number]")
            print("   Example: python test_train_mcp.py 6  (health check)")
    else:
        # Default: Run health check first, then full test
        print("\n▶️  Running default tests (Health Check → Full Agent Search)...")
        print("   💡 Tip: Run individual tests with: python test_train_mcp.py <1-7>")
        print("   💡 Quick start: python test_train_mcp.py 6  (health check only)")
        print()
        
        # Test 6: Health check (fastest, run first to verify connectivity)
        asyncio.run(test_connection_health())
        
        # Test 1: Full agent search (if health check passed)
        print("\n" + "-" * 70)
        print("📢 Proceeding to full agent test...")
        print("-" * 70)
        asyncio.run(test_full_agent_search())
    
    print("\n" + "🚂" * 35)
    print("  ✅ All tests completed!")
    print("🚂" * 35 + "\n")
