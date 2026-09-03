import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineArrowPath,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import documentService from '../../services/documentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TransactionsPage() {
  const { showError } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;
      const res = await documentService.getTransactions(params);
      setTransactions(res.data?.results || res.data || []);
    } catch {
      showError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and search transactions extracted from your documents.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchTransactions}
          leftIcon={<HiOutlineArrowPath className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </form>
        <div className="flex items-center gap-2">
          <HiOutlineFunnel className="h-4 w-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <HiOutlineBanknotes className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No transactions yet
          </h3>
          <p className="mt-1 max-w-sm mx-auto text-sm text-slate-500">
            Upload a document to extract transactions automatically. Transactions
            will appear here once processing is complete.
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 font-medium max-w-[250px] truncate">
                      {txn.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {txn.category || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right whitespace-nowrap">
                      <span
                        className={
                          txn.transaction_type === 'credit'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }
                      >
                        {txn.transaction_type === 'credit' ? '+' : '-'}$
                        {parseFloat(txn.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          txn.transaction_type === 'credit'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {txn.transaction_type_display || txn.transaction_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
