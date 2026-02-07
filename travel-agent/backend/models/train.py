from pydantic import BaseModel, Field
from typing import List, Optional


class TrainResult(BaseModel):
    """Model for individual train result with all essential, fare, and additional data."""
    
    # Essential Data (Must Have)
    train_number: str = Field(default="", description="Unique train ID (e.g., '12951')")
    train_name: str = Field(default="", description="Popular name (e.g., 'Mumbai Rajdhani Express')")
    departure_station: str = Field(default="", description="Starting station with code (e.g., 'New Delhi (NDLS)')")
    arrival_station: str = Field(default="", description="Ending station with code (e.g., 'Mumbai Central (BCT)')")
    departure_time: str = Field(default="", description="When train leaves (e.g., '04:55 PM')")
    arrival_time: str = Field(default="", description="When train arrives (e.g., '08:35 AM (+1 day)')")
    duration: str = Field(default="", description="Total journey time (e.g., '15h 40m')")
    distance: str = Field(default="", description="Total kilometers (e.g., '1,384 km')")
    running_days: str = Field(default="", description="Days the train runs (e.g., 'Mon, Wed, Fri, Sun')")
    
    # Class & Fare Data (Important for User Decision)
    classes_available: List[str] = Field(default_factory=list, description="List of coach types (e.g., ['1A', '2A', '3A', 'SL'])")
    fare_1ac: str = Field(default="", description="First AC price (e.g., '₹4,875')")
    fare_2ac: str = Field(default="", description="Second AC price (e.g., '₹2,875')")
    fare_3ac: str = Field(default="", description="Third AC price (e.g., '₹1,990')")
    fare_sleeper: str = Field(default="", description="Sleeper class price (e.g., '₹735')")
    fare_general: str = Field(default="", description="General class price (e.g., '₹420')")
    
    # Additional Data (Nice to Have)
    train_type: str = Field(default="", description="Category of train (e.g., 'Rajdhani / Shatabdi / Express / Mail')")
    pantry_available: str = Field(default="", description="Food service availability (e.g., 'Yes - Pantry Car')")
    stops: int = Field(default=0, description="Number of intermediate stops")
    avg_speed: str = Field(default="", description="Average speed (e.g., '88 km/h')")
    booking_url: str = Field(default="", description="Source URL for train details (from search results)")


class TrainResults(BaseModel):
    """Model for list of train search results."""
    trains: List[TrainResult] = Field(default_factory=list, description="List of trains between stations")


class TrainSearchRequest(BaseModel):
    """Model for train search request parameters."""
    source_station: str = Field(description="Source station code (e.g., 'NDLS' for New Delhi)")
    destination_station: str = Field(description="Destination station code (e.g., 'BCT' for Mumbai Central)")
    date: str = Field(description="Travel date in YYYY-MM-DD format")
    adults: int = Field(default=1, description="Number of adult passengers")
    children: int = Field(default=0, description="Number of child passengers")
    preferred_class: Optional[str] = Field(default=None, description="Preferred class (1A, 2A, 3A, SL, GEN)")
