r"""
Indian Railways MCP Tool Integration
=====================================
Connects to the Indian Railway MCP Server (https://railway-mcp.amithv.xyz/mcp)
via Agno's MCPTools to provide real-time train data.

Available Tools (from MCP server):
  1. search-trains        → Find trains between two stations on a given date
  2. get-seat-availability → Real-time seat availability with fares
  3. get-train-info        → Detailed train info (route, schedule, coaches)
  7. get-station-code      → Find station code by station name
  8. get-train-code        → Find train number by train name

Architecture:
  Remote MCP Server (railway-mcp.amithv.xyz/mcp)
       ↕  (Streamable HTTP transport)
  Agno MCPTools (Python MCP client)
       ↕
  Agent (LLM)
       ↕
  test_train_mcp.py (test script)

Prerequisites:
  pip install mcp
  (Node.js NOT required for this approach — direct HTTP connection)

Author: Travel Agent Project
"""

from agno.tools.mcp import MCPTools

# ============================================
# MCP Server Configuration
# ============================================
# The Indian Railway MCP Server is a FREE, community-hosted server.
# No API key required!
INDIAN_RAILWAY_MCP_URL = "https://railway-mcp.amithv.xyz/mcp"

# Only include the 5 tools we need (out of 8 available)
# NOTE: Tool names are Case-Sensitive and must match the MCP server exactly!
INCLUDED_TOOLS = [
    "Search-trains",           # 1. Find trains between stations
    "Get-seat-availability",   # 2. Real-time availability + fares
    "Get-train-info",          # 3. Train route, schedule, coaches
    "Get-station-code",        # 7. Find station code by name
    "Get-train-code",          # 8. Find train number by name
]

# Tools we don't need right now (can enable later)
EXCLUDED_TOOLS = [
    "Get-train-live-status",   # 4. Live running status
    "Get-train-delay-info",    # 5. Average delay statistics
    "Get-live-station-info",   # 6. All trains at a station
]


def get_mcp_tools() -> MCPTools:
    """
    Create and return an MCPTools instance configured for the Indian Railway
    MCP server, using Streamable HTTP transport.

    This function creates the MCPTools instance but does NOT connect yet.
    Connection happens when:
      - You call `await mcp_tools.connect()` manually, OR
      - You use it as `async with mcp_tools:`, OR
      - Agno Agent auto-connects when it runs (automatic mode)

    Returns:
        MCPTools: Configured but not-yet-connected MCP tools instance.

    Example usage with Agno Agent (automatic connection management):
        ```python
        mcp_tools = get_mcp_tools()
        agent = Agent(model=model, tools=[mcp_tools])
        # Agent auto-connects on first run
        await agent.arun("Find trains from Delhi to Mumbai")
        ```

    Example usage with manual connection:
        ```python
        mcp_tools = get_mcp_tools()
        await mcp_tools.connect()
        try:
            agent = Agent(model=model, tools=[mcp_tools])
            await agent.arun("Find trains from Delhi to Mumbai")
        finally:
            await mcp_tools.close()
        ```
    """
    mcp_tools = MCPTools(
        url=INDIAN_RAILWAY_MCP_URL,
        transport="streamable-http",
        include_tools=INCLUDED_TOOLS,
        timeout_seconds=30,  # 30s timeout (remote server can be slow)
    )
    return mcp_tools


# ============================================
# Agent Instructions for MCP Tools
# ============================================
# These instructions tell the LLM agent how to use the MCP tools effectively.

