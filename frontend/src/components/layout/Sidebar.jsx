import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlineWrenchScrewdriver,
  HiOutlineDocumentChartBar,
  HiOutlineHome,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronRight,
  HiOutlineRectangleStack,
  HiOutlineTag,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  Navigation Config                                                  */
/* ------------------------------------------------------------------ */

const mainMenu = [
  {
    name: 'Dashboard',
    to: '/dashboard',
    icon: HiOutlineSquares2X2,
  },
  {
    name: 'Document Reader',
    to: '/documents',
    icon: HiOutlineDocumentText,
  },
  {
    name: 'Transactions',
    icon: HiOutlineBanknotes,
    children: [
      { name: 'All Transactions', to: '/transactions' },
      { name: 'By Category', to: '/transactions/by-category' },
    ],
  },
  {
    name: 'Setup',
    icon: HiOutlineWrenchScrewdriver,
    children: [
      { name: 'Categories', to: '/setup/categories' },
      { name: 'Document Types', to: '/setup/document-types' },
    ],
  },
  {
    name: 'Reports',
    to: '/reports',
    icon: HiOutlineDocumentChartBar,
  },
];

const bottomMenu = [
  { name: 'Home Page', to: '/home', icon: HiOutlineHome },
  { name: 'Profile Settings', to: '/settings', icon: HiOutlineCog6Tooth },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState({});

  const toggleExpand = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  /** Check whether any child route is currently active */
  const isGroupActive = (children) =>
    children?.some((child) => location.pathname.startsWith(child.to));

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
          {/* ---- Main Menu ---- */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>

            {mainMenu.map((item) =>
              item.children ? (
                <SubMenu
                  key={item.name}
                  item={item}
                  expanded={expanded[item.name] || isGroupActive(item.children)}
                  onToggle={() => toggleExpand(item.name)}
                  onClose={onClose}
                  location={location}
                />
              ) : (
                <SidebarLink
                  key={item.name}
                  item={item}
                  onClose={onClose}
                />
              )
            )}
          </nav>

          {/* ---- Divider + Bottom ---- */}
          <div className="border-t border-slate-200">
            <nav className="space-y-1 px-3 py-3">
              {bottomMenu.map((item) => (
                <SidebarLink key={item.name} item={item} onClose={onClose} />
              ))}

              {/* Log Out */}
              <button
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0 text-red-400 group-hover:text-red-500" />
                Log Out
              </button>
            </nav>

            <div className="border-t border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                &copy; {new Date().getFullYear()} AccountMgr
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Link                                                        */
/* ------------------------------------------------------------------ */

function SidebarLink({ item, onClose }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-orange-50 text-orange-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`h-5 w-5 shrink-0 ${
              isActive
                ? 'text-orange-500'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          {item.name}
        </>
      )}
    </NavLink>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible Sub-Menu                                               */
/* ------------------------------------------------------------------ */

function SubMenu({ item, expanded, onToggle, onClose, location }) {
  const isActive = item.children?.some((child) =>
    location.pathname.startsWith(child.to)
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-orange-50 text-orange-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <item.icon
          className={`h-5 w-5 shrink-0 ${
            isActive
              ? 'text-orange-500'
              : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
        <span className="flex-1 text-left">{item.name}</span>
        <HiOutlineChevronRight
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Children */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-8 mt-1 space-y-1 border-l border-slate-200 pl-3">
          {item.children.map((child) => {
            const childActive = location.pathname === child.to;
            return (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onClose}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  childActive
                    ? 'font-medium text-orange-600 bg-orange-50/60'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {child.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
