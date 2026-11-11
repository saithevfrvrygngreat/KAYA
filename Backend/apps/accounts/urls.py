from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^register/?$', views.register, name='auth-register'),
    re_path(r'^login/?$', views.login, name='auth-login'),
    re_path(r'^me/?$', views.get_me, name='auth-me'),
    re_path(r'^details/?$', views.user_details_or_profile, name='auth-details'),
    re_path(r'^profile/?$', views.user_details_or_profile, name='auth-profile'),
    re_path(r'^change-password/?$', views.change_password, name='auth-change-password'),
    re_path(r'^forgot-password/?$', views.forgot_password, name='auth-forgot-password'),
    re_path(r'^verify-reset-otp/?$', views.verify_reset_otp, name='auth-verify-reset-otp'),
    re_path(r'^reset-password/?$', views.reset_password, name='auth-reset-password'),
]
