import {
  Settings,
  ChevronRight,
  Plus,
  Home,
  MessageCircle,
  ClipboardList,
  CalendarPlus,
  MapPin,
  CalendarDays,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  Open: "bg-emerald-100 text-emerald-700",
  Ongoing: "bg-blue-100 text-blue-700",
  Completed: "bg-slate-100 text-slate-500",
  Cancelled: "bg-rose-100 text-rose-600",
};

function StatusBadge({ status = "Open" }) {
  return (
    <Badge className={`${STATUS_STYLES[status] || STATUS_STYLES.Open} font-medium`}>
      {status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Event row
// ---------------------------------------------------------------------------

function OrganiserEventRow({ event, onManage }) {
  return (
    <button
      type="button"
      onClick={() => onManage?.(event)}
      className="w-full rounded-xl border border-slate-100 p-4 text-left transition-colors hover:border-violet-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{event.name}</p>
          <p className="text-xs text-slate-400">{event.category}</p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          {event.date}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {event.city}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Users className="h-3.5 w-3.5 text-violet-500" />
          {event.appliedCount ?? 0} applied, {event.selectedCount ?? 0} selected
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-violet-600">
          Manage
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onRaiseRequirement }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <CalendarPlus className="h-7 w-7 text-violet-500" />
      </div>
      <p className="text-base font-semibold text-slate-800">
        No events posted yet
      </p>
      <p className="text-sm text-slate-500">
        Raise your first requirement and start finding volunteers
      </p>
      <Button
        type="button"
        onClick={onRaiseRequirement}
        className="mt-2 gap-1.5 bg-violet-600 hover:bg-violet-700"
      >
        <Plus className="h-4 w-4" />
        Raise a Requirement
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom navigation
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "post", label: "Post", icon: Plus },
  { key: "events", label: "Events", icon: ClipboardList },
];

function BottomNav({ active = "home", onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate?.(key)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-violet-600" : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span className={isActive ? "text-violet-600" : "text-slate-400"}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OrganiserDashboard({
  organiser = {},
  events = [],
  activeNav = "home",
  onSettingsOpen,
  onManageEvent,
  onRaiseRequirement,
  onNavigate,
}) {
  return (
    <div className="mx-auto min-h-screen max-w-xl bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
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
            <p className="text-base font-semibold text-slate-900">
              {organiser.name || "Your Company"}
            </p>
          </div>

          <button
            type="button"
            onClick={onSettingsOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-header */}
        <div className="mt-3.5 flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">Your Events</p>
          <Badge className="bg-indigo-100 px-2.5 py-1 text-indigo-700">
            Hire Score {organiser.hireScore ?? "—"}
          </Badge>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 py-4">
        {events.length === 0 ? (
          <EmptyState onRaiseRequirement={onRaiseRequirement} />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <OrganiserEventRow
                key={event._id || event.id}
                event={event}
                onManage={onManageEvent}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        type="button"
        onClick={onRaiseRequirement}
        aria-label="Raise a requirement"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <BottomNav active={activeNav} onNavigate={onNavigate} />
    </div>
  );
}