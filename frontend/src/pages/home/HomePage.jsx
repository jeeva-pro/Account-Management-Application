import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlineCloudArrowUp,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import documentService from '../../services/documentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.first_name || 'there';

  const [docStats, setDocStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, docsRes] = await Promise.allSettled([
          documentService.getDocumentStats(),
          documentService.getDocuments({ limit: 5 }),
        ]);
        if (statsRes.status === 'fulfilled') setDocStats(statsRes.value.data);
        if (docsRes.status === 'fulfilled')
          setRecentDocs(docsRes.value.data?.results || docsRes.value.data || []);
      } catch {
        // silently fail — stats are optional
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const stats = [
    {
      label: 'Total Documents',
      value: docStats?.total ?? 0,
      icon: HiOutlineDocumentText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed',
      value: docStats?.completed ?? 0,
      icon: HiOutlineCheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Processing',
      value: docStats?.processing ?? 0,
      icon: HiOutlineClock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Failed',
      value: docStats?.failed ?? 0,
      icon: HiOutlineExclamationTriangle,
      color: 'bg-red-50 text-red-600',
    },
  ];

  const quickLinks = [
    {
      title: 'Upload Document',
      description: 'Upload a new document for data extraction',
      to: '/documents',
      icon: HiOutlineCloudArrowUp,
      color: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    },
    {
      title: 'View Transactions',
      description: 'Browse all extracted transactions',
      to: '/transactions',
      icon: HiOutlineBanknotes,
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    },
    {
      title: 'Reports',
      description: 'View financial reports and analytics',
      to: '/reports',
      icon: HiOutlineChartBar,
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    },
  ];

  const statusStyles = {
    uploaded: 'bg-slate-100 text-slate-600',
    processing: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's an overview of your account activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
            >
              <div
                className={`inline-flex rounded-lg p-2.5 transition-colors ${link.color}`}
              >
                <link.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-orange-600">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Documents
          </h2>
          <Link
            to="/documents/history"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View all
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <HiOutlineDocumentText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700">
              No documents yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload your first document to get started.
            </p>
            <Link
              to="/documents"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Upload now
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {recentDocs.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="rounded-lg bg-orange-50 p-1.5">
                    <HiOutlineDocumentText className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {doc.original_filename}
                    </p>
                    <p className="text-xs text-slate-400">
                      {doc.document_type_display ||
                        doc.document_type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusStyles[doc.status] || statusStyles.uploaded
                    }`}
                  >
                    {doc.status_display || doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
