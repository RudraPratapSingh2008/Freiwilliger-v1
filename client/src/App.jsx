import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Placeholder pages
const HomePage = () => <div className="p-8"><h1>Home Page</h1></div>
const LoginPage = () => <div className="p-8"><h1>Login</h1></div>
const RegisterPage = () => <div className="p-8"><h1>Register</h1></div>
const DashboardPage = () => <div className="p-8"><h1>Dashboard</h1></div>
const SettingsPage = () => <div className="p-8"><h1>Settings</h1></div>

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
