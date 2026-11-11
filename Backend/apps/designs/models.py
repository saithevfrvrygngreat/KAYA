from django.db import models
from django.conf import settings
from apps.products.models import Product

class CustomDesign(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='custom_designs')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='custom_designs')
    design_json = models.JSONField()
    preview_image_path = models.CharField(max_length=500, blank=True, null=True)
    room_image_path = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=50, default='saved')

    mongo_id = models.CharField(max_length=50, blank=True, default='', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        d_id = self.mongo_id if self.mongo_id else str(self.id)
        user_data = None
        if self.user:
            user_data = {
                'id': self.user.display_id,
                '_id': self.user.display_id,
                'name': self.user.name,
                'email': self.user.email,
            }

        return {
            'id': d_id,
            '_id': d_id,
            'user': user_data,
            'product': self.product.to_dict() if self.product else None,
            'design_json': self.design_json,
            'preview_image_path': self.preview_image_path,
            'room_image_path': self.room_image_path,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __str__(self):
        prod_name = self.product.name if self.product else 'Unknown'
        return f"Design #{self.id} for {prod_name}"

class RoomImage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='room_images')
    path = models.CharField(max_length=500)
    mongo_id = models.CharField(max_length=50, blank=True, default='', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        r_id = self.mongo_id if self.mongo_id else str(self.id)
        return {
            'id': r_id,
            '_id': r_id,
            'user': self.user.display_id if self.user else None,
            'path': self.path,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

