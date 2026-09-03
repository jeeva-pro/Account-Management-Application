"""
Custom throttle classes for the Account Management Application.

Each throttle maps to a named scope defined in
``REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]`` inside *settings.py*.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle anonymous login attempts to 5 requests per minute.

    Protects against brute-force credential stuffing.
    """

    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    """
    Throttle anonymous registration attempts to 3 requests per minute.

    Prevents automated mass account creation.
    """

    scope = "register"


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Throttle password-reset requests to 3 per minute.

    Limits abuse of the forgot-password flow (e.g. email bombing).
    """

    scope = "password_reset"


class ChangePasswordRateThrottle(UserRateThrottle):
    """
    Throttle authenticated password-change requests to 5 per minute.

    Prevents rapid-fire password change attempts.
    """

    scope = "change_password"
