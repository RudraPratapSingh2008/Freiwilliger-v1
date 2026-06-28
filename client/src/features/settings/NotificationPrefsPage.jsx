import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useUpdateNotificationsMutation } from "../../api/settingsApi";
import { updateUser } from "../auth/authSlice";

// ---------------------------------------------------------------------------
// Notification categories configuration
// ---------------------------------------------------------------------------

const NOTIFICATION_CATEGORIES = [
  {
    key: "events",
    label: "Events",
    description: "New events near you, event updates",
  },
  {
    key: "messages",
    label: "Messages",
    description: "New messages, typing indicators",
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "New reviews received",
  },
  {
    key: "network",
    label: "Network",
    description: "Connection requests, network activity",
  },
  {
    key: "contactRequests",
    label: "Contact Requests",
    description: "New requests, approval notifications",
  },
];

// ---------------------------------------------------------------------------
// NotificationPrefsPage
// ---------------------------------------------------------------------------

export default function NotificationPrefsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const notificationPrefs = user?.notificationPrefs;

  const [prefs, setPrefs] = useState({
    events: true,
    messages: true,
    reviews: true,
    network: true,
    contactRequests: true,
  });

  const [updateNotifications, { isLoading }] = useUpdateNotificationsMutation();

  // Sync local state with Redux store
  useEffect(() => {
    if (notificationPrefs) {
      setPrefs({
        events: notificationPrefs.events ?? true,
        messages: notificationPrefs.messages ?? true,
        reviews: notificationPrefs.reviews ?? true,
        network: notificationPrefs.network ?? true,
        contactRequests: notificationPrefs.contactRequests ?? true,
      });
    }
  }, [notificationPrefs]);

  const handleToggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);

    try {
      await updateNotifications(updated).unwrap();
      dispatch(updateUser({ notificationPrefs: updated }));
    } catch {
      // Revert on failure
      setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-violet-600" />
          <h1 className="text-lg font-semibold text-slate-900">
            Notification Preferences
          </h1>
        </div>
      </div>

      {/* Toggle list */}
      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {NOTIFICATION_CATEGORIES.map((category, idx) => (
            <div key={category.key}>
              {idx > 0 && (
                <div className="mx-4 border-t border-gray-100" />
              )}
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-slate-800">
                    {category.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {category.description}
                  </p>
                </div>
                <Switch
                  checked={prefs[category.key]}
                  onCheckedChange={() => handleToggle(category.key)}
                  disabled={isLoading}
                  aria-label={`Toggle ${category.label} notifications`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Saving...
          </p>
        )}
      </div>
    </div>
  );
}
