from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


@override_settings(
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
)
class AuthAPITestCase(APITestCase):
    def test_register_success(self):
        payload = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
        }
        response = self.client.post("/auth/register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "john@example.com")
        self.assertTrue(User.objects.filter(email="john@example.com").exists())

    def test_register_password_confirmation_mismatch(self):
        payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "password": "StrongPass123!",
            "confirm_password": "WrongPass123!",
        }
        response = self.client.post("/auth/register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_login_success(self):
        User.objects.create_user(
            username="tester@example.com",
            email="tester@example.com",
            password="StrongPass123!",
        )
        payload = {"email": "tester@example.com", "password": "StrongPass123!"}
        response = self.client.post("/auth/login/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "tester@example.com")

    def test_login_invalid_credentials(self):
        User.objects.create_user(
            username="tester@example.com",
            email="tester@example.com",
            password="StrongPass123!",
        )
        payload = {"email": "tester@example.com", "password": "WrongPass123!"}
        response = self.client.post("/auth/login/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
