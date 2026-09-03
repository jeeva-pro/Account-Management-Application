import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage';

// Profile
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';

// Settings
import SettingsPage from '../pages/settings/SettingsPage';
import ChangePasswordPage from '../pages/settings/ChangePasswordPage';

// Documents
import DocumentReaderPage from '../pages/documents/DocumentReaderPage';
import DocumentHistoryPage from '../pages/documents/DocumentHistoryPage';

// Transactions
import TransactionsPage from '../pages/transactions/TransactionsPage';
import TransactionsByCategoryPage from '../pages/transactions/TransactionsByCategoryPage';

// Reports
import ReportsPage from '../pages/reports/ReportsPage';

// Setup
import CategoriesPage from '../pages/setup/CategoriesPage';
import DocumentTypesPage from '../pages/setup/DocumentTypesPage';

// Home
import HomePage from '../pages/home/HomePage';

// 404
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Home */}
        <Route path="home" element={<HomePage />} />

        {/* Documents */}
        <Route path="documents" element={<DocumentReaderPage />} />
        <Route path="documents/history" element={<DocumentHistoryPage />} />

        {/* Transactions */}
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/by-category" element={<TransactionsByCategoryPage />} />

        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Setup */}
        <Route path="setup/categories" element={<CategoriesPage />} />
        <Route path="setup/document-types" element={<DocumentTypesPage />} />

        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
