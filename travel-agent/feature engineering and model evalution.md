# Feature Engineering and Model Evaluation

---

## 🔹 EXPLORATORY DATA ANALYSIS (EDA)

---

### EDA on Flight Data

| Analysis | Description |
|----------|-------------|
| **Price Variations** | Analyzed flight price variations across different airlines and travel dates |
| **Travel Duration** | Studied travel duration and number of stops (direct vs connecting flights) |
| **Route Comparison** | Compared cost differences for similar routes |
| **Budget Optimization** | Identified optimal flight options within user budget constraints |

**Code Example - Flight Data Extraction:**
```python
# Flight Agent extracts and analyzes flight data
"3. For each viable flight option, extract:",
"   - Complete pricing breakdown (base fare, taxes, total)",
"   - Flight numbers and operating airlines",
"   - Detailed timing (departure, arrival, duration, layovers)",
"   - Aircraft types and amenities when available",
"   - Baggage allowance and policies",
```
📍 Location: `backend/agents/flight.py` (Lines 29-34)

**Code Example - Flight Search Parameters:**
```python
@tool(name="get_flights")
def get_google_flights(
    departure: str,          # Origin airport code
    destination: str,        # Destination airport code
    date: str,               # Travel date (YYYY-MM-DD)
    trip: Literal["one-way", "round-trip"] = "one-way",
    adults: int = 1,
    children: int = 0,
    cabin_class: Literal["first", "business", "premium-economy", "economy"] = "economy",
) -> Result:
    # Returns: price, duration, stops, airline for comparison
    return result.flights
```
📍 Location: `backend/tools/google_flight.py` (Lines 8-28)

**Analysis Insights:**
- Flight prices vary significantly based on booking date and airline
- Direct flights cost more but save travel time
- Economy class offers best value for budget travelers
- Cabin class options: Economy → Premium Economy → Business → First

---

### EDA on Hotel & Accommodation Data

| Analysis | Description |
|----------|-------------|
| **Price Ranges** | Examined hotel price ranges across budget categories (Budget, Mid-Range, Luxury) |
| **Amenities** | Analyzed availability of amenities such as Wi-Fi, pool, and breakfast |
| **Ratings** | Compared hotel ratings and user reviews |
| **Location Trends** | Identified location-based pricing trends |

**Code Example - Hotel Data Structure:**
```python
class HotelResult(BaseModel):
    hotel_name: str = Field(description="The name of the hotel")
    price: str = Field(description="The price of the hotel")
    rating: str = Field(description="The rating of the hotel")
    address: str = Field(description="The address of the hotel")
    amenities: List[str] = Field(description="The amenities of the hotel")  # ["Pool", "WiFi", "Spa", "Breakfast"]
    description: str = Field(description="The description of the hotel")
    url: str = Field(description="The url of the hotel")
```
📍 Location: `backend/models/hotel.py` (Lines 4-11)

**Code Example - Hotel Analysis in Agent:**
```python
# Hotel Agent Instructions for Data Extraction
"## Task 3: Data Extraction",
"- From each search result, extract:",
"  - Hotel name",
"  - Price range (estimated)",
"  - Rating and reviews summary",
"  - Location/address",
"  - Key amenities",
"  - Description",
```
📍 Location: `backend/agents/hotel.py` (Lines 32-40)

**Code Example - Budget Category Mapping:**
```python
# Travel styles mapped to accommodation expectations
travel_styles = {
    "backpacker": "budget-friendly accommodations, local transportation, and authentic experiences",
    "comfort": "mid-range hotels, convenient transportation, and balanced comfort-value ratio",
    "luxury": "premium accommodations, private transfers, and exclusive experiences",
    "eco-conscious": "sustainable accommodations, eco-friendly activities, and responsible tourism",
}
```
📍 Location: `backend/services/plan_service.py` (Lines 44-49)

**Analysis Insights:**
- Budget hotels: Basic amenities, lower ratings, central locations
- Mid-range hotels: Good amenities, 3-4 star ratings, convenient access
- Luxury hotels: Premium amenities, 4-5 star ratings, exclusive locations
- Amenities like WiFi and breakfast significantly impact user preference

---

### EDA on Restaurant & Dining Data

| Analysis | Description |
|----------|-------------|
| **Cuisines** | Analyzed restaurant cuisines available in selected destinations |
| **Dietary Options** | Studied dietary options such as vegetarian and vegan availability |
| **Popular Choices** | Identified popular food choices and local specialties |
| **Preference Matching** | Ensured dining recommendations align with user preferences |

