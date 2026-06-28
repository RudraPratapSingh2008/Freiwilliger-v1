import { useMemo, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  ListPlus,
  X,
  ChevronDown,
  Languages,
  Briefcase,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMatchBarColor(percent) {
  if (percent >= 70) return "bg-emerald-500";
  if (percent >= 40) return "bg-amber-500";
  return "bg-gray-400";
}

function relativeDate(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ---------------------------------------------------------------------------
// ApplicantCard
// ---------------------------------------------------------------------------

function ApplicantCard({
  applicant,
  isExpanded,
  onToggleExpand,
  onAction,
  isPendingConfirm,
}) {
  const matchPercent = Math.round(
    (applicant.skillsMatched / applicant.skillsTotal) * 100
  );
  const isSelected = applicant.status === "selected";
  const isRejected = applicant.status === "rejected";
  const isShortlisted = applicant.status === "shortlisted";

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all ${
        isSelected
          ? "border-emerald-300 ring-1 ring-emerald-100"
          : "border-gray-200"
      }`}
    >
      {/* Tappable summary row */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <img
          src={applicant.profilePhoto}
          alt={applicant.fullName}
          className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {applicant.fullName}
              </p>
              <p className="truncate text-sm text-gray-500">
                @{applicant.username}
              </p>
            </div>
            <ScoreBadge score={applicant.helpScore} role="volunteer" size="sm" />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {applicant.city}
            </span>
            <span>{applicant.ageRange} yrs</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {relativeDate(applicant.appliedDate)}
            </span>
          </div>

          {applicant.isReturningVolunteer && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
              <RotateCcw className="h-3 w-3" />
              Returning Volunteer
            </span>
          )}

          {/* Skills match bar */}
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
              <span>
                {applicant.skillsMatched}/{applicant.skillsTotal} skills matched
              </span>
              <span className="font-medium">{matchPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${getMatchBarColor(matchPercent)}`}
                style={{ width: `${matchPercent}%` }}
              />
            </div>
          </div>
        </div>

        <ChevronDown
          className={`mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-3 text-sm">
          <div>
            <p className="mb-1 font-medium text-gray-700">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 flex items-center gap-1 font-medium text-gray-700">
              <Languages className="h-3.5 w-3.5" /> Languages
            </p>
            <p className="text-gray-600">{applicant.languages.join(", ")}</p>
          </div>

          <div>
            <p className="mb-1 flex items-center gap-1 font-medium text-gray-700">
              <Briefcase className="h-3.5 w-3.5" /> Past work
            </p>
            {applicant.pastWork.length > 0 ? (
              <ul className="space-y-1 text-gray-600">
                {applicant.pastWork.map((work, i) => (
                  <li key={i}>
                    {work.role} · {work.organisation} ({work.duration})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No past experience listed</p>
            )}
          </div>

          <div>
            <p className="mb-1 font-medium text-gray-700">Reviews</p>
            {applicant.reviews.length > 0 ? (
              <ul className="space-y-1.5">
                {applicant.reviews.map((review, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="mt-0.5 flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s < review.stars ? "fill-amber-400" : "fill-transparent"
                          }`}
                        />
                      ))}
                    </span>
                    <span>{review.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No reviews yet</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        {isSelected ? (
          <>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              {isPendingConfirm ? "Pending confirmation" : "Selected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => onAction(applicant.id, "remove")}
            >
              Remove
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={isShortlisted ? "secondary" : "outline"}
              size="sm"
              disabled={isRejected}
              onClick={() => onAction(applicant.id, "shortlist")}
            >
              <ListPlus className="mr-1 h-3.5 w-3.5" />
              Shortlist
            </Button>
            <Button
              size="sm"
              disabled={isRejected}
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => onAction(applicant.id, "select")}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Select
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isRejected}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onAction(applicant.id, "reject")}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ApplicantList (main page)
// ---------------------------------------------------------------------------

const TABS = [
  { key: "all", label: "All" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "selected", label: "Selected" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicantList({
  eventName,
  totalSpots,
  applicants = [],
  onBack,
  onUpdateStatus, // (applicantId, action) => void
  onConfirmSelections, // (applicantIds[]) => Promise<void> | void
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [pendingConfirmIds, setPendingConfirmIds] = useState([]);
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);

  const counts = useMemo(
    () => ({
      all: applicants.length,
      shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
      selected: applicants.filter((a) => a.status === "selected").length,
      rejected: applicants.filter((a) => a.status === "rejected").length,
    }),
    [applicants]
  );

  const visibleApplicants = useMemo(() => {
    if (activeTab === "all") return applicants;
    return applicants.filter((a) => a.status === activeTab);
  }, [applicants, activeTab]);

  function handleAction(applicantId, action) {
    if (action === "select") {
      setPendingConfirmIds((prev) => [...new Set([...prev, applicantId])]);
    }
    if (action === "remove") {
      setPendingConfirmIds((prev) => prev.filter((id) => id !== applicantId));
    }
    onUpdateStatus(applicantId, action);
  }

  function handleSelectAllShortlisted() {
    const shortlistedIds = applicants
      .filter((a) => a.status === "shortlisted")
      .map((a) => a.id);

    shortlistedIds.forEach((id) => onUpdateStatus(id, "select"));
    setPendingConfirmIds((prev) => [...new Set([...prev, ...shortlistedIds])]);
  }

  async function handleConfirm() {
    await onConfirmSelections(pendingConfirmIds);
    setPendingConfirmIds([]);
    setConfirmSheetOpen(false);
  }

  const selectedCount = counts.selected;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-1.5 hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <p className="font-semibold text-gray-900">{eventName}</p>
            <p className="text-xs text-gray-500">Applicants</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Counter + bulk action */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">{selectedCount}</span> of{" "}
          {totalSpots} volunteers selected
        </span>
        {activeTab === "shortlisted" && counts.shortlisted > 0 && (
          <Button variant="outline" size="sm" onClick={handleSelectAllShortlisted}>
            Select All Shortlisted
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 space-y-3 px-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gray-100"
            />
          ))
        ) : visibleApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-medium text-gray-700">No applicants here yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Check back soon or review another tab.
            </p>
          </div>
        ) : (
          visibleApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              isExpanded={expandedId === applicant.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === applicant.id ? null : applicant.id)
              }
              onAction={handleAction}
              isPendingConfirm={pendingConfirmIds.includes(applicant.id)}
            />
          ))
        )}
      </div>

      {/* Floating confirm bar */}
      {pendingConfirmIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setConfirmSheetOpen(true)}
          >
            Confirm Selection ({pendingConfirmIds.length})
          </Button>
        </div>
      )}

      {/* Confirm sheet */}
      <Sheet open={confirmSheetOpen} onOpenChange={setConfirmSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>
              Confirm selection of {pendingConfirmIds.length} volunteer
              {pendingConfirmIds.length !== 1 ? "s" : ""}?
            </SheetTitle>
          </SheetHeader>
          <p className="px-1 py-2 text-sm text-gray-500">
            This will notify them that they've been selected for {eventName}.
          </p>
          <SheetFooter className="flex-row gap-2 sm:justify-stretch">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmSheetOpen(false)}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleConfirm}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Confirm & Notify
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}