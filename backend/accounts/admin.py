"""
Django admin configuration for the custom User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin view for the custom User model.

    Overrides the default ``UserAdmin`` to use *email* instead of
    *username* and to surface the custom fields (phone, profile_image,
    UUID primary key, timestamps).
    """

    # ── List view ──────────────────────────────────────────────────────
    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("is_active", "is_staff", "is_superuser", "created_at")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-created_at",)

    # ── Detail / edit view ─────────────────────────────────────────────
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Information",
            {"fields": ("first_name", "last_name", "phone", "profile_image")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Important Dates",
            {"fields": ("last_login", "created_at", "updated_at")},
        ),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")

    # ── Add user form ──────────────────────────────────────────────────
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    # Email is the unique identifier — no username field
    filter_horizontal = ("groups", "user_permissions")
