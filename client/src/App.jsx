import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ForgotPassword from "./features/auth/ForgotPasswordPage";

// ── Route Guards ─────────────────────────────────────────────────────────────
import { ProtectedRoute, RoleRoute } from "./components/routing/ProtectedRoute";

// ── Placeholder pages (replace with real components as you build them) ───────
// These are lightweight stubs so the router doesn't crash before
// the real pages exist. Delete and import the real ones as you go.
function DashboardRouter() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">
      Dashboard
    </div>
  );
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
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public root: redirect authenticated users to dashboard ── */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login"    replace />
          }
        />

        {/* ── Auth routes (public — redirect to /dashboard if already logged in) ── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <ForgotPassword />
          }
        />

        {/* ── Protected routes (must be authenticated) ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"   element={<DashboardRouter />} />
          <Route path="/settings/*"  element={<SettingsPage />} />

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