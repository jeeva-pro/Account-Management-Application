import {
  HiOutlineTag,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';

const defaultCategories = [
  { name: 'Groceries', description: 'Supermarkets, food stores', count: 0 },
  { name: 'Utilities', description: 'Electric, gas, water, internet', count: 0 },
  { name: 'Rent / Mortgage', description: 'Housing payments', count: 0 },
  { name: 'Transportation', description: 'Fuel, public transit, parking', count: 0 },
  { name: 'Dining', description: 'Restaurants, cafés, takeout', count: 0 },
  { name: 'Healthcare', description: 'Medical, dental, pharmacy', count: 0 },
  { name: 'Entertainment', description: 'Subscriptions, movies, events', count: 0 },
  { name: 'Shopping', description: 'Clothing, electronics, general retail', count: 0 },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Transaction categories for organising your financial data.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Auto-categorisation</p>
          <p className="mt-0.5">
            Categories are automatically assigned when documents are processed.
            Custom category management will be available in a future update.
          </p>
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {defaultCategories.map((cat) => (
          <div
            key={cat.name}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <HiOutlineTag className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                {cat.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">{cat.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Transactions</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {cat.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
