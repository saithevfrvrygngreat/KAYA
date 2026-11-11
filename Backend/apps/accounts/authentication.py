import jwt
import datetime
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User, UserDetails

def generate_token(user):
    payload = {
        'id': user.id,
        'mongo_id': user.mongo_id or str(user.id),
        'email': user.email,
        'is_admin': user.is_admin,
        'role': 'admin' if user.is_admin else user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

def format_user(user, details=None):
    if details is None:
        try:
            details = getattr(user, 'details', None)
        except Exception:
            details = None

    is_admin = bool(user.is_admin or user.role in ['admin', 'administrator'])
    user_id = user.mongo_id if user.mongo_id else str(user.id)
    details_id = str(details.id) if details else None

    return {
        'id': user_id,
        '_id': user_id,
        'name': user.name,
        'email': user.email,
        'is_admin': is_admin,
        'role': 'admin' if is_admin else user.role,
        'profile_image': (details.profile_image if details else user.profile_image) or '',
        'avatar': (details.avatar if details and details.avatar else (details.profile_image if details else user.profile_image)) or '',
        'phone': (details.phone if details else user.phone) or '',
        'address': (details.address if details else user.address) or '',
        'city': (details.city if details else user.city) or '',
        'state': (details.state if details else '') or '',
        'postal_code': (details.postal_code if details else user.postal_code) or '',
        'country': (details.country if details else 'India') or 'India',
        'bio': (details.bio if details else user.bio) or '',
        'preferred_style': (details.preferred_style if details else 'Contemporary Minimalist') or 'Contemporary Minimalist',
        'design_firm': (details.design_firm if details else '') or '',
        'details_id': details_id,
        'createdAt': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
        'updatedAt': details.updated_at.isoformat() if details and hasattr(details, 'updated_at') and details.updated_at else (user.updated_at.isoformat() if hasattr(user, 'updated_at') and user.updated_at else None),
    }

def format_details(details):
    if not details:
        return {}
    return {
        'id': str(details.id),
        '_id': str(details.id),
        'user': details.user.mongo_id if details.user.mongo_id else str(details.user.id),
        'name': details.name or '',
        'email': details.email or '',
        'phone': details.phone or '',
        'address': details.address or '',
        'city': details.city or '',
        'state': details.state or '',
        'postal_code': details.postal_code or '',
        'country': details.country or 'India',
        'bio': details.bio or '',
        'profile_image': details.profile_image or '',
        'avatar': details.avatar or '',
        'preferred_style': details.preferred_style or 'Contemporary Minimalist',
        'design_firm': details.design_firm or '',
        'shipping_notes': details.shipping_notes or '',
        'createdAt': details.created_at.isoformat() if hasattr(details, 'created_at') and details.created_at else None,
        'updatedAt': details.updated_at.isoformat() if hasattr(details, 'updated_at') and details.updated_at else None,
    }

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1].strip()
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('id')
            mongo_id = payload.get('mongo_id')
            user = None
            if user_id:
                try:
                    user = User.objects.filter(id=user_id).first()
                except (ValueError, TypeError):
                    pass
            if not user and mongo_id:
                user = User.objects.filter(mongo_id=mongo_id).first()
            if not user:
                email = payload.get('email')
                if email:
                    user = User.objects.filter(email__iexact=email).first()

            if not user:
                raise exceptions.AuthenticationFailed('User no longer exists.')
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User account is disabled.')

            return (user, token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired.')
        except jwt.PyJWTError:
            raise exceptions.AuthenticationFailed('Invalid token.')

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1].strip()
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
                user_id = payload.get('id')
                mongo_id = payload.get('mongo_id')
                user = None
                if user_id:
                    try:
                        user = User.objects.filter(id=user_id).first()
                    except (ValueError, TypeError):
                        pass
                if not user and mongo_id:
                    user = User.objects.filter(mongo_id=mongo_id).first()
                if not user:
                    email = payload.get('email')
                    if email:
                        user = User.objects.filter(email__iexact=email).first()
                if user and user.is_active:
                    request.user = user
            except Exception:
                pass
        return self.get_response(request)
