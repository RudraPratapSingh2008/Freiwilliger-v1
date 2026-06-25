import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
import OrganiserDashboard from "./features/organiser/OrganiserDashboard";

// ── Route Guards ─────────────────────────────────────────────────────────────
import { ProtectedRoute, RoleRoute } from "./components/routing/ProtectedRoute";

// ── Placeholder pages (replace with real components as you build them) ───────
// These are lightweight stubs so the router doesn't crash before
// the real pages exist. Delete and import the real ones as you go.
// TODO: Replace DashboardRouter/SettingsPage stubs with real components when available.
function DashboardRouter() {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "organiser") {
    return <OrganiserDashboard />;
  }

  if (user?.role === "volunteer") {
    return <VolunteerDashboard />;
  }

  return <Navigate to="/role-selection" replace />;
}

function SettingsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">
      Settings
    </div>
  );
}

// ── Optional role-specific stubs (uncomment when built) ─────────────────────
// import RaiseRequirement from "./features/organiser/RaiseRequirement";

export default function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // After registration, if role isn't set yet → force role selection
  const needsRoleSelection = isAuthenticated && !user?.role;

  return (
    <BrowserRouter>
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
          <Route path="/settings/*"         element={<SettingsPage />} />

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
          {/* Uncomment when RaiseRequirement is built (Day 23):
          <Route element={<RoleRoute requiredRole="organiser" />}>
            <Route path="/post-event" element={<RaiseRequirement />} />
          </Route>
          */}

          {/* ── Volunteer-only routes ── */}
          {/* Uncomment when VolunteerDashboard is built (Day 11):
          <Route element={<RoleRoute requiredRole="volunteer" />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
          */}
        </Route>

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
    </BrowserRouter>
  );
}