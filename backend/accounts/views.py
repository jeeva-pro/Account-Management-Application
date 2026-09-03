"""
API views for authentication and account management.

All business logic is delegated to serializers; views handle HTTP
semantics, permissions, throttling, and response formatting.
"""

import logging

from django.conf import settings
from rest_framework import generics, status
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView, exception_handler
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import User
from .permissions import IsOwner
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from .throttles import (
    ChangePasswordRateThrottle,
    LoginRateThrottle,
    PasswordResetRateThrottle,
    RegisterRateThrottle,
)

logger = logging.getLogger("accounts")


# ---------------------------------------------------------------------------
# Custom Exception Handler
# ---------------------------------------------------------------------------


def custom_exception_handler(exc, context):
    """
    Wrap DRF's default exception handler to sanitise production errors.

    * In DEBUG mode, pass through all details for developer convenience.
    * In production, suppress database errors, stack traces, and any
      unhandled 500-level exceptions so that sensitive internals are
      never leaked to the client.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Attach a consistent ``status_code`` field to every error payload
        response.data["status_code"] = response.status_code
        return response

    # Unhandled exception — log it, then return a safe 500 response
    logger.exception(
        "Unhandled exception in %s",
        context.get("view", "unknown view"),
    )

    if settings.DEBUG:
        # Let Django's default handler surface the traceback in dev
        return None

    return Response(
        {
            "detail": "An unexpected error occurred. Please try again later.",
            "status_code": 500,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


# ---------------------------------------------------------------------------
# Auth Views
# ---------------------------------------------------------------------------


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Create a new user account and return JWT tokens.
    """

    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=["Auth"],
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="User registered successfully."),
            400: OpenApiResponse(description="Validation error."),
            429: OpenApiResponse(description="Rate limit exceeded."),
        },
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        user = result["user"]
        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "tokens": result["tokens"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/auth/login/

    Authenticate with email + password and receive JWT tokens.
    """

    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    serializer_class = LoginSerializer

    @extend_schema(
        tags=["Auth"],
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="Login successful."),
            400: OpenApiResponse(description="Invalid credentials."),
            429: OpenApiResponse(description="Rate limit exceeded."),
        },
    )
    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = serializer.validated_data["tokens"]
        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "tokens": tokens,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Blacklist the provided refresh token to log the user out.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    @extend_schema(
        tags=["Auth"],
        request=LogoutSerializer,
        responses={
            200: OpenApiResponse(description="Logout successful."),
            400: OpenApiResponse(description="Invalid or expired token."),
        },
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Logout successful."},
            status=status.HTTP_200_OK,
        )


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/auth/refresh/

    Exchange a valid refresh token for a new access + refresh pair.
    Uses SimpleJWT's built-in view with rotation + blacklisting.
    """

    @extend_schema(tags=["Auth"])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/

    Initiate a password reset flow. In production this would dispatch
    an email; here it returns the UID + token for testing purposes.
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]
    serializer_class = ForgotPasswordSerializer

    @extend_schema(
        tags=["Auth"],
        request=ForgotPasswordSerializer,
        responses={
            200: OpenApiResponse(
                description="Password reset initiated (token returned for dev/testing)."
            ),
            400: OpenApiResponse(description="Validation error."),
            429: OpenApiResponse(description="Rate limit exceeded."),
        },
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = serializer.save()
        return Response(
            {
                "message": "Password reset link has been sent to your email.",
                "uid": reset_data["uid"],
                "token": reset_data["token"],
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/

    Complete the password reset by validating the token and setting
    a new password.
    """

    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    @extend_schema(
        tags=["Auth"],
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password has been reset."),
            400: OpenApiResponse(description="Validation error."),
        },
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Account / Profile Views
# ---------------------------------------------------------------------------


class ProfileView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE /api/accounts/profile/

    Retrieve, update, or deactivate the authenticated user's profile.
    DELETE soft-deactivates the account (sets ``is_active=False``).
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_object(self):
        """Return the currently authenticated user."""
        obj = self.request.user
        self.check_object_permissions(self.request, obj)
        return obj

    @extend_schema(tags=["Accounts"])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=["Accounts"])
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(tags=["Accounts"])
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(tags=["Accounts"])
    def delete(self, request, *args, **kwargs):
        """Soft-delete: deactivate the account instead of removing it."""
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(
            {"message": "Account deactivated successfully."},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    GET /api/accounts/me/

    Return the currently authenticated user's information.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        tags=["Accounts"],
        responses={200: UserSerializer},
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/accounts/change-password/

    Allow an authenticated user to change their password by providing
    the current (old) password and a new password.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ChangePasswordRateThrottle]
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        tags=["Accounts"],
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password changed successfully."),
            400: OpenApiResponse(description="Validation error."),
            429: OpenApiResponse(description="Rate limit exceeded."),
        },
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )
