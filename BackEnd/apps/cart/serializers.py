from decimal import Decimal

from rest_framework import serializers

from apps.catalog.models import Product, ProductVariant
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image_url = serializers.CharField(source="product.image_url", read_only=True)
    product_variant_id = serializers.SerializerMethodField()
    variant_color = serializers.SerializerMethodField()
    variant_size = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(
        source="product.price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product_id",
            "product_variant_id",
            "variant_color",
            "variant_size",
            "product_name",
            "product_slug",
            "product_image_url",
            "unit_price",
            "quantity",
            "line_total",
        )

    def get_product_variant_id(self, obj) -> int | None:
        return obj.product_variant_id

    def get_variant_color(self, obj) -> str | None:
        if obj.product_variant_id is not None:
            return obj.product_variant.color
        return None

    def get_variant_size(self, obj) -> str | None:
        if obj.product_variant_id is not None:
            return obj.product_variant.size
        return None

    def get_line_total(self, obj) -> Decimal:
        return obj.quantity * obj.product.price


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = (
            "id",
            "user",
            "subtotal_amount",
            "discount_amount",
            "shipping_amount",
            "total_amount",
            "updated_at",
            "items",
        )
        read_only_fields = fields


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    product_variant_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Product does not exist.")
        return value

    def validate(self, attrs):
        product_id = attrs["product_id"]
        variants_qs = ProductVariant.objects.filter(product_id=product_id)
        vid = attrs.get("product_variant_id")

        if variants_qs.exists():
            if vid is None:
                raise serializers.ValidationError(
                    {
                        "product_variant_id": (
                            "This product requires a variant (color / size). "
                            "Send product_variant_id from GET /catalog/products/{id}/ variants[].id."
                        )
                    }
                )
            if not variants_qs.filter(pk=vid).exists():
                raise serializers.ValidationError(
                    {"product_variant_id": "Variant does not belong to this product."}
                )
        elif vid is not None:
            raise serializers.ValidationError(
                {"product_variant_id": "This product has no variants; omit product_variant_id."}
            )

        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(required=True, min_value=1)
