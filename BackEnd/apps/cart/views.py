from django.db.models import F, Prefetch, Sum, DecimalField
from django.db.models.functions import Coalesce
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import ProductVariant

from .models import Cart, CartItem
from .serializers import (
    AddCartItemSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)


def _get_or_create_cart_for_user(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _cart_for_response(user):
    """Giỏ kèm items + product + variant (tránh N+1 khi serialize)."""
    c = _get_or_create_cart_for_user(user)
    return Cart.objects.prefetch_related(
        Prefetch(
            "items",
            queryset=CartItem.objects.select_related("product", "product_variant"),
        )
    ).get(pk=c.pk)


def _recalculate_cart_totals(cart):
    subtotal = cart.items.aggregate(
        subtotal=Coalesce(
            Sum(
                F("quantity") * F("product__price"),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            0,
            output_field=DecimalField(max_digits=12, decimal_places=2),
        )
    )["subtotal"]
    cart.subtotal_amount = subtotal
    cart.total_amount = subtotal - cart.discount_amount + cart.shipping_amount
    cart.save(update_fields=["subtotal_amount", "total_amount", "updated_at"])


@extend_schema(tags=["Cart"])
class CartMeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def get(self, request):
        cart = _get_or_create_cart_for_user(request.user)
        _recalculate_cart_totals(cart)
        cart = _cart_for_response(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@extend_schema(tags=["Cart"])
class CartItemCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=AddCartItemSerializer, responses=CartSerializer)
    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = _get_or_create_cart_for_user(request.user)
        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]
        variant_id = serializer.validated_data.get("product_variant_id")
        raw_vid = request.data.get("product_variant_id")
        if variant_id is None and raw_vid not in (None, ""):
            try:
                candidate = int(raw_vid)
            except (TypeError, ValueError):
                candidate = None
            if candidate is not None and ProductVariant.objects.filter(
                pk=candidate, product_id=product_id
            ).exists():
                variant_id = candidate

        if variant_id is not None:
            item = cart.items.filter(
                product_id=product_id,
                product_variant_id=variant_id,
            ).first()
        else:
            item = cart.items.filter(
                product_id=product_id,
                product_variant_id__isnull=True,
            ).first()

        if item:
            item.quantity += quantity
            item.save(update_fields=["quantity"])
        else:
            CartItem.objects.create(
                cart=cart,
                product_id=product_id,
                product_variant_id=variant_id,
                quantity=quantity,
            )

        _recalculate_cart_totals(cart)
        cart = _cart_for_response(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


@extend_schema(tags=["Cart"])
class CartItemDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_item(self, user, item_id):
        cart = _get_or_create_cart_for_user(user)
        return cart, cart.items.filter(pk=item_id).first()

    @extend_schema(request=UpdateCartItemSerializer, responses=CartSerializer)
    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, item = self._get_item(request.user, item_id)
        if not item:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity"])
        _recalculate_cart_totals(cart)
        cart = _cart_for_response(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @extend_schema(responses=CartSerializer)
    def delete(self, request, item_id):
        cart, item = self._get_item(request.user, item_id)
        if not item:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()
        _recalculate_cart_totals(cart)
        cart = _cart_for_response(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
