import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { useGetScoreHistoryQuery } from "@/api/usersApi";

/**
 * Formats a timestamp into a relative "time ago" string.
 */
function getRelativeTime(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
}

/**
 * ScoreHistoryTimeline — vertical timeline of score changes.
 *
 * Props:
 * - history (optional): array of { delta, reason, eventId, eventName, timestamp }
 *   If not provided, fetches data internally via useGetScoreHistoryQuery.
 */
export default function ScoreHistoryTimeline({ history: historyProp }) {
  const { data, isLoading } = useGetScoreHistoryQuery(undefined, {
    skip: !!historyProp,
  });

  const history = historyProp || data?.data || data || [];

  if (isLoading && !historyProp) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span className="animate-pulse">Loading score history...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Trophy className="h-10 w-10 mb-3 text-amber-400" />
        <p className="text-sm font-medium">No score changes yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical connecting line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

      <ul className="space-y-4">
        {history.map((entry, index) => {
          const isPositive = entry.delta > 0;
          const Icon = isPositive ? TrendingUp : TrendingDown;
          const colorClass = isPositive ? "text-emerald-600" : "text-red-600";
          const deltaText = isPositive ? `+${entry.delta}` : `${entry.delta}`;

          return (
            <li key={entry._id || `${entry.timestamp}-${index}`} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background ${
                  isPositive ? "border-emerald-600" : "border-red-600"
                }`}
              >
                <Icon className={`h-3 w-3 ${colorClass}`} />
              </div>

              {/* Entry content */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${colorClass}`}>
                    {deltaText}
                  </span>
                  <span className="text-sm text-foreground">{entry.reason}</span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  {entry.eventId && entry.eventName && (
                    <Link
                      to={`/events/${entry.eventId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {entry.eventName}
                    </Link>
                  )}
                  {entry.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {entry.eventId && entry.eventName ? "· " : ""}
                      {getRelativeTime(entry.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
