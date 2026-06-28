import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetEventQuery,
  useGetApplicantsQuery,
} from "@/api/eventsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Wallet,
  Users,
  UserCheck,
  ClipboardCheck,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import VolunteersTab from "./VolunteersTab";
import EventDetailsTab from "./EventDetailsTab";

const statusColors = {
  open: "bg-green-500 text-white",
  closed: "bg-blue-500 text-white",
  completed: "bg-gray-500 text-white",
  cancelled: "bg-red-500 text-white",
};

export default function EventManagementPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const {
    data: eventRes,
    isLoading: eventLoading,
    isError: eventError,
  } = useGetEventQuery(eventId, { skip: !eventId });

  const {
    data: applicantsRes,
    isLoading: applicantsLoading,
  } = useGetApplicantsQuery(eventId, { skip: !eventId });

  const event = eventRes?.data || eventRes;
  const applicants = applicantsRes?.data || applicantsRes || [];

  // Authorization guard
  if (event && user && event.organiserId !== user._id) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  if (eventLoading || applicantsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load event details.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const selectedVolunteers = Array.isArray(applicants)
    ? applicants.filter((a) => a.status === "selected" || a.applicationStatus === "selected")
    : [];

  const attendanceCount = event.attendanceLog?.length || 0;

  const formattedDate = event.dateTime?.start
    ? new Date(event.dateTime.start).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "TBD";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{event.eventName || event.name}</h1>
          <Badge className={statusColors[event.status] || "bg-gray-500 text-white"}>
            {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/post-event?edit=${eventId}`)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit Event
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.location?.city || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.compensation?.paymentType || "Volunteer"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {event.totalVolunteersNeeded || 0} needed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedVolunteers.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {attendanceCount} attended
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="volunteers">
        <TabsList>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
        </TabsList>
        <TabsContent value="volunteers">
          <VolunteersTab event={event} applicants={applicants} />
        </TabsContent>
        <TabsContent value="details">
          <EventDetailsTab event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
