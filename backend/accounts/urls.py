"""
URL configuration for the accounts app.

Provides two pattern lists imported by config/urls.py::

    path("api/auth/",     include("accounts.urls.auth_urlpatterns"))
    path("api/accounts/", include("accounts.urls.account_urlpatterns"))
"""

from django.urls import path

from . import views

# ---------------------------------------------------------------------------
# /api/auth/...
# ---------------------------------------------------------------------------
auth_urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("refresh/", views.RefreshTokenView.as_view(), name="auth-refresh"),
    path(
        "forgot-password/",
        views.ForgotPasswordView.as_view(),
        name="auth-forgot-password",
    ),
    path(
        "reset-password/",
        views.ResetPasswordView.as_view(),
        name="auth-reset-password",
    ),
]

# ---------------------------------------------------------------------------
# /api/accounts/...
# ---------------------------------------------------------------------------
account_urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="account-profile"),
    path("me/", views.MeView.as_view(), name="account-me"),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="account-change-password",
    ),
]
