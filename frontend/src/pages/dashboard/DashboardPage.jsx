import { Link } from 'react-router-dom';
import {
  HiOutlineUserCircle,
  HiOutlineLockClosed,
  HiOutlineCog6Tooth,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, calculateProfileCompletion } from '../../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();

  const profileCompletion = calculateProfileCompletion(user);
  const greeting = getGreeting();
  const firstName = user?.first_name || 'there';

  const stats = [
    {
      label: 'Profile Completion',
      value: `${profileCompletion}%`,
      icon: HiOutlineChartBar,
      color: profileCompletion === 100 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Account Created',
      value: formatDate(user?.date_joined || user?.created_at),
      icon: HiOutlineCalendarDays,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'Last Updated',
      value: formatDate(user?.updated_at || user?.last_login),
      icon: HiOutlineClock,
      color: 'text-slate-600 bg-slate-100',
    },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information and profile picture',
      to: '/profile/edit',
      icon: HiOutlineUserCircle,
      color: 'bg-primary-50 text-primary-600 group-hover:bg-primary-100',
    },
    {
      title: 'Change Password',
      description: 'Keep your account secure with a new password',
      to: '/change-password',
      icon: HiOutlineLockClosed,
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    },
    {
      title: 'Settings',
      description: 'Manage your account preferences and security',
      to: '/settings',
      icon: HiOutlineCog6Tooth,
      color: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-2 text-primary-100 max-w-lg">
          Welcome to your account dashboard. Here you can manage your profile,
          update your settings, and keep your account secure.
        </p>
        {profileCompletion < 100 && (
          <Link
            to="/profile/edit"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            Complete your profile ({profileCompletion}%)
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
            >
              <div className={`inline-flex rounded-lg p-2.5 transition-colors ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
