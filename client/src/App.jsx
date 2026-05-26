import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';

// Placeholders — replace in later weeks
const HomePage = () => <div className="p-8"><h1>Home Page</h1></div>;
const DashboardPage = () => <div className="p-8"><h1>Dashboard — Week 5</h1></div>;
const SettingsPage = () => <div className="p-8"><h1>Settings — Week 9</h1></div>;
const RoleSelection = () => <div className="p-8"><h1>Role Selection — Week 3</h1></div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}