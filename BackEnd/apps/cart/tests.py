from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Product, ProductVariant

User = get_user_model()


@override_settings(
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
)
class CartAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="cart-user@example.com",
            email="cart-user@example.com",
            password="StrongPass123!",
        )
        self.other_user = User.objects.create_user(
            username="other-user@example.com",
            email="other-user@example.com",
            password="StrongPass123!",
        )
        self.product = Product.objects.create(
            name="Cart Product",
            slug="cart-product",
            price="120.00",
            stock=20,
        )
        self.product_2 = Product.objects.create(
            name="Second Product",
            slug="second-product",
            price="50.00",
            stock=10,
        )
        self.product_with_variants = Product.objects.create(
            name="Variant Parent",
            slug="variant-parent",
            price="99.00",
            stock=100,
        )
        self.variant_m = ProductVariant.objects.create(
            product=self.product_with_variants,
            color="#000000",
            size="M",
            stock=8,
        )
        self.variant_l = ProductVariant.objects.create(
            product=self.product_with_variants,
            color="#000000",
            size="L",
            stock=6,
        )
        self.client.force_authenticate(user=self.user)

    def test_get_cart_me_returns_empty_cart_when_not_exists(self):
        response = self.client.get("/cart/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"], [])
        self.assertEqual(str(response.data["subtotal_amount"]), "0.00")
        self.assertEqual(str(response.data["total_amount"]), "0.00")

    def test_add_item_creates_cart_item_and_recalculates_totals(self):
        payload = {"product_id": self.product.id, "quantity": 2}
        response = self.client.post("/cart/items/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["product_id"], self.product.id)
        self.assertEqual(response.data["items"][0]["quantity"], 2)
        self.assertEqual(str(response.data["subtotal_amount"]), "240.00")
        self.assertEqual(str(response.data["total_amount"]), "240.00")

    def test_add_same_product_twice_increases_quantity(self):
        self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 1},
            format="json",
        )
        response = self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 4)
        self.assertEqual(str(response.data["subtotal_amount"]), "480.00")

    def test_patch_item_updates_quantity_and_totals(self):
        add_response = self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 1},
            format="json",
        )
        item_id = add_response.data["items"][0]["id"]

        patch_response = self.client.patch(
            f"/cart/items/{item_id}/",
            {"quantity": 5},
            format="json",
        )

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["items"][0]["quantity"], 5)
        self.assertEqual(str(patch_response.data["subtotal_amount"]), "600.00")
        self.assertEqual(str(patch_response.data["total_amount"]), "600.00")

    def test_delete_item_removes_item_and_updates_totals(self):
        add_response = self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 2},
            format="json",
        )
        item_id = add_response.data["items"][0]["id"]

        delete_response = self.client.delete(f"/cart/items/{item_id}/")

        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.data["items"], [])
        self.assertEqual(str(delete_response.data["subtotal_amount"]), "0.00")
        self.assertEqual(str(delete_response.data["total_amount"]), "0.00")

    def test_returns_401_when_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/cart/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_item_returns_400_when_product_not_found(self):
        response = self.client.post(
            "/cart/items/",
            {"product_id": 999999, "quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("product_id", response.data)

    def test_add_item_returns_400_when_quantity_invalid(self):
        response = self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 0},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

    def test_patch_returns_404_when_item_not_belong_to_user(self):
        other_client = self.client_class()
        other_client.force_authenticate(user=self.other_user)
        add_response = other_client.post(
            "/cart/items/",
            {"product_id": self.product_2.id, "quantity": 1},
            format="json",
        )
        other_item_id = add_response.data["items"][0]["id"]

        response = self.client.patch(
            f"/cart/items/{other_item_id}/",
            {"quantity": 3},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_returns_404_when_item_not_belong_to_user(self):
        other_client = self.client_class()
        other_client.force_authenticate(user=self.other_user)
        add_response = other_client.post(
            "/cart/items/",
            {"product_id": self.product_2.id, "quantity": 1},
            format="json",
        )
        other_item_id = add_response.data["items"][0]["id"]

        response = self.client.delete(f"/cart/items/{other_item_id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_swagger_schema_contains_cart_paths(self):
        response = self.client.get("/api/schema/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("/cart/me/", response.data["paths"])
        self.assertIn("/cart/items/", response.data["paths"])
        self.assertIn("/cart/items/{item_id}/", response.data["paths"])

    def test_variant_product_requires_product_variant_id(self):
        r = self.client.post(
            "/cart/items/",
            {"product_id": self.product_with_variants.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("product_variant_id", r.data)

    def test_add_variant_line_merges_same_variant(self):
        self.client.post(
            "/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "quantity": 1,
                "product_variant_id": self.variant_m.id,
            },
            format="json",
        )
        r = self.client.post(
            "/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "quantity": 2,
                "product_variant_id": self.variant_m.id,
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["items"]), 1)
        self.assertEqual(r.data["items"][0]["quantity"], 3)
        self.assertEqual(r.data["items"][0]["product_variant_id"], self.variant_m.id)

    def test_two_different_variants_are_two_lines(self):
        self.client.post(
            "/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "quantity": 1,
                "product_variant_id": self.variant_m.id,
            },
            format="json",
        )
        r = self.client.post(
            "/cart/items/",
            {
                "product_id": self.product_with_variants.id,
                "quantity": 1,
                "product_variant_id": self.variant_l.id,
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["items"]), 2)

    def test_subtotal_and_line_total_include_quantity(self):
        """GET /cart/me/ phải cộng quantity * price (không chỉ cộng đơn giá)."""
        self.client.post(
            "/cart/items/",
            {"product_id": self.product.id, "quantity": 2},
            format="json",
        )
        r = self.client.get("/cart/me/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["items"]), 1)
        unit = Decimal("120.00")
        self.assertEqual(Decimal(str(r.data["items"][0]["line_total"])), unit * 2)
        self.assertEqual(Decimal(str(r.data["subtotal_amount"])), unit * 2)
        self.assertEqual(Decimal(str(r.data["total_amount"])), unit * 2)
