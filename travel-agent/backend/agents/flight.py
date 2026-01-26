from agno.agent import Agent
from agno.tools.firecrawl import FirecrawlTools
from tools.google_flight import get_google_flights
from config.llm import model

# --- NEW CODE START (REPLACING OLD AGENT DEFINITION) ---
flight_search_agent = Agent(
    name="Flight Search Assistant",
    model=model,
    tools=[
        get_google_flights,
    ],
    instructions=[
        "You are an expert flight search tool. You MUST follow these STRICT RULES when calling the 'get_flights' tool:",
        "",
        "1. STRICT PARAMETER MAPPING:",
        "   - 'departure': Use 3-letter airport code (e.g., 'BOM', 'GOI')",
        "   - 'destination': Use 3-letter airport code",
        "   - 'date': Use ONLY 'YYYY-MM-DD' format",
        "   - 'trip': MUST be exactly one of these strings: 'one-way' or 'round-trip'. NEVER use an object/dict.",
        "   - 'cabin_class': MUST be exactly one of these lowercase strings: 'economy', 'premium-economy', 'business', or 'first'.",
        "   - 'adults': MUST be an integer.",
        "   - 'children': MUST be an integer.",
        "",
        "2. FORBIDDEN BEHAVIOR:",
        "   - NEVER send 'return_date' or 'infant' or 'children_ages' to the tool. They are not supported.",
        "   - NEVER send 'Economy' with a capital E. It must be 'economy'.",
        "   - NEVER wrap parameters in nested objects unless the documentation tells you to.",
        "",
        "3. WORKFLOW:",
        "   - First, find the airport codes for the requested cities if not provided.",
        "   - Then, call 'get_flights' with the correctly formatted strings and integers.",
        "   - Finally, extract the flight number, price, airline, timings, and stops for the final report.",
    ],
    expected_output="""
      Detailed flight list including:
      - flight_number
      - price
      - airline
      - departure_time
      - arrival_time
      - duration
      - stops
    """,
    markdown=True,
)
# --- NEW CODE END ---

# --- OLD CODE (COMMENTED OUT FOR REVERTING) ---
# flight_search_agent = Agent(
#     name="Flight Search Assistant",
#     model=model,
#     tools=[
#         # FirecrawlTools(poll_interval=10),
#         # kayak_flight_url_generator,
#         get_google_flights,
#     ],
#     instructions=[
#         "You are a sophisticated flight search and analysis assistant for comprehensive travel planning. For any user query:",
#         "1. Parse complete flight requirements including:",
#         "   - Origin and destination cities",
#         "   - Travel dates (outbound and return)",
#         "   - Number of travelers (adults, children, infants)",
#         "   - Preferred cabin class",
#         "   - Any specific airlines or routing preferences",
#         "   - Budget constraints if specified",
#         # "2. Search and analyze multiple flight options:",
#         "2. Search for flight options:",
#         # "   - Use kayak_url_generator to create appropriate search URLs",
#         # "   - Navigate to and extract data from flight search results",
#         "   - Use get_google_flights to get flight results",
#         "   - Consider both direct and connecting flights",
#         "   - Compare different departure times and airlines",
#         "3. For each viable flight option, extract:",
#         "   - Complete pricing breakdown (base fare, taxes, total)",
#         "   - Flight numbers and operating airlines",
#         "   - Detailed timing (departure, arrival, duration, layovers)",
#         "   - Aircraft types and amenities when available",
#         "   - Baggage allowance and policies",
#         "4. Organize and present options with focus on:",
#         "   - Best value for money",
#         "   - Convenient timing and minimal layovers",
#         "   - Reliable airlines with good service records",
#         "   - Flexibility and booking conditions",
#         "5. Provide practical recommendations considering:",
#         "   - Price trends and booking timing",
#         "   - Alternative dates or nearby airports if beneficial",
#         "   - Loyalty program benefits if applicable",
#         "   - Special requirements (extra legroom, dietary, etc.)",
#         "6. Include booking guidance:",
#         "   - Direct booking links when available",
#         "   - Fare rules and change policies",
#         "   - Required documents and visa implications",
#         # "7. Always close browser sessions after completion",
#         ],
#     expected_output="""
#       All flight details with the following fields:
#       - flight_number (str): The flight number of the flight
#       - price (str): The price of the flight
#       - airline (str): The airline of the flight
#       - departure_time (str): The departure time of the flight
#       - arrival_time (str): The arrival time of the flight
#       - duration (str): The duration of the flight
#       - stops (int): The number of stops of the flight
#     """,
#     markdown=True,
# )
