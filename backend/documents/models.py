"""
Models for document upload, processing, and transaction extraction.

Documents hold uploaded files (PDF/JPG/PNG) with metadata.
Transactions represent individual financial entries extracted from documents.
"""

import uuid

from django.conf import settings
from django.db import models


class Document(models.Model):
    """
    Represents an uploaded document (bank statement, credit card
    statement, vendor/sales bill, or check) submitted for data extraction.
    """

    class DocumentType(models.TextChoices):
        BANK_STATEMENT = "bank_statement", "Bank Statement"
        CREDIT_CARD_STATEMENT = "credit_card_statement", "Credit Card Statement"
        VENDOR_SALES_BILL = "vendor_sales_bill", "Vendor/Sales Bill"
        CHECK = "check", "Check"

    class DateFormat(models.TextChoices):
        MM_DD_YYYY = "MM/DD/YYYY", "MM/DD/YYYY"
        DD_MM_YYYY = "DD/MM/YYYY", "DD/MM/YYYY"
        YYYY_MM_DD = "YYYY-MM-DD", "YYYY-MM-DD"
        DD_MM_YYYY_DASH = "DD-MM-YYYY", "DD-MM-YYYY"
        MM_DD_YYYY_DASH = "MM-DD-YYYY", "MM-DD-YYYY"
        YYYY_MM_DD_SLASH = "YYYY/MM/DD", "YYYY/MM/DD"

    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    class FileType(models.TextChoices):
        PDF = "pdf", "PDF"
        JPG = "jpg", "JPG"
        PNG = "png", "PNG"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the document.",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
        help_text="The user who uploaded this document.",
    )
    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        help_text="The type of financial document.",
    )
    date_format = models.CharField(
        max_length=20,
        choices=DateFormat.choices,
        blank=True,
        default="",
        help_text="Optional date format hint for the parser.",
    )
    pdf_password = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Optional password for encrypted PDF files.",
    )
    original_filename = models.CharField(
        max_length=500,
        help_text="Original name of the uploaded file.",
    )
    file = models.FileField(
        upload_to="documents/",
        help_text="The uploaded document file.",
    )
    file_size = models.PositiveIntegerField(
        help_text="File size in bytes.",
    )
    file_type = models.CharField(
        max_length=10,
        choices=FileType.choices,
        help_text="File extension/type.",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
        help_text="Current processing status.",
    )
    extracted_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Parsed/OCR data extracted from the document.",
    )
    error_message = models.TextField(
        blank=True,
        default="",
        help_text="Error details if processing failed.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the document was uploaded.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the document was last updated.",
    )

    class Meta:
        verbose_name = "document"
        verbose_name_plural = "documents"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"], name="idx_doc_user"),
            models.Index(fields=["status"], name="idx_doc_status"),
            models.Index(fields=["document_type"], name="idx_doc_type"),
            models.Index(fields=["created_at"], name="idx_doc_created"),
        ]

    def __str__(self):
        return f"{self.original_filename} ({self.get_document_type_display()})"

    @property
    def file_size_display(self):
        """Return a human-readable file size."""
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} KB"
        return f"{self.file_size / (1024 * 1024):.2f} MB"


class Transaction(models.Model):
    """
    Represents a single financial transaction, typically extracted
    from an uploaded document.
    """

    class TransactionType(models.TextChoices):
        DEBIT = "debit", "Debit"
        CREDIT = "credit", "Credit"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the transaction.",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
        help_text="The user who owns this transaction.",
    )
    document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
        help_text="The source document this transaction was extracted from.",
    )
    date = models.DateField(
        help_text="Transaction date.",
    )
    description = models.CharField(
        max_length=500,
        help_text="Transaction description or memo.",
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Transaction category (e.g., groceries, utilities).",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Transaction amount.",
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TransactionType.choices,
        help_text="Whether this is a debit or credit.",
    )
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Check number or reference ID.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the record was created.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the record was last updated.",
    )

    class Meta:
        verbose_name = "transaction"
        verbose_name_plural = "transactions"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user"], name="idx_txn_user"),
            models.Index(fields=["date"], name="idx_txn_date"),
            models.Index(fields=["transaction_type"], name="idx_txn_type"),
            models.Index(fields=["category"], name="idx_txn_category"),
        ]

    def __str__(self):
        return f"{self.date} — {self.description} ({self.amount})"
