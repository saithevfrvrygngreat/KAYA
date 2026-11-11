from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^generate-art/?$', views.generate_art_spec, name='ai-generate-art'),
    re_path(r'^analyze-room/?$', views.analyze_room, name='ai-analyze-room'),
]
