import { useNavigate } from "react-router-dom";
import { useCancelEventMutation } from "@/api/eventsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  XCircle,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Users,
  Wallet,
  ClipboardList,
} from "lucide-react";

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className="text-sm">{children || "—"}</div>
      </div>
    </div>
  );
}

export default function EventDetailsTab({ event }) {
  const navigate = useNavigate();
  const [cancelEvent, { isLoading: isCancelling }] = useCancelEventMutation();

  const canCancel = event.status === "open" || event.status === "closed";

  const handleCancel = async () => {
    try {
      await cancelEvent(event._id).unwrap();
    } catch (err) {
      console.error("Failed to cancel event:", err);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime?.start) return "—";
    const start = new Date(dateTime.start).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    if (dateTime.end) {
      const end = new Date(dateTime.end).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${start} – ${end}`;
    }
    return start;
  };

  const formatLocation = (location) => {
    if (!location) return "—";
    const parts = [location.address, location.city, location.state, location.country].filter(
      Boolean
    );
    return parts.join(", ") || "—";
  };

  return (
    <div className="space-y-4 mt-2">
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <InfoRow icon={FileText} label="Name">
            {event.eventName || event.name}
          </InfoRow>

          <InfoRow icon={FileText} label="Description">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </InfoRow>

          <InfoRow icon={Briefcase} label="Category">
            {event.category && (
              <Badge variant="secondary">{event.category}</Badge>
            )}
          </InfoRow>

          <InfoRow icon={MapPin} label="Location">
            {formatLocation(event.location)}
          </InfoRow>

          <InfoRow icon={Calendar} label="Date & Time">
            {formatDateTime(event.dateTime)}
          </InfoRow>

          <InfoRow icon={ClipboardList} label="Requirements">
            {Array.isArray(event.requirements) && event.requirements.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {event.requirements.map((req, i) => (
                  <li key={i} className="text-sm">{req}</li>
                ))}
              </ul>
            ) : typeof event.requirements === "string" ? (
              event.requirements
            ) : (
              "None specified"
            )}
          </InfoRow>

          <InfoRow icon={Wallet} label="Compensation">
            {event.compensation?.paymentType || "Volunteer (unpaid)"}
            {event.compensation?.amount && ` — ${event.compensation.amount}`}
          </InfoRow>

          <InfoRow icon={Users} label="Roles">
            {Array.isArray(event.roles) && event.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {event.roles.map((role, i) => (
                  <Badge key={i} variant="outline">
                    {typeof role === "string" ? role : role.name || role.title}
                  </Badge>
                ))}
              </div>
            ) : (
              "No specific roles"
            )}
          </InfoRow>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/post-event?edit=${event._id}`)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit Event
        </Button>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isCancelling}>
                <XCircle className="h-4 w-4 mr-1" />
                {isCancelling ? "Cancelling..." : "Cancel Event"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All selected volunteers will be
                  notified that the event has been cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Event</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Yes, Cancel Event
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
