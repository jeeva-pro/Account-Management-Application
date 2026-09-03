"""
Root URL configuration for the Account Management Application.

Routes:
    /api/auth/...           → Authentication endpoints
    /api/accounts/...       → Account / profile endpoints
    /api/health/            → Health-check endpoint
    /api/health/database/   → Database health-check endpoint
    /api/docs/              → Swagger UI
    /api/schema/            → OpenAPI 3.0 schema (JSON/YAML)
    /admin/                 → Django admin
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from accounts.urls import auth_urlpatterns, account_urlpatterns


# ---------------------------------------------------------------------------
# Health-check views (kept in urls.py — they're trivially small)
# ---------------------------------------------------------------------------
def health_check(request):
    """Return a simple OK response to confirm the service is running."""
    return JsonResponse({"status": "ok"})


def database_health_check(request):
    """Verify database connectivity without exposing internals."""
    from django.db import connection

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "database": "connected"})
    except Exception:
        return JsonResponse(
            {"status": "error", "database": "disconnected"},
            status=503,
        )


# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------
urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),
    # Authentication & account endpoints
    path("api/auth/", include(auth_urlpatterns)),
    path("api/accounts/", include(account_urlpatterns)),
    # Documents & transactions
    path("api/", include("documents.urls")),
    # Health checks
    path("api/health/", health_check, name="health-check"),
    path("api/health/database/", database_health_check, name="database-health-check"),
    # OpenAPI / Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
