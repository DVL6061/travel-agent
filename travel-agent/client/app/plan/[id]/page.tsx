"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  DollarSign,
  Globe,
  Info,
  Landmark,
  MapPin,
  Moon,
  Paperclip,
  Plane,
  Sun,
  Users,
  Heart,
  Home,
  Loader2,
  // --- NEW CODE: Train icon for Trains tab ---
  Train,
  // --- END NEW CODE ---
  Lightbulb,
  Utensils,
  Receipt,
  Timer, // For Destination Guide duration
  Ticket, // For entry fee in Destination Guide
  Compass, // For Popular Areas section
  Navigation, // For Common Activities
  Sparkles, // For section headers
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Type Definitions
interface DayPlan {
  day: number;
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
  notes?: string;
}

interface Hotel {
  hotel_name: string;
  price: string;
  rating: string;
  address: string;
  amenities: string[];
  description?: string;
  url?: string;
}

interface Attraction {
  name: string;
  description?: string;
}

interface Flight {
  duration: string;
  price: string;
  departure_time: string;
  arrival_time: string;
  airline: string;
  flight_number?: string;
  url?: string;
  stops?: number;
}

interface Restaurant {
  name: string;
  description?: string;
  location?: string;
  url?: string;
}

// --- NEW CODE: Train Interface ---
interface Train {
  train_number: string;
  train_name: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  distance?: string;
  running_days?: string;
  classes_available?: string[];
  fare_1ac?: string;
  fare_2ac?: string;
  fare_3ac?: string;
  fare_sleeper?: string;
  fare_general?: string;
  train_type?: string;
  pantry_available?: string;
  stops?: number;
  avg_speed?: string;
  booking_url?: string;
}
// --- END NEW CODE ---

interface Itinerary {
  day_by_day_plan: DayPlan[];
  hotels: Hotel[];
  attractions: Attraction[];
  flights: Flight[];
  // --- NEW CODE: Trains Array ---
  trains?: Train[];
  // --- END NEW CODE ---
  restaurants?: Restaurant[];
  tips?: string[];
  budget_insights?: string[];
}

interface TripDetails {
  id: string;
  name?: string;
  status: "pending" | "completed" | "failed" | "in-progress";
  itinerary?: Itinerary;
  // Raw agent responses
  budget_agent_response?: string;
  destination_agent_response?: string;
  flight_agent_response?: string | null; // null = agent skipped, string = agent ran
  train_agent_response?: string | null; // null = agent skipped, string = agent ran
  restaurant_agent_response?: string;
  itinerary_agent_response?: string;
  current_step?: string;
  // Input details
  destination?: string;
  startingLocation?: string;
  travelDatesStart?: string;
  travelDatesEnd?: string;
  dateInputType?: string;
  duration?: number;
  travelingWith?: string;
  adults?: number;
  children?: number;
  ageGroups?: string[];
  budget?: number;
  budgetCurrency?: string;
  travelStyle?: string;
  budgetFlexible?: boolean;
  vibes?: string[];
  priorities?: string[];
  interests?: string;
  rooms?: number;
  pace?: number[];
  beenThereBefore?: string;
  lovedPlaces?: string;
  additionalInfo?: string;
}

// Helper functions
const isValidUrl = (url?: string): boolean => {
  if (!url || url.trim() === "") return false;
  const lowerUrl = url.toLowerCase().trim();
  // Reject N/A, Not Available, and other placeholder values
  if (lowerUrl === "n/a" || lowerUrl === "na" || lowerUrl.includes("not available")) return false;
  // Must start with http:// or https://
  return lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://");
};

const formatCurrency = (amount?: number, currency?: string) => {
  if (!amount) return "Not specified";
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
  };
  return `${symbols[currency || "USD"] || "$"}${amount.toLocaleString()}`;
};

