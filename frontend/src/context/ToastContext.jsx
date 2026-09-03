import { createContext, useCallback } from 'react';
import toast from 'react-hot-toast';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
      iconTheme: {
        primary: '#16a34a',
        secondary: '#f0fdf4',
      },
    });
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      iconTheme: {
        primary: '#dc2626',
        secondary: '#fef2f2',
      },
    });
  }, []);

  const showInfo = useCallback((message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
      },
    });
  }, []);

  const value = { showSuccess, showError, showInfo };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
