import { Link } from 'react-router-dom';
import {
  HiOutlineBars3,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user } = useAuth();

  const initials = getInitials(user?.first_name, user?.last_name);
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email || 'User';

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <HiOutlineXMark className="h-5 w-5" />
            ) : (
              <HiOutlineBars3 className="h-5 w-5" />
            )}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="hidden text-lg font-bold text-slate-900 sm:block">
              AccountMgr
            </span>
          </Link>
        </div>

        {/* Right section — User info (no dropdown) */}
        <div className="flex items-center gap-3">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 ring-2 ring-white">
              {initials}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{displayName}</p>
            <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
