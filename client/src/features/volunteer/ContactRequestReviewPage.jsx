import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useGetMyContactRequestsQuery,
  useRespondToContactRequestMutation,
} from "@/api/contactRequestsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Shield } from "lucide-react";

const REASON_LABELS = {
  emergency: "Emergency",
  event_coordination: "Event coordination",
  technical_issue: "Technical issue",
  other: "Other",
};

export default function ContactRequestReviewPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [actionTaken, setActionTaken] = useState(null); // 'approved' | 'denied'

  // Try navigation state first, otherwise fetch and filter
  const navRequest = location.state?.request;
  const { data: requestsRes, isLoading } = useGetMyContactRequestsQuery(undefined, {
    skip: !!navRequest,
  });

  const request =
    navRequest ||
    requestsRes?.data?.find((r) => r._id === requestId) ||
    null;

  const [respondToContactRequest, { isLoading: isResponding }] =
    useRespondToContactRequestMutation();

  const handleApprove = async () => {
    try {
      await respondToContactRequest({
        id: requestId,
        status: "approved_by_volunteer",
      }).unwrap();
      setActionTaken("approved");
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleDeny = async () => {
    try {
      await respondToContactRequest({
        id: requestId,
        status: "denied_by_volunteer",
      }).unwrap();
      setActionTaken("denied");
    } catch {
      // Error handled by RTK Query
    }
  };

  // Loading state
  if (!navRequest && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading request…
      </div>
    );
  }

  // Not found
  if (!request) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <p>Contact request not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      </div>
    );
  }

  // Extract organiser info
  const organiser = request.organiserId || request.organiser || {};
  const organiserProfile = organiser.organiserProfile || {};
  const organiserName =
    organiserProfile.companyName ||
    organiserProfile.fullName ||
    organiser.username ||
    "Unknown Organiser";
  const hireScore = organiserProfile.hireScore;

  // Extract event info
  const eventName =
    request.eventId?.eventName || request.eventName || "Unknown Event";

  // Reason
  const reasonLabel = REASON_LABELS[request.reason] || request.reason || "—";
  const details = request.details || "";

  // Confirmation view
  if (actionTaken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div
          className={`flex size-16 items-center justify-center rounded-full ${
            actionTaken === "approved"
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          {actionTaken === "approved" ? (
            <Check className="size-8 text-green-600 dark:text-green-400" />
          ) : (
            <X className="size-8 text-slate-600 dark:text-slate-400" />
          )}
        </div>
        <h2 className="text-lg font-medium text-foreground">
          {actionTaken === "approved" ? "Contact shared" : "Request declined"}
        </h2>
        <p className="text-center text-sm text-muted-foreground max-w-xs">
          {actionTaken === "approved"
            ? "Your contact information has been shared with the organiser."
            : "Your contact information remains private."}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-2">
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-6 max-w-lg mx-auto gap-5">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="self-start -ml-2"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
        <Shield className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This organiser has requested your contact information
        </p>
      </div>

      {/* Organiser info card */}
      <Card>
        <CardHeader>
          <CardTitle>Organiser</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{organiserName}</span>
            {hireScore != null && (
              <Badge variant="secondary">Hire Score: {hireScore}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Event: <span className="text-foreground">{eventName}</span>
          </p>
        </CardContent>
      </Card>

      {/* Reason card */}
      <Card>
        <CardHeader>
          <CardTitle>Reason for Request</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit">
            {reasonLabel}
          </Badge>
          {details && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {details}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <Button
          size="lg"
          onClick={handleApprove}
          disabled={isResponding}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="size-4" />
          {isResponding ? "Processing…" : "Approve — Share my contact"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleDeny}
          disabled={isResponding}
          className="w-full"
        >
          <X className="size-4" />
          {isResponding ? "Processing…" : "Deny — Keep private"}
        </Button>
      </div>

      {/* Privacy reminder */}
      <div className="flex items-start gap-2 mt-2">
        <Shield className="size-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Your info is only shared once and is not stored on the organiser's account
        </p>
      </div>
    </div>
  );
}
