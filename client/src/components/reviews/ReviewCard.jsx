import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diffInSeconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StarDisplay({ value = 0 }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewCard
// ---------------------------------------------------------------------------

/**
 * Displays a single review.
 *
 * Accepts the real shape returned by the backend (review.controller.js):
 *   { reviewerId: { username, role, volunteerProfile, organiserProfile },
 *     stars, comment, isNoShow, createdAt }
 *
 * Also tolerates a couple of looser aliases (`text`/`rating`/`noShow`) so it
 * keeps working if it's fed data from a slightly different source — but the
 * fields above are the ones the API actually sends.
 */
export function ReviewCard({ review }) {
  if (!review) return null;

  const reviewer = review.reviewerId || {};
  const reviewerName =
    reviewer.displayName ||
    reviewer.volunteerProfile?.fullName ||
    reviewer.organiserProfile?.companyName ||
    reviewer.organiserProfile?.fullName ||
    reviewer.username ||
    review.reviewerName ||
    'Anonymous';

  const reviewerAvatar =
    reviewer.displayPhoto ||
    reviewer.volunteerProfile?.profilePhoto ||
    reviewer.organiserProfile?.profilePhoto ||
    reviewer.organiserProfile?.logo ||
    review.reviewerAvatar ||
    null;

  const reviewerRole = reviewer.role || review.reviewerRole;
  const stars = review.stars ?? review.rating ?? 0;
  const comment = review.comment ?? review.text ?? '';
  const isNoShow = review.isNoShow ?? review.noShow ?? false;

  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={reviewerAvatar} alt={reviewerName} />
            <AvatarFallback className="text-xs">
              {reviewerName[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-700">{reviewerName}</p>
              {reviewerRole && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-[10px] capitalize text-slate-500"
                >
                  {reviewerRole}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <StarDisplay value={stars} />
      </div>

      {comment && <p className="mt-2 text-sm text-slate-500">{comment}</p>}

      <div className="mt-1.5 flex items-center gap-2">
        {review.createdAt && (
          <p className="text-xs text-slate-300">{formatRelative(review.createdAt)}</p>
        )}
        {isNoShow && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            No-show
          </span>
        )}
      </div>
    </div>
  );
}

export default ReviewCard;
