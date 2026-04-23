from decimal import Decimal

from django.db import models
from django.db.models import Q
from rest_framework import serializers

from .models import Order, OrderItem


def user_order_display_number(order: Order) -> int:
    """1-based index among this user's remaining orders, oldest first (stable on id tie)."""
    return (
        Order.objects.filter(user_id=order.user_id)
        .filter(Q(created_at__lt=order.created_at) | Q(created_at=order.created_at, pk__lte=order.pk))
        .count()
    )


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(read_only=True)
    product_variant_id = serializers.SerializerMethodField()

    def get_product_variant_id(self, obj) -> int | None:
        return obj.product_variant_id

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product_id",
            "product_variant_id",
            "variant_color",
            "variant_size",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        )


class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(read_only=True)
    order_number = serializers.SerializerMethodField()

    def get_order_number(self, obj: Order) -> int:
        rank = self.context.get("order_rank")
        if rank is not None:
            return rank[obj.pk]
        return user_order_display_number(obj)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "payment_method",
            "total_amount",
            "created_at",
            "items_count",
        )


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    order_number = serializers.SerializerMethodField()

    def get_order_number(self, obj: Order) -> int:
        return user_order_display_number(obj)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "payment_method",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address_line1",
            "shipping_city",
            "shipping_postal_code",
            "subtotal_amount",
            "discount_amount",
            "shipping_amount",
            "total_amount",
            "created_at",
            "items",
        )


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    shipping_full_name = serializers.CharField(max_length=200)
    shipping_phone = serializers.CharField(max_length=40)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_city = serializers.CharField(max_length=120)
    shipping_postal_code = serializers.CharField(
        max_length=32, required=False, allow_blank=True, default=""
    )

    def validate_shipping_postal_code(self, value: str) -> str:
        return (value or "").strip()


class CancelOrderSerializer(serializers.Serializer):
    class Reason(models.TextChoices):
        CHANGED_MIND = "changed_mind", "Changed my mind"
        WRONG_ITEMS = "wrong_items", "Ordered wrong items"
        FOUND_BETTER_PRICE = "found_better_price", "Found a better price"
        DELIVERY_TOO_SLOW = "delivery_too_slow", "Delivery is too slow"
        OTHER = "other", "Other"

    reason = serializers.ChoiceField(choices=Reason.choices)
    note = serializers.CharField(required=False, allow_blank=True, max_length=500, default="")

    def validate_note(self, value: str) -> str:
        return (value or "").strip()
