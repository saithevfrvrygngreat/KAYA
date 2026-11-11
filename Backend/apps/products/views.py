from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Product

@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    try:
        queryset = Product.objects.filter(is_active=True)
        category = request.GET.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)

        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        products = [p.to_dict() for p in queryset.order_by('name')]
        return Response({'data': products})
    except Exception as e:
        return Response({'message': 'Failed to fetch products.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_products(request):
    try:
        if not (request.user.is_admin or request.user.role in ['admin', 'administrator']):
            return Response({'message': 'Access denied: administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Product.objects.all()
        category = request.GET.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)

        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        products = [p.to_dict() for p in queryset.order_by('category', 'name')]
        return Response({'data': products})
    except Exception as e:
        return Response({'message': 'Failed to fetch products.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, id):
    try:
        product = None
        # Try finding by integer id, mongo_id, or string match
        if str(id).isdigit():
            product = Product.objects.filter(id=int(id)).first()
        if not product:
            product = Product.objects.filter(mongo_id=str(id)).first()
        if not product:
            return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'data': product.to_dict()})
    except Exception as e:
        return Response({'message': 'Failed to fetch product.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
