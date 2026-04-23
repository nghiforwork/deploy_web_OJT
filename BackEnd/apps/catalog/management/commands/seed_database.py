"""
Repopulate the database while keeping table structure (migrations unchanged).

- **Giữ bảng, xóa hết dữ liệu, seed lại (toàn DB Django):**
    python manage.py seed_database --flush --demo-user

- **Chỉ xóa catalog/cart/orders (+ tùy chọn user):** dùng ``--clear`` / ``--clear-auth``.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product, ProductCategory, ProductVariant
from apps.orders.models import Order, OrderItem


User = get_user_model()


def _clear_jwt_blacklist() -> tuple[int, int]:
    try:
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
    except ImportError:
        return 0, 0
    b = BlacklistedToken.objects.all().delete()[0]
    o = OutstandingToken.objects.all().delete()[0]
    return b, o


class Command(BaseCommand):
    help = (
        "Reset data while keeping tables: use --flush to wipe all Django table rows, "
        "or --clear for catalog/cart/orders only. Then runs seed_catalog_products. "
        "--demo-user creates shopdemo / ShopDemo123!"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Run ``manage.py flush`` (empty every table Django manages; keeps schema + django_migrations), "
            "then seed. Do not combine with --clear.",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete orders, carts, products, categories (commerce data only).",
        )
        parser.add_argument(
            "--clear-auth",
            action="store_true",
            help="Also delete all auth.User rows (after clearing carts/orders). "
            "You will need --demo-user or createsuperuser to log in again.",
        )
        parser.add_argument(
            "--demo-user",
            action="store_true",
            help="Create or reset user 'shopdemo' with password 'ShopDemo123!' and an empty cart.",
        )

    def handle(self, *args, **options):
        flush = options["flush"]
        clear = options["clear"]
        clear_auth = options["clear_auth"]
        demo_user = options["demo_user"]

        if flush and clear:
            raise CommandError("Use either --flush or --clear, not both.")

        if clear_auth and not clear and not flush:
            raise CommandError(
                "Use --clear together with --clear-auth (or use --flush alone), "
                "so carts and orders are removed before deleting users.",
            )

        if flush:
            self.stdout.write("  Running flush (all rows removed, tables kept)...")
            call_command("flush", interactive=False, verbosity=1)
        else:
            if clear:
                self._clear_commerce()
            if clear_auth:
                self._clear_users_and_tokens()

        call_command("seed_catalog_products")

        if demo_user:
            self._seed_demo_user()

        self.stdout.write(self.style.SUCCESS("seed_database finished."))

    @transaction.atomic
    def _clear_commerce(self) -> None:
        n_oi, _ = OrderItem.objects.all().delete()
        n_o, _ = Order.objects.all().delete()
        n_ci, _ = CartItem.objects.all().delete()
        n_c, _ = Cart.objects.all().delete()
        n_pv, _ = ProductVariant.objects.all().delete()
        n_pc, _ = ProductCategory.objects.all().delete()
        n_p, _ = Product.objects.all().delete()
        n_cat, _ = Category.objects.all().delete()
        self.stdout.write(
            f"  Cleared commerce: order_items={n_oi}, orders={n_o}, cart_items={n_ci}, "
            f"carts={n_c}, product_variants={n_pv}, product_categories={n_pc}, "
            f"products={n_p}, categories={n_cat}"
        )

    @transaction.atomic
    def _clear_users_and_tokens(self) -> None:
        n_bt, n_ot = _clear_jwt_blacklist()
        n_u, _ = User.objects.all().delete()
        self.stdout.write(f"  Cleared auth: blacklisted_tokens={n_bt}, outstanding_tokens={n_ot}, users={n_u}")

    @transaction.atomic
    def _seed_demo_user(self) -> None:
        username = "shopdemo"
        email = "shopdemo@example.com"
        password = "ShopDemo123!"
        user, created = User.objects.update_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": "Shop",
                "last_name": "Demo",
                "is_active": True,
            },
        )
        user.set_password(password)
        user.save()
        Cart.objects.get_or_create(user=user)
        verb = "created" if created else "updated"
        self.stdout.write(
            self.style.NOTICE(
                f"  Demo user {verb}: username={username!r} password={password!r} email={email!r}"
            )
        )
