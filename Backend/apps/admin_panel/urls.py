from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^$', views.get_dashboard, name='admin-root'),
    re_path(r'^dashboard/?$', views.get_dashboard, name='admin-dashboard'),
    re_path(r'^orders/(?P<id>[^/]+)/status/?$', views.update_order_status, name='admin-order-status'),
    re_path(r'^products/?$', views.store_product, name='admin-products-create'),
    re_path(r'^products/(?P<id>[^/]+)/toggle-stock/?$', views.toggle_product_stock, name='admin-product-toggle-stock'),
    re_path(r'^products/(?P<id>[^/]+)/toggle-active/?$', views.toggle_product_active, name='admin-product-toggle-active'),
    re_path(r'^products/(?P<id>[^/]+)/?$', views.destroy_product, name='admin-product-destroy'),
]
