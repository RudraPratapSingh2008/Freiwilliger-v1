import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Users, Flag, Mail } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', icon: BarChart3, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reports', icon: Flag, label: 'Reports' },
  { to: '/admin/contact-requests', icon: Mail, label: 'Contact Requests' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-6">
          <h1 className="text-lg font-bold text-violet-700">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white">
        <nav className="flex justify-around py-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                  isActive ? 'text-violet-700' : 'text-gray-500'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
