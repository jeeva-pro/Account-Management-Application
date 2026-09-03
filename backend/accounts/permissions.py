"""
Custom permission classes for the Account Management Application.
"""

from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission that grants access only to the object's owner.

    Expects the object to *be* the authenticated user (e.g. a User instance
    from ``request.user``) or to have an ``owner``, ``user``, or ``email``
    attribute that can be compared to the requesting user.

    Usage::

        permission_classes = [IsAuthenticated, IsOwner]
    """

    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        """
        Return ``True`` if *request.user* is the owner of *obj*.

        Ownership is determined by identity comparison first, then by
        checking common foreign-key attribute names.
        """
        # Direct identity — the object IS the user
        if obj == request.user:
            return True

        # FK named 'owner'
        if hasattr(obj, "owner") and obj.owner == request.user:
            return True

        # FK named 'user'
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        # Matching email field
        if hasattr(obj, "email") and obj.email == request.user.email:
            return True

        return False