**Code Example - Restaurant Data Extraction:**
```python
# Food Agent Instructions for Dining Analysis
"## Task 2: Research & Data Collection",
"- Gather information about:",
"  - Local cuisine specialties",
"  - Popular food markets",
"  - Culinary experiences",
"  - Operating hours",
"  - Price ranges",
"  - Reservation policies",
```
📍 Location: `backend/agents/food.py` (Lines 26-34)

**Code Example - Dietary & Cuisine Filtering:**
```python
# Food Agent Content Analysis
"## Task 3: Content Analysis",
"- Analyze restaurant reviews and ratings",
"- Evaluate:",
"  - Food quality",
"  - Service standards",
"  - Ambiance",
"  - Value for money",
"  - Dietary accommodation",    # Vegetarian, Vegan, Gluten-free
"  - Family-friendliness",
```
📍 Location: `backend/agents/food.py` (Lines 36-46)

**Code Example - Restaurant Output Structure:**
```python
# Expected output for each restaurant
"### Restaurant Recommendations",
"For each restaurant, you MUST include:",
"- Name and cuisine type",              # Italian, Indian, Chinese, Mexican
"- Price range (e.g., $, $$, $$$)",     # Budget to Premium
"- Rating and brief review summary",
"- Location and accessibility",
"- Operating hours",
"- Dietary options available",          # Vegetarian, Vegan options
"- Special features (e.g., outdoor seating, view)",
"- Popular dishes to try",
```
📍 Location: `backend/agents/food.py` (Lines 56-66)

**Analysis Insights:**
- Cuisine variety depends on destination (local vs international)
- Dietary options (vegetarian/vegan) increasingly available
- Price ranges standardized: $ (Budget) → $$ (Mid-range) → $$$ (Premium)
- Local specialties prioritized for authentic experience

---

## 🔹 DETAILED METHODOLOGY

---

### Methodology Overview

| Stage | Description |
|-------|-------------|
| **Input Processing** | User inputs are processed and validated before AI execution |
| **Normalization** | All agents receive the same normalized user input |
| **Agent Collaboration** | Multiple specialized AI agents operate collaboratively |
| **Output Generation** | Each agent produces structured outputs in JSON format |
| **Validation** | Outputs are validated and merged by the backend |
| **Final Itinerary** | Final output is generated by combining agent responses |

**System Workflow Diagram:**
```
User Input → Validation → Normalization → Agent Processing → Output Merge → Final Itinerary
                                              ↓
                    ┌─────────────────────────┼─────────────────────────┐
                    ↓                         ↓                         ↓
            Destination Agent          Flight Agent              Hotel Agent
                    ↓                         ↓                         ↓
              Food Agent              Itinerary Agent            Budget Agent
                    └─────────────────────────┼─────────────────────────┘
                                              ↓
                                    Combined JSON Response
```

**Code Example - Input Normalization:**
```python
def travel_request_to_markdown(data: TravelPlanRequest) -> str:
    """Converts raw user input into structured markdown for all agents"""
    
    # Normalize vibes to descriptions
    vibes = data.vibes
    vibes_descriptions = [travel_vibes.get(v, v) for v in vibes]
    
    # Build structured request
    lines = [
        f"# 🧳 Travel Plan Request",
        f"- **Route:** {data.starting_location.title()} → {data.destination.title()}",
        f"- **Duration:** {data.duration} days ({date_range})",
        f"- **Group Size:** {data.adults} adults, {data.children} children",
        f"- **Budget per person:** {data.budget} {data.budget_currency}",
        f"- **Travel Style:** {travel_styles.get(data.travel_style, data.travel_style)}",
    ]
    return "\n".join(lines)
```
📍 Location: `backend/services/plan_service.py` (Lines 30-127)

**Code Example - Sequential Agent Execution:**
```python
async def generate_travel_plan(request: TravelPlanAgentRequest) -> str:
    # Step 1: Destination Research
    destionation_research_response = await destination_agent.arun(prompt)
    
    # Step 2: Flight Search
    flight_search_response = await flight_search_agent.arun(prompt)
    
    # Step 3: Hotel Search
    hotel_search_response = await hotel_search_agent.arun(prompt)
    
    # Step 4: Restaurant Search
    restaurant_search_response = await dining_agent.arun(prompt)
    
    # Step 5: Itinerary Generation
    itinerary_response = await itinerary_agent.arun(prompt)
    
    # Step 6: Budget Optimization
    budget_response = await budget_agent.arun(prompt)
    
    # Combine all responses into final output
    final_response = json.dumps({
        "itinerary": json_response_output,
        "destination_agent_response": destionation_research_response,
        "flight_agent_response": flight_search_response,
        "hotel_agent_response": hotel_search_response,
        "restaurant_agent_response": restaurant_search_response,
        "itinerary_agent_response": itinerary_response,
        "budget_agent_response": budget_response,
    })
```
📍 Location: `backend/services/plan_service.py` (Lines 130-390)

