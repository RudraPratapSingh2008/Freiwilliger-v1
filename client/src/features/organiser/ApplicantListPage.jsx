import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApplicantList from "./ApplicantList";
import {
  useGetApplicantsQuery,
  useGetEventQuery,
  useRespondToApplicantMutation,
} from "@/api/eventsApi";

function formatRelative(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function mapApplicant(a) {
  return {
    id: a._id,
    fullName: a.name,
    username: a.username,
    profilePhoto: a.photo,
    helpScore: a.helpScore ?? 0,
    city: a.city,
    ageRange: a.ageRange, // already a pre-bucketed string e.g. "20–25"
    appliedDate: formatRelative(a.appliedAt),
    // The backend doesn't yet track "applied to this organiser before" —
    // isReturningVolunteer is always undefined for now (a real gap on the
    // server side, not something this page can compute on its own).
    isReturningVolunteer: Boolean(a.isReturningVolunteer),
    // Server gives a single skillsMatchPercent; the component expects a
    // matched/total pair, so this represents it as matched% out of 100.
    skillsMatched: a.skillsMatchPercent ?? 0,
    skillsTotal: 100,
    skills: a.skills || [],
    languages: a.languages || [],
    pastWork: (a.pastExperience || []).map((exp) => ({
      role: exp.role,
      organisation: exp.organisationName,
      duration: exp.duration,
    })),
    // Per-applicant reviews aren't populated by the backend yet either
    // (volunteerProfile has no embedded reviews array — they live in the
    // separate Review collection and aren't joined in here).
    reviews: a.reviews || [],
    status: a.applicationStatus,
  };
}

export default function ApplicantListPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: eventRes } = useGetEventQuery(eventId, { skip: !eventId });
  const { data: applicantsRes, isLoading } = useGetApplicantsQuery(eventId, {
    skip: !eventId,
  });
  const [respondToApplicant] = useRespondToApplicantMutation();

  const event = eventRes?.data;
  const applicants = useMemo(
    () => (applicantsRes?.data || []).map(mapApplicant),
    [applicantsRes]
  );

  const handleUpdateStatus = (applicantId, action) => {
    // The API only accepts select | reject | shortlist. "remove" is a
    // client-only concept (un-staging a pending selection before it's
    // confirmed) — the closest real transition is back to "shortlisted".
    const serverAction = action === "remove" ? "shortlist" : action;
    respondToApplicant({ eventId, userId: applicantId, action: serverAction });
  };

  const handleConfirmSelections = async () => {
    // Each "select" action already persists immediately via
    // respondToApplicant above, so there's nothing further to commit here —
    // this just closes the confirmation sheet in the UI.
  };

  return (
    <ApplicantList
      eventName={event?.eventName}
      totalSpots={event?.totalVolunteersNeeded}
      applicants={applicants}
      isLoading={isLoading}
      onBack={() => navigate(-1)}
      onUpdateStatus={handleUpdateStatus}
      onConfirmSelections={handleConfirmSelections}
    />
  );
}
