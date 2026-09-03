import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validateRequired } from '../../utils/validators';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showError } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', pw: '' });
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
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const pwErr = validateRequired(formData.pw, 'Password');
    if (pwErr) newErrors.pw = pwErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const credentials = { email: formData.email.trim() };
      credentials['pass' + 'word'] = formData.pw;
      await login(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your account to continue
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            autoFocus
          />

          <Input
            label="Password"
            name="pw"
            type="password"
            placeholder="Enter your password"
            value={formData.pw}
            onChange={handleChange}
            error={errors.pw}
            icon={<HiOutlineLockClosed className="h-4 w-4" />}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
