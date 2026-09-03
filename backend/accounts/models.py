"""
Custom User model for the Account Management Application.

Uses email as the unique identifier instead of a username.
All primary keys are UUIDs for security and portability.
"""

import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom manager for the User model.

    Provides helper methods for creating regular users and superusers
    with email as the unique identifier.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a regular user with the given email and password.

        Args:
            email: The user's email address (required, will be normalised).
            password: The raw password (will be hashed before storage).
            **extra_fields: Additional model fields.

        Returns:
            User: The newly created user instance.

        Raises:
            ValueError: If no email address is provided.
        """
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.

        Superusers always have ``is_staff``, ``is_superuser``, and
        ``is_active`` set to ``True``.

        Args:
            email: The superuser's email address.
            password: The raw password.
            **extra_fields: Additional model fields.

        Returns:
            User: The newly created superuser instance.

        Raises:
            ValueError: If is_staff or is_superuser is not True.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email as the unique identifier.

    Extends Django's ``AbstractBaseUser`` and ``PermissionsMixin`` to
    provide a full-featured user model with admin-compliant permissions.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the user.",
    )
    email = models.EmailField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Primary email address used for authentication.",
    )
    first_name = models.CharField(
        max_length=150,
        help_text="User's first name.",
    )
    last_name = models.CharField(
        max_length=150,
        help_text="User's last name.",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="Optional phone number.",
    )
    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True,
        help_text="Optional profile image.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user account is active.",
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can access the admin site.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the account was created.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the account was last updated.",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"], name="idx_user_email"),
            models.Index(fields=["created_at"], name="idx_user_created"),
            models.Index(fields=["is_active"], name="idx_user_active"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["email"],
                name="unique_user_email",
            ),
        ]

    def __str__(self):
        """Return a human-readable representation of the user."""
        return self.email

    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
