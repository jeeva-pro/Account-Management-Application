import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCamera, HiOutlineXMark } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/authService';
import { validateRequired, validatePhone } from '../../utils/validators';
import { getInitials } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || null);

  const initials = getInitials(user?.first_name, user?.last_name);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    const fnErr = validateRequired(formData.first_name, 'First name');
    if (fnErr) newErrors.first_name = fnErr;
    const lnErr = validateRequired(formData.last_name, 'Last name');
    if (lnErr) newErrors.last_name = lnErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('first_name', formData.first_name.trim());
        payload.append('last_name', formData.last_name.trim());
        payload.append('phone', formData.phone.trim());
        payload.append('profile_image', imageFile);
      } else {
        payload = {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
        };
      }

      const updated = await authService.updateProfile(payload);
      updateUser(updated);
      showSuccess('Profile updated successfully!');
      navigate('/profile');
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
      showError(data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your personal information and profile picture
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-200">
          {/* Profile Image Section */}
          <div className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Profile Photo</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100 text-xl font-bold text-primary-700 shadow-sm">
                    {initials}
                  </div>
                )}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 transition-colors"
                    aria-label="Remove photo"
                  >
                    <HiOutlineXMark className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<HiOutlineCamera className="h-4 w-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <p className="mt-1.5 text-xs text-slate-500">
                  JPEG, PNG, WebP or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="space-y-5 p-6">
            <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                label="Last name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

            <Input
              label="Email address"
              name="email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
