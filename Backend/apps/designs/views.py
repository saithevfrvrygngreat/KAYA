import os
import json
import time
from pathlib import Path
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from apps.products.models import Product
from .models import CustomDesign, RoomImage

def save_uploaded_file(uploaded_file, subfolder='rooms'):
    upload_dir = settings.MEDIA_ROOT / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(uploaded_file.name)[1]
    filename = f"{int(time.time() * 1000)}-{os.urandom(4).hex()}{ext}"
    dest_path = upload_dir / filename
    with open(dest_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return f"{subfolder}/{filename}"

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def save_design(request):
    try:
        data = request.data
        product_id = data.get('product_id')
        design_json_raw = data.get('design_json')

        if not product_id:
            return Response({'message': 'Validation failed', 'errors': {'product_id': 'Product is required.'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        product = None
        if str(product_id).isdigit():
            product = Product.objects.filter(id=int(product_id)).first()
        if not product:
            product = Product.objects.filter(mongo_id=str(product_id)).first()

        if not product:
            return Response({'message': 'Validation failed', 'errors': {'product_id': 'Invalid product.'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        if isinstance(design_json_raw, str):
            try:
                design_data = json.loads(design_json_raw)
            except Exception:
                return Response({'message': 'Validation failed', 'errors': {'design_json': 'Design payload must be a valid object.'}}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        elif isinstance(design_json_raw, dict):
            design_data = design_json_raw
        else:
            return Response({'message': 'Invalid design payload.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        room_image_path = None
        if 'room_image' in request.FILES:
            room_image_path = save_uploaded_file(request.FILES['room_image'], 'rooms')
            RoomImage.objects.create(
                user=request.user if request.user and request.user.is_authenticated else None,
                path=room_image_path
            )

        user = request.user if request.user and request.user.is_authenticated else None

        design = CustomDesign.objects.create(
            user=user,
            product=product,
            design_json=design_data,
            room_image_path=room_image_path,
            status='saved',
        )

        design_id = design.mongo_id if design.mongo_id else str(design.id)

        return Response({
            'status': 'saved',
            'design_id': design_id,
            'preview_url': f'/designs/{design_id}/preview',
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': 'Failed to save design.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_designs(request):
    try:
        designs = CustomDesign.objects.filter(user=request.user).select_related('product').order_by('-created_at')
        return Response({'data': [d.to_dict() for d in designs]})
    except Exception as e:
        return Response({'message': 'Failed to fetch designs.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_design(request, id):
    try:
        design = None
        if str(id).isdigit():
            design = CustomDesign.objects.filter(id=int(id)).select_related('product', 'user').first()
        if not design:
            design = CustomDesign.objects.filter(mongo_id=str(id)).select_related('product', 'user').first()

        if not design:
            return Response({'message': 'Design not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'data': design.to_dict()})
    except Exception as e:
        return Response({'message': 'Failed to fetch design.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_room_image(request):
    try:
        file_obj = request.FILES.get('image') or request.FILES.get('room_image')
        if not file_obj:
            return Response({'message': 'Image file is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        image_path = save_uploaded_file(file_obj, 'rooms')
        user = request.user if request.user and request.user.is_authenticated else None

        room_image = RoomImage.objects.create(
            user=user,
            path=image_path
        )

        r_id = room_image.mongo_id if room_image.mongo_id else str(room_image.id)

        return Response({
            'status': 'uploaded',
            'room_image_id': r_id,
            'image_path': image_path,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': 'Failed to upload image.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
