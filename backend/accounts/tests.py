"""
Comprehensive test suite for the Account Management Application.

Covers registration, login, JWT lifecycle, token refresh, logout,
profile CRUD, password change, forgot/reset password, authorisation
checks, and rate-limiting.
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import User

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TEST_PW = "Str0ng!Pass99"
WEAK_PW = "123"

# Disable throttling globally for tests so rate-limit tests can
# opt in explicitly.
NO_THROTTLE = {
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
}


def create_user(
    email="testuser@example.com",
    pw=None,
    first_name="Test",
    last_name="User",
    **kwargs,
):
    """Shortcut to create and return a ``User`` instance."""
    if pw is None:
        pw = TEST_PW
    return User.objects.create_user(
        email=email,
        password=pw,
        first_name=first_name,
        last_name=last_name,
        **kwargs,
    )


def get_tokens_for_user(client, email="testuser@example.com", pw=None):
    """Log in via the API and return the tokens dict."""
    if pw is None:
        pw = TEST_PW
    response = client.post(
        reverse("auth-login"),
        {"email": email, "password": pw},
        format="json",
    )
    return response.data.get("tokens", {})


# ---------------------------------------------------------------------------
# Registration Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class RegistrationTests(TestCase):
    """Tests for POST /api/auth/register/."""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("auth-register")

    def test_register_success(self):
        """A valid payload creates a user and returns tokens."""
        data = {
            "email": "newuser@example.com",
            "password": TEST_PW,
            "password_confirm": TEST_PW,
            "first_name": "New",
            "last_name": "User",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

    def test_register_duplicate_email(self):
        """Registration fails if the email is already taken."""
        create_user(email="taken@example.com")
        data = {
            "email": "taken@example.com",
            "password": TEST_PW,
            "password_confirm": TEST_PW,
            "first_name": "Dup",
            "last_name": "User",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        """Registration fails with a password that doesn't meet strength rules."""
        data = {
            "email": "weakpw@example.com",
            "password": WEAK_PW,
            "password_confirm": WEAK_PW,
            "first_name": "Weak",
            "last_name": "Pass",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        """Registration fails when passwords do not match."""
        data = {
            "email": "mismatch@example.com",
            "password": TEST_PW,
            "password_confirm": "DifferentPass!99",
            "first_name": "Mis",
            "last_name": "Match",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        """Registration fails when required fields are missing."""
        data = {"email": "incomplete@example.com"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Login Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class LoginTests(TestCase):
    """Tests for POST /api/auth/login/."""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("auth-login")
        self.user = create_user()

    def test_login_success(self):
        """A valid email + password returns tokens."""
        data = {"email": self.user.email, "password": TEST_PW}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])

    def test_login_wrong_password(self):
        """Login fails with an incorrect password."""
        data = {"email": self.user.email, "password": "WrongPass!99"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        """Login fails for a non-existent email."""
        data = {"email": "ghost@example.com", "password": TEST_PW}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_user(self):
        """Login fails for a deactivated account."""
        self.user.is_active = False
        self.user.save()
        data = {"email": self.user.email, "password": TEST_PW}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# JWT / Protected Endpoint Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class JWTAuthTests(TestCase):
    """Tests for JWT-protected endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.tokens = get_tokens_for_user(self.client)

    def test_access_protected_endpoint_with_token(self):
        """A valid access token grants access to /api/accounts/me/."""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        response = self.client.get(reverse("account-me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_access_protected_endpoint_without_token(self):
        """Requests without a token are rejected."""
        response = self.client.get(reverse("account-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_with_invalid_token(self):
        """A fabricated token is rejected."""
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalidtoken123")
        response = self.client.get(reverse("account-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Token Refresh Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class TokenRefreshTests(TestCase):
    """Tests for POST /api/auth/refresh/."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.tokens = get_tokens_for_user(self.client)

    def test_refresh_success(self):
        """A valid refresh token returns a new access token."""
        response = self.client.post(
            reverse("auth-refresh"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_with_blacklisted_token(self):
        """A blacklisted (used) refresh token cannot be reused."""
        # Use the refresh token once (rotation blacklists it)
        self.client.post(
            reverse("auth-refresh"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        # Second use should fail
        response = self.client.post(
            reverse("auth-refresh"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Logout Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class LogoutTests(TestCase):
    """Tests for POST /api/auth/logout/."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.tokens = get_tokens_for_user(self.client)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    def test_logout_blacklists_refresh(self):
        """Logging out blacklists the refresh token."""
        response = self.client.post(
            reverse("auth-logout"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # The refresh token should no longer work
        refresh_response = self.client.post(
            reverse("auth-refresh"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        self.assertEqual(
            refresh_response.status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_logout_requires_auth(self):
        """Unauthenticated logout attempts are rejected."""
        client = APIClient()  # no credentials
        response = client.post(
            reverse("auth-logout"),
            {"refresh": self.tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Profile Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class ProfileTests(TestCase):
    """Tests for /api/accounts/profile/ (GET, PUT, PATCH, DELETE)."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.tokens = get_tokens_for_user(self.client)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.url = reverse("account-profile")

    def test_get_profile(self):
        """GET returns the authenticated user's profile."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["first_name"], self.user.first_name)

    def test_update_profile_put(self):
        """PUT updates the full profile (excluding read-only fields)."""
        data = {
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+1234567890",
        }
        response = self.client.put(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.phone, "+1234567890")

    def test_partial_update_profile_patch(self):
        """PATCH partially updates the profile."""
        response = self.client.patch(
            self.url,
            {"last_name": "Patched"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, "Patched")

    def test_delete_profile_deactivates(self):
        """DELETE soft-deactivates the account."""
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_profile_requires_auth(self):
        """Unauthenticated requests to the profile endpoint are rejected."""
        client = APIClient()
        response = client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Change Password Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class ChangePasswordTests(TestCase):
    """Tests for POST /api/accounts/change-password/."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.tokens = get_tokens_for_user(self.client)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.url = reverse("account-change-password")

    def test_change_password_success(self):
        """A valid old + new password combination succeeds."""
        data = {
            "old_password": TEST_PW,
            "new_password": "NewStrong!123",
            "confirm_password": "NewStrong!123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrong!123"))

    def test_change_password_wrong_old(self):
        """Supplying the wrong current password fails."""
        data = {
            "old_password": "WrongOld!99",
            "new_password": "NewStrong!123",
            "confirm_password": "NewStrong!123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch(self):
        """New password and confirmation must match."""
        data = {
            "old_password": TEST_PW,
            "new_password": "NewStrong!123",
            "confirm_password": "Different!123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_requires_auth(self):
        """Unauthenticated requests are rejected."""
        client = APIClient()
        data = {
            "old_password": TEST_PW,
            "new_password": "NewStrong!123",
            "confirm_password": "NewStrong!123",
        }
        response = client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Forgot / Reset Password Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class ForgotResetPasswordTests(TestCase):
    """Tests for the forgot-password + reset-password flow."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()

    def test_forgot_password_success(self):
        """A valid email returns uid + token."""
        response = self.client.post(
            reverse("auth-forgot-password"),
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("uid", response.data)
        self.assertIn("token", response.data)

    def test_forgot_password_invalid_email(self):
        """A non-existent email returns a validation error."""
        response = self.client.post(
            reverse("auth-forgot-password"),
            {"email": "nobody@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_success(self):
        """A valid uid + token + matching passwords resets the password."""
        # Obtain the reset token
        forgot_resp = self.client.post(
            reverse("auth-forgot-password"),
            {"email": self.user.email},
            format="json",
        )
        uid = forgot_resp.data["uid"]
        token = forgot_resp.data["token"]

        # Reset the password
        new_pw = "BrandNew!456"
        response = self.client.post(
            reverse("auth-reset-password"),
            {
                "uid": uid,
                "token": token,
                "new_password": new_pw,
                "confirm_password": new_pw,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_pw))

    def test_reset_password_invalid_token(self):
        """An invalid token is rejected."""
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(
            reverse("auth-reset-password"),
            {
                "uid": uid,
                "token": "invalid-token",
                "new_password": "BrandNew!456",
                "confirm_password": "BrandNew!456",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Unauthorized Access Tests
# ---------------------------------------------------------------------------


@override_settings(REST_FRAMEWORK={**NO_THROTTLE})
class UnauthorizedAccessTests(TestCase):
    """Ensure all protected endpoints reject unauthenticated requests."""

    def setUp(self):
        self.client = APIClient()

    def test_me_unauthorized(self):
        response = self.client.get(reverse("account-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_unauthorized(self):
        response = self.client.get(reverse("account-profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_unauthorized(self):
        response = self.client.post(reverse("account-change-password"), {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_unauthorized(self):
        response = self.client.post(reverse("auth-logout"), {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# Rate-Limiting Tests
# ---------------------------------------------------------------------------


class RateLimitTests(TestCase):
    """
    Verify that throttle classes are correctly applied.

    These tests use the production throttle settings to confirm that
    repeated requests are eventually rejected with HTTP 429.
    """

    def setUp(self):
        self.client = APIClient()

    @override_settings(
        REST_FRAMEWORK={
            "DEFAULT_THROTTLE_CLASSES": [
                "rest_framework.throttling.ScopedRateThrottle",
            ],
            "DEFAULT_THROTTLE_RATES": {
                "login": "2/minute",
                "register": "1/minute",
                "password_reset": "1/minute",
            },
        }
    )
    def test_login_rate_limit(self):
        """Login endpoint enforces its rate limit."""
        url = reverse("auth-login")
        data = {"email": "a@b.com", "password": "x"}
        # First two should NOT be 429
        for _ in range(2):
            self.client.post(url, data, format="json")
        # Third should be throttled
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @override_settings(
        REST_FRAMEWORK={
            "DEFAULT_THROTTLE_CLASSES": [
                "rest_framework.throttling.ScopedRateThrottle",
            ],
            "DEFAULT_THROTTLE_RATES": {
                "login": "2/minute",
                "register": "1/minute",
                "password_reset": "1/minute",
            },
        }
    )
    def test_register_rate_limit(self):
        """Register endpoint enforces its rate limit."""
        url = reverse("auth-register")
        data = {
            "email": "rl@example.com",
            "password": TEST_PW,
            "password_confirm": TEST_PW,
            "first_name": "RL",
            "last_name": "Test",
        }
        self.client.post(url, data, format="json")  # first request
        data["email"] = "rl2@example.com"
        response = self.client.post(url, data, format="json")  # should be throttled
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


# ---------------------------------------------------------------------------
# Model Tests
# ---------------------------------------------------------------------------


class UserModelTests(TestCase):
    """Tests for the custom User model and UserManager."""

    def test_create_user(self):
        """create_user produces a non-staff, non-superuser account."""
        user = create_user()
        self.assertEqual(user.email, "testuser@example.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password(TEST_PW))

    def test_create_user_no_email(self):
        """create_user raises ValueError without an email."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password=TEST_PW)

    def test_create_superuser(self):
        """create_superuser sets staff + superuser flags."""
        su = User.objects.create_superuser(
            email="admin@example.com",
            password=TEST_PW,
            first_name="Admin",
            last_name="User",
        )
        self.assertTrue(su.is_staff)
        self.assertTrue(su.is_superuser)

    def test_create_superuser_not_staff_raises(self):
        """create_superuser rejects is_staff=False."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="bad@example.com",
                password=TEST_PW,
                first_name="Bad",
                last_name="Admin",
                is_staff=False,
            )

    def test_create_superuser_not_superuser_raises(self):
        """create_superuser rejects is_superuser=False."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="bad2@example.com",
                password=TEST_PW,
                first_name="Bad",
                last_name="Admin",
                is_superuser=False,
            )

    def test_full_name_property(self):
        """The full_name property concatenates first + last name."""
        user = create_user(first_name="Jane", last_name="Doe")
        self.assertEqual(user.full_name, "Jane Doe")

    def test_string_representation(self):
        """__str__ returns the email address."""
        user = create_user()
        self.assertEqual(str(user), user.email)

    def test_email_normalisation(self):
        """Email domain is lowered by UserManager."""
        user = create_user(email="TEST@EXAMPLE.COM")
        self.assertEqual(user.email, "TEST@example.com")


# ---------------------------------------------------------------------------
# Health Check Tests
# ---------------------------------------------------------------------------


class HealthCheckTests(TestCase):
    """Tests for /api/health/ and /api/health/database/."""

    def setUp(self):
        self.client = APIClient()

    def test_health_ok(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ok")

    def test_database_health_ok(self):
        response = self.client.get(reverse("database-health-check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["database"], "connected")
