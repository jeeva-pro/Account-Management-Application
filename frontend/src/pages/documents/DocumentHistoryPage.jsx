import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { useToast } from '../../hooks/useToast';
import documentService from '../../services/documentService';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ------------------------------------------------------------------ */
/*  Status badge styles                                                */
/* ------------------------------------------------------------------ */
const statusStyles = {
  uploaded: 'bg-slate-100 text-slate-600',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

const typeLabels = {
  bank_statement: 'Bank Statement',
  credit_card_statement: 'Credit Card',
  vendor_sales_bill: 'Vendor/Sales Bill',
  check: 'Check',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentHistoryPage() {
  const { showSuccess, showError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentService.getDocuments();
      setDocuments(res.data?.results || res.data || []);
    } catch {
      showError('Failed to load document history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showSuccess('Document deleted.');
    } catch {
      showError('Failed to delete document.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/documents"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <HiOutlineArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document History</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                View and manage your previously uploaded documents.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDocuments}
            leftIcon={<HiOutlineArrowPath className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Link to="/documents">
            <Button
              size="sm"
              className="!bg-orange-500 hover:!bg-orange-600 focus:!ring-orange-400"
            >
              Upload New
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <HiOutlineClock className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No documents yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload your first document to get started with data extraction.
          </p>
          <Link to="/documents" className="mt-4 inline-block">
            <Button
              size="sm"
              className="!bg-orange-500 hover:!bg-orange-600 focus:!ring-orange-400"
            >
              Upload Document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Uploaded
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-50 p-1.5">
                          <HiOutlineDocumentText className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 max-w-[200px]">
                            {doc.original_filename}
                          </p>
                          <p className="text-xs uppercase text-slate-400">
                            {doc.file_type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {typeLabels[doc.document_type] || doc.document_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          statusStyles[doc.status] || statusStyles.uploaded
                        }`}
                      >
                        {doc.status_display || doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {doc.file_size_display || formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(doc)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete document?"
        message={`This will permanently delete "${deleteTarget?.original_filename}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
