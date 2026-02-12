"""
Indian Railways Train Search Tool
Primary: Exa API (searches railway websites)
Backup: pyinrail library (direct railway API wrapper)
"""

r'''
from typing import List, Literal, Optional
from loguru import logger
from agno.tools import tool
from agno.tools.exa import ExaTools
from config.logger import logger_hook


# 1. ADDED NEW DOMAINS: Added ixigo and confirmtkt for fares and availability
exa_tool = ExaTools(
    num_results=10,
    include_domains=[
        "erail.in",
        "confirmtkt.com",
        "ixigo.com",
        "enquiry.indianrail.gov.in",
        "indiarailinfo.com", 
        "trainman.in",
        "railyatri.in" 
    ]
)


@tool(name="get_trains", show_result=True, tool_hooks=[logger_hook])
def get_indian_trains(
    source: str,
    destination: str,
    date: str,
    adults: int = 1,
    children: int = 0,
    preferred_class: Literal["1A", "2A", "3A", "SL", "GEN", "any"] = "any",
    custom_query: Optional[str] = None,
) -> List[dict]:
    """
    Expert search tool for Indian Railways. Uses high-precision extraction for 
    fares, availability, and live status.
    """
    logger.info(f"🚂 Agent Querying: {custom_query if custom_query else source + ' to ' + destination}")
    
    try:
        # Build a highly specific query if one isn't provided
        if not custom_query:
            search_query = f"current seat availability and fares for trains from {source} to {destination} on {date} indiarailinfo"
        else:
            search_query = custom_query

        # EXPERT CHANGE: Use 'text' and 'highlights' to force Exa to parse the page content
        # This prevents the "Wall of Text" issue and helps the LLM find the numbers.
        exa_results = exa_tool.search_exa(
            query=search_query,
            num_results=3,
            text=True,           # Get full text content
            highlights=True      # Highlight the most relevant snippets (like fares)
        )
        
        if exa_results:
            return exa_results
            
    except Exception as e:
        logger.error(f"🚂 Exa Expert Mode Error: {str(e)}")
    
    # --- BACKUP: pyinrail Library (Only runs if no custom_query) ---
    if not custom_query:
        try:
            logger.info("🚂 Train Search: Using pyinrail Library (BACKUP)")
            from pyinrail import RailwayEnquiry
            rail = RailwayEnquiry()
            train_list = rail.getTrainBetweenStations(source, destination, date)
            
            if train_list:
                trains = []
                for train in train_list:
                    trains.append({
                        "train_number": train.get("trainNumber", ""),
                        "train_name": train.get("trainName", ""),
                        "departure_station": source,
                        "arrival_station": destination,
                        "departure_time": train.get("departureTime", ""),
                        "arrival_time": train.get("arrivalTime", ""),
                        "duration": train.get("duration", ""),
                        "classes_available": train.get("availableClasses", []),
                        "booking_url": "https://www.irctc.co.in/",
                    })
                return trains
        except Exception as e:
            logger.error(f"🚂 pyinrail error: {str(e)}")
    
    return []

# (Station codes list remains the same below...)


# --- COMMON INDIAN RAILWAY STATION CODES (for reference) ---
# The AI agent will use its knowledge to convert city names to codes
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
    "Kochi": "ERS",
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
}'''



"""
Indian Railways Train Search Tool - High Precision Version
Primary: Exa API (High-precision extraction with fallback domains)

IMPORTANT NOTES ON ExaTools API:
- text=True and text_length_limit are CONSTRUCTOR-level params (not search_exa args)
- search_exa() only accepts: query, num_results, category
- highlights parameter was REMOVED in exa_py 2.0+ (use text instead)
"""

from typing import List, Literal, Optional
from loguru import logger
from agno.tools import tool
from agno.tools.exa import ExaTools
from config.logger import logger_hook


# EXPANDED DOMAINS with HIGH-PRECISION TEXT EXTRACTION
# text=True → Returns full page text content (not just URLs)
# text_length_limit=3000 → More content per result for fare/availability extraction
# livecrawl="always" → Gets fresh/current page data
exa_tool = ExaTools(
    text=True,
    text_length_limit=3000,
    num_results=10,
    livecrawl="always",
    include_domains=[
        "erail.in",
        "confirmtkt.com",
        "ixigo.com",
        "enquiry.indianrail.gov.in",
        "indiarailinfo.com", 
        "trainman.in",
        "railyatri.in",
        "makemytrip.com",
        "checkmytrain.com",
    ]
)


@tool(name="get_trains", show_result=True, tool_hooks=[logger_hook])
def get_indian_trains(
    source: str,
    destination: str,
    date: str,
    adults: int = 1,
    children: int = 0,
    preferred_class: Literal["1A", "2A", "3A", "SL", "GEN", "any"] = "any",
    custom_query: Optional[str] = None,
) -> str:
    """
    Expert search tool for Indian Railways. Optimized for high-precision extraction
    of fares, availability, and live status snippets from railway websites via Exa.
    
    :param source: Source station code (e.g., 'NDLS')
    :param destination: Destination station code (e.g., 'MMCT')
    :param date: Travel date in 'YYYY-MM-DD' format
    :param custom_query: Highly specific query from Agent (e.g. 'site:confirmtkt.com 12952 availability')
    :returns: JSON string of search results with text content from railway sites
    """
    
    logger.info(f"🚂 Agent Request: {custom_query if custom_query else source + ' to ' + destination}")
    
    # --- PRIMARY: Exa API Search with Text Content Extraction ---
    try:
        # Build a semantic query if the agent didn't provide a custom one
        search_query = custom_query if custom_query else \
            f"trains from {source} to {destination} seat availability fares schedule {date}"

        logger.info(f"🚂 Querying Exa: {search_query}")

        # CORRECT API USAGE:
        # search_exa() only takes: query, num_results, category
        # text extraction is configured at the ExaTools constructor level above
        exa_results = exa_tool.search_exa(
            query=search_query,
            num_results=5,
        )
        
        if exa_results:
            logger.info(f"🚂 Exa returned results successfully")
            return exa_results
            
    except Exception as e:
        logger.error(f"🚂 Exa Extraction Error: {str(e)}")
    
    # Return a structured message when no results found
    logger.warning("🚂 No results from Exa search — returning empty result guidance")
    return '{"error": "No train data found from web sources. The agent should retry with alternative query terms or site-specific queries like site:erail.in or site:confirmtkt.com."}'


# --- STATION CODE REGISTRY ---
COMMON_STATION_CODES = {
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
    "Kochi": "ERS",
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
    "Bhubaneswar": "BBS"
}
