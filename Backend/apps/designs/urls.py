from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^$', views.save_design, name='designs-save'),
    re_path(r'^my-designs/?$', views.get_my_designs, name='designs-my-designs'),
    re_path(r'^room-image/?$', views.upload_room_image, name='designs-room-image'),
    re_path(r'^(?P<id>[^/]+)/?$', views.get_design, name='designs-detail'),
]
