import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

/**
 * NotificationBell — self-contained bell icon with unread badge + dropdown.
 * Drop into any header; it manages its own state via useNotifications().
 */
export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={(id) => markAsRead(id)}
          onMarkAllRead={markAllRead}
          onClearAll={clearAll}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
