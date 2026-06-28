import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUpdateVisibilityMutation } from "../../api/settingsApi";
import { updateUser } from "../auth/authSlice";

// ---------------------------------------------------------------------------
// Toggle configuration
// ---------------------------------------------------------------------------

const VISIBILITY_TOGGLES = [
  {
    key: "showHelpScore",
    label: "Show Help Score",
    description: "Allow others to see your Help/Hire Score",
  },
  {
    key: "showWorkHistory",
    label: "Show Work History",
    description: "Allow others to see your past events",
  },
  {
    key: "showCity",
    label: "Show City",
    description: "Show your city on your public profile",
  },
];

// ---------------------------------------------------------------------------
// ToggleRow
// ---------------------------------------------------------------------------

function ToggleRow({ label, description, checked, onCheckedChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// VisibilitySettingsPage
// ---------------------------------------------------------------------------

export default function VisibilitySettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const visibilityPrefs = useSelector(
    (state) => state.auth.user?.visibilityPrefs
  );

  const [updateVisibility, { isLoading }] = useUpdateVisibilityMutation();

  const handleToggle = async (key, newValue) => {
    try {
      const updated = { ...visibilityPrefs, [key]: newValue };
      await updateVisibility(updated).unwrap();
      dispatch(updateUser({ visibilityPrefs: updated }));
    } catch {
      // Silently fail — switch stays at previous state
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-violet-600" />
          <h1 className="text-lg font-semibold text-slate-900">
            Visibility Settings
          </h1>
        </div>
      </div>

      {/* Toggle list */}
      <div className="mx-auto max-w-md px-4 pt-6">
        <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-500">
          PROFILE VISIBILITY
        </p>
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          {VISIBILITY_TOGGLES.map((toggle, idx) => (
            <div key={toggle.key}>
              {idx > 0 && <Separator className="ml-4" />}
              <ToggleRow
                label={toggle.label}
                description={toggle.description}
                checked={visibilityPrefs?.[toggle.key] ?? true}
                onCheckedChange={(value) => handleToggle(toggle.key, value)}
                disabled={isLoading}
              />
            </div>
          ))}
        </Card>

        {/* Future-ready slots */}
        <p className="mb-2 mt-8 px-1 text-xs font-semibold tracking-wide text-gray-500">
          COMING SOON
        </p>
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-4 opacity-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">
                Who Can Message Me
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Control who is allowed to send you messages
              </p>
            </div>
            <Switch disabled checked={true} />
          </div>
          <Separator className="ml-4" />
          <div className="flex items-center justify-between gap-4 px-4 py-4 opacity-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">
                Who Can See My Profile
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Restrict profile visibility to certain groups
              </p>
            </div>
            <Switch disabled checked={true} />
          </div>
        </Card>
      </div>
    </div>
  );
}
