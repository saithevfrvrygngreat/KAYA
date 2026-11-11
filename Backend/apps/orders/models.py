from django.db import models
from django.conf import settings
from apps.designs.models import CustomDesign

class Order(models.Model):
    STATUS_CHOICES = (
        ('placed', 'Placed'),
        ('processing', 'Processing'),
        ('shipping', 'Shipping'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    CANCELLED_BY_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    custom_design = models.ForeignKey(CustomDesign, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    order_number = models.CharField(max_length=100, unique=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='placed')
    cancelled_by = models.CharField(max_length=50, choices=CANCELLED_BY_CHOICES, null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    shipping_address = models.TextField(null=True, blank=True)
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    customer_phone = models.CharField(max_length=50, null=True, blank=True)
    customer_email = models.EmailField(null=True, blank=True)
    cart_items = models.JSONField(null=True, blank=True)
    payment_id = models.CharField(max_length=255, null=True, blank=True)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_STATUS_CHOICES, default='pending')
    placed_at = models.DateTimeField(null=True, blank=True)

    mongo_id = models.CharField(max_length=50, blank=True, default='', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        o_id = self.mongo_id if self.mongo_id else str(self.id)
        user_data = None
        if self.user:
            user_data = {
                'id': self.user.display_id,
                '_id': self.user.display_id,
                'name': self.user.name,
                'email': self.user.email,
            }

        return {
            'id': o_id,
            '_id': o_id,
            'user': user_data,
            'custom_design': self.custom_design.to_dict() if self.custom_design else None,
            'order_number': self.order_number,
            'total_price': float(self.total_price),
            'status': self.status,
            'cancelled_by': self.cancelled_by,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'shipping_address': self.shipping_address,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'cart_items': self.cart_items,
            'payment_id': self.payment_id,
            'payment_status': self.payment_status,
            'placed_at': self.placed_at.isoformat() if self.placed_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __str__(self):
        return f"{self.order_number} - {self.status} (INR {self.total_price})"

