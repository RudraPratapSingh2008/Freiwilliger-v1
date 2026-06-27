import { useMemo, useState } from "react";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Star,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ATTENDANCE_CHIP = {
  pending: { label: "Attendance Pending", className: "bg-gray-100 text-gray-600", icon: Clock },
  attended: { label: "Attended", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  no_show: { label: "No-show", className: "bg-red-100 text-red-700", icon: XCircle },
};

// ---------------------------------------------------------------------------
// StarRating (interactive)
// ---------------------------------------------------------------------------

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = (hovered || value) >= starValue;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(starValue)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange(starValue)}
            className={readOnly ? "cursor-default" : "cursor-pointer"}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-300"
                }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewForm (inline, collapsible)
// ---------------------------------------------------------------------------

function ReviewForm({ onSubmit, isSubmitting }) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");

  return (
    <div className="space-y-3 rounded-xl bg-gray-50 p-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-600">Your rating</p>
        <StarRating value={stars} onChange={setStars} />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-600">Your review</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How was your experience at this event?"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>
      <Button
        size="sm"
        disabled={stars === 0 || isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        onClick={() => onSubmit({ stars, text })}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubmittedReview (read-only display)
// ---------------------------------------------------------------------------

function SubmittedReview({ review }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Your review</span>
        <StarRating value={review.stars} onChange={() => { }} readOnly />
      </div>
      {review.text && <p className="text-sm text-gray-700">{review.text}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EventInfoRow
// ---------------------------------------------------------------------------

function EventInfoRow({ event }) {
  return (
    <>
      <p className="font-semibold text-gray-900">{event.eventName}</p>
      <p className="text-sm text-gray-500">{event.organiserName}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(event.dateTime.start)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {event.city}
        </span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// UpcomingCard
// ---------------------------------------------------------------------------

function UpcomingCard({ event, onViewGroupChat }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <EventInfoRow event={event} />
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          <CheckCircle2 className="h-3 w-3" />
          Selected
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => onViewGroupChat(event.id)}
      >
        <MessageCircle className="mr-1.5 h-4 w-4" />
        View Group Chat
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OngoingCard
// ---------------------------------------------------------------------------

function OngoingCard({ event, onViewGroupChat }) {
  const chip = ATTENDANCE_CHIP[event.attendanceStatus] ?? ATTENDANCE_CHIP.pending;
  const ChipIcon = chip.icon;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <EventInfoRow event={event} />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${chip.className}`}
        >
          <ChipIcon className="h-3 w-3" />
          {chip.label}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => onViewGroupChat(event.id)}
      >
        <MessageCircle className="mr-1.5 h-4 w-4" />
        View Group Chat
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompletedCard
// ---------------------------------------------------------------------------

function CompletedCard({ event, onSubmitReview, isSubmittingReview }) {
  const [formOpen, setFormOpen] = useState(false);
  const hasReview = Boolean(event.myReview);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <EventInfoRow event={event} />

      {hasReview ? (
        <div className="mt-3">
          <SubmittedReview review={event.myReview} />
        </div>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5 text-left"
          >
            <span className="text-sm font-medium text-amber-800">
              Rate this event
            </span>
            <ChevronDown
              className={`h-4 w-4 text-amber-700 transition-transform ${formOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {formOpen && (
            <div className="mt-2">
              <ReviewForm
                isSubmitting={isSubmittingReview}
                onSubmit={(review) =>
                  // The backend (review.controller.js) requires revieweeId on
                  // every submission. This is always the event's organiser
                  // here, since a volunteer reviewing on this page can only
                  // ever review the organiser they volunteered for.
                  onSubmitReview(event.id, {
                    ...review,
                    revieweeId: event.organiserId,
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MyEvents (main page)
// ---------------------------------------------------------------------------

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

const EMPTY_COPY = {
  upcoming: {
    title: "No upcoming events",
    subtitle: "Events you're selected for will show up here.",
  },
  ongoing: {
    title: "Nothing happening right now",
    subtitle: "Events in progress will appear here on the day.",
  },
  completed: {
    title: "No completed events yet",
    subtitle: "Your event history and reviews will live here.",
  },
};

export default function MyEvents({
  events = [], // each completed event must include `organiserId` (the
  // organiser's user id) so a submitted review can carry revieweeId —
  // see CompletedCard's onSubmit below.
  isLoading = false,
  onViewGroupChat,
  onSubmitReview, // (eventId, { stars, text }) => Promise<void> | void
  submittingReviewEventId = null,
}) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const grouped = useMemo(
    () => ({
      upcoming: events.filter((e) => e.bucket === "upcoming"),
      ongoing: events.filter((e) => e.bucket === "ongoing"),
      completed: events.filter((e) => e.bucket === "completed"),
    }),
    [events]
  );

  const visibleEvents = grouped[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">My Events</h1>

        <div className="mt-3 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab.label}
              {grouped[tab.key].length > 0 && (
                <span className="ml-1 opacity-75">({grouped[tab.key].length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))
        ) : visibleEvents.length === 0 ? (
          <EmptyState {...EMPTY_COPY[activeTab]} />
        ) : (
          visibleEvents.map((event) => {
            if (activeTab === "upcoming") {
              return (
                <UpcomingCard
                  key={event.id}
                  event={event}
                  onViewGroupChat={onViewGroupChat}
                />
              );
            }
            if (activeTab === "ongoing") {
              return (
                <OngoingCard
                  key={event.id}
                  event={event}
                  onViewGroupChat={onViewGroupChat}
                />
              );
            }
            return (
              <CompletedCard
                key={event.id}
                event={event}
                onSubmitReview={onSubmitReview}
                isSubmittingReview={submittingReviewEventId === event.id}
              />
            );
          })
        )}
      </div>
    </div>
  );
}