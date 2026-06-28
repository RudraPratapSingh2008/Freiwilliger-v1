import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import OrganiserDashboard from "./OrganiserDashboard";
import { useGetMyEventsOrganiserQuery } from "@/api/eventsApi";

function formatDate(dateTime) {
  if (!dateTime?.start) return "Date pending";
  return new Date(dateTime.start).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function deriveStatusLabel(rawStatus) {
  if (rawStatus === "completed") return "Completed";
  if (rawStatus === "cancelled") return "Cancelled";
  if (rawStatus === "closed") return "Ongoing";
  return "Open"; // draft / open
}

export default function OrganiserDashboardPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const { data: eventsRes, isLoading } = useGetMyEventsOrganiserQuery();

  const organiser = useMemo(() => {
    const profile = currentUser?.organiserProfile || {};
    return {
      id: currentUser?._id,
      logoUrl: profile.logo || profile.profilePhoto,
      name: profile.companyName || profile.fullName || currentUser?.username,
      hireScore: profile.hireScore,
    };
  }, [currentUser]);

  const events = useMemo(() => {
    const raw = eventsRes?.data || [];
    return raw.map((e) => ({
      id: e._id,
      name: e.eventName,
      category: e.category,
      status: deriveStatusLabel(e.status),
      date: formatDate(e.dateTime),
      city: e.location?.city,
      appliedCount: e.pendingApplicationCount ?? 0,
      selectedCount: e.selectedVolunteers?.length ?? 0,
    }));
  }, [eventsRes]);

  return (
    <OrganiserDashboard
      organiser={organiser}
      events={events}
      isLoading={isLoading}
      onSettingsOpen={() => navigate("/settings")}
      onManageEvent={(event) => navigate(`/events/${event.id}/applicants`)}
      onRaiseRequirement={() => navigate("/post-event")}
      onNavigate={(key) => {
        if (key === "home") navigate("/dashboard");
        // "network" has no page built yet anywhere in this app — intentionally
        // left unwired rather than pointing at a page that doesn't exist.
      }}
    />
  );
}
