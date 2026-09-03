import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineTag,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import documentService from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TransactionsByCategoryPage() {
  const { showError } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await documentService.getTransactions();
        setTransactions(res.data?.results || res.data || []);
      } catch {
        showError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group by category
  const grouped = transactions.reduce((acc, txn) => {
    const cat = txn.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = { items: [], total: 0 };
    acc[cat].items.push(txn);
    acc[cat].total += parseFloat(txn.amount);
    return acc;
  }, {});

  const categories = Object.entries(grouped).sort(
    ([, a], [, b]) => b.total - a.total
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Transactions by Category
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your transactions grouped by category.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <HiOutlineTag className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No transactions yet
          </h3>
          <p className="mt-1 max-w-sm mx-auto text-sm text-slate-500">
            Upload a document to extract transactions automatically. They'll be
            grouped by category here once processed.
          </p>
          <Link to="/documents" className="mt-4 inline-block">
            <Button
              size="sm"
              className="!bg-orange-500 hover:!bg-orange-600 focus:!ring-orange-400"
              leftIcon={<HiOutlineDocumentText className="h-4 w-4" />}
            >
              Upload Document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(([category, data]) => (
            <div
              key={category}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <HiOutlineTag className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    {category}
                  </h3>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {data.items.length}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  $
                  {data.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {/* Transaction items */}
              <div className="divide-y divide-slate-100">
                {data.items.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {txn.description}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(txn.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`ml-4 text-sm font-semibold whitespace-nowrap ${
                        txn.transaction_type === 'credit'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {txn.transaction_type === 'credit' ? '+' : '-'}$
                      {parseFloat(txn.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
