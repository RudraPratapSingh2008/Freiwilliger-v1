import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarClock,
  IndianRupee,
  Users,
  ShieldCheck,
  Heart,
  MessageCircle,
  Star,
  Check,
  Shirt,
  Languages,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Helpers / small pieces
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  Open: "bg-emerald-100 text-emerald-700",
  Ongoing: "bg-amber-100 text-amber-700",
  Completed: "bg-slate-100 text-slate-500",
};

function StatusBadge({ status = "Open" }) {
  return (
    <Badge className={`${STATUS_STYLES[status] || STATUS_STYLES.Open} font-medium`}>
      {status}
    </Badge>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function CompensationBadge({ event }) {
  const type = event.paymentType || "Unpaid";
  const text =
    type === "Paid" || type === "Paid + Refreshments"
      ? `₹${event.amount ?? "—"}${event.amountUnit === "per-hour" ? "/hr" : ""} paid`
      : type === "Refreshments only"
      ? "Refreshments provided"
      : "Unpaid";

  return (
    <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600">
        <IndianRupee className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-base font-bold text-violet-700">{text}</p>
        {type === "Paid + Refreshments" && (
          <p className="text-xs text-violet-500">+ Refreshments on-site</p>
        )}
      </div>
    </div>
  );
}

function StarRating({ value = 0, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
            {review.authorName?.[0] || "?"}
          </div>
          <p className="text-sm font-medium text-slate-700">
            {review.authorName || "Anonymous"}
          </p>
        </div>
        <StarRating value={review.rating} />
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-slate-500">{review.comment}</p>
      )}
      {review.date && (
        <p className="mt-1.5 text-xs text-slate-300">{review.date}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action bar (handles applied / selected / default states)
// ---------------------------------------------------------------------------

function ActionBar({
  applicationStatus,
  isSaved,
  onSave,
  onMessage,
  onApply,
  onWithdraw,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {applicationStatus === "selected" ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
            Selected 🎉
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMessage}
            className="h-11 w-11 shrink-0 border-slate-200"
          >
            <MessageCircle className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onSave}
            className="h-11 w-11 shrink-0 border-slate-200"
          >
            <Heart
              className={`h-5 w-5 ${
                isSaved ? "fill-rose-500 text-rose-500" : "text-slate-500"
              }`}
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMessage}
            className="h-11 w-11 shrink-0 border-slate-200"
          >
            <MessageCircle className="h-5 w-5 text-slate-600" />
          </Button>

          {applicationStatus === "applied" ? (
            <div className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-600">
                <Check className="h-4 w-4" />
                Applied
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={onWithdraw}
                className="h-11 shrink-0 text-sm font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600"
              >
                Withdraw
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onApply}
              className="h-11 flex-1 gap-1.5 bg-violet-600 hover:bg-violet-700"
            >
              Apply Now
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventDetail({
  event,
  organiser = {},
  user = {},
  reviews = [],
  applicationStatus = "none", // "none" | "applied" | "selected"
  isSaved = false,
  onBack,
  onViewOrganiserProfile,
  onSave,
  onMessage,
  onApply,
  onWithdraw,
}) {
  if (!event) return null;

  const userSkills = useMemo(() => new Set(user.skills || []), [user.skills]);
  const helpScoreOk =
    (user.helpScore ?? 0) >= (event.minHelpScore ?? 0);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-white pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-slate-400">Event details</p>
      </div>

      <div className="space-y-6 px-4 py-5">
        {/* 1. Organiser header */}
        <button
          type="button"
          onClick={onViewOrganiserProfile}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
            {organiser.logoUrl ? (
              <img
                src={organiser.logoUrl}
                alt={organiser.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                {organiser.name?.[0] || "O"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {organiser.name || "Organiser"}
              </p>
              <Badge className="bg-indigo-100 text-indigo-700">
                Hire Score {organiser.hireScore ?? "—"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{organiser.city}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-violet-600">
            View Profile
          </span>
        </button>

        {/* 2. Title + category + status */}
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {event.category}
            </Badge>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="mt-2 text-xl font-bold text-slate-900">{event.name}</h1>
        </div>

        {/* 3. Location */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-violet-500" />
          <div>
            <p className="text-sm text-slate-700">{event.address}</p>
            <p className="text-sm text-slate-400">{event.city}</p>
          </div>
        </div>

        {/* 4. Date & time */}
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-violet-500" />
          <p className="text-sm text-slate-700">
            {event.startDate} {event.startTime} → {event.endDate} {event.endTime}
          </p>
        </div>

        {/* 5. Compensation */}
        <CompensationBadge event={event} />

        {/* 6. Roles */}
        {event.roles?.length > 0 && (
          <div>
            <SectionLabel>Roles needed</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {event.roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="bg-slate-100 px-3 py-1 text-slate-600"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 7. Requirements */}
        <div>
          <SectionLabel>Requirements</SectionLabel>
          <div className="space-y-4 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Gender preference</span>
              <span className="font-medium text-slate-700">
                {event.genderPref || "Any"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Age range</span>
              <span className="font-medium text-slate-700">
                {event.ageRange?.[0] ?? 18} – {event.ageRange?.[1] ?? 60} yrs
              </span>
            </div>

            {event.skills?.length > 0 && (
              <div className="text-sm">
                <span className="text-slate-500">Required skills</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {event.skills.map((skill) => {
                    const matched = userSkills.has(skill);
                    return (
                      <span
                        key={skill}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          matched
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {matched && <Check className="mr-1 inline h-3 w-3" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {event.languages?.length > 0 && (
              <div className="flex items-start justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Languages className="h-3.5 w-3.5" />
                  Languages
                </span>
                <span className="text-right font-medium text-slate-700">
                  {event.languages.join(", ")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Min Help Score
              </span>
              <span
                className={`font-medium ${
                  helpScoreOk ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                You: {user.helpScore ?? 0} / Req: {event.minHelpScore ?? 0}
              </span>
            </div>

            {event.dressCode && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Shirt className="h-3.5 w-3.5" />
                  Dress code
                </span>
                <span className="font-medium text-slate-700">
                  {event.dressCode}
                </span>
              </div>
            )}

            {event.otherRequirements && (
              <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
                {event.otherRequirements}
              </p>
            )}
          </div>
        </div>

        {/* 8. Organiser hiring history */}
        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3">
          <Sparkles className="h-4.5 w-4.5 shrink-0 text-violet-500" />
          <p className="text-sm text-violet-700">
            Hired{" "}
            <span className="font-semibold">
              {organiser.volunteersHired ?? 0}
            </span>{" "}
            volunteers in{" "}
            <span className="font-semibold">{organiser.eventsHosted ?? 0}</span>{" "}
            events
          </p>
        </div>

        {/* 9. Reviews */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <SectionLabel>Reviews of organiser</SectionLabel>
            <div className="flex items-center gap-1.5 text-sm">
              <StarRating value={avgRating} />
              <span className="font-medium text-slate-600">
                {avgRating.toFixed(1)}
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400">No reviews yet</p>
          ) : (
            <div className="space-y-2.5">
              {reviews.slice(0, 3).map((review, i) => (
                <ReviewCard key={review.id ?? i} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ActionBar
        applicationStatus={applicationStatus}
        isSaved={isSaved}
        onSave={onSave}
        onMessage={onMessage}
        onApply={onApply}
        onWithdraw={onWithdraw}
      />
    </div>
  );
}