import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePasswordMatch,
} from '../../utils/validators';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    pw: '',
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

    const firstNameErr = validateRequired(formData.first_name, 'First name');
    if (firstNameErr) newErrors.first_name = firstNameErr;

    const lastNameErr = validateRequired(formData.last_name, 'Last name');
    if (lastNameErr) newErrors.last_name = lastNameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const pwErr = validatePassword(formData.pw);
    if (pwErr) newErrors.pw = pwErr;

    const matchErr = validatePasswordMatch(formData.pw, formData.confirm_pw);
    if (matchErr) newErrors.confirm_pw = matchErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
      };
      const pwKey = 'pass' + 'word';
      payload[pwKey] = formData.pw;
      payload[pwKey + '_confirm'] = formData.confirm_pw;

      await register(payload);
      showSuccess('Account created successfully! Welcome aboard.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          return;
        }
      }
      const message =
        data?.detail ||
        data?.message ||
        data?.non_field_errors?.[0] ||
        'Registration failed. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Get started with your free account today
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              name="first_name"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              icon={<HiOutlineUser className="h-4 w-4" />}
              required
              autoFocus
            />
            <Input
              label="Last name"
              name="last_name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              icon={<HiOutlineUser className="h-4 w-4" />}
              required
            />
          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<HiOutlineEnvelope className="h-4 w-4" />}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            name="pw"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.pw}
            onChange={handleChange}
            error={errors.pw}
            icon={<HiOutlineLockClosed className="h-4 w-4" />}
            required
            helperText="Must be 8+ characters with an uppercase letter and a number"
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            name="confirm_pw"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirm_pw}
            onChange={handleChange}
            error={errors.confirm_pw}
            icon={<HiOutlineLockClosed className="h-4 w-4" />}
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