const formatDate = (dateString?: string, inputType?: string) => {
  if (!dateString || inputType === "text") {
    return dateString || "Flexible dates";
  }
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const getPaceDescription = (pace?: number[]) => {
  if (!pace || !pace.length) return "Balanced";
  const paceValue = pace[0] || 3;
  const descriptions = {
    1: "Very relaxed",
    2: "Mostly relaxed",
    3: "Balanced",
    4: "Quite busy",
    5: "Action-packed",
  };
  return descriptions[paceValue as keyof typeof descriptions] || "Balanced";
};

// Helper function to render status badge
function StatusBadge({ status }: { status: TripDetails["status"] }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let text = status.toUpperCase();

  switch (status) {
    case "completed":
      variant = "default"; // Using Tailwind's green for success
      text = "Completed";
      break;
    case "pending":
      variant = "secondary"; // Using Tailwind's yellow for pending
      text = "Pending";
      break;
    case "in-progress":
      variant = "outline"; // Using Tailwind's blue for in-progress
      text = "In Progress";
      break;
    case "failed":
      variant = "destructive";
      text = "Failed";
      break;
  }
  return (
    <Badge
      variant={variant}
      className={
        status === "completed"
          ? "bg-green-500 hover:bg-green-600 text-white"
          : status === "pending"
            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
            : status === "in-progress"
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : ""
      }
    >
      {text}
    </Badge>
  );
}

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  // Function to fetch trip details
  const fetchTripDetails = useCallback(async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${tripId}`);
      const data = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch trip details");
      }

      if (data.success && data.tripPlan) {
        // Convert raw data to our TripDetails format
        const tripPlan = data.tripPlan;
        console.log("Trip plan data:", tripPlan);

        // Map the database status to our TripDetails status
        let status: TripDetails["status"] = "pending";
        if (tripPlan.status) {
          switch (tripPlan.status.status) {
            case "completed":
              status = "completed";
              break;
            case "processing":
              status = "in-progress";
              break;
            case "failed":
              status = "failed";
              break;
            default:
              status = "pending";
          }
        }

        // Parse the itinerary JSON if it exists
        let itinerary: Itinerary | undefined;

        // Extract all agent responses from the parsed JSON
        // null = agent was skipped, "" or string = agent ran
        let budget_agent_response = "";
        let destination_agent_response = "";
        let flight_agent_response: string | null = null;
        let train_agent_response: string | null = null;
        let restaurant_agent_response = "";
        let itinerary_agent_response = "";

        if (tripPlan.output?.itinerary) {
          try {
            // First parse the outer JSON string
            const parsedOutput = JSON.parse(tripPlan.output.itinerary);
            console.log("Parsed output:", parsedOutput);

            // Extract agent responses from the parsed JSON
            budget_agent_response = parsedOutput.budget_agent_response || "";
            destination_agent_response =
              parsedOutput.destination_agent_response || "";
            flight_agent_response = parsedOutput.flight_agent_response ?? null;
            train_agent_response = parsedOutput.train_agent_response ?? null;
            restaurant_agent_response =
              parsedOutput.restaurant_agent_response || "";
            itinerary_agent_response =
              parsedOutput.itinerary_agent_response || "";

            if (parsedOutput.itinerary) {
              // Then parse the inner JSON string to get the actual itinerary
              itinerary = JSON.parse(parsedOutput.itinerary) as Itinerary;
              console.log("Parsed itinerary:", itinerary);
            }
          } catch (e) {
            console.error("Failed to parse itinerary JSON:", e);
          }
        }

        console.log("Budget agent response:", budget_agent_response);
        console.log("Destination agent response:", destination_agent_response);

        const tripDetails: TripDetails = {
          id: tripPlan.id,
          name: tripPlan.name,
          status,
          itinerary,
          // Extract current step from status if available
          current_step: tripPlan.status?.currentStep || undefined,
          // Raw agent responses
          budget_agent_response,
          destination_agent_response,
          flight_agent_response,
          train_agent_response,
          restaurant_agent_response,
          itinerary_agent_response,
          // Input details
          destination: tripPlan.destination,
          startingLocation: tripPlan.startingLocation,
          travelDatesStart: tripPlan.travelDatesStart
            ? String(tripPlan.travelDatesStart)
            : undefined,
          travelDatesEnd: tripPlan.travelDatesEnd
            ? String(tripPlan.travelDatesEnd)
            : undefined,
          dateInputType: tripPlan.dateInputType,
          duration: tripPlan.duration ?? undefined,
          travelingWith: tripPlan.travelingWith,
          adults: tripPlan.adults,
          children: tripPlan.children,
          ageGroups: tripPlan.ageGroups as string[],
          budget: tripPlan.budget,
          budgetCurrency: tripPlan.budgetCurrency,
          travelStyle: tripPlan.travelStyle,
          budgetFlexible: tripPlan.budgetFlexible,
          vibes: tripPlan.vibes as string[],
          priorities: tripPlan.priorities as string[],
          interests: tripPlan.interests ?? undefined,
          rooms: tripPlan.rooms,
          pace: tripPlan.pace as number[],
          beenThereBefore: tripPlan.beenThereBefore ?? undefined,
          lovedPlaces: tripPlan.lovedPlaces ?? undefined,
          additionalInfo: tripPlan.additionalInfo ?? undefined,
        };

        console.log("Setting trip state:", tripDetails);
        setTrip(tripDetails);
      } else {
        setError("Trip plan not found");
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
      setError(
        `Failed to fetch trip details: ${err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Function to retry a failed trip plan
  const retryTripPlan = async () => {
    if (!tripId) return;

    try {
      setRetryLoading(true);
      const response = await fetch(`/api/plans/${tripId}/retry`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to retry trip plan");
      }

      // Refresh trip details after retry
      await fetchTripDetails();

      // Start polling again
      setPolling(true);
    } catch (err) {
      console.error("Error retrying trip plan:", err);
      setError(
        `Failed to retry trip plan: ${err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setRetryLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Setup polling
  useEffect(() => {
    if (!trip) return;

    // Check if we should poll
    const shouldPoll = trip.status !== "completed" && trip.status !== "failed";

    if (shouldPoll) {
      setPolling(true);
      const pollInterval = setInterval(fetchTripDetails, 5000);

      return () => {
        clearInterval(pollInterval);
        setPolling(false);
      };
    } else {
      setPolling(false);
    }
  }, [trip, trip?.status, tripId, fetchTripDetails]);

  // Render loading state
  if (loading && !trip) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 size={48} className="animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Loading Trip Details</h1>
        <p className="text-muted-foreground text-center">
          Fetching your trip plan...
        </p>
      </div>
    );
  }

  // Render error state
  if (error || !trip) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Landmark size={64} className="text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Trip Not Found</h1>
        <p className="text-muted-foreground text-center">
          {error ||
            "The trip you are looking for does not exist or could not be loaded."}
        </p>
        <Link href="/plans" className="mt-4 text-primary hover:underline">
          Go to your trip plans
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {trip.destination && (
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" />
                {trip.destination}
              </h1>
            )}
            {trip.name && trip.name !== trip.destination && (
              <p className="text-xl text-muted-foreground mt-1">{trip.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {polling && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Updating...
              </div>
            )}
            <StatusBadge status={trip.status} />
          </div>
        </div>
      </header>

      <Separator />

      {/* Trip Input Details Section */}
      <section className="bg-muted/30 rounded-lg p-6 border border-border">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Globe className="mr-3 h-6 w-6 text-primary" /> Trip Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Destination and Location */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Destination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">To:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.destination}
                  </span>
                </div>
                <div>
                  <span className="font-medium">From:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.startingLocation}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Duration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                Travel Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">From:</span>{" "}
                  <span className="text-muted-foreground">
                    {formatDate(trip.travelDatesStart, trip.dateInputType)}
                  </span>
                </div>
                {trip.travelDatesEnd && (
                  <div>
                    <span className="font-medium">To:</span>{" "}
                    <span className="text-muted-foreground">
                      {formatDate(trip.travelDatesEnd, trip.dateInputType)}
                    </span>
                  </div>
                )}
                {trip.duration && (
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    <span className="text-muted-foreground">
                      {trip.duration} days
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Travelers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Travelers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.travelingWith}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Group:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.adults} adult{trip.adults !== 1 ? "s" : ""}
                    {trip.children && trip.children > 0
                      ? `, ${trip.children} child${trip.children !== 1 ? "ren" : ""
                      }`
                      : ""}
                  </span>
                </div>
                {trip.ageGroups && trip.ageGroups.length > 0 && (
                  <div>
                    <span className="font-medium">Ages:</span>{" "}
                    <span className="text-muted-foreground">
                      {trip.ageGroups.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accommodation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Home className="h-4 w-4 mr-2 text-primary" />
                Accommodation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.travelStyle}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Rooms:</span>{" "}
                  <span className="text-muted-foreground">{trip.rooms}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Amount:</span>{" "}
                  <span className="text-muted-foreground">
                    {formatCurrency(trip.budget, trip.budgetCurrency)} per
                    person
                  </span>
                </div>
                <div>
                  <span className="font-medium">Flexible:</span>{" "}
                  <span className="text-muted-foreground">
                    {trip.budgetFlexible ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Style */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-4 w-4 mr-2 text-primary" />
                Trip Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Pace:</span>{" "}
                  <span className="text-muted-foreground">
                    {getPaceDescription(trip.pace)}
                  </span>
                </div>
                {trip.vibes && trip.vibes.length > 0 && (
                  <div>
                    <span className="font-medium block mb-1">Vibes:</span>
                    <div className="flex flex-wrap gap-1">
                      {trip.vibes.map((vibe) => (
                        <Badge
                          key={vibe}
                          variant="secondary"
                          className="text-xs"
                        >
                          {vibe}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {trip.priorities && trip.priorities.length > 0 && (
                  <div>
                    <span className="font-medium block mb-1">Priorities:</span>
                    <div className="flex flex-wrap gap-1">
                      {trip.priorities.map((priority) => (
                        <Badge
                          key={priority}
                          variant="outline"
                          className="text-xs"
                        >
                          {priority}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {(trip.interests ||
          trip.beenThereBefore ||
          trip.lovedPlaces ||
          trip.additionalInfo) && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">
                Additional Information
              </h3>
              <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.interests && (
                    <div>
                      <h4 className="font-medium mb-1">Specific Interests:</h4>
                      <p className="text-muted-foreground text-sm">
                        {trip.interests}
                      </p>
                    </div>
                  )}
                  {trip.beenThereBefore && (
                    <div>
                      <h4 className="font-medium mb-1">Previous Visits:</h4>
                      <p className="text-muted-foreground text-sm">
                        {trip.beenThereBefore}
                      </p>
                    </div>
                  )}
                  {trip.lovedPlaces && (
                    <div>
                      <h4 className="font-medium mb-1">Loved Places:</h4>
                      <p className="text-muted-foreground text-sm">
                        {trip.lovedPlaces}
                      </p>
                    </div>
                  )}
                  {trip.additionalInfo && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-1">
                        Additional Information:
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {trip.additionalInfo}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
      </section>

      {/* Show loading message or itinerary based on status */}
      {(trip.status === "pending" ||
        trip.status === "in-progress" ||
        trip.status === "failed") && (
          <div className="text-center py-10 border rounded-lg">
            <Info size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {trip.status === "pending" && "Trip Plan in Progress"}
              {trip.status === "in-progress" && "Trip Plan is Being Generated"}
              {trip.status === "failed" && "Failed to Generate Trip Plan"}
            </h2>
            <p className="text-muted-foreground">
              {trip.status === "pending" &&
                "Your trip itinerary is currently being planned. Please wait as we create your personalized travel plan."}
              {trip.status === "in-progress" &&
                "We are working on your trip details. This might take a few moments. The page will automatically update when your plan is ready."}
              {trip.status === "failed" &&
                "Something went wrong while generating your trip plan. Please try again or contact support."}
            </p>

            {/* Show current step when available */}
            {(trip.status === "pending" || trip.status === "in-progress") &&
              trip.current_step && (
                <div className="mt-4 bg-muted/30 p-4 rounded-lg max-w-md mx-auto">
                  <h3 className="font-medium text-sm mb-1">Current Progress:</h3>
                  <p className="text-primary font-medium">{trip.current_step}</p>
                </div>
              )}

            {(trip.status === "pending" || trip.status === "in-progress") && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating automatically...
                </div>
              </div>
            )}

            {/* Add retry button for failed plans */}
            {trip.status === "failed" && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={retryTripPlan}
                  disabled={retryLoading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {retryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 22v-6h6"></path>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                      </svg>
                      Retry Plan Generation
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      {/* Show tabbed content when completed */}
      {trip.status === "completed" && (
        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="mb-4 flex w-full justify-start overflow-auto">
            <TabsTrigger value="itinerary" className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" /> Itinerary
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" /> Destination Guide
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center">
              <Home className="h-4 w-4 mr-2" /> Hotels
            </TabsTrigger>
            {/* Flight Tab: Only show if flight agent ran */}
            {trip.flight_agent_response !== null && (
              <TabsTrigger value="flights" className="flex items-center">
                <Plane className="h-4 w-4 mr-2" /> Flights
              </TabsTrigger>
            )}
            {/* Train Tab: Only show if train agent ran */}
            {trip.train_agent_response !== null && (
              <TabsTrigger value="trains" className="flex items-center">
                <Train className="h-4 w-4 mr-2" /> Trains
              </TabsTrigger>
            )}
            <TabsTrigger value="dining" className="flex items-center">
              <Utensils className="h-4 w-4 mr-2" /> Dining
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" /> Budget
            </TabsTrigger>
          </TabsList>

          {/* Itinerary Tab Content */}
          <TabsContent value="itinerary" className="space-y-8">
            {trip.itinerary && (
              <div className="space-y-12">
                {/* Day-by-Day Plan Section */}
                <section>
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <CalendarDays className="mr-3 h-6 w-6 text-primary" /> Daily
                    Itinerary
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {trip.itinerary.day_by_day_plan.map((dayPlan) => (
                      <Card
                        key={dayPlan.day}
                        className="overflow-hidden border-l-4 border-l-primary"
                      >
                        <CardHeader className="bg-muted/50 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl flex items-center">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mr-3">
                                {dayPlan.day}
                              </span>
                              <span>Day {dayPlan.day}</span>
                            </CardTitle>
                            {dayPlan.date && (
                              <Badge variant="outline" className="ml-auto">
                                <CalendarDays className="mr-1 h-3 w-3" />
                                {new Date(dayPlan.date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex items-center mb-3">
                              <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                              <h3 className="font-medium">Morning</h3>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {dayPlan.morning}
                            </p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex items-center mb-3">
                              <Sun className="h-5 w-5 mr-2 text-orange-500" />
                              <h3 className="font-medium">Afternoon</h3>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {dayPlan.afternoon}
                            </p>
                          </div>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex items-center mb-3">
                              <Moon className="h-5 w-5 mr-2 text-indigo-500" />
                              <h3 className="font-medium">Evening</h3>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {dayPlan.evening}
                            </p>
                          </div>
                        </CardContent>
                        {dayPlan.notes && (
                          <div className="px-6 py-3 bg-muted/10">
                            <div className="flex items-start">
                              <Paperclip className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Note:</span>{" "}
                                {dayPlan.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Attractions Section */}
                {trip.itinerary.attractions &&
                  trip.itinerary.attractions.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-semibold mb-6 flex items-center">
                        <Landmark className="mr-3 h-6 w-6 text-primary" />{" "}
                        Attractions & Activities
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trip.itinerary.attractions.map((attraction, index) => (
                          <Card
                            key={index}
                            className="group hover:shadow-md transition-all duration-300 border-b-4 border-b-transparent hover:border-b-primary"
                          >
                            <CardHeader>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {attraction.name}
                              </CardTitle>
                            </CardHeader>
                            {attraction.description && (
                              <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {attraction.description}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Tips Section */}
                {trip.itinerary.tips && trip.itinerary.tips.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <Lightbulb className="mr-3 h-6 w-6 text-primary" /> Travel
                      Tips
                    </h2>
                    <Card>
                      <CardContent className="pt-6">
                        <ul className="space-y-2">
                          {trip.itinerary.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary mr-3 flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-muted-foreground">
                                {tip}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </div>
            )}
          </TabsContent>

          {/* Guide Tab Content */}
          <TabsContent value="guide" className="space-y-8">
            {trip.destination_agent_response ? (
              (() => {
                // ==========================================
                // DESTINATION GUIDE PARSER - 4 SECTION LAYOUT
                // ==========================================

                interface MainAttraction {
                  name: string;
                  description: string;
                  location?: string;
                  hours?: string;
                  entry?: string;
                  duration?: string;
                  tip?: string;
                  icon: string;
                }

                interface SimpleItem {
                  name: string;
                  description: string;
                  icon: string;
                }

                interface BasicInfoItem {
                  label: string;
                  value: string;
                  icon: string;
                }

                interface ParsedGuide {
                  mainAttractions: MainAttraction[];
                  commonActivities: SimpleItem[];
                  popularAreas: SimpleItem[];
                  basicInfo: BasicInfoItem[];
                }

                const getAttractionIcon = (name: string, desc: string): string => {
                  const combined = (name + " " + (desc || "")).toLowerCase();
                  if (combined.includes("temple") || combined.includes("mandir") || combined.includes("church") || combined.includes("mosque") || combined.includes("cathedral") || combined.includes("pagoda") || combined.includes("kali")) return "🛕";
                  if (combined.includes("museum") || combined.includes("gallery") || combined.includes("sangrahalaya") || combined.includes("memorial") || combined.includes("victoria")) return "🏛️";
                  if (combined.includes("fort") || combined.includes("palace") || combined.includes("castle") || combined.includes("mahal")) return "🏰";
                  if (combined.includes("beach") || combined.includes("coast") || combined.includes("marina")) return "🏖️";
                  if (combined.includes("park") || combined.includes("garden") || combined.includes("eco") || combined.includes("botanical")) return "🌳";
                  if (combined.includes("monument") || combined.includes("gateway") || combined.includes("tower") || combined.includes("arch") || combined.includes("pillar")) return "🗼";
                  if (combined.includes("railway") || combined.includes("station") || combined.includes("train") || combined.includes("terminus") || combined.includes("howrah")) return "🚂";
                  if (combined.includes("bridge")) return "🌉";
                  if (combined.includes("cave") || combined.includes("elephanta")) return "⛰️";
                  if (combined.includes("market") || combined.includes("bazaar") || combined.includes("shopping") || combined.includes("new market")) return "🛍️";
                  if (combined.includes("lake") || combined.includes("river") || combined.includes("ganga") || combined.includes("ganges") || combined.includes("boat")) return "🌊";
                  if (combined.includes("walk") || combined.includes("promenade") || combined.includes("street")) return "🚶";
                  if (combined.includes("ghat") || combined.includes("dhobi") || combined.includes("laundry")) return "🧺";
                  if (combined.includes("food") || combined.includes("cook") || combined.includes("cuisine") || combined.includes("restaurant") || combined.includes("dining") || combined.includes("street food")) return "🍽️";
                  if (combined.includes("yoga") || combined.includes("wellness") || combined.includes("meditation")) return "🧘";
                  if (combined.includes("bollywood") || combined.includes("film") || combined.includes("cinema")) return "🎬";
                  if (combined.includes("culture") || combined.includes("art") || combined.includes("heritage") || combined.includes("performance") || combined.includes("dance") || combined.includes("music")) return "🎭";
                  if (combined.includes("cemetery") || combined.includes("tomb")) return "🪦";
                  if (combined.includes("zoo") || combined.includes("aquarium")) return "🦁";
                  if (combined.includes("pottery") || combined.includes("craft") || combined.includes("kumartuli")) return "🏺";
                  return "📍";
                };

                const getActivityIcon = (name: string, desc: string): string => {
                  const combined = (name + " " + (desc || "")).toLowerCase();
                  if (combined.includes("food") || combined.includes("eat") || combined.includes("cook") || combined.includes("culinary") || combined.includes("cuisine") || combined.includes("vegetarian")) return "🍜";
                  if (combined.includes("boat") || combined.includes("cruise") || combined.includes("river") || combined.includes("ganges")) return "🚣";
                  if (combined.includes("shop") || combined.includes("market") || combined.includes("bazaar") || combined.includes("buy")) return "🛒";
                  if (combined.includes("walk") || combined.includes("tour") || combined.includes("trek") || combined.includes("hike")) return "🚶";
                  if (combined.includes("culture") || combined.includes("performance") || combined.includes("dance") || combined.includes("music") || combined.includes("attend")) return "🎭";
                  if (combined.includes("pottery") || combined.includes("craft") || combined.includes("art") || combined.includes("visit")) return "🎨";
                  if (combined.includes("photo") || combined.includes("view") || combined.includes("scenic")) return "📸";
                  if (combined.includes("yoga") || combined.includes("meditation") || combined.includes("wellness")) return "🧘";
                  if (combined.includes("night") || combined.includes("party") || combined.includes("bar") || combined.includes("pub")) return "🌃";
                  return "✨";
                };

                const getAreaIcon = (name: string, desc: string): string => {
                  const combined = (name + " " + (desc || "")).toLowerCase();
                  if (combined.includes("restaurant") || combined.includes("food") || combined.includes("dining") || combined.includes("nightlife")) return "🍽️";
                  if (combined.includes("shop") || combined.includes("market") || combined.includes("commercial")) return "🛍️";
                  if (combined.includes("book") || combined.includes("college") || combined.includes("university") || combined.includes("education")) return "📚";
                  if (combined.includes("modern") || combined.includes("new") || combined.includes("urban") || combined.includes("town")) return "🏙️";
                  if (combined.includes("historic") || combined.includes("old") || combined.includes("heritage")) return "🏛️";
                  if (combined.includes("beach") || combined.includes("waterfront") || combined.includes("coast")) return "🏖️";
                  if (combined.includes("park") || combined.includes("garden") || combined.includes("green")) return "🌳";
                  return "📌";
                };

                const getBasicInfoIcon = (label: string): string => {
                  const lower = label.toLowerCase();
                  if (lower.includes("food") || lower.includes("vegetarian") || lower.includes("cuisine") || lower.includes("dining")) return "🥗";
                  if (lower.includes("transport") || lower.includes("getting") || lower.includes("taxi") || lower.includes("metro") || lower.includes("bus")) return "🚌";
                  if (lower.includes("safety") || lower.includes("safe") || lower.includes("security")) return "🛡️";
                  if (lower.includes("weather") || lower.includes("climate") || lower.includes("best time") || lower.includes("visit")) return "🌤️";
                  if (lower.includes("currency") || lower.includes("money") || lower.includes("atm") || lower.includes("bank")) return "💰";
                  if (lower.includes("language") || lower.includes("speak") || lower.includes("communication")) return "🗣️";
                  if (lower.includes("emergency") || lower.includes("hospital") || lower.includes("police") || lower.includes("help")) return "🚨";
                  if (lower.includes("internet") || lower.includes("wifi") || lower.includes("sim") || lower.includes("phone")) return "📱";
                  return "ℹ️";
                };

                const clean = (t: string): string => t.replace(/\*\*/g, "").replace(/^\*|\*$/g, "").trim();

                const parseDestinationGuide = (text: string): ParsedGuide => {
                  const result: ParsedGuide = {
                    mainAttractions: [],
                    commonActivities: [],
                    popularAreas: [],
                    basicInfo: [],
                  };

                  // Split into sections
                  type SectionType = "main" | "activities" | "areas" | "info" | "none";
                  let currentSection: SectionType = "none";
                  let currentAttraction: any = null;

                  const pushCurrentAttraction = () => {
                    if (currentAttraction && currentAttraction.name && currentSection === "main") {
                      const n = clean(currentAttraction.name);
                      result.mainAttractions.push({
                        name: n,
                        description: clean(currentAttraction.description || ""),
                        location: currentAttraction.location ? clean(currentAttraction.location) : undefined,
                        hours: currentAttraction.hours ? clean(currentAttraction.hours) : undefined,
                        entry: currentAttraction.entry ? clean(currentAttraction.entry) : undefined,
                        duration: currentAttraction.duration ? clean(currentAttraction.duration) : undefined,
                        tip: currentAttraction.tip ? clean(currentAttraction.tip) : undefined,
                        icon: getAttractionIcon(n, currentAttraction.description || ""),
                      });
                    }
                    currentAttraction = null;
                  };

                  const detectSection = (line: string): SectionType | null => {
                    const lower = line.replace(/[#*_\-•]/g, "").trim().toLowerCase();
                    if (lower === "main attractions" || lower === "top attractions" || lower === "key attractions" || lower === "major attractions") return "main";
                    if (lower === "common activities" || lower === "activities" || lower === "things to do" || lower === "experiences") return "activities";
                    if (lower === "popular areas" || lower === "neighborhoods" || lower === "areas" || lower === "notable areas" || lower === "key areas") return "areas";
                    if (lower === "basic information" || lower === "practical information" || lower === "useful information" || lower === "essential information" || lower === "travel tips" || lower === "general tips" || lower === "quick tips") return "info";
                    if (lower === "tourist guide" || lower === "destination guide" || lower === "travel guide") return "none";
                    return null;
                  };

                  const lines = text.split("\n");

                  lines.forEach((line) => {
                    const trimmed = line.trim();
                    if (!trimmed) return;

                    // Check for markdown headers: ## Section Name
                    const headerMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
                    if (headerMatch) {
                      pushCurrentAttraction();
                      const section = detectSection(headerMatch[1]);
                      if (section !== null) currentSection = section;
                      return;
                    }

                    // Check for plain section headers
                    const section = detectSection(trimmed);
                    if (section !== null) {
                      pushCurrentAttraction();
                      currentSection = section;
                      return;
                    }

                    // Parse based on current section
                    if (currentSection === "main") {
                      // Match bold name: **Name:** Description (colon can be inside or outside **)
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      const plainMatch = !boldMatch ? trimmed.match(/^([A-Z][A-Za-z\s\-'().&,]+?):\s+(.+)$/) : null;
                      const nameMatch = boldMatch || plainMatch;

                      if (nameMatch) {
                        const name = clean(nameMatch[1]).replace(/:$/, "").trim();
                        const desc = clean(nameMatch[2] || "");
                        const lower = name.toLowerCase();

                        // Check if this is metadata for current attraction
                        if (currentAttraction) {
                          if (lower === "location" || lower === "address") { currentAttraction.location = desc; return; }
                          if (lower === "open" || lower === "hours" || lower === "timing" || lower === "opening hours" || lower.startsWith("open")) { currentAttraction.hours = desc; return; }
                          if (lower === "entry" || lower === "entry fee" || lower === "fee" || lower === "price" || lower === "ticket" || lower === "admission") { currentAttraction.entry = desc; return; }
                          if (lower === "duration" || lower === "time needed" || lower === "time required") { currentAttraction.duration = desc; return; }
                          if (lower === "tip" || lower === "note" || lower === "tips" || lower === "pro tip") { currentAttraction.tip = desc; return; }
                        }

                        // It's a new attraction
                        if (name.length > 2) {
                          pushCurrentAttraction();
                          currentAttraction = { name, description: desc };
                        }
                      } else if (currentAttraction) {
                        // Additional description line
                        const stripped = clean(trimmed.replace(/^[-•]\s*/, ""));
                        if (stripped) {
                          currentAttraction.description = (currentAttraction.description || "") + " " + stripped;
                        }
                      }
                    } else if (currentSection === "activities" || currentSection === "areas") {
                      // Simple format: **Name:** Description or Name: Description
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      const plainMatch = !boldMatch ? trimmed.match(/^([A-Z][A-Za-z\s\-'().&,]+?):\s+(.+)$/) : null;
                      const listBold = !boldMatch && !plainMatch ? trimmed.match(/^[-•]\s*\*\*(.+?):?\*\*:?\s*(.*)$/) : null;
                      const match = boldMatch || plainMatch || listBold;

                      if (match) {
                        const name = clean(match[1]).replace(/:$/, "").trim();
                        const desc = clean(match[2] || "");
                        if (name.length > 2) {
                          const icon = currentSection === "activities" ? getActivityIcon(name, desc) : getAreaIcon(name, desc);
                          const item: SimpleItem = { name, description: desc, icon };
                          if (currentSection === "activities") {
                            result.commonActivities.push(item);
                          } else {
                            result.popularAreas.push(item);
                          }
                        }
                      }
                    } else if (currentSection === "info") {
                      // Key-value format: **Label:** Value or Label: Value
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      const plainMatch = !boldMatch ? trimmed.match(/^([A-Z][A-Za-z\s\-'().&,]+?):\s+(.+)$/) : null;
                      const match = boldMatch || plainMatch;

                      if (match) {
                        const label = clean(match[1]).replace(/:$/, "").trim();
                        const value = clean(match[2] || "");
                        if (label.length > 1 && value.length > 0) {
                          result.basicInfo.push({
                            label,
                            value,
                            icon: getBasicInfoIcon(label),
                          });
                        }
                      }
                    } else if (currentSection === "none") {
                      // Before any section detected - try to auto-detect
                      // If we see a bold name with metadata lines after, assume Main Attractions
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      if (boldMatch) {
                        const name = clean(boldMatch[1]).replace(/:$/, "").trim();
                        const desc = clean(boldMatch[2] || "");
                        if (name.length > 2 && desc.length > 0) {
                          currentSection = "main";
                          pushCurrentAttraction();
                          currentAttraction = { name, description: desc };
                        }
                      }
                    }
                  });

                  // Push any remaining attraction
                  pushCurrentAttraction();

                  return result;
                };

                const guide = parseDestinationGuide(trip.destination_agent_response);
                const totalItems = guide.mainAttractions.length + guide.commonActivities.length + guide.popularAreas.length + guide.basicInfo.length;
                console.log("[Destination Guide] Parsed:", {
                  mainAttractions: guide.mainAttractions.length,
                  commonActivities: guide.commonActivities.length,
                  popularAreas: guide.popularAreas.length,
                  basicInfo: guide.basicInfo.length,
                  total: totalItems,
                });

                return totalItems > 0 ? (
                  <div className="space-y-10">

                    {/* ===== SECTION 1: MAIN ATTRACTIONS ===== */}
                    {guide.mainAttractions.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mr-3">
                            <Landmark className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Main Attractions</h2>
                            <p className="text-sm text-muted-foreground">{guide.mainAttractions.length} must-visit places</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {guide.mainAttractions.map((attraction, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-3">
                                <CardTitle className="text-lg flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0 leading-tight">{attraction.icon}</span>
                                  <span className="leading-snug">{attraction.name}</span>
                                </CardTitle>
                                {attraction.location && (
                                  <CardDescription className="flex items-center mt-1.5 ml-10">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-primary" />
                                    <span>{attraction.location}</span>
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="pt-4 pb-4">
                                <div className="space-y-3">
                                  {attraction.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {attraction.description}
                                    </p>
                                  )}

                                  {(attraction.hours || attraction.duration || attraction.entry) && (
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                      {attraction.hours && (
                                        <div className="flex items-center bg-muted/50 px-2.5 py-1.5 rounded-md">
                                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
                                          <span className="text-muted-foreground">{attraction.hours}</span>
                                        </div>
                                      )}
                                      {attraction.entry && (
                                        <div className="flex items-center bg-muted/50 px-2.5 py-1.5 rounded-md">
                                          <Ticket className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
                                          <span className="text-muted-foreground">{attraction.entry}</span>
                                        </div>
                                      )}
                                      {attraction.duration && (
                                        <div className="flex items-center bg-muted/50 px-2.5 py-1.5 rounded-md">
                                          <Timer className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
                                          <span className="text-muted-foreground">{attraction.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {attraction.tip && (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                                      <div className="flex items-start">
                                        <Lightbulb className="h-3.5 w-3.5 mr-2 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                        <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                                          {attraction.tip}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* ===== SECTION 2: COMMON ACTIVITIES ===== */}
                    {guide.commonActivities.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 mr-3">
                            <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Things To Do</h2>
                            <p className="text-sm text-muted-foreground">{guide.commonActivities.length} popular activities</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {guide.commonActivities.map((activity, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden border-t-2 border-t-emerald-500/50 hover:shadow-md hover:border-t-emerald-500 transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <CardContent className="pt-5 pb-4">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-sm mb-1">{activity.name}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* ===== SECTION 3: POPULAR AREAS ===== */}
                    {guide.popularAreas.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 mr-3">
                            <Compass className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Popular Areas</h2>
                            <p className="text-sm text-muted-foreground">{guide.popularAreas.length} neighborhoods to explore</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {guide.popularAreas.map((area, index) => (
                            <div
                              key={index}
                              className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 cursor-default"
                            >
                              <span className="text-xl flex-shrink-0 mt-0.5">{area.icon}</span>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm mb-0.5 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">{area.name}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{area.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* ===== SECTION 4: BASIC INFORMATION ===== */}
                    {guide.basicInfo.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mr-3">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Essential Information</h2>
                            <p className="text-sm text-muted-foreground">Quick facts and practical tips</p>
                          </div>
                        </div>
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                              {guide.basicInfo.map((info, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors"
                                >
                                  <span className="text-xl flex-shrink-0 mt-0.5">{info.icon}</span>
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-sm text-foreground">{info.label}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{info.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </section>
                    )}
                  </div>
                ) : (
                  // Fallback to markdown if parsing produces no results
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />{" "}
                        Destination Guide
                      </CardTitle>
                      <CardDescription>
                        Tourist information and recommendations for{" "}
                        {trip.destination}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {trip.destination_agent_response}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <Info
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">
                  Destination Guide Not Available
                </h2>
                <p className="text-muted-foreground">
                  Destination guide information is not available for this trip.
                </p>
              </div>
            )}

          </TabsContent>

          {/* Hotels Tab Content */}
          <TabsContent value="hotels" className="space-y-8">
            {trip.itinerary &&
              trip.itinerary.hotels &&
              trip.itinerary.hotels.length > 0 ? (
              <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Home className="mr-3 h-6 w-6 text-primary" /> Recommended
                  Accommodations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trip.itinerary.hotels.map((hotel, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-l-4 border-l-primary"
                    >
                      <CardHeader className="bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {hotel.hotel_name}
                            </CardTitle>
                            {hotel.rating && (
                              <CardDescription className="flex items-center mt-1">
                                <span className="text-yellow-500 flex items-center">
                                  {Array(Math.floor(Number(hotel.rating) || 0))
                                    .fill(0)
                                    .map((_, i) => (
                                      <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ))}
                                </span>
                                <span className="ml-1">{hotel.rating}</span>
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="font-medium">
                            {hotel.price}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {hotel.address}
                            </p>
                          </div>

                          {hotel.description && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {hotel.description}
                              </p>
                            </div>
                          )}

                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium mb-2">
                                Amenities:
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {hotel.amenities.map((amenity, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      {isValidUrl(hotel.url) && (
                        <CardFooter className="bg-muted/30 border-t">
                          <a
                            href={hotel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center"
                          >
                            View Hotel / Book{" "}
                            <Globe className="h-4 w-4 ml-1.5" />
                          </a>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <Info
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">
                  Hotel Information Not Available
                </h2>
                <p className="text-muted-foreground">
                  Hotel recommendations are not available for this trip.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Flights Tab Content - Only render if flight agent ran */}
          {trip.flight_agent_response !== null && (
            <TabsContent value="flights" className="space-y-8">
              {trip.itinerary &&
                trip.itinerary.flights &&
                trip.itinerary.flights.length > 0 ? (
                <div className="space-y-8">
                  {/* Flights from itinerary */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                      <Plane className="mr-3 h-6 w-6 text-primary" /> Selected
                      Flights
                    </h2>
                    <div className="space-y-6">
                      {trip.itinerary.flights
                        .filter(
                          (flight) =>
                            flight.airline !== "TBD" &&
                            flight.departure_time !== "TBD"
                        )
                        .map((flight, index) => (
                          <Card
                            key={index}
                            className="border-r-4 border-r-primary overflow-hidden"
                          >
                            <CardHeader className="bg-muted/30">
                              <CardTitle className="text-xl flex items-center">
                                <Plane className="h-5 w-5 mr-2 text-primary" />
                                {flight.airline}
                              </CardTitle>
                              {flight.flight_number &&
                                flight.flight_number !== "N/A" &&
                                flight.flight_number !== "TBD" && (
                                  <CardDescription>
                                    Flight {flight.flight_number}
                                  </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="py-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="bg-muted/20 p-3 rounded-lg">
                                  <p className="font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-primary" />
                                    Duration:
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    {flight.duration}
                                  </p>
                                </div>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                  <p className="font-medium flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                                    Price:
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    {flight.price}
                                  </p>
                                </div>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                  <p className="font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                                    Departure:
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    {flight.departure_time || "Not specified"}
                                  </p>
                                </div>
                                <div className="bg-muted/20 p-3 rounded-lg">
                                  <p className="font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                                    Arrival:
                                  </p>
                                  <p className="text-muted-foreground mt-1">
                                    {flight.arrival_time || "Not specified"}
                                  </p>
                                </div>
                                {typeof flight.stops !== "undefined" && (
                                  <div className="bg-muted/20 p-3 rounded-lg">
                                    <p className="font-medium">Stops:</p>
                                    <p className="text-muted-foreground mt-1">
                                      {flight.stops}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            {flight.url &&
                              flight.url !== "N/A" &&
                              flight.url !== "TBD" && (
                                <CardFooter className="bg-muted/30 border-t">
                                  <a
                                    href={flight.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm flex items-center"
                                  >
                                    Book / View Flight{" "}
                                    <Globe className="h-4 w-4 ml-1.5" />
                                  </a>
                                </CardFooter>
                              )}
                          </Card>
                        ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                  <Info
                    size={48}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold mb-3">
                    Flight Information Currently Unavailable
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't retrieve flight information at this time. Our data sources may be temporarily unavailable. Please try again later with a new trip plan.
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Trains Tab Content - Only render if train agent ran */}
          {trip.train_agent_response !== null && (
            <TabsContent value="trains" className="space-y-8">
              {trip.itinerary?.trains && trip.itinerary.trains.length > 0 ? (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold flex items-center mb-6 text-foreground">
                      <Train className="h-6 w-6 mr-2 text-primary" />
                      Train Options (Indian Railways)
                    </h2>
                    {/* Show structured train cards if available */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trip.itinerary.trains.map((train, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                          <CardHeader className="space-y-1">
                            <CardTitle className="text-lg flex items-center">
                              <Train className="h-5 w-5 mr-2 text-primary" />
                              {train.train_name || `Train ${train.train_number}`}
                            </CardTitle>
                            <CardDescription>
                              🚂 {train.train_number} {train.train_type && `• ${train.train_type}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-4 space-y-4">
                            {/* Route */}
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <p className="font-medium flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                Route:
                              </p>
                              <p className="text-muted-foreground mt-1">
                                {train.departure_station} → {train.arrival_station}
                              </p>
                            </div>

                            {/* Timings */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                <p className="font-medium flex items-center text-green-700 dark:text-green-300">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Departure:
                                </p>
                                <p className="text-green-600 dark:text-green-400 mt-1">
                                  {train.departure_time || "Not specified"}
                                </p>
                              </div>
                              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                                <p className="font-medium flex items-center text-red-700 dark:text-red-300">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Arrival:
                                </p>
                                <p className="text-red-600 dark:text-red-400 mt-1">
                                  {train.arrival_time || "Not specified"}
                                </p>
                              </div>
                            </div>

                            {/* Duration & Distance */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-muted/20 p-3 rounded-lg">
                                <p className="font-medium">⏱️ Duration:</p>
                                <p className="text-muted-foreground mt-1">{train.duration || "N/A"}</p>
                              </div>
                              {train.distance && (
                                <div className="bg-muted/20 p-3 rounded-lg">
                                  <p className="font-medium">📍 Distance:</p>
                                  <p className="text-muted-foreground mt-1">{train.distance}</p>
                                </div>
                              )}
                            </div>

                            {/* Fares by Class */}
                            <div className="border-t pt-4">
                              <p className="font-semibold mb-3 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                                💺 Available Classes & Fares:
                              </p>
                              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                {train.fare_1ac && (
                                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                    <p className="font-bold text-purple-700 dark:text-purple-300">1AC</p>
                                    <p className="text-purple-600 dark:text-purple-400">{train.fare_1ac}</p>
                                  </div>
                                )}
                                {train.fare_2ac && (
                                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <p className="font-bold text-blue-700 dark:text-blue-300">2AC</p>
                                    <p className="text-blue-600 dark:text-blue-400">{train.fare_2ac}</p>
                                  </div>
                                )}
                                {train.fare_3ac && (
                                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                    <p className="font-bold text-green-700 dark:text-green-300">3AC</p>
                                    <p className="text-green-600 dark:text-green-400">{train.fare_3ac}</p>
                                  </div>
                                )}
                                {train.fare_sleeper && (
                                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                                    <p className="font-bold text-yellow-700 dark:text-yellow-300">SL</p>
                                    <p className="text-yellow-600 dark:text-yellow-400">{train.fare_sleeper}</p>
                                  </div>
                                )}
                                {train.fare_general && (
                                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                                    <p className="font-bold text-gray-700 dark:text-gray-300">GEN</p>
                                    <p className="text-gray-600 dark:text-gray-400">{train.fare_general}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Running Days & Pantry */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {train.running_days && (
                                <div className="bg-muted/20 p-2 rounded-lg">
                                  <p className="font-medium">📅 Runs:</p>
                                  <p className="text-muted-foreground">{train.running_days}</p>
                                </div>
                              )}
                              {train.pantry_available && (
                                <div className="bg-muted/20 p-2 rounded-lg">
                                  <p className="font-medium">🍽️ Pantry:</p>
                                  <p className="text-muted-foreground">{train.pantry_available}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="bg-orange-100 dark:bg-orange-900/30 border-t">
                            <a
                              href={train.booking_url || "https://www.irctc.co.in/"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center"
                            >
                              🔗 Book on IRCTC <Globe className="h-4 w-4 ml-1.5" />
                            </a>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                  <Info size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-3">
                    Train Information Currently Unavailable
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't retrieve train information at this time. Our data sources may be temporarily unavailable. Please try again later with a new trip plan.
                  </p>
                </div>
              )}
            </TabsContent>
          )}


          {/* Dining Tab Content */}
          <TabsContent value="dining" className="space-y-8">
            {trip.restaurant_agent_response ||
              (trip.itinerary &&
                trip.itinerary.restaurants &&
                trip.itinerary.restaurants.length > 0) ? (
              (() => {
                // ==========================================
                // DINING TAB - PARSED CARD LAYOUT
                // ==========================================

                interface ParsedRestaurant {
                  name: string;
                  description: string;
                  location?: string;
                  bestTime?: string;
                  mustTry?: string;
                  culturalSignificance?: string;
                  url?: string;
                  icon: string;
                }

                interface DiningInfo {
                  label: string;
                  value: string;
                  icon: string;
                }

                interface ParsedDining {
                  restaurants: ParsedRestaurant[];
                  additionalInfo: DiningInfo[];
                }

                const getDiningIcon = (name: string, desc: string): string => {
                  const combined = (name + " " + (desc || "")).toLowerCase();
                  if (combined.includes("street food") || combined.includes("chaat") || combined.includes("snack")) return "\uD83C\uDF5C";
                  if (combined.includes("market") || combined.includes("bazaar") || combined.includes("crawford")) return "\uD83D\uDED2";
                  if (combined.includes("cook") || combined.includes("class") || combined.includes("learn")) return "\uD83D\uDC68\u200D\uD83C\uDF73";
                  if (combined.includes("cafe") || combined.includes("coffee") || combined.includes("tea")) return "\u2615";
                  if (combined.includes("sweet") || combined.includes("dessert") || combined.includes("mithai")) return "\uD83C\uDF6C";
                  if (combined.includes("fine dining") || combined.includes("luxury") || combined.includes("premium")) return "\uD83C\uDF7D\uFE0F";
                  if (combined.includes("vegetarian") || combined.includes("veg") || combined.includes("thali")) return "\uD83E\uDD57";
                  if (combined.includes("biryani") || combined.includes("mughlai") || combined.includes("kebab") || combined.includes("non-veg")) return "\uD83C\uDF56";
                  if (combined.includes("fish") || combined.includes("seafood") || combined.includes("coastal")) return "\uD83D\uDC1F";
                  if (combined.includes("bakery") || combined.includes("bread") || combined.includes("cake")) return "\uD83C\uDF70";
                  if (combined.includes("juice") || combined.includes("drink") || combined.includes("lassi")) return "\uD83E\uDD64";
                  if (combined.includes("south indian") || combined.includes("dosa") || combined.includes("idli")) return "\uD83E\uDED3";
                  return "\uD83C\uDF5D";
                };

                const getDiningInfoIcon = (label: string): string => {
                  const lower = label.toLowerCase();
                  if (lower.includes("food custom") || lower.includes("local food") || lower.includes("cuisine")) return "\uD83E\uDD57";
                  if (lower.includes("peak") || lower.includes("hour") || lower.includes("timing") || lower.includes("time")) return "\u23F0";
                  if (lower.includes("transport") || lower.includes("getting") || lower.includes("taxi") || lower.includes("auto")) return "\uD83D\uDE8C";
                  if (lower.includes("safety") || lower.includes("safe") || lower.includes("hygiene") || lower.includes("food safety")) return "\uD83D\uDEE1\uFE0F";
                  if (lower.includes("tip") || lower.includes("advice") || lower.includes("recommend")) return "\uD83D\uDCA1";
                  if (lower.includes("cost") || lower.includes("price") || lower.includes("budget") || lower.includes("cheap")) return "\uD83D\uDCB0";
                  if (lower.includes("water") || lower.includes("drink") || lower.includes("beverage")) return "\uD83D\uDCA7";
                  if (lower.includes("reservation") || lower.includes("book") || lower.includes("advance")) return "\uD83D\uDCDD";
                  return "\u2139\uFE0F";
                };

                const cleanText = (t: string): string => t.replace(/\*\*/g, "").replace(/^\*|\*$/g, "").trim();

                const parseDiningGuide = (text: string): ParsedDining => {
                  const result: ParsedDining = {
                    restaurants: [],
                    additionalInfo: [],
                  };

                  let currentSection: "restaurants" | "info" | "none" = "none";
                  let currentRestaurant: any = null;

                  const pushCurrentRestaurant = () => {
                    if (currentRestaurant && currentRestaurant.name) {
                      const n = cleanText(currentRestaurant.name);
                      if (n.length > 2) {
                        result.restaurants.push({
                          name: n,
                          description: cleanText(currentRestaurant.description || ""),
                          location: currentRestaurant.location ? cleanText(currentRestaurant.location) : undefined,
                          bestTime: currentRestaurant.bestTime ? cleanText(currentRestaurant.bestTime) : undefined,
                          mustTry: currentRestaurant.mustTry ? cleanText(currentRestaurant.mustTry) : undefined,
                          culturalSignificance: currentRestaurant.culturalSignificance ? cleanText(currentRestaurant.culturalSignificance) : undefined,
                          url: currentRestaurant.url ? cleanText(currentRestaurant.url) : undefined,
                          icon: getDiningIcon(n, currentRestaurant.description || ""),
                        });
                      }
                    }
                    currentRestaurant = null;
                  };

                  const detectSection = (line: string): "restaurants" | "info" | "skip" | null => {
                    const lower = line.replace(/[#*_\-\u2022\uD83C-\uDBFF\uDC00-\uDFFF]/gu, "").trim().toLowerCase();
                    if (lower.includes("food market") || lower.includes("restaurant") || lower.includes("dining spot") || lower.includes("where to eat") || lower.includes("experiences")) return "restaurants";
                    if (lower.includes("additional information") || lower.includes("practical") || lower.includes("dining tips") || lower.includes("useful info")) return "info";
                    if (lower.includes("restaurant recommendation") || lower.includes("dining guide") || lower.includes("food guide")) return "skip";
                    return null;
                  };

                  const lines = text.split("\n");

                  lines.forEach((line) => {
                    const trimmed = line.trim();
                    if (!trimmed) return;

                    // Check markdown headers
                    const headerMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
                    if (headerMatch) {
                      pushCurrentRestaurant();
                      const section = detectSection(headerMatch[1]);
                      if (section === "restaurants" || section === "info") currentSection = section;
                      return;
                    }

                    // Check plain section headers (with optional emoji prefix)
                    const section = detectSection(trimmed);
                    if (section === "restaurants" || section === "info") {
                      pushCurrentRestaurant();
                      currentSection = section;
                      return;
                    }
                    if (section === "skip") return;

                    if (currentSection === "restaurants" || currentSection === "none") {
                      // Match bold name: **Name:** Description (colon inside or outside **)
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      const plainMatch = !boldMatch ? trimmed.match(/^([A-Z][A-Za-z\s\-'().&,]+?):\s+(.+)$/) : null;
                      const nameMatch = boldMatch || plainMatch;

                      if (nameMatch) {
                        const name = cleanText(nameMatch[1]).replace(/:$/, "").trim();
                        const desc = cleanText(nameMatch[2] || "");
                        const lower = name.toLowerCase();

                        // Check if this is metadata for current restaurant
                        if (currentRestaurant) {
                          if (lower === "location" || lower === "address" || lower === "area") { currentRestaurant.location = desc; return; }
                          if (lower === "best time to visit" || lower === "best time" || lower === "timing" || lower === "when to visit") { currentRestaurant.bestTime = desc; return; }
                          if (lower === "must-try local foods" || lower === "must-try" || lower === "must try" || lower === "speciality" || lower === "specialty" || lower === "signature dishes" || lower === "popular dishes") { currentRestaurant.mustTry = desc; return; }
                          if (lower === "cultural significance" || lower === "significance" || lower === "history" || lower === "about") { currentRestaurant.culturalSignificance = desc; return; }
                          if (lower === "url" || lower === "website" || lower === "link" || lower === "book" || lower === "booking") { currentRestaurant.url = desc; return; }
                          if (lower === "open" || lower === "hours" || lower === "opening hours") { return; } // Skip hours for now
                        }

                        // It's a new restaurant
                        if (name.length > 2 && desc.length > 0) {
                          if (currentSection === "none") currentSection = "restaurants";
                          pushCurrentRestaurant();
                          currentRestaurant = { name, description: desc };
                        }
                      } else if (currentRestaurant) {
                        // Check for URL line
                        const urlMatch = trimmed.match(/^(?:URL|Website|Link):\s*(https?:\/\/.+)$/i);
                        if (urlMatch) {
                          currentRestaurant.url = urlMatch[1].trim();
                        }
                      }
                    } else if (currentSection === "info") {
                      // Key-value format for additional information
                      const boldMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
                      const plainMatch = !boldMatch ? trimmed.match(/^([A-Z][A-Za-z\s\-'().&,]+?):\s+(.+)$/) : null;
                      const match = boldMatch || plainMatch;

                      if (match) {
                        const label = cleanText(match[1]).replace(/:$/, "").trim();
                        const value = cleanText(match[2] || "");
                        if (label.length > 1 && value.length > 0) {
                          // Skip farewell/closing messages
                          const lower = label.toLowerCase();
                          if (!lower.includes("hope") && !lower.includes("enjoy") && !lower.includes("wish")) {
                            result.additionalInfo.push({
                              label,
                              value,
                              icon: getDiningInfoIcon(label),
                            });
                          }
                        }
                      }
                    }
                  });

                  // Push any remaining restaurant
                  pushCurrentRestaurant();

                  return result;
                };

                // Parse the AI response
                const parsedDining = trip.restaurant_agent_response
                  ? parseDiningGuide(trip.restaurant_agent_response)
                  : { restaurants: [], additionalInfo: [] };

                // Merge with structured restaurant data from itinerary
                const structuredRestaurants = trip.itinerary?.restaurants || [];
                const mergedRestaurants: ParsedRestaurant[] = [];

                // Start with parsed restaurants (they have richer data)
                parsedDining.restaurants.forEach((parsed) => {
                  const match = structuredRestaurants.find(
                    (sr) => sr.name.toLowerCase().trim() === parsed.name.toLowerCase().trim()
                  );
                  mergedRestaurants.push({
                    ...parsed,
                    location: parsed.location || match?.location,
                    url: parsed.url || match?.url,
                    description: parsed.description || match?.description || "",
                  });
                });

                // Add any structured restaurants not already in parsed list
                structuredRestaurants.forEach((sr) => {
                  const alreadyExists = mergedRestaurants.some(
                    (mr) => mr.name.toLowerCase().trim() === sr.name.toLowerCase().trim()
                  );
                  if (!alreadyExists) {
                    mergedRestaurants.push({
                      name: sr.name,
                      description: sr.description || "",
                      location: sr.location,
                      url: sr.url,
                      icon: getDiningIcon(sr.name, sr.description || ""),
                    });
                  }
                });

                const totalItems = mergedRestaurants.length + parsedDining.additionalInfo.length;
                console.log("[Dining] Parsed:", {
                  parsedRestaurants: parsedDining.restaurants.length,
                  structuredRestaurants: structuredRestaurants.length,
                  merged: mergedRestaurants.length,
                  additionalInfo: parsedDining.additionalInfo.length,
                });

                return totalItems > 0 ? (
                  <div className="space-y-10">

                    {/* ===== RESTAURANT CARDS ===== */}
                    {mergedRestaurants.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 mr-3">
                            <Utensils className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Food Markets & Experiences</h2>
                            <p className="text-sm text-muted-foreground">{mergedRestaurants.length} places to explore</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {mergedRestaurants.map((restaurant, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                              <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent pb-3">
                                <CardTitle className="text-lg flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0 leading-tight">{restaurant.icon}</span>
                                  <span className="leading-snug">{restaurant.name}</span>
                                </CardTitle>
                                {restaurant.location && (
                                  <CardDescription className="flex items-center mt-1.5 ml-10">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-orange-500" />
                                    <span>{restaurant.location}</span>
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="pt-4 pb-4">
                                <div className="space-y-3">
                                  {restaurant.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {restaurant.description}
                                    </p>
                                  )}

                                  {(restaurant.bestTime || restaurant.mustTry) && (
                                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
                                      {restaurant.bestTime && (
                                        <div className="flex items-center bg-muted/50 px-2.5 py-1.5 rounded-md">
                                          <Clock className="h-3.5 w-3.5 mr-1.5 text-orange-500 flex-shrink-0" />
                                          <span className="font-semibold mr-1">Best Time:</span>
                                          <span className="text-muted-foreground">{restaurant.bestTime}</span>
                                        </div>
                                      )}
                                      {restaurant.mustTry && (
                                        <div className="flex items-center bg-muted/50 px-2.5 py-1.5 rounded-md">
                                          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-orange-500 flex-shrink-0" />
                                          <span className="font-semibold mr-1">Must-Try:</span>
                                          <span className="text-muted-foreground">{restaurant.mustTry}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {restaurant.culturalSignificance && (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                                      <div className="flex items-start">
                                        <Landmark className="h-3.5 w-3.5 mr-2 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                        <p className="text-xs leading-relaxed">
                                          <span className="font-semibold text-amber-900 dark:text-amber-100 mr-1">Cultural Significance:</span>
                                          <span className="text-amber-800 dark:text-amber-200">{restaurant.culturalSignificance}</span>
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                              {isValidUrl(restaurant.url) && (
                                <CardFooter className="bg-muted/30 border-t py-3">
                                  <a
                                    href={restaurant.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 dark:text-orange-400 hover:underline text-sm flex items-center font-medium"
                                  >
                                    Visit Website
                                    <Globe className="h-4 w-4 ml-1.5" />
                                  </a>
                                </CardFooter>
                              )}
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* ===== ADDITIONAL INFORMATION ===== */}
                    {parsedDining.additionalInfo.length > 0 && (
                      <section>
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mr-3">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">Additional Information</h2>
                            <p className="text-sm text-muted-foreground">Quick facts and practical dining tips</p>
                          </div>
                        </div>
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                              {parsedDining.additionalInfo.map((info, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors"
                                >
                                  <span className="text-xl flex-shrink-0 mt-0.5">{info.icon}</span>
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-sm text-foreground">{info.label}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{info.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </section>
                    )}
                  </div>
                ) : (
                  // Fallback to markdown if parsing produces no results
                  <div className="space-y-8">
                    {trip.restaurant_agent_response && (
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                          <CardTitle className="flex items-center">
                            <Utensils className="h-5 w-5 mr-2 text-primary" />{" "}
                            Restaurant Recommendations
                          </CardTitle>
                          <CardDescription>
                            Dining options for your trip
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {trip.restaurant_agent_response}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <Info
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">
                  Dining Information Not Available
                </h2>
                <p className="text-muted-foreground">
                  Restaurant recommendations are not available for this trip.
                </p>
              </div>
            )}

          </TabsContent>

          {/* Budget Tab Content */}
          <TabsContent value="budget" className="space-y-8">
            {trip.budget_agent_response ? (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-primary" /> Budget
                    Analysis
                  </CardTitle>
                  <CardDescription>
                    Budget recommendations and optimization strategies
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {trip.budget_agent_response}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <Info
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">
                  Budget Information Not Available
                </h2>
                <p className="text-muted-foreground">
                  Budget analysis information is not available for this trip.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
