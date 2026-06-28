import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MyEvents from "./MyEvents";
import { useGetMyEventsVolunteerQuery } from "@/api/eventsApi";
import { useCreateReviewMutation } from "@/api/reviewsApi";

function deriveBucket(event) {
  if (event.status === "completed") return "completed";
  const now = Date.now();
  const start = event.dateTime?.start ? new Date(event.dateTime.start).getTime() : null;
  const end = event.dateTime?.end ? new Date(event.dateTime.end).getTime() : null;
  if (start && end && now >= start && now <= end) return "ongoing";
  return "upcoming";
}

function deriveAttendanceStatus(event, volunteerId) {
  const log = (event.attendanceLog || []).find(
    (entry) => entry.volunteerId?.toString() === volunteerId?.toString()
  );
  if (!log) return "pending";
  return log.attended ? "attended" : "no_show";
}

export default function MyEventsPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const volunteerId = currentUser?._id;

  const { data: eventsRes, isLoading } = useGetMyEventsVolunteerQuery();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [submittingEventId, setSubmittingEventId] = useState(null);

  // The backend has no "my submitted reviews" list endpoint, so once a
  // review is submitted this session we track it locally to flip the card
  // into its "reviewed" state immediately. It won't survive a hard refresh
  // until that endpoint exists.
  const [locallySubmitted, setLocallySubmitted] = useState({});

  const events = useMemo(() => {
    const raw = eventsRes?.data || [];
    return raw
      // Only events this volunteer was actually selected for are meaningful
      // to show here — pending/rejected/withdrawn applications don't have
      // an event experience to review or attend.
      .filter((e) => e.applicationStatus === "selected")
      .map((e) => {
        const organiserProfile = e.organiserId?.organiserProfile || {};
        return {
          id: e._id,
          eventName: e.eventName,
          organiserName:
            organiserProfile.companyName || organiserProfile.fullName || e.organiserId?.username,
          organiserId: e.organiserId?._id,
          dateTime: e.dateTime,
          city: e.location?.city,
          bucket: deriveBucket(e),
          attendanceStatus: deriveAttendanceStatus(e, volunteerId),
          groupChatId: e.groupChatId,
          myReview: locallySubmitted[e._id] || null,
        };
      });
  }, [eventsRes, volunteerId, locallySubmitted]);

  const handleSubmitReview = async (eventId, payload) => {
    setSubmittingEventId(eventId);
    try {
      await createReview(payload).unwrap();
      setLocallySubmitted((prev) => ({ ...prev, [eventId]: payload }));
    } catch (err) {
      console.error("[MyEventsPage] failed to submit review", err);
    } finally {
      setSubmittingEventId(null);
    }
  };

  return (
    <MyEvents
      events={events}
      isLoading={isLoading}
      onViewGroupChat={(eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (event?.groupChatId) {
          navigate(`/messages?conversation=${event.groupChatId}`);
        }
      }}
      onSubmitReview={handleSubmitReview}
      submittingReviewEventId={isSubmittingReview ? submittingEventId : null}
    />
  );
}
