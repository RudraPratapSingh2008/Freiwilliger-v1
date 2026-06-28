import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * AdminRoute
 * ----------
 * Route guard that checks if the authenticated user has role === 'admin'.
 * - Not authenticated → redirect to /login
 * - Authenticated but not admin → redirect to /dashboard
 * - Admin → render child routes via <Outlet />
 */
export default function AdminRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
