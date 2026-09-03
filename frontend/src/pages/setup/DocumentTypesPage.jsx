import {
  HiOutlineBuildingLibrary,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const documentTypes = [
  {
    title: 'Bank Statement',
    icon: HiOutlineBuildingLibrary,
    color: 'bg-blue-50 text-blue-600',
    description: 'Monthly or periodic bank account statements.',
    features: [
      'Transaction extraction',
      'Balance detection',
      'Date range identification',
      'Account number parsing',
    ],
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    title: 'Credit Card Statement',
    icon: HiOutlineCreditCard,
    color: 'bg-purple-50 text-purple-600',
    description: 'Credit card billing statements and summaries.',
    features: [
      'Transaction extraction',
      'Minimum payment detection',
      'Due date identification',
      'Merchant categorisation',
    ],
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    title: 'Vendor/Sales Bill',
    icon: HiOutlineDocumentText,
    color: 'bg-emerald-50 text-emerald-600',
    description: 'Invoices, purchase orders, and vendor bills.',
    features: [
      'Line item extraction',
      'Tax calculation',
      'Vendor details parsing',
      'Total amount detection',
    ],
    formats: ['PDF', 'JPG', 'PNG'],
  },
  {
    title: 'Check',
    icon: HiOutlineClipboardDocumentCheck,
    color: 'bg-orange-50 text-orange-600',
    description: 'Personal or business cheques and bank drafts.',
    features: [
      'Amount recognition',
      'Payee extraction',
      'Date detection',
      'Check number parsing',
    ],
    formats: ['PDF', 'JPG', 'PNG'],
  },
];

export default function DocumentTypesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Types</h1>
        <p className="mt-1 text-sm text-slate-500">
          Supported document types and their extraction capabilities.
        </p>
      </div>

      {/* Document type cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {documentTypes.map((dt) => (
          <div
            key={dt.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${dt.color}`}>
                <dt.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{dt.title}</h3>
                <p className="text-xs text-slate-400">{dt.description}</p>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Extraction Features
              </p>
              <ul className="space-y-1.5">
                {dt.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-slate-600">
                    <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Supported formats */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Formats:</span>
              {dt.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
