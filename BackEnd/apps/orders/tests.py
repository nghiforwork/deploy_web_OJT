from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Product, ProductVariant
from apps.orders.models import Order, OrderItem

User = get_user_model()


@override_settings(
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
)
class OrdersAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="order-user@example.com",
            email="order-user@example.com",
            password="StrongPass123!",
        )
        self.other = User.objects.create_user(
            username="other-order@example.com",
            email="other-order@example.com",
            password="StrongPass123!",
        )
        self.product = Product.objects.create(
            name="Order Product",
            slug="order-product",
            price="100.00",
            stock=5,
        )
        self.client.force_authenticate(user=self.user)

    def test_checkout_empty_cart_returns_400(self):
        r = self.client.post(
            "/orders/checkout/",
            {
                "payment_method": "cod",
                "shipping_full_name": "A B",
                "shipping_phone": "0900",
                "shipping_address_line1": "1 St",
                "shipping_city": "HCMC",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_creates_order_clears_cart_updates_stock(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        r = self.client.post(
            "/orders/checkout/",
            {
                "payment_method": "card",
                "shipping_full_name": "Buyer Name",
                "shipping_phone": "0900000000",
                "shipping_address_line1": "123 Road",
                "shipping_city": "HCMC",
                "shipping_postal_code": "700000",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["items"][0]["quantity"], 2)
        self.assertEqual(str(r.data["total_amount"]), "200.00")
        self.assertEqual(r.data["order_number"], 1)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

        cart.refresh_from_db()
        self.assertEqual(cart.items.count(), 0)

        self.assertEqual(Order.objects.filter(user=self.user).count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)

    def test_checkout_decrements_variant_stock_not_product_when_line_has_variant(self):
        p = Product.objects.create(
            name="Variant Checkout Product",
            slug="variant-checkout-product",
            price="10.00",
            stock=50,
        )
        v = ProductVariant.objects.create(
            product=p,
            color="#FFFFFF",
            size="S",
            stock=4,
        )
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=cart,
            product=p,
            product_variant=v,
            quantity=2,
        )
        r = self.client.post(
            "/orders/checkout/",
            {
                "payment_method": "cod",
                "shipping_full_name": "A B",
                "shipping_phone": "0900",
                "shipping_address_line1": "1 St",
                "shipping_city": "HCMC",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        v.refresh_from_db()
        p.refresh_from_db()
        self.assertEqual(v.stock, 2)
        self.assertEqual(p.stock, 50)

    def test_checkout_insufficient_variant_stock_returns_400(self):
        p = Product.objects.create(
            name="Low Variant Stock",
            slug="low-variant-stock",
            price="5.00",
            stock=100,
        )
        v = ProductVariant.objects.create(product=p, color="#000", size="M", stock=1)
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=p, product_variant=v, quantity=5)

        r = self.client.post(
            "/orders/checkout/",
            {
                "payment_method": "cod",
                "shipping_full_name": "A",
                "shipping_phone": "1",
                "shipping_address_line1": "X",
                "shipping_city": "Y",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_checkout_insufficient_stock_returns_400(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=99)

        r = self.client.post(
            "/orders/checkout/",
            {
                "payment_method": "cod",
                "shipping_full_name": "A",
                "shipping_phone": "1",
                "shipping_address_line1": "X",
                "shipping_city": "Y",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_detail_forbidden_for_other_user(self):
        order = Order.objects.create(
            user=self.other,
            payment_method=Order.PaymentMethod.COD,
            shipping_full_name="X",
            shipping_phone="1",
            shipping_address_line1="a",
            shipping_city="b",
            total_amount="10.00",
            subtotal_amount="10.00",
        )
        r = self.client.get(f"/orders/{order.id}/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
