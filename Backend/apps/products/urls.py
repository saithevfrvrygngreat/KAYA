from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^$', views.get_products, name='products-list'),
    re_path(r'^all/?$', views.get_all_products, name='products-all'),
    re_path(r'^(?P<id>[^/]+)/?$', views.get_product, name='products-detail'),
]
