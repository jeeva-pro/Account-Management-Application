"""
URL configuration for the documents app.

Provides REST endpoints for document and transaction management.
Imported by config/urls.py::

    path("api/", include("documents.urls"))
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"documents", views.DocumentViewSet, basename="document")
router.register(r"transactions", views.TransactionViewSet, basename="transaction")

urlpatterns = [
    path("", include(router.urls)),
]
