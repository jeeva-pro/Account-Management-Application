from django.contrib import admin

from .models import Document, Transaction


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        "original_filename",
        "user",
        "document_type",
        "file_type",
        "status",
        "file_size_display",
        "created_at",
    ]
    list_filter = ["document_type", "status", "file_type", "created_at"]
    search_fields = ["original_filename", "user__email"]
    readonly_fields = ["id", "file_size", "file_type", "created_at", "updated_at"]
    ordering = ["-created_at"]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        "date",
        "description",
        "amount",
        "transaction_type",
        "category",
        "user",
        "created_at",
    ]
    list_filter = ["transaction_type", "category", "date"]
    search_fields = ["description", "reference_number", "user__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-date", "-created_at"]
