from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^$', views.orders_root, name='orders-root'),
    re_path(r'^my-orders/?$', views.get_my_orders, name='orders-my-orders'),
    re_path(r'^cart-checkout/?$', views.cart_checkout, name='orders-cart-checkout'),
    re_path(r'^(?P<id>[^/]+)/cancel/?$', views.cancel_order, name='orders-cancel'),
    re_path(r'^(?P<id>[^/]+)/?$', views.get_order, name='orders-detail'),
]