TRAIN_MCP_AGENT_INSTRUCTIONS = [
    "You are an expert Indian Railways assistant powered by real-time railway data.",
    "You have access to the following tools via the Indian Railway MCP server:",
    "",
    "🔧 AVAILABLE TOOLS:",
    "  1. Search-trains: Search for trains between two stations on a date.",
    "     - Input: source station code, destination station code, date (YYYYMMDD)",
    "     - Returns: List of trains with numbers, names, times, duration, classes, running days",
    "",
    "  2. Get-seat-availability: Check real-time seat availability AND fares.",
    "     - Input: train number, source, destination, date, class, quota",
    "     - Returns: Availability status (AVAILABLE/WL/RAC/REGRET) + fare info",
    "",
    "  3. Get-train-info: Get detailed train information.",
    "     - Input: train number",
    "     - Returns: Full route, schedule, coach position, classes, zone, pantry info",
    "",
    "  7. Get-station-code: Find station code(s) by station name.",
    "     - Input: station name (e.g., 'New Delhi', 'Mumbai')",
    "     - Returns: Matching station codes",
    "",
    "  8. Get-train-code: Find train number by train name.",
    "     - Input: train name (e.g., 'Rajdhani Express')",
    "     - Returns: Matching train numbers",
    "",
    "📋 WORKFLOW (follow this order):",
    "  Step 1: If user gives city names, use Get-station-code to find the correct station codes.",
    "  Step 2: Use Search-trains with the station codes and desired date to find available trains.",
    "  Step 3: ⚠️ MANDATORY - For EACH train found, call Get-seat-availability for ALL available classes to retrieve fares.",
    "  Step 4: Optionally use Get-train-info for detailed route/schedule info.",
    "  Step 5: Present ALL results in a clear, structured markdown format.",
    "",
    "📊 OUTPUT FORMAT:",
    "  - Present trains in a clear markdown table or structured list",
    "  - Include: train number, name, departure/arrival times, duration, classes, running days",
    "  - For availability: show status (AVAILABLE X / WL Y / RAC Z) and fare for each class",
    "  - Include source/booking URL: https://www.irctc.co.in/",
    "",
    "⚠️ DATE FORMAT:",
    "  - The MCP server expects dates in YYYYMMDD format (e.g., 20260215)",
    "  - Convert user-provided dates (like 'February 15, 2026' or '2026-02-15') to YYYYMMDD",
    "",
    "🚫 FORBIDDEN:",
    "  - NEVER say 'I cannot find trains' without first trying the Search-trains tool",
    "  - NEVER skip the Get-station-code step if user gives city names instead of codes",
    "  - NEVER skip Step 3 (Get-seat-availability) - fare data is CRITICAL",
    "  - NEVER return raw MCP output without formatting it nicely",
    "  - NEVER leave fare fields empty or blank",
    "  - ALWAYS show at least the top 3-5 trains from search results",
    "  - ALWAYS populate fare fields for all available classes",
    "",
    "⏰ ERROR HANDLING:",
    "  - If a tool call fails, try once more before giving up",
    "  - If Get-seat-availability fails for a specific class, use 'Not available' instead of leaving it empty",
    "  - If the MCP server is down, inform the user that real-time data is temporarily unavailable",
    "  - Suggest the user try again in a few minutes if the server is unreachable",
]


# ============================================
# Common Station Codes (for quick reference)
# ============================================
# The agent can also use get-station-code tool to look these up.
COMMON_STATION_CODES = {
    # Major Cities
    "New Delhi": "NDLS",
    "Delhi Junction": "DLI",
    "Mumbai Central": "BCT",
    "Mumbai CST": "CSMT",
    "Chennai Central": "MAS",
    "Kolkata Howrah": "HWH",
    "Kolkata Sealdah": "SDAH",
    "Bangalore City": "SBC",
    "Hyderabad": "HYB",
    "Secunderabad": "SC",
    "Ahmedabad": "ADI",
    "Pune": "PUNE",
    "Jaipur": "JP",
    "Lucknow": "LKO",
    "Varanasi": "BSB",
    "Goa Madgaon": "MAO",
    "Kochi Ernakulam": "ERS",
    "Thiruvananthapuram": "TVC",
    "Agra Cantt": "AGC",
    "Amritsar": "ASR",
    "Patna": "PNBE",
    "Bhopal": "BPL",
    "Indore": "INDB",
    "Nagpur": "NGP",
    "Coimbatore": "CBE",
    "Mysore": "MYS",
    "Udaipur": "UDZ",
    "Jodhpur": "JU",
    "Guwahati": "GHY",
    "Bhubaneswar": "BBS",
}
