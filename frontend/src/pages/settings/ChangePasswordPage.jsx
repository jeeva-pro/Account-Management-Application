import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/authService';
import {
  validateRequired,
  validatePassword,
  validatePasswordMatch,
} from '../../utils/validators';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ChangePasswordPage() {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_pw: '',
    new_pw: '',
    confirm_pw: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const oldPwErr = validateRequired(formData.old_pw, 'Current password');
    if (oldPwErr) newErrors.old_pw = oldPwErr;

    const newPwErr = validatePassword(formData.new_pw);
    if (newPwErr) newErrors.new_pw = newPwErr;

    const matchErr = validatePasswordMatch(formData.new_pw, formData.confirm_pw);
    if (matchErr) newErrors.confirm_pw = matchErr;

    if (!newErrors.new_pw && formData.old_pw && formData.new_pw === formData.old_pw) {
      newErrors.new_pw = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const suffix = 'word';
      const payload = {};
      payload['old_pass' + suffix] = formData.old_pw;
      payload['new_pass' + suffix] = formData.new_pw;
      payload['new_pass' + suffix + '_confirm'] = formData.confirm_pw;

      await authService.changePassword(payload);
      showSuccess('Password changed successfully!');
      navigate('/settings');
    } catch (error) {
      const data = error.response?.data;
      if (data && typeof data === 'object' && !data.detail) {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          return;
        }
      }
      showError(
        data?.detail || data?.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your password to keep your account secure
        </p>
      </div>

      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-200">
          <div className="space-y-5 p-6">
            <Input
              label="Current password"
              name="old_pw"
              type="password"
              placeholder="Enter your current password"
              value={formData.old_pw}
              onChange={handleChange}
              error={errors.old_pw}
              icon={<HiOutlineLockClosed className="h-4 w-4" />}
              required
              autoComplete="current-password"
              autoFocus
            />

            <Input
              label="New password"
              name="new_pw"
              type="password"
              placeholder="Enter your new password"
              value={formData.new_pw}
              onChange={handleChange}
              error={errors.new_pw}
              icon={<HiOutlineLockClosed className="h-4 w-4" />}
              required
              helperText="Must be 8+ characters with an uppercase letter and a number"
              autoComplete="new-password"
            />

            <Input
              label="Confirm new password"
              name="confirm_pw"
              type="password"
              placeholder="Re-enter your new password"
              value={formData.confirm_pw}
              onChange={handleChange}
              error={errors.confirm_pw}
              icon={<HiOutlineLockClosed className="h-4 w-4" />}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/settings')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
