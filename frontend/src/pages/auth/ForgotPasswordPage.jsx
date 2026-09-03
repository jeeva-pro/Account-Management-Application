import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineCheckCircle } from 'react-icons/hi2';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../utils/validators';
import authService from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ForgotPasswordPage() {
  const { showError } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <HiOutlineCheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-slate-800">{email}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-slate-600 mb-6">
            Didn&apos;t receive the email? Check your spam folder or try again with a
            different email address.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
          >
            Try Again
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            icon={<HiOutlineEnvelope className="h-4 w-4" />}
            required
            autoFocus
            autoComplete="email"
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Send Reset Link
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Back to Sign In
        </Link>
      </p>
    </div>
  );
}
