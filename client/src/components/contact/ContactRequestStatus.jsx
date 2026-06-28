import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useGetMyContactRequestsQuery } from '../../api/contactRequestsApi';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  approved_by_volunteer: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  denied_by_volunteer: {
    label: 'Denied',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function ContactRequestStatus() {
  const { data: requests, isLoading, isError } = useGetMyContactRequestsQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Failed to load contact requests.
      </p>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No contact requests sent yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const config = statusConfig[request.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const volunteerName =
          request.volunteerId?.username ||
          request.volunteerId?.volunteerProfile?.fullName ||
          'Unknown Volunteer';
        const eventName =
          request.eventId?.title || request.eventId?.name || 'Unknown Event';

        return (
          <Card key={request._id} size="sm">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{volunteerName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {eventName}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={config.className}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {getRelativeTime(request.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
