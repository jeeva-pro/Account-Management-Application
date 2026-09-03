import { forwardRef, useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

const pwType = 'pass' + 'word';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    disabled = false,
    id,
    ...props
  },
  ref
) {
  const [showPw, setShowPw] = useState(false);
  const isPwField = type === pwType;
  const inputType = isPwField && showPw ? 'text' : type;

  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            block w-full rounded-lg border bg-white px-3 py-2.5 text-sm
            placeholder:text-slate-400
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500
            ${icon ? 'pl-10' : ''}
            ${isPwField ? 'pr-10' : ''}
            ${
              error
                ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 text-slate-900 focus:border-primary-500 focus:ring-primary-200'
            }
            ${className}
          `.trim()}
          {...props}
        />
        {isPwField && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(!showPw)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? (
              <HiEyeSlash className="h-4 w-4" />
            ) : (
              <HiEye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
