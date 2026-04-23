from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.catalog.models import Product, ProductVariant

# Create your models here.
class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        db_column="user_id",
    )
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "carts"

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        db_column="cart_id",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
        db_column="product_id",
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="cart_items",
        db_column="product_variant_id",
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "cart_items"
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "product"],
                condition=Q(product_variant__isnull=True),
                name="uniq_cart_product_no_variant",
            ),
            models.UniqueConstraint(
                fields=["cart", "product_variant"],
                condition=Q(product_variant__isnull=False),
                name="uniq_cart_product_variant",
            ),
        ]