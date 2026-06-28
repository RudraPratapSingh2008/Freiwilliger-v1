import { CalendarDays, Loader2, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function formatDate(dateTime) {
  if (!dateTime?.start) return 'Date pending';
  return new Date(dateTime.start).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventCard({
  event,
  onApply,
  onWithdraw,
  isApplying = false,
  isWithdrawing = false,
}) {
  const navigate = useNavigate();

  if (!event) return null;

  const eventId = event.id || event._id;
  const title = event.eventName || event.name || 'Untitled event';
  const city = event.location?.city || event.city || 'Unknown city';
  const status = event.status || 'open';
  const applicationStatus = event.applicationStatus || 'none';
  const spotsRemaining = typeof event.spotsRemaining === 'number'
    ? event.spotsRemaining
    : Math.max(0, (event.totalVolunteersNeeded || 0) - (event.selectedVolunteers?.length || 0));
  const isBusy = isApplying || isWithdrawing;

  return (
    <Card
      onClick={() => eventId && navigate(`/events/${eventId}`)}
      className="cursor-pointer overflow-hidden border-slate-100 shadow-sm transition-shadow hover:shadow-md"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{event.category || 'Event'}</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">{status}</Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-violet-500" />
            {formatDate(event.dateTime)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-violet-500" />
            {city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-violet-500" />
            {spotsRemaining} spots left
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm font-medium text-slate-500">
            {applicationStatus === 'pending'
              ? 'Application pending'
              : applicationStatus === 'withdrew'
                ? 'Application withdrawn'
                : applicationStatus === 'selected'
                  ? 'Selected'
                  : 'Ready to apply'}
          </span>

          {applicationStatus === 'pending' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw?.(event);
              }}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isWithdrawing ? 'Withdrawing' : 'Withdraw'}
            </button>
          ) : applicationStatus === 'selected' ? (
            <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
              Selected
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApply?.(event);
              }}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isApplying ? 'Applying' : 'Apply'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
