from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.models import User, UserDetails
from apps.accounts.authentication import format_user
from apps.products.models import Product, CATEGORIES
from apps.orders.models import Order
from apps.designs.models import CustomDesign, RoomImage

def check_admin(user):
    return bool(user and user.is_authenticated and (user.is_admin or user.role in ['admin', 'administrator']))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        users = User.objects.all().order_by('-created_at')
        orders = Order.objects.all().select_related('user', 'custom_design__product').order_by('-created_at')
        designs = CustomDesign.objects.all().select_related('user', 'product').order_by('-created_at')
        products = Product.objects.all().order_by('category', 'name')

        # Compute per-user counts
        user_order_counts = dict(Order.objects.values_list('user_id').annotate(c=Count('id')))
        user_design_counts = dict(CustomDesign.objects.values_list('user_id').annotate(c=Count('id')))
        user_room_counts = dict(RoomImage.objects.values_list('user_id').annotate(c=Count('id')))

        users_list = []
        for u in users:
            u_dict = format_user(u)
            u_dict['orders_count'] = user_order_counts.get(u.id, 0)
            u_dict['custom_designs_count'] = user_design_counts.get(u.id, 0)
            u_dict['room_images_count'] = user_room_counts.get(u.id, 0)
            users_list.append(u_dict)

        orders_list = [o.to_dict() for o in orders]
        designs_list = [d.to_dict() for d in designs]
        products_list = [p.to_dict() for p in products]

        paid_non_cancelled = [o for o in orders if o.payment_status == 'paid' and o.status != 'cancelled']
        paid_all = [o for o in orders if o.payment_status == 'paid']
        cancelled = [o for o in orders if o.status == 'cancelled']

        stats = {
            'total_users': users.count(),
            'total_admins': users.filter(Q(is_admin=True) | Q(role__in=['admin', 'administrator'])).count(),
            'total_orders': orders.count(),
            'total_designs': designs.count(),
            'total_revenue': sum(float(o.total_price) for o in paid_non_cancelled),
            'gross_revenue': sum(float(o.total_price) for o in paid_all),
            'cancelled_revenue': sum(float(o.total_price) for o in cancelled),
        }

        return Response({
            'users': users_list,
            'orders': orders_list,
            'designs': designs_list,
            'products': products_list,
            'stats': stats,
        })
    except Exception as e:
        print(f"Admin dashboard error: {e}")
        return Response({'message': 'Failed to load admin dashboard.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, id):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        new_status = request.data.get('status')
        valid_statuses = ['placed', 'processing', 'shipping', 'delivered', 'cancelled']
        if not new_status or new_status not in valid_statuses:
            return Response({
                'message': 'Invalid status.',
                'errors': {'status': f"Status must be one of: {', '.join(valid_statuses)}"}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        order = None
        if str(id).isdigit():
            order = Order.objects.filter(id=int(id)).first()
        if not order:
            order = Order.objects.filter(mongo_id=str(id)).first()
        if not order:
            order = Order.objects.filter(order_number=str(id)).first()

        if not order:
            return Response({'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'cancelled' and order.cancelled_by == 'user':
            return Response({
                'message': f"Order {order.order_number} was cancelled by the customer. The status is permanently locked and cannot be changed by admin."
            }, status=status.HTTP_403_FORBIDDEN)

        stages = ['placed', 'processing', 'shipping', 'delivered']
        if new_status != 'cancelled' and order.status != 'cancelled':
            try:
                curr_idx = stages.index(order.status)
                new_idx = stages.index(new_status)
                if new_idx < curr_idx:
                    return Response({
                        'message': f"Cannot move order backwards from '{order.status.upper()}' to '{new_status.upper()}'. The order process is forward-only: Placed → Processing → Shipping → Delivered."
                    }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            except ValueError:
                pass

        order.status = new_status
        if new_status == 'cancelled':
            order.cancelled_by = 'admin'
            order.cancelled_at = timezone.now()
        elif order.cancelled_by == 'admin':
            order.cancelled_by = None
            order.cancelled_at = None

        order.save()

        return Response({
            'message': f"Order {order.order_number} status updated to '{new_status.capitalize()}' successfully!",
            'data': order.to_dict()
        })
    except Exception as e:
        return Response({'message': str(e) or 'Failed to update order status.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

DEFAULT_IMAGES = {
    'Wall Decor': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
    'Lighting': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80',
    'Soft Furnishings': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80',
    'Decorative Accents': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80',
    'Rugs & Mats': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80',
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def store_product(request):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        data = request.data
        name = (data.get('name') or '').strip()
        category = data.get('category')
        description = (data.get('description') or '').strip()
        base_price = data.get('base_price')
        image_path = (data.get('image_path') or '').strip()

        errors = {}
        if not name:
            errors['name'] = 'Product name is required.'
        if not category or category not in CATEGORIES:
            errors['category'] = f"Category must be one of: {', '.join(CATEGORIES)}"
        if not description:
            errors['description'] = 'Description is required.'
        if base_price is None:
            errors['base_price'] = 'Valid base price is required.'
        else:
            try:
                if float(base_price) < 0:
                    errors['base_price'] = 'Base price must be non-negative.'
            except ValueError:
                errors['base_price'] = 'Valid base price is required.'

        if errors:
            return Response({'message': 'Validation failed', 'errors': errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if Product.objects.filter(name__iexact=name).exists():
            return Response({'message': 'Validation failed', 'errors': {'name': 'A product with this name already exists.'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        final_image = image_path or DEFAULT_IMAGES.get(category, DEFAULT_IMAGES['Wall Decor'])

        product = Product.objects.create(
            name=name,
            category=category,
            description=description,
            base_price=float(base_price),
            image_path=final_image,
            is_active=True,
            in_stock=True
        )

        return Response({
            'message': f"New masterpiece curation '{product.name}' added successfully!",
            'data': product.to_dict()
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': 'Failed to create product.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_product_stock(request, id):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        product = None
        if str(id).isdigit():
            product = Product.objects.filter(id=int(id)).first()
        if not product:
            product = Product.objects.filter(mongo_id=str(id)).first()

        if not product:
            return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        product.in_stock = not product.in_stock
        product.save()

        status_text = 'In Stock' if product.in_stock else 'Out of Stock'
        return Response({
            'message': f"Masterpiece '{product.name}' is now marked as {status_text}!",
            'data': product.to_dict()
        })
    except Exception as e:
        return Response({'message': 'Failed to toggle stock.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_product_active(request, id):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        product = None
        if str(id).isdigit():
            product = Product.objects.filter(id=int(id)).first()
        if not product:
            product = Product.objects.filter(mongo_id=str(id)).first()

        if not product:
            return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        product.is_active = not product.is_active
        product.save()

        status_text = 'Visible (Active)' if product.is_active else 'Hidden (Inactive)'
        return Response({
            'message': f"Masterpiece '{product.name}' visibility is now {status_text}!",
            'data': product.to_dict()
        })
    except Exception as e:
        return Response({'message': 'Failed to toggle active status.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def destroy_product(request, id):
    if not check_admin(request.user):
        return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        product = None
        if str(id).isdigit():
            product = Product.objects.filter(id=int(id)).first()
        if not product:
            product = Product.objects.filter(mongo_id=str(id)).first()

        if not product:
            return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        name = product.name
        product.delete()

        return Response({'message': f"Masterpiece curation '{name}' has been completely deleted and removed from all lists!"})
    except Exception as e:
        return Response({'message': 'Failed to delete product.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

