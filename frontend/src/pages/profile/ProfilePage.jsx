import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineCalendarDays,
  HiOutlineClock,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/authService';
import { getInitials, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = getInitials(user?.first_name, user?.last_name);
  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
      : 'No name set';

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

  const profileFields = [
    { label: 'Email', value: user?.email, icon: HiOutlineEnvelope },
    { label: 'Phone', value: user?.phone || 'Not set', icon: HiOutlinePhone },
    { label: 'Account Created', value: formatDate(user?.date_joined || user?.created_at), icon: HiOutlineCalendarDays },
    { label: 'Last Updated', value: formatDate(user?.updated_at || user?.last_login), icon: HiOutlineClock },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your personal information and account details
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/profile/edit">
            <Button
              variant="primary"
              leftIcon={<HiOutlinePencilSquare className="h-4 w-4" />}
            >
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Cover / Header */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />

        <div className="px-6 pb-6">
          {/* Avatar + Name */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end -mt-12">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={fullName}
                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-primary-100 text-2xl font-bold text-primary-700 shadow-md">
                {initials}
              </div>
            )}
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <field.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">{field.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="text-base font-semibold text-red-800">Danger Zone</h3>
        <p className="mt-1 text-sm text-red-600">
          Once you delete your account, there is no going back. Please be certain.
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

      {/* Delete Confirmation Dialog */}
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