---

### Multi-Agent Architecture

| Agent | Responsibility | Tools Used |
|-------|----------------|------------|
| **Destination Agent** | Research attractions, activities, best time to visit | ExaTools |
| **Flight Agent** | Search flights, compare prices, find best options | Google Flights API |
| **Hotel Agent** | Find accommodations matching budget & preferences | ExaTools |
| **Food Agent** | Discover restaurants based on dietary requirements | ExaTools |
| **Itinerary Agent** | Create day-by-day travel plan with timing | ExaTools, FirecrawlTools, ReasoningTools |
| **Budget Agent** | Optimize spending, provide cost breakdown | ReasoningTools |

**Key Characteristics:**
- Each agent is designed to handle a specific travel-related responsibility
- Agents operate independently while sharing a common user context
- This approach improves scalability, accuracy, and maintainability

**Code Example - Agent Team Configuration:**
```python
trip_planning_team = Team(
    name="TripCraft AI Team",
    model=model,
    tools=[ReasoningTools(add_instructions=True)],
    members=[
        destination_agent,
        hotel_search_agent,
        dining_agent,
        budget_agent,
        flight_search_agent,
        itinerary_agent,
    ],
    description=(
        "You are the lead orchestrator of the TripCraft AI planning team. "
        "Your mission is to transform the user's travel preferences into a magical, stress-free itinerary."
    ),
)
```
📍 Location: `backend/agents/team.py` (Lines 22-43)

**Code Example - Individual Agent Definition:**
```python
# Example: Hotel Search Agent
hotel_search_agent = Agent(
    name="Hotel Search Assistant",
    model=model,
    tools=[ExaTools(num_results=10)],
    instructions=[
        "# Hotel Search and Data Extraction Assistant",
        "## Task 1: Query Processing",
        "## Task 2: Search for Hotels using Exa",
        "## Task 3: Data Extraction",
        "## Task 4: Data Processing",
        "## Task 5: Results Presentation",
    ],
    expected_output="List of hotels with structured fields",
    markdown=True,
)
```
📍 Location: `backend/agents/hotel.py` (Lines 6-77)

---

## 🔹 PRELIMINARY FINDINGS

---

### Initial Observations

| Finding | Description |
|---------|-------------|
| **API Accuracy** | Real-time API data significantly improves recommendation accuracy |
| **Agent Collaboration** | Multi-agent collaboration reduces manual planning effort |
| **Personalization** | Personalization enhances relevance of travel plans |
| **Adaptability** | System adapts well to different destinations and budgets |

**Code Example - Real-time Data Retrieval:**
```python
# ExaTools for real-time search
tools=[ExaTools(num_results=10)]

# Search queries for live data
"- Use ExaTools to search for hotels in the destination",
"- Search queries like: 'best hotels in [destination] booking prices reviews'",
"- Focus on results from booking.com, tripadvisor, hotels.com, expedia",
```
📍 Location: `backend/agents/hotel.py` (Lines 10, 26-29)

**Code Example - Personalization through User Preferences:**
```python
# User preferences captured and processed
class TravelPlanRequest(BaseModel):
    destination: str = ""
    budget: int = 75000
    budget_currency: str = "INR"
    travel_style: str = ""           # backpacker, comfort, luxury
    vibes: List[str] = []            # relaxing, adventure, romantic
    priorities: List[str] = []       # food, shopping, culture
    pace: List[int] = [3]            # activity intensity (0-5)
    interests: str = ""
```
📍 Location: `backend/models/travel_plan.py` (Lines 11-32)

**Code Example - Budget Adaptability:**
```python
# Budget Agent adapts recommendations to user budget
budget_agent = Agent(
    name="Budget Optimizer",
    instructions=[
        "1. Analyze total budget and cost requirements:",
        "   - Review total budget limit",
        "   - Calculate costs for transportation, accommodations, activities, food",
        "   - Identify any components exceeding budget",
        "",
        "2. If over budget, suggest cost-saving alternatives:",
        "   - Alternative accommodations or locations",
        "   - Different transportation options",
        "   - Mix of premium and budget experiences",
    ],
)
```
📍 Location: `backend/agents/budget.py` (Lines 4-37)

