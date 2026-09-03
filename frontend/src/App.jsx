import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/common/Toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toast />
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
