import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineLockClosed,
} from 'react-icons/hi2';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: HiOutlineHome },
  { name: 'Profile', to: '/profile', icon: HiOutlineUserCircle },
  { name: 'Change Password', to: '/change-password', icon: HiOutlineLockClosed },
  { name: 'Settings', to: '/settings', icon: HiOutlineCog6Tooth },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-20 mt-16 w-64 transform border-r border-slate-200
          bg-white transition-transform duration-200 ease-in-out lg:static lg:mt-0
          lg:translate-x-0 lg:transition-none
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive
                          ? 'text-primary-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} AccountMgr</p>
          </div>
        </div>
      </aside>
    </>
  );
}
