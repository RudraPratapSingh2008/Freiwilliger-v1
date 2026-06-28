import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import FilterDrawer, { DEFAULT_FILTERS } from "@/components/FilterDrawer";
import EventCard from "@/components/EventCard";
import NotificationBell from "@/components/notifications/NotificationBell";
import StateDiscovery from "./StateDiscovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useApplyToEventMutation,
  useGetFeedQuery,
  useWithdrawApplicationMutation,
} from "@/api/eventsApi";

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
                className={`h-5 w-5 ${isActive ? "text-violet-600" : "text-slate-400"}`}
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
        <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100" />
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
      <p className="text-base font-semibold text-slate-800">No events in your area yet</p>
      <p className="text-sm text-slate-500">Check back soon</p>
    </div>
  );
}

function LocationErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <MapPin className="h-7 w-7 text-amber-500" />
      </div>
      <p className="text-base font-semibold text-slate-800">
        Enable location to see nearby events
      </p>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PULL_THRESHOLD = 70;

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getEventStart(event) {
  const raw = event?.dateTime?.start || event?.startDate || event?.date;
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date : null;
}

function matchesFilters(event, filters, searchQuery, volunteerSkills) {
  const haystack = [
    event.eventName,
    event.name,
    event.category,
    event.location?.city,
    event.city,
  ]
    .map(normalizeText)
    .join(" ");

  if (searchQuery && !haystack.includes(normalizeText(searchQuery))) {
    return false;
  }

  const eventStart = getEventStart(event);
  if (filters.dateFrom && eventStart && eventStart < new Date(filters.dateFrom)) {
    return false;
  }

  if (filters.dateTo && eventStart) {
    const endOfDay = new Date(filters.dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    if (eventStart > endOfDay) {
      return false;
    }
  }

  if (filters.gender !== "Any") {
    const requiredGender = event.requirements?.genderPreference || "Any";
    if (requiredGender !== "Any" && requiredGender !== filters.gender) {
      return false;
    }
  }

  if (filters.minPay !== "") {
    const minPay = Number(filters.minPay);
    const amount = Number(event.compensation?.amount ?? 0);
    if (Number.isFinite(minPay) && amount < minPay) {
      return false;
    }
  }

  if (filters.skillsMatch) {
    const requiredSkills = event.requirements?.requiredSkills || [];
    if (requiredSkills.length > 0) {
      const skillSet = new Set(volunteerSkills.map(normalizeText));
      const hasMatch = requiredSkills.every((skill) => skillSet.has(normalizeText(skill)));
      if (!hasMatch) {
        return false;
      }
    }
  }

  if (filters.payment !== "Any") {
    const paymentType = normalizeText(event.compensation?.paymentType);
    const notes = normalizeText(event.compensation?.notes);

    if (filters.payment === "Paid" && paymentType !== "paid") {
      return false;
    }
    if (filters.payment === "Unpaid" && paymentType !== "unpaid") {
      return false;
    }
    if (filters.payment === "Refreshments" && !notes.includes("refresh")) {
      return false;
    }
  }

  return true;
}

function FeedEventCard({ event }) {
  const [applyToEvent, { isLoading: isApplying }] = useApplyToEventMutation();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();
  const eventId = event._id || event.id;

  const handleApply = async () => {
    if (!eventId) return;
    try {
      await applyToEvent(eventId).unwrap();
    } catch (error) {
      console.error("Failed to apply to event:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!eventId) return;
    try {
      await withdrawApplication(eventId).unwrap();
    } catch (error) {
      console.error("Failed to withdraw application:", error);
    }
  };

  return (
    <EventCard
      event={event}
      onApply={handleApply}
      onWithdraw={handleWithdraw}
      isApplying={isApplying}
      isWithdrawing={isWithdrawing}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VolunteerDashboard({
  avatarUrl,
  activeNav = "home",
  onProfileOpen,
  onSettingsOpen,
  onNavigate,
}) {
  const navigate = useNavigate();

  const handleNavigate = (key) => {
    if (key === "messages") {
      navigate("/messages");
    } else if (onNavigate) {
      onNavigate(key);
    }
  };
  const location = useSelector((state) => state.auth.user?.location || state.auth.location || {});
  const volunteerSkills = useSelector(
    (state) => state.auth.user?.volunteerProfile?.skills || state.auth.user?.skills || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const scrollRef = useRef(null);

  const feedQuery = useMemo(
    () => ({
      lat: location?.lat ?? "",
      lng: location?.lng ?? "",
      radius: filters.distance,
      payment: filters.payment,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      gender: filters.gender,
      minPay: filters.minPay,
      skillsMatch: filters.skillsMatch,
    }),
    [filters, location?.lat, location?.lng]
  );

  const { data: feedResponse, isLoading, isError, error, refetch } = useGetFeedQuery(feedQuery);
  const feedEvents = feedResponse?.data || [];

  const visibleEvents = useMemo(
    () => feedEvents.filter((event) => matchesFilters(event, filters, searchQuery, volunteerSkills)),
    [feedEvents, filters, searchQuery, volunteerSkills]
  );

  const locationPrompt = useMemo(() => {
    const errorMessage = error?.data?.message || error?.message || "";
    if (!location?.lat || !location?.lng) {
      return "Save your city and coordinates in your profile, then refresh to load nearby events.";
    }
    if (errorMessage) {
      return errorMessage;
    }
    return "Turn on location access so we can load events near you.";
  }, [error, location?.lat, location?.lng]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchQuery(value);
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
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await refetch();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    touchStartY.current = null;
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-white pb-20">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onProfileOpen}
            className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Your profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                ?
              </div>
            )}
          </button>

          <p className="text-lg font-bold tracking-tight text-violet-600">Freiwilliger</p>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              type="button"
              onClick={onSettingsOpen}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

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
            onClick={() => setIsFilterOpen(true)}
            className="h-10 w-10 shrink-0 border-slate-200 text-violet-600"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="mt-2.5 flex items-center gap-1 text-sm text-slate-500"
        >
          <MapPin className="h-3.5 w-3.5 text-violet-500" />
          Showing events near{" "}
          <span className="font-medium text-slate-700">{location?.city || location?.state || "you"}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </header>

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

      <main
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {!location?.lat || !location?.lng ? (
          <LocationErrorState message={locationPrompt} onRetry={refetch} />
        ) : isLoading ? (
          <FeedSkeleton />
        ) : isError ? (
          <LocationErrorState message={locationPrompt} onRetry={refetch} />
        ) : visibleEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {visibleEvents.map((event) => (
              <FeedEventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}

        {/* State Discovery Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <StateDiscovery />
        </div>
      </main>

      <BottomNav active={activeNav} onNavigate={handleNavigate} />

      <FilterDrawer
        isOpen={isFilterOpen}
        filters={filters}
        onChange={setFilters}
        onApply={() => setIsFilterOpen(false)}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}