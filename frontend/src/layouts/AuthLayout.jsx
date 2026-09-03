import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header */}
      <div className="px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-xl font-bold text-slate-900">AccountMgr</span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} AccountMgr. All rights reserved.
      </div>
    </div>
  );
}
