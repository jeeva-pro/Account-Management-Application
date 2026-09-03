import { Toaster } from 'react-hot-toast';

export function Toast() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '420px',
        },
      }}
    />
  );
}
