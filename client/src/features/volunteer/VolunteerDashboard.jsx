import { useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Settings,
  MapPin,
  ChevronDown,
  Home,
  MessageCircle,
  Users,
  ClipboardList,
  CalendarX,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";

// ---------------------------------------------------------------------------
// Bottom navigation
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "network", label: "Network", icon: Users },
  { key: "myEvents", label: "My Events", icon: ClipboardList },
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
// Skeleton + empty states
// ---------------------------------------------------------------------------

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <CalendarX className="h-7 w-7 text-violet-500" />
      </div>
      <p className="text-base font-semibold text-slate-800">
        No events in your area yet
      </p>
      <p className="text-sm text-slate-500">Check back soon</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PULL_THRESHOLD = 70;

export default function VolunteerDashboard({
  events = [],
  city = "",
  isLoading = false,
  avatarUrl,
  activeNav = "home",
  onSearch,
  onFilterOpen,
  onCityChange,
  onProfileOpen,
  onSettingsOpen,
  onRefresh,
  onNavigate,
}) {
  const [query, setQuery] = useState("");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const scrollRef = useRef(null);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onSearch?.(v);
  };

  const handleTouchStart = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    touchStartY.current = null;
  };

  const showPullIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onProfileOpen}
            className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Your profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                ?
              </div>
            )}
          </button>

          <p className="text-lg font-bold tracking-tight text-violet-600">
            Freiwilliger
          </p>

          <button
            type="button"
            onClick={onSettingsOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={handleSearchChange}
              placeholder="Search events by name or category"
              className="h-10 pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onFilterOpen}
            className="h-10 w-10 shrink-0 border-slate-200 text-violet-600"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* City indicator */}
        <button
          type="button"
          onClick={onCityChange}
          className="mt-2.5 flex items-center gap-1 text-sm text-slate-500"
        >
          <MapPin className="h-3.5 w-3.5 text-violet-500" />
          Showing events near{" "}
          <span className="font-medium text-slate-700">{city || "you"}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all"
        style={{
          height: isRefreshing ? 44 : Math.min(pullDistance, 60),
        }}
      >
        <Loader2
          className={`h-5 w-5 text-violet-500 ${
            isRefreshing || pullDistance >= PULL_THRESHOLD ? "animate-spin" : ""
          }`}
        />
      </div>

      {/* Feed */}
      <main
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isLoading ? (
          <FeedSkeleton />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      <BottomNav active={activeNav} onNavigate={onNavigate} />
    </div>
  );
}