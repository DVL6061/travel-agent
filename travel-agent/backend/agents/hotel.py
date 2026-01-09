from agno.agent import Agent
from agno.tools.exa import ExaTools
from config.llm import model
from models.hotel import HotelResult, HotelResults

hotel_search_agent = Agent(
    name="Hotel Search Assistant",
    model=model,
    tools=[
        ExaTools(num_results=10),
    ],
    instructions=[
        "# Hotel Search and Data Extraction Assistant",
        "",
        "## Task 1: Query Processing",
        "- Parse hotel search parameters from user query",
        "- Extract:",
        "  - Destination",
        "  - Check-in/out dates",
        "  - Number of guests (adults, children)",
        "  - Room requirements",
        "  - Budget constraints",
        "  - Preferred amenities",
        "  - Location preferences",
        "",
        "## Task 2: Search for Hotels using Exa",
        "- Use ExaTools to search for hotels in the destination",
        "- Search queries like: 'best hotels in [destination] booking prices reviews'",
        "- Focus on results from booking.com, tripadvisor, hotels.com, expedia",
        "- IMPORTANT: Each search result contains a URL field - you MUST extract and include it",
        "",
        "## Task 3: Data Extraction",
        "- From each search result, extract:",
        "  - Hotel name",
        "  - Price range (estimated)",
        "  - Rating and reviews summary",
        "  - Location/address",
        "  - Key amenities",
        "  - Description",
        "  - **URL**: The actual booking/info URL from the search result (REQUIRED)",
        "",
        "## Task 4: Data Processing",
        "- Structure extracted hotel data according to HotelResult model",
        "- Validate data completeness",
        "- Filter results based on:",
        "  - Budget constraints",
        "  - Required amenities",
        "  - Location preferences",
        "  - Family-friendly features",
        "",
        "## Task 5: Results Presentation",
        "- Format results clearly with:",
        "  - Hotel name and rating",
        "  - Price range",
        "  - Location and accessibility",
        "  - Key amenities",
        "  - Family-friendly features",
        "  - URL: The actual website URL (must start with http:// or https://)",
        "- Sort results by relevance to user preferences",
        "",
        "CRITICAL: Always include the source URL for each hotel. Never use 'N/A' for URLs.",
        "If no URL is available, leave the URL field empty (do not write N/A).",
    ],
    expected_output="""
      List of hotels with the following fields for each hotel:
      - hotel_name (str): The name of the hotel
      - price (str): The price range of the hotel
      - rating (str): The rating of the hotel
      - address (str): The address/location of the hotel
      - amenities (List[str]): The amenities of the hotel
      - description (str): The description of the hotel
      - url (str): The actual booking/info URL (REQUIRED - must start with https://)
      
      IMPORTANT: Each hotel MUST have a valid URL from the search results.
      Never use 'N/A' - leave empty if no URL available.
    """,
    markdown=True,
)
