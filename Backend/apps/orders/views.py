import json
import random
import re
from datetime import datetime
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.designs.models import CustomDesign
from .models import Order

def generate_order_number():
    now = datetime.now()
    date_str = now.strftime('%Y%m%d')
    random_str = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=6))
    return f"ORD-{date_str}-{random_str}"

def _do_get_my_orders(request):
    try:
        if not (request.user and request.user.is_authenticated):
            return Response({'message': 'Not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)
        orders = Order.objects.filter(user=request.user).select_related('custom_design__product').order_by('-created_at')
        return Response({'data': [o.to_dict() for o in orders]})
    except Exception as e:
        return Response({'message': 'Failed to fetch orders.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def _do_create_order(request):
    try:
        data = request.data
        custom_design_id = data.get('custom_design_id')
        shipping_address = data.get('shipping_address')
        customer_name = data.get('customer_name')
        customer_phone = data.get('customer_phone')
        customer_email = data.get('customer_email')
        payment_id = data.get('payment_id')

        errors = {}
        if not custom_design_id:
            errors['custom_design_id'] = 'Design ID is required.'
        if not shipping_address:
            errors['shipping_address'] = 'Shipping address is required.'
        if not customer_name:
            errors['customer_name'] = 'Customer name is required.'
        if not customer_phone:
            errors['customer_phone'] = 'Phone number is required.'
        if not customer_email or not re.match(r'^\S+@\S+\.\S+$', customer_email):
            errors['customer_email'] = 'Valid email is required.'
        if not payment_id:
            errors['payment_id'] = 'Payment ID is required.'

        if errors:
            return Response({'message': 'Validation failed', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        design = None
        if str(custom_design_id).isdigit():
            design = CustomDesign.objects.filter(id=int(custom_design_id)).select_related('product').first()
        if not design:
            design = CustomDesign.objects.filter(mongo_id=str(custom_design_id)).select_related('product').first()

        if not design:
            return Response({'message': 'Design not found.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        if not design.product:
            return Response({'message': 'Design product not found.', 'errors': {'custom_design_id': 'Selected design has no product linked.'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        total_price = round(float(design.product.base_price) * 1.18, 2)
        user = request.user if request.user and request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            custom_design=design,
            order_number=generate_order_number(),
            total_price=total_price,
            status='placed',
            shipping_address=shipping_address,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            cart_items=None,
            payment_id=payment_id,
            payment_status='paid',
            placed_at=timezone.now(),
        )

        o_id = order.mongo_id if order.mongo_id else str(order.id)

        return Response({
            'status': 'placed',
            'order_id': o_id,
            'order_number': order.order_number,
            'data': order.to_dict(),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': 'Failed to create order.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    return _do_get_my_orders(request)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_order(request, id):
    try:
        order = None
        if str(id).isdigit():
            order = Order.objects.filter(id=int(id)).select_related('custom_design__product', 'user').first()
        if not order:
            order = Order.objects.filter(mongo_id=str(id)).select_related('custom_design__product', 'user').first()
        if not order:
            order = Order.objects.filter(order_number=str(id)).select_related('custom_design__product', 'user').first()

        if not order:
            return Response({'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user and request.user.is_authenticated and order.user:
            is_admin = bool(request.user.is_admin or request.user.role in ['admin', 'administrator'])
            if order.user.id != request.user.id and not is_admin:
                return Response({'message': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'data': order.to_dict()})
    except Exception as e:
        return Response({'message': 'Failed to fetch order.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):

    return _do_create_order(request)

@api_view(['GET', 'POST'])
def orders_root(request):
    if request.method == 'POST':
        return _do_create_order(request)
    return _do_get_my_orders(request)


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_checkout(request):
    try:
        data = request.data
        cart_items_raw = data.get('cart_items')
        total_price = data.get('total_price')
        shipping_address = data.get('shipping_address')
        customer_name = data.get('customer_name')
        customer_phone = data.get('customer_phone')
        customer_email = data.get('customer_email')
        payment_id = data.get('payment_id')

        errors = {}
        if not cart_items_raw:
            errors['cart_items'] = 'Cart items are required.'
        if total_price is None or float(total_price) < 0:
            errors['total_price'] = 'Valid total price is required.'
        if not shipping_address:
            errors['shipping_address'] = 'Shipping address is required.'
        if not customer_name:
            errors['customer_name'] = 'Customer name is required.'
        if not customer_phone:
            errors['customer_phone'] = 'Phone number is required.'
        if not customer_email or not re.match(r'^\S+@\S+\.\S+$', customer_email):
            errors['customer_email'] = 'Valid email is required.'
        if not payment_id:
            errors['payment_id'] = 'Payment ID is required.'

        if errors:
            return Response({'message': 'Validation failed', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if isinstance(cart_items_raw, str):
            try:
                parsed_cart_items = json.loads(cart_items_raw)
            except Exception:
                return Response({'message': 'Invalid cart items format.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        else:
            parsed_cart_items = cart_items_raw

        user = request.user if request.user and request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            custom_design=None,
            order_number=generate_order_number(),
            total_price=float(total_price),
            status='placed',
            shipping_address=shipping_address,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            cart_items=parsed_cart_items,
            payment_id=payment_id,
            payment_status='paid',
            placed_at=timezone.now(),
        )

        o_id = order.mongo_id if order.mongo_id else str(order.id)

        return Response({
            'status': 'placed',
            'order_id': o_id,
            'order_number': order.order_number,
            'data': order.to_dict(),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': 'Failed to process cart checkout.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def cancel_order(request, id):
    try:
        order = None
        if str(id).isdigit():
            order = Order.objects.filter(id=int(id)).first()
        if not order:
            order = Order.objects.filter(mongo_id=str(id)).first()
        if not order:
            order = Order.objects.filter(order_number=str(id)).first()

        if not order:
            return Response({'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_admin = False
        if request.user and request.user.is_authenticated:
            is_admin = bool(request.user.is_admin or request.user.role in ['admin', 'administrator'])
            if order.user and order.user.id != request.user.id and not is_admin:
                return Response({'message': 'Access denied: You cannot cancel this order.'}, status=status.HTTP_403_FORBIDDEN)

        cancellable_statuses = ['placed', 'processing', 'shipping']
        if order.status not in cancellable_statuses:
            return Response({
                'message': f"Order cannot be cancelled because its current status is '{order.status}'. Cancellation is only permitted while status is Placed, Processing, or Shipping."
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        cancelled_by = 'admin' if is_admin else 'user'
        order.status = 'cancelled'
        order.cancelled_by = cancelled_by
        order.cancelled_at = timezone.now()
        order.save()

        return Response({
            'message': f'Order {order.order_number} has been cancelled successfully.',
            'data': order.to_dict()
        })
    except Exception as e:
        return Response({'message': str(e) or 'Failed to cancel order.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def orders_root(request):
    if request.method == 'POST':
        return _do_create_order(request)
    return _do_get_my_orders(request)

