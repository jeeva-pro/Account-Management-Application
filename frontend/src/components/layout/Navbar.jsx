import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

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

        {/* Right section — User Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-100">
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
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
              <div className="border-b border-slate-100 px-4 py-2.5 sm:hidden">
                <p className="text-sm font-medium text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm ${
                      active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <HiOutlineUserCircle className="h-4 w-4" />
                    Your Profile
                  </Link>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/settings"
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm ${
                      active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <HiOutlineCog6Tooth className="h-4 w-4" />
                    Settings
                  </Link>
                )}
              </Menu.Item>

              <div className="border-t border-slate-100 my-1" />

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm ${
                      active ? 'bg-red-50 text-red-700' : 'text-red-600'
                    }`}
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                    {loggingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}
