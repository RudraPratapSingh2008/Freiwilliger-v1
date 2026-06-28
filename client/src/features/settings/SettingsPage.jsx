import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  Bell,
  Shield,
  HelpCircle,
  AlertTriangle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { logout } from "../../features/auth/authSlice";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

// ---------------------------------------------------------------------------
// Section data
// ---------------------------------------------------------------------------

const SETTINGS_SECTIONS = [
  {
    label: "ACCOUNT",
    items: [
      { id: "change-password", icon: Lock, label: "Change Password", path: "/settings/password" },
    ],
  },
  {
    label: "PRIVACY",
    items: [
      { id: "visibility", icon: Eye, label: "Visibility Settings", path: "/settings/visibility" },
      { id: "data-privacy", icon: Shield, label: "Data & Privacy", path: "/settings/data-privacy" },
    ],
  },
  {
    label: "NOTIFICATIONS",
    items: [
      { id: "notifications", icon: Bell, label: "Notification Preferences", path: "/settings/notifications" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { id: "help", icon: HelpCircle, label: "Help Centre", path: "/help" },
      { id: "report", icon: AlertTriangle, label: "Report a Problem", path: "/help?tab=report" },
    ],
  },
  {
    label: "LEGAL",
    items: [
      { id: "terms", icon: FileText, label: "Terms & Conditions", path: "/terms" },
      { id: "privacy-policy", icon: FileText, label: "Privacy Policy", path: "/privacy-policy" },
      { id: "community-guidelines", icon: FileText, label: "Community Guidelines", path: "/community-guidelines" },
    ],
  },
];

// ---------------------------------------------------------------------------
// SettingsItem
// ---------------------------------------------------------------------------

function SettingsItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
      <span className="flex-1 text-sm font-medium text-slate-800">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const avatarUrl =
    user?.profilePhotoUrl ||
    user?.volunteerProfile?.profilePhoto ||
    user?.organiserProfile?.logo;

  const displayName = user?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const profileSetupPath =
    user?.role === "organiser"
      ? "/profile-setup/organiser"
      : "/profile-setup/volunteer";

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-lg bg-violet-100 text-violet-700">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <p className="text-base font-semibold text-slate-900">{displayName}</p>
            <button
              type="button"
              onClick={() => navigate(profileSetupPath)}
              className="mt-1 text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-md space-y-6 px-4 pt-6">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-500">
              {section.label}
            </p>
            <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
              {section.items.map((item, idx) => (
                <div key={item.id}>
                  {idx > 0 && <Separator className="ml-12" />}
                  <SettingsItem
                    icon={item.icon}
                    label={item.label}
                    onClick={() => handleItemClick(item.path)}
                  />
                </div>
              ))}
            </Card>
          </div>
        ))}

        {/* Language */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-500">
            LANGUAGE
          </p>
          <Card className="overflow-hidden rounded-xl border-0 shadow-sm p-4">
            <LanguageSwitcher />
          </Card>
        </div>

        {/* Appearance */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-500">
            APPEARANCE
          </p>
          <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
            <ThemeToggle />
          </Card>
        </div>

        {/* Sign Out */}
        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? You'll need to log in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
