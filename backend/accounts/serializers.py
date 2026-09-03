"""
Serializers for authentication and account management.

All input validation, password hashing, and token generation lives here
so that views stay thin.
"""

from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# ---------------------------------------------------------------------------
# Auth Serializers
# ---------------------------------------------------------------------------


class RegisterSerializer(serializers.Serializer):
    """
    Validates new-user registration data and creates the account.

    Returns JWT access + refresh tokens on success.
    """

    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value):
        """Ensure the email address is not already registered."""
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )
        return email

    def validate(self, attrs):
        """Ensure the two password fields match and meet strength rules."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        # Run Django's built-in password validators
        password_validation.validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        """Create the user and return a token pair."""
        validated_data.pop("password_confirm")
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }


class LoginSerializer(serializers.Serializer):
    """
    Authenticates a user by email + password and returns JWT tokens.
    """

    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        """Authenticate and attach the user + tokens to validated data."""
        email = attrs["email"].lower().strip()
        pw = attrs["password"]

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=pw,
        )
        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password."
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "This account has been deactivated."
            )

        refresh = RefreshToken.for_user(user)
        attrs["user"] = user
        attrs["tokens"] = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    Accepts a refresh token and blacklists it to invalidate the session.
    """

    refresh = serializers.CharField()

    def validate_refresh(self, value):
        """Store the raw token string for blacklisting in the view."""
        return value

    def save(self, **kwargs):
        """Blacklist the refresh token."""
        try:
            token = RefreshToken(self.validated_data["refresh"])
            token.blacklist()
        except Exception as exc:
            raise serializers.ValidationError(
                {"refresh": "Token is invalid or already blacklisted."}
            ) from exc


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Validates that an email exists in the system for password reset.

    In a real deployment this would trigger an email with a reset link.
    For now it validates the email and returns a UID + token pair that
    can be passed to ``ResetPasswordSerializer``.
    """

    email = serializers.EmailField(max_length=255)

    def validate_email(self, value):
        """Ensure the email belongs to an existing, active user."""
        email = value.lower().strip()
        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No active account found with this email address."
            )
        self._user = user
        return email

    def save(self, **kwargs):
        """
        Generate a password-reset token + UID.

        In production, dispatch an email containing a reset link that
        encodes these values.  Here we return them directly.
        """
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self._user.pk))
        token = default_token_generator.make_token(self._user)
        return {"uid": uid, "token": token}


class ResetPasswordSerializer(serializers.Serializer):
    """
    Validates a password-reset token and sets a new password.
    """

    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        """Decode UID, verify token, and check password match."""
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {"uid": "Invalid or expired password reset link."}
            )

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"token": "Invalid or expired password reset token."}
            )

        password_validation.validate_password(attrs["new_password"], user=user)

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        """Set the new password on the user."""
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


# ---------------------------------------------------------------------------
# Account / Profile Serializers
# ---------------------------------------------------------------------------


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating a user's profile.

    ``email``, ``id``, and ``created_at`` are read-only.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "profile_image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "is_active", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    """
    Lightweight read-only serializer for the ``/me/`` endpoint.
    """

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "profile_image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ChangePasswordSerializer(serializers.Serializer):
    """
    Validates an authenticated user's password change request.
    """

    old_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate_old_password(self, value):
        """Verify the current password is correct."""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        """Ensure new passwords match and pass strength validation."""
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "New passwords do not match."}
            )
        password_validation.validate_password(
            attrs["new_password"],
            user=self.context["request"].user,
        )
        return attrs

    def save(self, **kwargs):
        """Set the new password."""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
