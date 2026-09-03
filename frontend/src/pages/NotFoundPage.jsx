import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi2';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or doesn&apos;t exist.
        </p>
        <div className="mt-8">
          <Link to="/dashboard">
            <Button leftIcon={<HiOutlineHome className="h-4 w-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
