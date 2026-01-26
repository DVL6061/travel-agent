"""
Exa-based flight search tool as a fallback/alternative to Google Flights.
Uses Exa Search API to find flight information from various sources.
"""
from typing import Literal, List, Optional
from loguru import logger
from agno.tools import tool
from config.logger import logger_hook
from exa_py import Exa
import os
from dataclasses import dataclass


@dataclass
class ExaFlightResult:
    """Structured flight result from Exa search"""
    airline: str
    route: str
    price_range: str
    duration: str
    source: str
    url: str
    stops: str = "Direct or 1+ stops"


@tool(name="search_flights_exa", show_result=True, tool_hooks=[logger_hook])
def search_flights_exa(
    departure_city: str,
    destination_city: str,
    departure_date: str,
    return_date: Optional[str] = None,
    cabin_class: Literal["economy", "business", "first"] = "economy",
    num_travelers: int = 1,
) -> str:
    """
    Search for flight options using Exa Search API.
    This provides flight information from multiple sources including airline websites,
    travel aggregators, and travel blogs.
    
    :param departure_city: The departure city name (e.g., "New York", "Delhi")
    :param destination_city: The destination city name (e.g., "Paris", "Mumbai")
    :param departure_date: The departure date in the format 'YYYY-MM-DD'
    :param return_date: Optional return date in the format 'YYYY-MM-DD' (for round trips)
    :param cabin_class: The cabin class preference (economy, business, first)
    :param num_travelers: Number of travelers (default 1)
    :return: Flight search results as formatted string
    """
    
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        logger.error("EXA_API_KEY not set in environment variables")
        return "Error: Exa API key not configured. Please set EXA_API_KEY environment variable."
    
    logger.info(f"Searching flights from {departure_city} to {destination_city} on {departure_date}")
    
    try:
        exa = Exa(api_key=api_key)
        
        # Create search query for flights
        trip_type = "round trip" if return_date else "one-way"
        search_query = f"flights from {departure_city} to {destination_city} {cabin_class} class {trip_type} prices booking"
        
        # Also search for specific airline routes
        airline_query = f"airlines flying {departure_city} to {destination_city} schedule prices"
        
        # Perform search
        results = exa.search_and_contents(
            query=search_query,
            type="auto",
            num_results=10,
            text=True,
            highlights=True,
        )
        
        # Also get airline-specific results
        airline_results = exa.search_and_contents(
            query=airline_query,
            type="auto",
            num_results=5,
            text=True,
            highlights=True,
        )
        
        # Combine and format results
        flight_info = []
        
        flight_info.append(f"## ✈️ Flight Search Results")
        flight_info.append(f"**Route:** {departure_city} → {destination_city}")
        flight_info.append(f"**Date:** {departure_date}")
        if return_date:
            flight_info.append(f"**Return:** {return_date}")
        flight_info.append(f"**Class:** {cabin_class.capitalize()}")
        flight_info.append(f"**Travelers:** {num_travelers}")
        flight_info.append("")
        
        flight_info.append("### Flight Options Found:")
        flight_info.append("")
        
        # Process main search results
        if results.results:
            for i, result in enumerate(results.results[:8], 1):
                flight_info.append(f"**{i}. {result.title}**")
                if result.highlights:
                    for highlight in result.highlights[:2]:
                        flight_info.append(f"   - {highlight}")
                flight_info.append(f"   🔗 [View Details]({result.url})")
                flight_info.append("")
        
        # Add airline-specific info
        if airline_results.results:
            flight_info.append("### Airlines Operating This Route:")
            for result in airline_results.results[:3]:
                flight_info.append(f"- **{result.title}**")
                if result.url:
                    flight_info.append(f"  🔗 {result.url}")
        
        # Add booking recommendations
        flight_info.append("")
        flight_info.append("### 💡 Booking Tips:")
        flight_info.append(f"- Compare prices on Google Flights, Skyscanner, or Kayak")
        flight_info.append(f"- Book directly with airlines for best support")
        flight_info.append(f"- Consider flexible dates for better prices")
        flight_info.append(f"- Check airline websites for exclusive deals")
        
        result_text = "\n".join(flight_info)
        logger.info(f"Exa flight search completed with {len(results.results)} results")
        
        return result_text
        
    except Exception as e:
        logger.error(f"Error searching flights with Exa: {e}")
        return f"Error searching for flights: {str(e)}"


@tool(name="get_flight_prices", show_result=True, tool_hooks=[logger_hook])
def get_flight_prices(
    departure_airport: str,
    destination_airport: str,
    month_year: str,
) -> str:
    """
    Get typical flight prices and booking information for a route.
    
    :param departure_airport: Departure airport code or city (e.g., "JFK", "DEL")
    :param destination_airport: Destination airport code or city (e.g., "CDG", "BOM")
    :param month_year: Month and year for travel (e.g., "January 2025", "March 2025")
    :return: Price ranges and booking recommendations
    """
    
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        logger.error("EXA_API_KEY not set")
        return "Error: Exa API key not configured."
    
    try:
        exa = Exa(api_key=api_key)
        
        search_query = f"flight prices {departure_airport} to {destination_airport} {month_year} average cost cheap flights"
        
        results = exa.search_and_contents(
            query=search_query,
            type="auto",
            num_results=8,
            text=True,
            highlights=True,
        )
        
        price_info = []
        price_info.append(f"## 💰 Flight Price Information")
        price_info.append(f"**Route:** {departure_airport} → {destination_airport}")
        price_info.append(f"**Travel Period:** {month_year}")
        price_info.append("")
        
        if results.results:
            price_info.append("### Price Information from Sources:")
            for i, result in enumerate(results.results[:6], 1):
                price_info.append(f"")
                price_info.append(f"**{i}. {result.title}**")
                if result.highlights:
                    for highlight in result.highlights[:2]:
                        # Clean up and add highlight
                        clean_highlight = highlight.strip()
                        if clean_highlight:
                            price_info.append(f"   {clean_highlight}")
                if result.url:
                    price_info.append(f"   🔗 {result.url}")
        
        price_info.append("")
        price_info.append("### Recommended Booking Platforms:")
        price_info.append("- [Google Flights](https://www.google.com/flights)")
        price_info.append("- [Skyscanner](https://www.skyscanner.com)")
        price_info.append("- [Kayak](https://www.kayak.com)")
        price_info.append("- [Expedia](https://www.expedia.com)")
        
        return "\n".join(price_info)
        
    except Exception as e:
        logger.error(f"Error getting flight prices: {e}")
        return f"Error getting flight prices: {str(e)}"
