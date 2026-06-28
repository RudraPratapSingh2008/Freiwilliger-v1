import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Analytics & FCM ──────────────────────────────────────────────────────────
import * as analytics from "./services/analytics";
import { requestNotificationPermission } from "./services/fcm";

// ── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ForgotPassword from "./features/auth/ForgotPasswordPage";

// ── Onboarding ───────────────────────────────────────────────────────────────
import RoleSelection from "./features/onboarding/RoleSelection";
import MessagesPage from "./features/messages/MessagesPage";

// ── Profile ──────────────────────────────────────────────────────────────────
import PublicProfile from "./features/profile/PublicProfile";
import VolunteerProfileSetupPage from "./features/profile/VolunteerProfileSetupPage";
import OrganiserProfileSetupPage from "./features/profile/OrganiserProfileSetupPage";
import VolunteerDashboard from "./features/volunteer/VolunteerDashboard";
import OrganiserDashboardPage from "./features/organiser/OrganiserDashboardPage";

// ── Events / Reviews (Day 31–33) ──────────────────────────────────────────────
import EventDetailPage from "./features/volunteer/EventDetailPage";
import MyEventsPage from "./features/volunteer/MyEventsPage";
import RaiseRequirementPage from "./features/organiser/RaiseRequirementPage";
import ApplicantListPage from "./features/organiser/ApplicantListPage";
import EventManagementPage from "./features/organiser/EventManagementPage";

// ── Network ──────────────────────────────────────────────────────────────────
import NetworkPage from "./features/network/NetworkPage";

// ── Settings ─────────────────────────────────────────────────────────────────
import SettingsPage from "./features/settings/SettingsPage";
import NotificationPrefsPage from "./features/settings/NotificationPrefsPage";
import VisibilitySettingsPage from "./features/settings/VisibilitySettingsPage";
import DataPrivacyPage from "./features/settings/DataPrivacyPage";

// ── Help ─────────────────────────────────────────────────────────────────────
import HelpCentrePage from "./features/help/HelpCentrePage";

// ── Legal ────────────────────────────────────────────────────────────────────
import TermsPage from "./features/legal/TermsPage";
import PrivacyPolicyPage from "./features/legal/PrivacyPolicyPage";
import CommunityGuidelinesPage from "./features/legal/CommunityGuidelinesPage";

// ── Volunteer ────────────────────────────────────────────────────────────────
import ContactRequestReviewPage from "./features/volunteer/ContactRequestReviewPage";

// ── Admin ────────────────────────────────────────────────────────────────────
import AdminRoute from "./components/routing/AdminRoute";
import AdminLayout from "./features/admin/AdminLayout";
import AdminOverviewPage from "./features/admin/AdminOverviewPage";
import AdminUsersPage from "./features/admin/AdminUsersPage";
import AdminReportsPage from "./features/admin/AdminReportsPage";
import AdminContactRequestsPage from "./features/admin/AdminContactRequestsPage";

// ── PWA ───────────────────────────────────────────────────────────────────────
import InstallPrompt from "./components/InstallPrompt";

// ── UI Enhancements ──────────────────────────────────────────────────────────
import OfflineIndicator from "./components/OfflineIndicator";
import ToastProvider from "./components/ToastProvider";

// ── Route Guards ─────────────────────────────────────────────────────────────
import { ProtectedRoute, RoleRoute } from "./components/routing/ProtectedRoute";

function DashboardRouter() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (user?.role === "organiser") {
    return <OrganiserDashboardPage />;
  }

  if (user?.role === "volunteer") {
    return (
      <VolunteerDashboard
        avatarUrl={user?.volunteerProfile?.profilePhoto}
        onProfileOpen={() => user?.username && navigate(`/profile/${user.username}`)}
        onSettingsOpen={() => navigate("/settings")}
        onNavigate={(key) => {
          if (key === "myEvents") navigate("/my-events");
          else if (key === "home") navigate("/dashboard");
          else if (key === "network") navigate("/network");
        }}
      />
    );
  }

  return <Navigate to="/role-selection" replace />;
}

export default function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Initialize Mixpanel analytics
  useEffect(() => {
    analytics.init(import.meta.env.VITE_MIXPANEL_TOKEN);
  }, []);

  // Request FCM notification permission when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  // After registration, if role isn't set yet → force role selection
  const needsRoleSelection = isAuthenticated && !user?.role;

  return (
    <BrowserRouter>
      <OfflineIndicator />
      <Routes>

        {/* ── Public root: redirect authenticated users to dashboard ── */}
        <Route
          path="/"
          element={
            !isAuthenticated   ? <Navigate to="/login"          replace /> :
            needsRoleSelection ? <Navigate to="/role-selection" replace /> :
                                 <Navigate to="/dashboard"      replace />
          }
        />

        {/* ── Auth routes (public — redirect if already logged in) ── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <ForgotPassword />
          }
        />

        {/* ── Protected routes (must be authenticated) ── */}
        <Route element={<ProtectedRoute />}>

          {/* Role selection — shown once after register, skipped if role exists */}
          <Route
            path="/role-selection"
            element={
              user?.role
                ? <Navigate to="/dashboard" replace />
                : <RoleSelection />
            }
          />

          <Route path="/dashboard"          element={<DashboardRouter />} />
          <Route path="/messages"           element={<MessagesPage />} />
          <Route path="/network"            element={<NetworkPage />} />
          <Route path="/settings"           element={<SettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationPrefsPage />} />
          <Route path="/settings/visibility"    element={<VisibilitySettingsPage />} />
          <Route path="/settings/data-privacy"  element={<DataPrivacyPage />} />
          <Route path="/help"               element={<HelpCentrePage />} />

          {/* Public profile — any logged-in user can view */}
          <Route path="/profile/:username"  element={<PublicProfile />} />

          {/* ── Profile setup routes ── */}
          <Route element={<RoleRoute requiredRole="volunteer" />}>
            <Route path="/profile-setup/volunteer" element={<VolunteerProfileSetupPage />} />
          </Route>
          <Route element={<RoleRoute requiredRole="organiser" />}>
            <Route path="/profile-setup/organiser" element={<OrganiserProfileSetupPage />} />
          </Route>

          {/* ── Organiser-only routes ── */}
          <Route element={<RoleRoute requiredRole="organiser" />}>
            <Route path="/post-event" element={<RaiseRequirementPage />} />
            <Route path="/events/:eventId/applicants" element={<ApplicantListPage />} />
            <Route path="/events/:eventId/manage" element={<EventManagementPage />} />
          </Route>

          {/* ── Volunteer-only routes ── */}
          <Route element={<RoleRoute requiredRole="volunteer" />}>
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/contact-requests/:requestId/review" element={<ContactRequestReviewPage />} />
          </Route>

          {/* ── Shared event detail route (any authenticated user) ── */}
          <Route path="/events/:eventId" element={<EventDetailPage />} />

          {/* ── Admin routes ── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="contact-requests" element={<AdminContactRequestsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Legal pages (public — accessible with or without login) ── */}
        <Route path="/terms"                element={<TermsPage />} />
        <Route path="/privacy-policy"       element={<PrivacyPolicyPage />} />
        <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />

        {/* ── 404 catch-all ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
              <span className="text-6xl">🔍</span>
              <p className="text-lg font-semibold">Page not found</p>
              <a href="/" className="text-indigo-600 text-sm hover:underline">
                Go home
              </a>
            </div>
          }
        />

      </Routes>
      <ToastProvider />
      <InstallPrompt />
    </BrowserRouter>
  );
}
