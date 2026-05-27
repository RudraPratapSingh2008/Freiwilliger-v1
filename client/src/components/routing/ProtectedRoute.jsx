import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 * -------------
 * Wraps any routes that require authentication.
 * - Reads `isAuthenticated` from Redux authSlice.
 * - If NOT authenticated → redirects to /login and saves the
 *   attempted path in location.state so LoginPage can redirect
 *   back after a successful login.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/settings/*" element={<Settings />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the page the user was trying to reach so we can
    // redirect back after login (handled in LoginPage).
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Render child routes
  return <Outlet />;
}

/**
 * RoleRoute
 * ---------
 * Wraps routes that require a specific user role.
 * - If the user is not authenticated → redirect to /login.
 * - If authenticated but wrong role → redirect to /dashboard
 *   (avoids leaking role-specific pages to the wrong role).
 *
 * @param {string} requiredRole - "volunteer" | "organiser"
 *
 * Usage in App.jsx:
 *   <Route element={<RoleRoute requiredRole="organiser" />}>
 *     <Route path="/post-event" element={<RaiseRequirement />} />
 *   </Route>
 */
export function RoleRoute({ requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== requiredRole) {
    // Wrong role — send them to the generic dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}