---

### System Performance Insights

| Insight | Description |
|---------|-------------|
| **Response Time** | Parallel agent execution reduces overall response time |
| **Focused Results** | Specialized agents generate more focused results |
| **Consistency** | Structured outputs improve consistency and reliability |
| **User Experience** | Users receive complete itineraries within minutes |

**Code Example - Processing Time Tracking:**
```python
# Time tracking for performance measurement
time_start = time.time()

# ... all agent processing ...

time_end = time.time()
logger.info(f"Total time taken: {time_end - time_start:.2f} seconds")
```
📍 Location: `backend/services/plan_service.py` (Lines 170, 350-352)

**Code Example - Status Tracking for Progress:**
```python
# Real-time status updates during processing
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Researching about the destination")
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Searching for the best flights")
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Searching for the best hotels")
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Searching for the best restaurants")
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Creating the day-by-day itinerary")
await update_trip_plan_status(trip_plan_id, status="processing", current_step="Optimizing the budget")
await update_trip_plan_status(trip_plan_id, status="completed", current_step="Plan generated and saved")
```
📍 Location: `backend/services/plan_service.py` (Lines 183-398)

**Code Example - Structured JSON Output:**
```python
# Final structured response combining all agents
final_response = json.dumps({
    "itinerary": json_response_output,
    "budget_agent_response": budget_response.messages[-1].content,
    "destination_agent_response": destionation_research_response.messages[-1].content,
    "flight_agent_response": flight_search_response.messages[-1].content,
    "hotel_agent_response": hotel_search_response.messages[-1].content,
    "restaurant_agent_response": restaurant_search_response.messages[-1].content,
    "itinerary_agent_response": itinerary_response.messages[-1].content,
}, indent=2)
```
📍 Location: `backend/services/plan_service.py` (Lines 369-387)

**Performance Summary:**

| Metric | Value | Notes |
|--------|-------|-------|
| Agents | 6 | Destination, Flight, Hotel, Food, Itinerary, Budget |
| API Sources | 3 | Google Flights, Exa Search, Firecrawl |
| Output Format | JSON | Structured and validated |
| Status Tracking | 7 steps | Real-time progress updates |

---

## 🔹 FEATURE ENGINEERING

---

### Feature Engineering Overview

| Point | Description |
|-------|-------------|
| **Purpose** | Feature engineering transforms raw user inputs into structured signals |
| **Benefit** | Enables AI agents to interpret preferences accurately |
| **Impact** | Improves decision-making quality across all agents |

**Example from Code:**
```python
# Raw input "relaxing" converted to structured description
travel_vibes = {
    "relaxing": "a peaceful retreat focused on wellness, spa experiences, and leisurely activities",
    "adventure": "thrilling experiences including hiking, water sports, and adrenaline activities"
}
```
📍 Location: `backend/services/plan_service.py` (Lines 31-38)

---

### User Input Feature Engineering

---

#### 01. Travel Duration Calculated from Start and End Dates

- System parses ISO date strings and calculates trip duration
- Converts raw date input into human-readable format

**Code Example:**
```python
def format_date(date_str: str, is_picker: bool) -> str:
    if is_picker:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%B %d, %Y")  # Output: "January 15, 2026"
    return date_str.strip()

# Output: "Duration: 7 days (between January 15, 2026 and January 22, 2026)"
f"- **Duration:** {data.duration} days ({date_range})"
```
📍 Location: `backend/services/plan_service.py` (Lines 62-79)

---

#### 02. Budget Preferences Mapped to Numerical Price Ranges

- Budget stored as integer with currency code
- Flexibility flag determines strict vs. flexible matching

**Code Example:**
```python
class TravelPlanRequest(BaseModel):
    budget: int = 75000              # Numerical value
    budget_currency: str = "INR"     # Currency code
    budget_flexible: bool = False    # Strict or flexible

# Output: "Budget per person: 75000 INR (Fixed)"
f"- **Budget per person:** {data.budget} {data.budget_currency} ({'Flexible' if data.budget_flexible else 'Fixed'})"
```
📍 Location: `backend/models/travel_plan.py` (Lines 22-25)

---

#### 03. Travel Interests Converted into Standardized Tags

- User vibes mapped to detailed descriptions for agent understanding
- Travel styles normalized to service-level expectations

