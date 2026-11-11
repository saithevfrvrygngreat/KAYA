import re
import random
import datetime
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import User, UserDetails
from .authentication import generate_token, format_user, format_details
from .emails import send_password_reset_otp_email

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    password_confirmation = data.get('password_confirmation') or ''

    errors = {}
    if not name:
        errors['name'] = 'Name is required.'
    if not email or not re.match(r'^\S+@\S+\.\S+$', email):
        errors['email'] = 'A valid email is required.'
    if not password:
        errors['password'] = 'Password is required.'
    else:
        if len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters long.'
        elif (not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password) or
              not re.search(r'[0-9]', password) or not re.search(r'[^A-Za-z0-9]', password)):
            errors['password'] = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'

    if password != password_confirmation:
        errors['password_confirmation'] = 'The password confirmation does not match.'

    if errors:
        return Response({'message': 'Validation failed', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    if User.objects.filter(email__iexact=email).exists():
        return Response({
            'message': 'Validation failed',
            'errors': {'email': 'This email address is already in use.'}
        }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    user = User(name=name, email=email, role='user', is_admin=False)
    user.set_password(password)
    user.save()

    details = UserDetails.objects.create(
        user=user,
        name=user.name,
        email=user.email,
        preferred_style='Contemporary Minimalist',
    )

    token = generate_token(user)

    return Response({
        'message': 'Account created successfully!',
        'token': token,
        'user': format_user(user, details),
        'details': format_details(details),
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email = (data.get('email') or '').strip()
    password = str(data.get('password') or '')

    if not email or not password:
        return Response({
            'message': 'Validation failed',
            'errors': {'email': 'Email and password are required.'}
        }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response({
            'message': 'Validation failed',
            'errors': {'email': 'The provided credentials do not match our records.'}
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({
            'message': 'Validation failed',
            'errors': {'email': 'The provided credentials do not match our records.'}
        }, status=status.HTTP_401_UNAUTHORIZED)

    is_admin = bool(user.is_admin or user.role in ['admin', 'administrator'])

    details, _ = UserDetails.objects.get_or_create(
        user=user,
        defaults={
            'name': user.name,
            'email': user.email,
            'phone': user.phone or '',
            'address': user.address or '',
            'city': user.city or '',
            'postal_code': user.postal_code or '',
            'bio': user.bio or '',
            'profile_image': user.profile_image or '',
            'preferred_style': 'Contemporary Minimalist',
        }
    )

    token = generate_token(user)

    return Response({
        'message': 'Welcome to the Admin Control Panel!' if is_admin else 'Logged in successfully!',
        'token': token,
        'user': format_user(user, details),
        'details': format_details(details),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    user = request.user
    details, _ = UserDetails.objects.get_or_create(
        user=user,
        defaults={
            'name': user.name,
            'email': user.email,
            'phone': user.phone or '',
            'address': user.address or '',
            'city': user.city or '',
            'postal_code': user.postal_code or '',
            'bio': user.bio or '',
            'profile_image': user.profile_image or '',
            'preferred_style': 'Contemporary Minimalist',
        }
    )
    return Response({
        'user': format_user(user, details),
        'details': format_details(details),
    })

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_details_or_profile(request):
    user = request.user
    details, _ = UserDetails.objects.get_or_create(
        user=user,
        defaults={
            'name': user.name,
            'email': user.email,
            'phone': user.phone or '',
            'address': user.address or '',
            'city': user.city or '',
            'postal_code': user.postal_code or '',
            'bio': user.bio or '',
            'profile_image': user.profile_image or '',
            'preferred_style': 'Contemporary Minimalist',
        }
    )

    if request.method == 'GET':
        return Response({
            'success': True,
            'details': format_details(details),
            'user': format_user(user, details),
        })

    # PUT or PATCH
    data = request.data
    if 'email' in data and data['email'].strip().lower() != user.email.lower():
        return Response({'message': 'Email address is permanent and cannot be modified.'}, status=status.HTTP_400_BAD_REQUEST)

    if 'name' in data:
        name = str(data['name']).strip()
        if not name:
            return Response({'message': 'Name cannot be empty', 'errors': {'name': 'Name is required'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        user.name = name
        details.name = name

    if 'phone' in data:
        user.phone = str(data['phone']).strip()
        details.phone = user.phone
    if 'address' in data:
        user.address = str(data['address']).strip()
        details.address = user.address
    if 'city' in data:
        user.city = str(data['city']).strip()
        details.city = user.city
    if 'state' in data:
        details.state = str(data['state']).strip()
    if 'postal_code' in data:
        user.postal_code = str(data['postal_code']).strip()
        details.postal_code = user.postal_code
    if 'country' in data:
        details.country = str(data['country']).strip()
    if 'bio' in data:
        user.bio = str(data['bio']).strip()
        details.bio = user.bio
    if 'profile_image' in data:
        user.profile_image = str(data['profile_image'])
        details.profile_image = user.profile_image
    if 'avatar' in data:
        details.avatar = str(data['avatar'])
    if 'preferred_style' in data:
        details.preferred_style = str(data['preferred_style']).strip()
    if 'design_firm' in data:
        details.design_firm = str(data['design_firm']).strip()

    user.save()
    details.save()

    return Response({
        'message': 'Profile details updated successfully!',
        'user': format_user(user, details),
        'details': format_details(details),
    })

@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not current_password:
        return Response({'message': 'Current password is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if not new_password:
        return Response({'message': 'New password is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if len(new_password) < 8:
        return Response({'message': 'New password must be at least 8 characters long.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if new_password != confirm_password:
        return Response({'message': 'New password and confirm password do not match.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if current_password.strip() == new_password.strip():
        return Response({'message': 'New password cannot be the same as your current password.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    if not user.check_password(current_password):
        return Response({'message': 'Current password does not match your records.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({
        'success': True,
        'message': 'Password updated successfully!',
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email or not re.match(r'^\S+@\S+\.\S+$', email):
        return Response({'message': 'A valid email address is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response({'message': 'No registered account found with this email address.'}, status=status.HTTP_404_NOT_FOUND)

    otp = str(random.randint(100000, 999999))
    user.reset_password_otp = otp
    user.reset_password_expires = timezone.now() + datetime.timedelta(minutes=10)
    user.save()

    send_password_reset_otp_email(user.email, otp)

    resp = {
        'success': True,
        'message': f'A 6-digit verification code has been dispatched to {user.email}.',
        'expires_in_minutes': 10,
    }
    return Response(resp)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    email = (request.data.get('email') or '').strip().lower()
    otp = (request.data.get('otp') or '').strip()

    if not email or not otp:
        return Response({'message': 'Email and 6-digit verification code are required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response({'message': 'No registered account found with this email address.'}, status=status.HTTP_404_NOT_FOUND)

    if not user.reset_password_otp or not user.reset_password_expires:
        return Response({'message': 'No active password reset request found. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > user.reset_password_expires:
        return Response({'message': 'The verification code has expired. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.reset_password_otp.strip() != otp:
        return Response({'message': 'Invalid verification code. Please check and try again.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'success': True,
        'message': 'Verification code verified successfully. You may now enter your new password.',
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = (request.data.get('email') or '').strip().lower()
    otp = (request.data.get('otp') or '').strip()
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not email or not otp:
        return Response({'message': 'Email and verification code are required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if not new_password:
        return Response({'message': 'New password is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if len(new_password) < 8:
        return Response({'message': 'New password must be at least 8 characters long.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if new_password != confirm_password:
        return Response({'message': 'New password and confirm password do not match.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not user.reset_password_otp or not user.reset_password_expires:
        return Response({'message': 'No active password reset request found. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > user.reset_password_expires:
        return Response({'message': 'The verification code has expired. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.reset_password_otp.strip() != otp:
        return Response({'message': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.reset_password_otp = None
    user.reset_password_expires = None
    user.save()

    return Response({
        'success': True,
        'message': 'Your password has been successfully updated! You can now log in with your new credentials.',
    })
