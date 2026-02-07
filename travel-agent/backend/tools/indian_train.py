"""
Indian Railways Train Search Tool
Primary: Exa API (searches railway websites)
Backup: pyinrail library (direct railway API wrapper)
"""

from typing import List, Literal, Optional
from loguru import logger
from agno.tools import tool
from agno.tools.exa import ExaTools
from config.logger import logger_hook


# Initialize Exa for train searches with Indian railway website domains
exa_tool = ExaTools(
    num_results=10,
    include_domains=["railyatri.in", "indiarailinfo.com", "erail.in", "trainman.in"]
)


@tool(name="get_trains", show_result=True, tool_hooks=[logger_hook])
def get_indian_trains(
    source: str,
    destination: str,
    date: str,
    adults: int = 1,
    children: int = 0,
    preferred_class: Literal["1A", "2A", "3A", "SL", "GEN", "any"] = "any",
) -> List[dict]:
    """
    Search for trains between two Indian railway stations.
    
    Uses Exa API as primary source (searches railyatri.in, indiarailinfo.com).
    Falls back to pyinrail library if Exa returns no results.
    
    :param source: Source station code (e.g., 'NDLS' for New Delhi, 'BCT' for Mumbai Central)
    :param destination: Destination station code (e.g., 'BCT', 'HWH' for Howrah)
    :param date: Travel date in 'YYYY-MM-DD' format
    :param adults: Number of adult passengers (default 1)
    :param children: Number of child passengers (default 0)
    :param preferred_class: Preferred class (1A, 2A, 3A, SL, GEN, or 'any')
    :return: List of train results with schedules, fares, and availability
    """
    
    logger.info(f"🚂 Train Search: {source} → {destination} on {date}")
    logger.info(f"🚂 Passengers: {adults} adults, {children} children | Class: {preferred_class}")
    
    trains = []
    
    # --- PRIMARY: Exa API Search ---
    try:
        logger.info("🚂 Train Search: Using Exa API (PRIMARY)")
        
        # Build search query for Indian railway websites
        search_query = f"trains from {source} to {destination} schedule fare {date} Indian Railways"
        
        # Search using Exa (domains are set in ExaTools initialization)
        exa_results = exa_tool.search_exa(
            query=search_query,
            num_results=5
        )
        
        if exa_results and len(exa_results) > 0:
            logger.info(f"🚂 Exa returned {len(exa_results)} results")
            # Return raw Exa results for the agent to process
            return exa_results
        else:
            logger.warning("🚂 Exa API returned no results, trying backup...")
            
    except Exception as e:
        logger.error(f"🚂 Exa API error: {str(e)}, trying backup...")
    
    # --- BACKUP: pyinrail Library ---
    try:
        logger.info("🚂 Train Search: Using pyinrail Library (BACKUP)")
        
        from pyinrail import RailwayEnquiry
        
        rail = RailwayEnquiry()
        
        # Get trains between stations
        train_list = rail.getTrainBetweenStations(source, destination, date)
        
        if train_list:
            logger.info(f"🚂 pyinrail returned {len(train_list)} trains")
            
            for train in train_list:
                train_data = {
                    "train_number": train.get("trainNumber", ""),
                    "train_name": train.get("trainName", ""),
                    "departure_station": f"{source}",
                    "arrival_station": f"{destination}",
                    "departure_time": train.get("departureTime", ""),
                    "arrival_time": train.get("arrivalTime", ""),
                    "duration": train.get("duration", ""),
                    "running_days": train.get("runningDays", ""),
                    "classes_available": train.get("availableClasses", []),
                    "train_type": train.get("trainType", ""),
                    "booking_url": "https://www.irctc.co.in/",
                }
                trains.append(train_data)
                
            return trains
        else:
            logger.warning("🚂 pyinrail also returned no results")
            
    except ImportError:
        logger.error("🚂 pyinrail library not installed. Run: pip install pyinrail")
    except Exception as e:
        logger.error(f"🚂 pyinrail error: {str(e)}")
    
    # --- FALLBACK: Return empty with message ---
    logger.warning("🚂 No trains found from any source")
    return []


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
}