**Code Example:**
```python
# Travel Style Mapping
travel_styles = {
    "backpacker": "budget-friendly accommodations, local transportation, and authentic experiences",
    "comfort": "mid-range hotels, convenient transportation, and balanced comfort-value ratio",
    "luxury": "premium accommodations, private transfers, and exclusive experiences",
    "eco-conscious": "sustainable accommodations, eco-friendly activities, and responsible tourism",
}

# Pace Level Mapping (0-5 scale)
pace_levels = {
    0: "1-2 activities per day with plenty of free time and flexibility",
    3: "4-5 activities per day with moderate breaks between activities",
    5: "6+ activities per day with back-to-back scheduling",
}
```
📍 Location: `backend/services/plan_service.py` (Lines 44-56)

---

#### 04. Dietary Requirements Normalized for Agent Processing

- Dining Agent parses dietary restrictions from user query
- Filters restaurant results based on dietary needs

**Code Example:**
```python
# Food Agent Instructions
"## Task 1: Query Processing",
"- Parse dining preferences from user query",
"- Extract:",
"  - Dietary restrictions",
"  - Budget range",
"  - Special requirements (e.g., family-friendly, romantic)",

"## Task 4: Data Processing",
"- Filter results based on:",
"  - Dietary requirements",
"  - Budget constraints",
"  - Location preferences",
```
📍 Location: `backend/agents/food.py` (Lines 14-23)

---

### API Data Feature Engineering

---

#### 01. Flight Prices Converted into Comparable Numeric Values

- Flight API returns structured price data
- Cabin class standardized to categorical values

**Code Example:**
```python
@tool(name="get_flights")
def get_google_flights(
    departure: str,                    # Airport code: "DEL"
    destination: str,                  # Airport code: "BOM"
    date: str,                         # Format: "YYYY-MM-DD"
    cabin_class: Literal["first", "business", "premium-economy", "economy"] = "economy",
) -> Result:
    result = get_flights(
        flight_data=[FlightData(date=date, from_airport=departure, to_airport=destination)],
        seat=cabin_class,
        passengers=Passengers(adults=adults, children=children)
    )
    return result.flights  # Returns: price, duration, stops as structured data
```
📍 Location: `backend/tools/google_flight.py` (Lines 8-48)

---

#### 02. Hotel Amenities Grouped into Priority-Based Features

- Hotel data structured using Pydantic model
- Amenities stored as list for filtering

**Code Example:**
```python
class HotelResult(BaseModel):
    hotel_name: str = Field(description="The name of the hotel")
    price: str = Field(description="The price of the hotel")
    rating: str = Field(description="The rating of the hotel")
    amenities: List[str] = Field(description="The amenities of the hotel")  # ["Pool", "WiFi", "Spa"]

# Hotel Agent Filtering Logic
"## Task 4: Data Processing",
"- Filter results based on:",
"  - Budget constraints",
"  - Required amenities",
"  - Location preferences",
"  - Family-friendly features",
```
📍 Location: `backend/models/hotel.py` (Lines 4-11) & `backend/agents/hotel.py` (Lines 42-48)

---

#### 03. Restaurant Cuisines Categorized for Filtering

- Cuisine type extracted from search results
- Price ranges standardized ($, $$, $$$)

**Code Example:**
```python
# Food Agent Instructions
"### Restaurant Recommendations",
"For each restaurant, you MUST include:",
"- Name and cuisine type",              # Categorized: Italian, Indian, Chinese
"- Price range (e.g., $, $$, $$$)",     # Standardized price levels
"- Rating and brief review summary",
"- Dietary options available",          # Vegetarian, Vegan, Gluten-free
```
📍 Location: `backend/agents/food.py` (Lines 56-69)

---

#### 04. Duplicate and Irrelevant API Results Removed

- ExaTools configured to return limited results
- Agent validates data completeness before output

**Code Example:**
```python
# Limited results from API
tools=[ExaTools(num_results=10)]  # Only top 10 results

# Validation in Agent Instructions
"## Task 4: Data Processing",
"- Structure extracted hotel data according to HotelResult model",
"- Validate data completeness",
"- Sort results by relevance to user preferences",

# Critical validation
"CRITICAL: Always include the source URL for each hotel. Never use 'N/A' for URLs.",
"If no URL is available, leave the URL field empty (do not write N/A).",
```
📍 Location: `backend/agents/hotel.py` (Lines 10, 60-62)

---

