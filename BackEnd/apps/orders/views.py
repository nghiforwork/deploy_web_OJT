from decimal import Decimal

from django.db import transaction
from django.db.models import Count, F, Prefetch
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart, CartItem
from apps.cart.views import _get_or_create_cart_for_user, _recalculate_cart_totals
from apps.catalog.models import Product, ProductVariant

from .models import Order, OrderItem
from .serializers import (
    CancelOrderSerializer,
    CheckoutSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)


def _cart_queryset_for_response(user):
    cart = _get_or_create_cart_for_user(user)
    return (
        Cart.objects.prefetch_related(
            Prefetch(
                "items",
                queryset=CartItem.objects.select_related("product", "product_variant"),
            )
        )
        .get(pk=cart.pk)
    )


@extend_schema(tags=["Orders"])
class OrderCheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CheckoutSerializer, responses=OrderDetailSerializer)
    def post(self, request):
        ser = CheckoutSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        user = request.user
        with transaction.atomic():
            cart = Cart.objects.select_for_update().filter(user=user).first()
            if not cart:
                cart = _get_or_create_cart_for_user(user)
                cart = Cart.objects.select_for_update().get(pk=cart.pk)

            items = list(
                cart.items.select_for_update(of=("self",))
                .select_related("product", "product_variant")
            )
            if not items:
                return Response(
                    {"detail": "Your cart is empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for item in items:
                if item.product_variant_id:
                    if item.product_variant.stock < item.quantity:
                        return Response(
                            {
                                "detail": (
                                    f"Insufficient stock for “{item.product.name}” "
                                    f"({item.product_variant.color} / {item.product_variant.size}). "
                                    f"Available: {item.product_variant.stock}, requested: {item.quantity}."
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                elif item.product.stock < item.quantity:
                    return Response(
                        {
                            "detail": (
                                f"Insufficient stock for “{item.product.name}”. "
                                f"Available: {item.product.stock}, requested: {item.quantity}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            subtotal = Decimal("0")
            for item in items:
                line = item.product.price * item.quantity
                subtotal += line

            discount = cart.discount_amount
            ship_fee = cart.shipping_amount
            total = subtotal - discount + ship_fee
            if total < 0:
                total = Decimal("0")

            order = Order.objects.create(
                user=user,
                status=Order.Status.PENDING,
                payment_method=data["payment_method"],
                shipping_full_name=data["shipping_full_name"],
                shipping_phone=data["shipping_phone"],
                shipping_address_line1=data["shipping_address_line1"],
                shipping_city=data["shipping_city"],
                shipping_postal_code=data.get("shipping_postal_code") or "",
                subtotal_amount=subtotal,
                discount_amount=discount,
                shipping_amount=ship_fee,
                total_amount=total,
            )

            for item in items:
                unit = item.product.price
                line_total = unit * item.quantity
                pv = item.product_variant
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_variant=pv,
                    variant_color=pv.color if pv else "",
                    variant_size=pv.size if pv else "",
                    product_name=item.product.name,
                    unit_price=unit,
                    quantity=item.quantity,
                    line_total=line_total,
                )
                if item.product_variant_id:
                    ProductVariant.objects.filter(pk=item.product_variant_id).update(
                        stock=F("stock") - item.quantity
                    )
                else:
                    Product.objects.filter(pk=item.product_id).update(
                        stock=F("stock") - item.quantity
                    )

            CartItem.objects.filter(cart=cart).delete()
            _recalculate_cart_totals(cart)

        order = (
            Order.objects.filter(pk=order.pk)
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product", "product_variant"),
                )
            )
            .first()
        )
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Orders"])
class OrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=OrderListSerializer(many=True))
    def get(self, request):
        user = request.user
        chronological_ids = list(
            Order.objects.filter(user=user).order_by("created_at", "id").values_list("id", flat=True)
        )
        order_rank = {pk: idx + 1 for idx, pk in enumerate(chronological_ids)}
        qs = (
            Order.objects.filter(user=user)
            .annotate(items_count=Count("items"))
            .order_by("-created_at")
        )
        return Response(
            OrderListSerializer(qs, many=True, context={"order_rank": order_rank}).data,
        )


@extend_schema(tags=["Orders"])
class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=OrderDetailSerializer)
    def get(self, request, pk):
        order = (
            Order.objects.filter(pk=pk, user=request.user)
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=OrderItem.objects.select_related("product", "product_variant"),
                )
            )
            .first()
        )
        if not order:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(OrderDetailSerializer(order).data)


@extend_schema(tags=["Orders"])
class OrderCancelAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CancelOrderSerializer, responses={204: None})
    def post(self, request, pk):
        ser = CancelOrderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        with transaction.atomic():
            # Lock the order row so we can safely restock and delete.
            order = (
                Order.objects.select_for_update()
                .filter(pk=pk, user=request.user)
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=OrderItem.objects.select_related("product", "product_variant"),
                    )
                )
                .first()
            )
            if not order:
                return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

            # Only allow cancelling orders that haven't shipped yet.
            if order.status in (Order.Status.SHIPPED,):
                return Response(
                    {"detail": "This order can no longer be cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for item in list(order.items.all()):
                if item.product_variant_id:
                    ProductVariant.objects.filter(pk=item.product_variant_id).update(
                        stock=F("stock") + item.quantity
                    )
                else:
                    Product.objects.filter(pk=item.product_id).update(
                        stock=F("stock") + item.quantity
                    )

            # Requirement: delete the order record after cancelling.
            order.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
