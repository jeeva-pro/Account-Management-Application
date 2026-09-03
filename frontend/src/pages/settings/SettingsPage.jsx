import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineLockClosed,
  HiOutlineTrash,
  HiOutlineChevronRight,
  HiOutlineEnvelope,
  HiOutlineUserCircle,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/authService';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      showSuccess('Your account has been deleted.');
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.detail || 'Failed to delete account. Please try again.';
      showError(message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const settingsLinks = [
    {
      title: 'Change Password',
      description: 'Update your password to keep your account secure',
      to: '/change-password',
      icon: HiOutlineLockClosed,
      iconColor: 'bg-primary-50 text-primary-600',
    },
    {
      title: 'Edit Profile',
      description: 'Update your name, phone, and profile picture',
      to: '/profile/edit',
      icon: HiOutlineUserCircle,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Account Information</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <HiOutlineEnvelope className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">Email:</span>
            <span className="font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <HiOutlineUserCircle className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">Name:</span>
            <span className="font-medium text-slate-900">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <HiOutlineCalendarDays className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">Member since:</span>
            <span className="font-medium text-slate-900">
              {formatDate(user?.date_joined || user?.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Links */}
      <div className="space-y-3">
        {settingsLinks.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className={`rounded-lg p-2.5 ${item.iconColor}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                {item.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
            </div>
            <HiOutlineChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" />
          </Link>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="text-base font-semibold text-red-800">Danger Zone</h3>
        <p className="mt-1 text-sm text-red-600">
          Permanently delete your account and all of your data. This action is
          irreversible.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          leftIcon={<HiOutlineTrash className="h-4 w-4" />}
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Account
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete Account"
        loading={deleting}
      />
    </div>
  );
}
