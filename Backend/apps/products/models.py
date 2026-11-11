from django.db import models

CATEGORIES = [
    'Wall Decor',
    'Lighting',
    'Soft Furnishings',
    'Decorative Accents',
    'Rugs & Mats',
]

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, choices=[(c, c) for c in CATEGORIES], blank=True, null=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    image_path = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    in_stock = models.BooleanField(default=True)

    mongo_id = models.CharField(max_length=50, blank=True, default='', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        prod_id = self.mongo_id if self.mongo_id else str(self.id)
        return {
            'id': prod_id,
            '_id': prod_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'base_price': float(self.base_price),
            'image_path': self.image_path,
            'is_active': self.is_active,
            'in_stock': self.in_stock,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __str__(self):
        return f"{self.name} ({self.category}) - INR {self.base_price}"

