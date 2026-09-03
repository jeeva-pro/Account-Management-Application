import {
  HiOutlineDocumentChartBar,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';

const reports = [
  {
    title: 'Monthly Summary',
    description:
      'View monthly income and expenses with trends over time. Get a clear picture of your financial flow.',
    icon: HiOutlineCalendarDays,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Category Breakdown',
    description:
      'Analyse spending by category with pie charts and detailed breakdowns. Identify where your money goes.',
    icon: HiOutlineTag,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Document Processing',
    description:
      'Track document upload and processing statistics. Monitor extraction accuracy and processing times.',
    icon: HiOutlineDocumentText,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Income vs Expenses',
    description:
      'Compare income and expenses side by side with interactive charts and filters.',
    icon: HiOutlineArrowTrendingUp,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Vendor Analysis',
    description:
      'Review payments by vendor or payee. Identify your top merchants and recurring expenses.',
    icon: HiOutlineChartBar,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Annual Overview',
    description:
      'Year-at-a-glance financial summary with key metrics, trends, and yearly comparisons.',
    icon: HiOutlineDocumentChartBar,
    color: 'bg-rose-50 text-rose-600',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Financial reports and analytics for your accounts.
        </p>
      </div>

      {/* Reports grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div
            key={report.title}
            className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            {/* Coming Soon badge */}
            <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Coming Soon
            </span>

            <div className={`inline-flex rounded-xl p-2.5 ${report.color}`}>
              <report.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              {report.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {report.description}
            </p>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">💡 Tip:</span> Reports will be
          automatically generated as you upload and process more documents. The
          more data available, the richer your reports will be.
        </p>
      </div>
    </div>
  );
}
