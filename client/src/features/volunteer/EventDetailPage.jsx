import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EventDetail from "./EventDetail";
import {
  useGetEventQuery,
  useApplyToEventMutation,
  useWithdrawApplicationMutation,
} from "@/api/eventsApi";
import { useGetUserReviewsQuery } from "@/api/reviewsApi";

// ---------------------------------------------------------------------------
// Helpers — map the nested server Event shape to the flat props EventDetail
// expects (it was built by v0 against a simplified mock shape).
// ---------------------------------------------------------------------------

function formatDatePart(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimePart(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function deriveStatusLabel(rawStatus, dateTime) {
  if (rawStatus === "completed") return "Completed";
  const now = Date.now();
  const start = dateTime?.start ? new Date(dateTime.start).getTime() : null;
  const end = dateTime?.end ? new Date(dateTime.end).getTime() : null;
  if (start && end && now >= start && now <= end) return "Ongoing";
  return "Open";
}

// Server applicationStatus enum: none | pending | shortlisted | selected | rejected | withdrew
// EventDetail only knows about: none | applied | selected
function mapApplicationStatus(status) {
  if (status === "selected") return "selected";
  if (status === "pending" || status === "shortlisted") return "applied";
  return "none";
}

const PAYMENT_LABELS = {
  paid: "Paid",
  unpaid: "Unpaid",
  certificate: "Unpaid",
  stipend: "Paid",
};

function mapEvent(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    name: raw.eventName,
    category: raw.category,
    status: deriveStatusLabel(raw.status, raw.dateTime),
    address: raw.location?.address,
    city: raw.location?.city,
    startDate: formatDatePart(raw.dateTime?.start),
    startTime: formatTimePart(raw.dateTime?.start),
    endDate: formatDatePart(raw.dateTime?.end),
    endTime: formatTimePart(raw.dateTime?.end),
    roles: raw.roles || [],
    genderPref: raw.requirements?.genderPreference,
    ageRange: [raw.requirements?.minAge ?? 18, raw.requirements?.maxAge ?? 60],
    skills: raw.requirements?.requiredSkills || [],
    languages: raw.requirements?.requiredLanguages || [],
    minHelpScore: raw.requirements?.minHelpScore ?? 0,
    dressCode: raw.requirements?.dressCode,
    otherRequirements: raw.requirements?.otherRequirements,
    paymentType: PAYMENT_LABELS[raw.compensation?.paymentType] || "Unpaid",
    amount: raw.compensation?.amount,
    amountUnit: "flat",
    organiserId: raw.organiserId?._id,
    groupChatId: raw.groupChatId,
  };
}

function mapOrganiser(raw) {
  const organiserUser = raw?.organiserId;
  if (!organiserUser) return {};
  const profile = organiserUser.organiserProfile || {};
  return {
    id: organiserUser._id,
    logoUrl: profile.logo || profile.profilePhoto,
    name: profile.companyName || profile.fullName || organiserUser.username,
    hireScore: profile.hireScore,
    city: organiserUser.location?.city,
    volunteersHired: profile.volunteerCount ?? 0,
    eventsHosted: profile.pastEvents?.length ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [isSaved, setIsSaved] = useState(false);

  const { data: eventRes, isLoading, isError } = useGetEventQuery(eventId, { skip: !eventId });
  const rawEvent = eventRes?.data;

  const { data: reviewsRes } = useGetUserReviewsQuery(rawEvent?.organiserId?._id, {
    skip: !rawEvent?.organiserId?._id,
  });

  const [applyToEvent, { isLoading: isApplying }] = useApplyToEventMutation();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const event = useMemo(() => mapEvent(rawEvent), [rawEvent]);
  const organiser = useMemo(() => mapOrganiser(rawEvent), [rawEvent]);
  const applicationStatus = mapApplicationStatus(rawEvent?.applicationStatus);
  const reviews = reviewsRes?.data?.reviews || [];

  const user = {
    skills:
      currentUser?.volunteerProfile?.skills ||
      currentUser?.skills ||
      [],
    helpScore:
      currentUser?.volunteerProfile?.helpScore ??
      currentUser?.helpScore ??
      0,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading event…
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-slate-400">
        <p>Couldn't load this event.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <EventDetail
      event={event}
      organiser={organiser}
      user={user}
      reviews={reviews}
      applicationStatus={applicationStatus}
      isSaved={isSaved}
      onBack={() => navigate(-1)}
      onViewOrganiserProfile={() =>
        organiser?.id && navigate(`/profile/${rawEvent.organiserId.username}`)
      }
      onSave={() => setIsSaved((prev) => !prev)}
      onMessage={() => organiser?.id && navigate(`/messages?with=${organiser.id}`)}
      onApply={() => applyToEvent(eventId)}
      onWithdraw={() => withdrawApplication(eventId)}
    />
  );
}