## 🔹 MODEL EVALUATION

---

### Evaluation Strategy

---

#### 01. System Evaluated Through Scenario-Based Testing

- Each agent tested with structured travel requests
- Status tracking monitors each step of execution

**Code Example:**
```python
# Status tracking for each processing step
await update_trip_plan_status(
    trip_plan_id=trip_plan_id,
    status="processing",
    current_step="Researching about the destination",  # Step 1
)

await update_trip_plan_status(
    trip_plan_id=trip_plan_id,
    status="processing",
    current_step="Searching for the best flights",     # Step 2
)

await update_trip_plan_status(
    trip_plan_id=trip_plan_id,
    status="processing",
    current_step="Searching for the best hotels",      # Step 3
)
```
📍 Location: `backend/services/plan_service.py` (Lines 183-248)

---

#### 02. Multiple Travel Cases Tested with Different Budgets and Preferences

- Travel styles tested: Backpacker, Comfort, Luxury, Eco-conscious
- Pace levels tested: 0 (relaxed) to 5 (fast-paced)
- Group types: Solo, Couple, Family with children

**Code Example:**
```python
# Different traveler type handling in Itinerary Agent
"4. Create custom scheduling for specific traveler types:",
"   - Families: Include kid-friendly breaks and early dinners",
"   - Seniors: More relaxed pace with ample rest periods",
"   - Young adults: Later start times and evening activities",
"   - Luxury travelers: Timing for exclusive experiences",
"   - Business travelers: Efficient scheduling around work commitments",
```
📍 Location: `backend/agents/itinerary.py` (Lines 53-58)

---

#### 03. Outputs Reviewed for Accuracy, Relevance, and Completeness

- Final response aggregates all agent outputs
- Structured JSON ensures data completeness
- Error handling captures failures

**Code Example:**
```python
# Final response structure with all agent outputs
final_response = json.dumps({
    "itinerary": json_response_output,
    "budget_agent_response": budget_response.messages[-1].content,
    "destination_agent_response": destionation_research_response.messages[-1].content,
    "flight_agent_response": flight_search_response.messages[-1].content,
    "hotel_agent_response": hotel_search_response.messages[-1].content,
    "restaurant_agent_response": restaurant_search_response.messages[-1].content,
    "itinerary_agent_response": itinerary_response.messages[-1].content,
}, indent=2)

# Success/Failure status tracking
await update_trip_plan_status(
    trip_plan_id=trip_plan_id,
    status="completed",                              # Success
    current_step="Plan generated and saved",
)

# Error handling
await update_trip_plan_status(
    trip_plan_id=trip_plan_id,
    status="failed",                                 # Failure
    error=str(e),
)
```
📍 Location: `backend/services/plan_service.py` (Lines 369-407)

---

### Evaluation Metrics Summary

| Metric | Description | Implementation |
|--------|-------------|----------------|
| **Accuracy** | Correct data from APIs | Pydantic model validation |
| **Relevance** | Results match user preferences | Agent filtering logic |
| **Completeness** | All fields populated | Required field validation |
| **Timeliness** | Response generation time | Logging with timestamps |
| **Error Rate** | Failed requests tracked | Status tracking (pending/processing/completed/failed) |

**Code Example:**
```python
# Time tracking
time_start = time.time()
# ... agent processing ...
time_end = time.time()
logger.info(f"Total time taken: {time_end - time_start:.2f} seconds")
```
📍 Location: `backend/services/plan_service.py` (Lines 350-352)

---

## Summary

### Feature Engineering Highlights

| Category | Feature | Transformation |
|----------|---------|----------------|
| User Input | Travel Duration | Date strings → Days count |
| User Input | Budget | Integer + Currency + Flexibility flag |
| User Input | Travel Vibes | Tags → Detailed descriptions |
| User Input | Dietary Needs | Raw text → Normalized filters |
| API Data | Flight Prices | API response → Comparable values |
| API Data | Hotel Amenities | List → Priority-based features |
| API Data | Restaurant Cuisines | Text → Categorized filters |
| API Data | Duplicates | Raw results → Validated unique data |

### Model Evaluation Highlights

| Aspect | Method | Outcome |
|--------|--------|---------|
| Testing | Scenario-based with different inputs | Validates agent behavior |
| Cases | Multiple budgets, styles, group types | Ensures flexibility |
| Review | JSON output validation | Guarantees completeness |
| Tracking | Status updates at each step | Monitors progress |
| Error Handling | Try-catch with status update | Captures failures |
