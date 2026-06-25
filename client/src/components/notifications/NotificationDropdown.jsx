import React from 'react';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  Mail,
  MailCheck,
  Bell,
} from 'lucide-react';
import { NOTIFICATION_TYPES } from '@/hooks/useNotifications';

// ── Icon mapping ─────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.NEW_APPLICANT]: {
    icon: UserPlus,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  [NOTIFICATION_TYPES.SELECTED]: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  [NOTIFICATION_TYPES.REJECTED]: {
    icon: XCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  [NOTIFICATION_TYPES.NEW_MESSAGE]: {
    icon: MessageSquare,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  [NOTIFICATION_TYPES.SCORE_UPDATED]: {
    icon: TrendingUp,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  [NOTIFICATION_TYPES.CONTACT_REQUEST_RECEIVED]: {
    icon: Mail,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  [NOTIFICATION_TYPES.CONTACT_REQUEST_APPROVED]: {
    icon: MailCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
};

const DEFAULT_CONFIG = { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50' };

// ── Helpers ──────────────────────────────────────────────────────────────

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ────────────────────────────────────────────────────────────

export default function NotificationDropdown({
  notifications = [],
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
  onClose,
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[28rem] z-50 overflow-hidden rounded-xl border border-slate-200/60 shadow-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Mark all read
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[22rem]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
            <Bell className="h-8 w-8 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/60">
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || DEFAULT_CONFIG;
              const Icon = config.icon;

              return (
                <li
                  key={notif.id}
                  role="button"
                  onClick={() => onMarkAsRead?.(notif.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50/80 ${
                    !notif.read ? 'bg-violet-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        notif.read ? 'text-slate-500' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {timeAgo(notif.timestamp)}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notif.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
