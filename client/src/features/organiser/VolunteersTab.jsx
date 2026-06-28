import { useNavigate } from "react-router-dom";
import { useMarkAttendanceMutation } from "@/api/eventsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  UserCheck,
  UserX,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";

function getAttendanceStatus(volunteer, event) {
  const log = event.attendanceLog || [];
  const record = log.find(
    (entry) =>
      entry.volunteerId === volunteer._id ||
      entry.volunteerId === volunteer.userId
  );
  if (!record) return "pending";
  return record.attended ? "attended" : "no-show";
}

function AttendanceChip({ status }) {
  const config = {
    attended: { label: "Attended", className: "bg-green-100 text-green-800" },
    "no-show": { label: "No-show", className: "bg-red-100 text-red-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge className={className}>{label}</Badge>;
}

export default function VolunteersTab({ event, applicants }) {
  const navigate = useNavigate();
  const [markAttendance] = useMarkAttendanceMutation();

  // Filter to selected volunteers only
  const selectedVolunteers = Array.isArray(applicants)
    ? applicants.filter(
        (a) => a.status === "selected" || a.applicationStatus === "selected"
      )
    : [];

  if (selectedVolunteers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No volunteers selected yet</p>
      </div>
    );
  }

  const handleMarkAttendance = (volunteerId, attended) => {
    markAttendance({
      eventId: event._id,
      volunteerId,
      attended,
    });
  };

  return (
    <div className="space-y-3 mt-2">
      {selectedVolunteers.map((volunteer) => {
        const volunteerId = volunteer._id || volunteer.userId;
        const name = volunteer.name || volunteer.fullName || "Volunteer";
        const photo = volunteer.photo || volunteer.profilePhoto;
        const helpScore = volunteer.helpScore ?? 0;
        const attendanceStatus = getAttendanceStatus(volunteer, event);
        const canMarkAttendance =
          (event.status === "completed" || event.status === "closed") &&
          attendanceStatus === "pending";
        const canWriteReview =
          event.reviewsEnabled === true && attendanceStatus === "attended";

        return (
          <Card key={volunteerId}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
              {/* Volunteer Info */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={photo} alt={name} />
                  <AvatarFallback>
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <ScoreBadge score={helpScore} size="sm" />
                    <AttendanceChip status={attendanceStatus} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {canMarkAttendance && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAttendance(volunteerId, true)}
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Mark Attended
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMarkAttendance(volunteerId, false)}
                    >
                      <UserX className="h-3.5 w-3.5 mr-1" />
                      Mark No-show
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Message
                </Button>
                {canWriteReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/reviews/write?volunteerId=${volunteerId}&eventId=${event._id}`)
                    }
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    Write Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
