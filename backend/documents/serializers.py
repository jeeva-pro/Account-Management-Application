"""
Serializers for document upload, listing, and transaction management.
"""

import os

from rest_framework import serializers

from .models import Document, Transaction


# Maximum upload size: 5 MB
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}


class DocumentUploadSerializer(serializers.ModelSerializer):
    """
    Handles document upload with file validation.

    Validates:
      - File size <= 5 MB
      - File type is PDF, JPG, or PNG
      - document_type is required
    """

    file = serializers.FileField(required=True)

    class Meta:
        model = Document
        fields = [
            "document_type",
            "date_format",
            "pdf_password",
            "file",
        ]

    def validate_file(self, value):
        """Validate file size and extension."""
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File size exceeds the 5 MB limit. "
                f"Uploaded file is {value.size / (1024 * 1024):.2f} MB."
            )

        ext = os.path.splitext(value.name)[1].lower().lstrip(".")
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Unsupported file type '.{ext}'. "
                f"Allowed types: PDF, JPG, PNG."
            )

        return value

    def create(self, validated_data):
        """Create a Document with computed fields from the uploaded file."""
        uploaded_file = validated_data["file"]
        ext = os.path.splitext(uploaded_file.name)[1].lower().lstrip(".")
        # Normalise jpeg → jpg
        if ext == "jpeg":
            ext = "jpg"

        validated_data["original_filename"] = uploaded_file.name
        validated_data["file_size"] = uploaded_file.size
        validated_data["file_type"] = ext
        validated_data["user"] = self.context["request"].user

        return super().create(validated_data)


class DocumentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for document list views.
    """

    document_type_display = serializers.CharField(
        source="get_document_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    file_size_display = serializers.CharField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "original_filename",
            "document_type",
            "document_type_display",
            "file_type",
            "file_size",
            "file_size_display",
            "status",
            "status_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class DocumentDetailSerializer(serializers.ModelSerializer):
    """
    Full detail serializer including extracted data.
    """

    document_type_display = serializers.CharField(
        source="get_document_type_display", read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    file_size_display = serializers.CharField(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "original_filename",
            "document_type",
            "document_type_display",
            "date_format",
            "file_type",
            "file_size",
            "file_size_display",
            "file_url",
            "status",
            "status_display",
            "extracted_data",
            "error_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        """Return the absolute URL for the uploaded file."""
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class TransactionSerializer(serializers.ModelSerializer):
    """
    Full transaction serializer for detail views.
    """

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display", read_only=True
    )
    document_filename = serializers.CharField(
        source="document.original_filename", read_only=True, default=None
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "date",
            "description",
            "category",
            "amount",
            "transaction_type",
            "transaction_type_display",
            "reference_number",
            "document",
            "document_filename",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class TransactionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for transaction list views.
    """

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display", read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "date",
            "description",
            "category",
            "amount",
            "transaction_type",
            "transaction_type_display",
            "reference_number",
            "created_at",
        ]
        read_only_fields = fields
