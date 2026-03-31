from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product, ProductCategory, ProductVariant


class ProductDetailAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="T-Shirts",
            slug="t-shirts",
            is_active=True,
            sort_order=1,
        )
        self.product = Product.objects.create(
            name="One Life Graphic T-Shirt",
            slug="one-life-graphic-t-shirt",
            description="Soft cotton t-shirt",
            image_url="https://example.com/product.png",
            price="260.00",
            original_price="300.00",
            discount_label="-13%",
            rating="4.50",
            stock=25,
        )
        ProductCategory.objects.create(
            product=self.product,
            category=self.category,
            is_primary=True,
        )
        ProductVariant.objects.create(
            product=self.product,
            color="#2D5016",
            size="Large",
            stock=10,
            sku="TSHIRT-L-GREEN",
        )

    def test_get_product_detail_returns_200_with_expected_payload(self):
        url = reverse("api_catalog:products-detail", kwargs={"pk": self.product.pk})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.product.id)
        self.assertEqual(response.data["name"], self.product.name)
        self.assertEqual(response.data["slug"], self.product.slug)
        self.assertIn("categories", response.data)
        self.assertIn("variants", response.data)
        self.assertIn("primary_category", response.data)
        self.assertEqual(len(response.data["categories"]), 1)
        self.assertEqual(len(response.data["variants"]), 1)
        self.assertEqual(response.data["primary_category"]["slug"], self.category.slug)

        expected_keys = {
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "price",
            "original_price",
            "discount_label",
            "rating",
            "stock",
            "created_at",
            "updated_at",
            "categories",
            "variants",
            "primary_category",
        }
        self.assertTrue(expected_keys.issubset(set(response.data.keys())))

    def test_get_product_detail_returns_404_when_not_found(self):
        url = reverse("api_catalog:products-detail", kwargs={"pk": 999999})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
