import mimetypes
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from django.views.static import serve

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'environment': 'development' if settings.DEBUG else 'production',
        'backend': 'Django + SQLite',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    })

def api_404(request, path=''):
    return JsonResponse({
        'message': f"API endpoint '{request.method} {request.path}' not found"
    }, status=404)

def spa_fallback(request, path=''):
    dist_dir = settings.FRONTEND_DIST_DIR
    if not dist_dir.exists():
        return HttpResponse('KaYa Luxury Furniture & Spatial Architecture API is running. (Frontend dist not detected)', content_type='text/plain')

    # If asking for a file inside dist (e.g. assets/*, favicon.ico, images/*)
    target_file = dist_dir / path.lstrip('/')
    if path and target_file.is_file():
        content_type, _ = mimetypes.guess_type(str(target_file))
        content_type = content_type or 'application/octet-stream'
        with open(target_file, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)

    # Otherwise return index.html for React client-side routing
    index_file = dist_dir / 'index.html'
    if index_file.exists():
        with open(index_file, 'rb') as f:
            return HttpResponse(f.read(), content_type='text/html')

    return HttpResponse('Frontend index.html not found.', status=404)

urlpatterns = [
    # Health check
    re_path(r'^api/health/?$', health_check, name='api-health'),

    # API endpoints (matches both with and without trailing slash)
    re_path(r'^api/auth/?', include('apps.accounts.urls')),
    re_path(r'^api/products/?', include('apps.products.urls')),
    re_path(r'^api/orders/?', include('apps.orders.urls')),
    re_path(r'^api/designs/?', include('apps.designs.urls')),
    re_path(r'^api/ai/?', include('apps.ai_services.urls')),
    re_path(r'^api/admin/?', include('apps.admin_panel.urls')),

    # Any unmatched /api/* returns JSON 404
    re_path(r'^api/(?P<path>.*)$', api_404),

    # Media / uploads serving
    re_path(r'^uploads/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),

    # SPA Frontend fallback for all other routes
    re_path(r'^(?P<path>.*)$', spa_fallback),
]
