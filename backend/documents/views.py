"""
API views for document upload, listing, and transaction management.

All documents and transactions are scoped to the authenticated user.
"""

import logging

from django.db import models as db_models
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import Document, Transaction
from .serializers import (
    DocumentDetailSerializer,
    DocumentListSerializer,
    DocumentUploadSerializer,
    TransactionListSerializer,
    TransactionSerializer,
)

logger = logging.getLogger("documents")


# ---------------------------------------------------------------------------
# Document Views
# ---------------------------------------------------------------------------


@extend_schema_view(
    list=extend_schema(
        tags=["Documents"],
        description="List all documents for the authenticated user.",
    ),
    retrieve=extend_schema(
        tags=["Documents"],
        description="Retrieve a specific document with full details.",
    ),
    destroy=extend_schema(
        tags=["Documents"],
        description="Delete a document.",
    ),
)
class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for document CRUD operations.

    - list:     GET  /api/documents/           — user's documents
    - create:   POST /api/documents/           — upload a new document
    - retrieve: GET  /api/documents/{id}/      — document detail
    - destroy:  DELETE /api/documents/{id}/     — delete a document
    """

    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        """Return only the authenticated user's documents."""
        return Document.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use different serializers for list vs detail vs create."""
        if self.action == "create":
            return DocumentUploadSerializer
        if self.action == "list":
            return DocumentListSerializer
        return DocumentDetailSerializer

    def get_parsers(self):
        """Allow multipart uploads for the create action."""
        if self.action == "create":
            return [MultiPartParser(), FormParser()]
        return super().get_parsers()

    @extend_schema(
        tags=["Documents"],
        request={
            "multipart/form-data": DocumentUploadSerializer,
        },
        responses={
            201: DocumentDetailSerializer,
            400: OpenApiResponse(description="Validation error."),
        },
    )
    def create(self, request, *args, **kwargs):
        """Upload a new document for processing."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()

        # Return full detail of the created document
        detail_serializer = DocumentDetailSerializer(
            document, context={"request": request}
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        """Delete the physical file along with the database record."""
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()

    @extend_schema(
        tags=["Documents"],
        description="Get document processing statistics for the current user.",
        responses={200: OpenApiResponse(description="Document statistics.")},
    )
    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """Return aggregate stats about the user's documents."""
        qs = self.get_queryset()
        return Response(
            {
                "total": qs.count(),
                "uploaded": qs.filter(status=Document.Status.UPLOADED).count(),
                "processing": qs.filter(status=Document.Status.PROCESSING).count(),
                "completed": qs.filter(status=Document.Status.COMPLETED).count(),
                "failed": qs.filter(status=Document.Status.FAILED).count(),
            }
        )


# ---------------------------------------------------------------------------
# Transaction Views
# ---------------------------------------------------------------------------


@extend_schema_view(
    list=extend_schema(
        tags=["Transactions"],
        description="List all transactions for the authenticated user.",
    ),
    retrieve=extend_schema(
        tags=["Transactions"],
        description="Retrieve a specific transaction.",
    ),
)
class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for transactions.

    Supports filtering by query parameters:
      - ?type=debit|credit
      - ?category=groceries
      - ?date_from=2025-01-01
      - ?date_to=2025-12-31
      - ?document=<uuid>
      - ?search=<description keyword>
    """

    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        """Return the authenticated user's transactions with optional filters."""
        qs = Transaction.objects.filter(user=self.request.user).select_related(
            "document"
        )

        # Filter by transaction type
        txn_type = self.request.query_params.get("type")
        if txn_type in ("debit", "credit"):
            qs = qs.filter(transaction_type=txn_type)

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__iexact=category)

        # Filter by date range
        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(date__lte=date_to)

        # Filter by source document
        document_id = self.request.query_params.get("document")
        if document_id:
            qs = qs.filter(document_id=document_id)

        # Search by description
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(description__icontains=search)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return TransactionListSerializer
        return TransactionSerializer

    @extend_schema(
        tags=["Transactions"],
        description="Get transaction summary statistics.",
        responses={200: OpenApiResponse(description="Transaction statistics.")},
    )
    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """Return aggregate stats about the user's transactions."""
        from django.db.models import Count, Sum

        qs = Transaction.objects.filter(user=request.user)
        totals = qs.aggregate(
            total_count=Count("id"),
            total_debit=Sum("amount", filter=db_models.Q(transaction_type="debit")),
            total_credit=Sum("amount", filter=db_models.Q(transaction_type="credit")),
        )
        categories = (
            qs.values("category")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        return Response(
            {
                "total_count": totals["total_count"],
                "total_debit": str(totals["total_debit"] or "0.00"),
                "total_credit": str(totals["total_credit"] or "0.00"),
                "top_categories": list(categories),
            }
        )
