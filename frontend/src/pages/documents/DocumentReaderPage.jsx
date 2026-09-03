import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineClock,
  HiOutlineCloudArrowUp,
  HiOutlineBuildingLibrary,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentCheck,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useToast } from '../../hooks/useToast';
import documentService from '../../services/documentService';
import Button from '../../components/common/Button';

/* ------------------------------------------------------------------ */
/*  Document type options                                              */
/* ------------------------------------------------------------------ */
const documentTypes = [
  {
    value: 'bank_statement',
    label: 'Bank Statement',
    icon: HiOutlineBuildingLibrary,
  },
  {
    value: 'credit_card_statement',
    label: 'Credit Card Statement',
    icon: HiOutlineCreditCard,
  },
  {
    value: 'vendor_sales_bill',
    label: 'Vendor/Sales Bill',
    icon: HiOutlineDocumentText,
  },
  {
    value: 'check',
    label: 'Check',
    icon: HiOutlineClipboardDocumentCheck,
  },
];

const dateFormats = [
  { value: '', label: 'Select Date Format (e.g., MM/DD/YYYY)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export default function DocumentReaderPage() {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [selectedType, setSelectedType] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ---- File validation ---- */
  const validateFile = useCallback(
    (f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        showError('Unsupported file type. Please upload PDF, JPG, or PNG.');
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        showError(
          `File too large (${(f.size / (1024 * 1024)).toFixed(2)} MB). Maximum is 5 MB.`
        );
        return false;
      }
      return true;
    },
    [showError]
  );

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  /* ---- Drag & drop ---- */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  /* ---- Upload ---- */
  const handleSubmit = async () => {
    if (!selectedType) {
      showError('Please select a document type.');
      return;
    }
    if (!file) {
      showError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', selectedType);
    if (dateFormat) formData.append('date_format', dateFormat);
    if (pdfPassword) formData.append('pdf_password', pdfPassword);

    setUploading(true);
    try {
      await documentService.uploadDocument(formData);
      showSuccess('Document uploaded successfully!');
      // Reset form
      setSelectedType('');
      setDateFormat('');
      setPdfPassword('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      const message =
        error.response?.data?.file?.[0] ||
        error.response?.data?.detail ||
        'Failed to upload document. Please try again.';
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <HiOutlineDocumentText className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Upload Document
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Select a document (PDF, JPG, PNG) and its type for data extraction.
              </p>
            </div>
          </div>
          <Link
            to="/documents/history"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <HiOutlineClock className="h-4 w-4" />
            History
          </Link>
        </div>

        {/* Document Type */}
        <div className="mt-8">
          <label className="text-sm font-semibold text-slate-700">
            Document Type <span className="text-red-500">*</span>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {documentTypes.map((dt) => {
              const isSelected = selectedType === dt.value;
              return (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setSelectedType(dt.value)}
                  className={`group flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <dt.icon
                    className={`h-7 w-7 ${
                      isSelected
                        ? 'text-orange-500'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium text-center leading-tight ${
                      isSelected ? 'text-orange-700' : 'text-slate-600'
                    }`}
                  >
                    {dt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Format */}
        <div className="mt-6">
          <label
            htmlFor="date-format"
            className="text-sm font-semibold text-slate-700"
          >
            Date Format{' '}
            <span className="font-normal text-slate-400">(Optional, helps parsing)</span>
          </label>
          <select
            id="date-format"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            {dateFormats.map((df) => (
              <option key={df.value} value={df.value}>
                {df.label}
              </option>
            ))}
          </select>
        </div>

        {/* PDF Password */}
        <div className="mt-6">
          <label
            htmlFor="pdf-password"
            className="text-sm font-semibold text-slate-700"
          >
            PDF Password Optional
          </label>
          <div className="relative mt-2">
            <input
              id="pdf-password"
              type={showPassword ? 'text' : 'password'}
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter password if PDF is locked"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-700 shadow-sm transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <HiOutlineEyeSlash className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Add password only if your PDF is password protected.
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mt-6">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors sm:p-12 ${
                dragOver
                  ? 'border-orange-400 bg-orange-50/50'
                  : 'border-slate-300 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <HiOutlineCloudArrowUp
                className={`h-10 w-10 ${
                  dragOver ? 'text-orange-500' : 'text-orange-400'
                }`}
              />
              <p className="mt-3 text-sm text-slate-500">
                <span className="font-medium text-orange-500">
                  Click or drag &amp; drop
                </span>{' '}
                PDF/JPG/PNG (maximum 5 MB total)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-lg bg-orange-50 p-2">
                <HiOutlineDocumentText className="h-5 w-5 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            loading={uploading}
            disabled={!selectedType || !file}
            className="!bg-orange-500 hover:!bg-orange-600 focus:!ring-orange-400 active:!bg-orange-700"
            leftIcon={<HiOutlineCloudArrowUp className="h-4 w-4" />}
          >
            Upload Document
          </Button>
        </div>
      </div>
    </div>
  );
}
