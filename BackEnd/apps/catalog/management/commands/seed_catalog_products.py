from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.catalog.models import Category, Product, ProductCategory, ProductVariant


CATEGORY_SEEDS = [
    {"name": "Men", "slug": "men", "sort_order": 1},
    {"name": "Women", "slug": "women", "sort_order": 2},
    {"name": "T-Shirts", "slug": "t-shirts", "sort_order": 3},
    {"name": "Shirts", "slug": "shirts", "sort_order": 4},
    {"name": "Jeans", "slug": "jeans", "sort_order": 5},
    {"name": "Hoodies", "slug": "hoodies", "sort_order": 6},
]

DRESS_STYLE_SEEDS = [
    {
        "name": "Casual",
        "slug": "casual",
        "sort_order": 30,
        "image_url": "/images/dress-style/casual.png",
    },
    {
        "name": "Formal",
        "slug": "formal",
        "sort_order": 35,
        "image_url": "/images/dress-style/formal.png",
    },
    {
        "name": "Party",
        "slug": "party",
        "sort_order": 40,
        "image_url": "/images/dress-style/party.png",
    },
    {
        "name": "Gym",
        "slug": "gym",
        "sort_order": 45,
        "image_url": "/images/dress-style/gym.png",
    },
]


PRODUCT_SEEDS = [
    {
        "name": "Black Orange T-Shirt",
        "slug": "black-orange-tshirt",
        "description": "Comfort fit t-shirt with black and orange tones.",
        "image_url": "/images/products/black-orange-tshirt.png",
        "price": Decimal("249.00"),
        "original_price": Decimal("299.00"),
        "discount_label": "-17%",
        "rating": Decimal("4.50"),
        "stock": 35,
        "category_slugs": ["men", "t-shirts", "casual"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#000000", "size": "M", "stock": 10, "sku": "BO-TS-M-BLK"},
            {"color": "#000000", "size": "L", "stock": 10, "sku": "BO-TS-L-BLK"},
            {"color": "#F97316", "size": "M", "stock": 11, "sku": "BO-TS-M-ORG"},
            {"color": "#F97316", "size": "L", "stock": 12, "sku": "BO-TS-L-ORG"},
        ],
    },
    {
        "name": "Purple Shirt",
        "slug": "purple-shirt",
        "description": "Elegant purple shirt suitable for both work and casual events.",
        "image_url": "/images/products/25143838_55536476_600.webp",
        "price": Decimal("349.00"),
        "original_price": Decimal("429.00"),
        "discount_label": "-19%",
        "rating": Decimal("4.70"),
        "stock": 24,
        "category_slugs": ["women", "shirts", "formal"],
        "primary_category": "shirts",
        "variants": [
            {"color": "#7C3AED", "size": "M", "stock": 8, "sku": "PP-SH-M-PUR"},
            {"color": "#7C3AED", "size": "L", "stock": 6, "sku": "PP-SH-L-PUR"},
        ],
    },
    {
        "name": "Black Jeans",
        "slug": "black-jeans",
        "description": "Slim-fit black jeans made from durable denim.",
        "image_url": "/images/products/black-jeans.png",
        "price": Decimal("499.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.60"),
        "stock": 18,
        "category_slugs": ["men", "jeans", "casual"],
        "primary_category": "jeans",
        "variants": [
            {"color": "#111827", "size": "32", "stock": 9, "sku": "BJ-32-BLK"},
            {"color": "#111827", "size": "34", "stock": 9, "sku": "BJ-34-BLK"},
        ],
    },
    {
        "name": "Moss Green T-Shirt",
        "slug": "moss-green-tshirt",
        "description": "Soft premium cotton tee with a fresh moss green tone.",
        "image_url": "/images/products/moss-green-tshirt.png",
        "price": Decimal("289.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.40"),
        "stock": 30,
        "category_slugs": ["men", "t-shirts", "casual"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#3A5F0B", "size": "M", "stock": 12, "sku": "MG-TS-M-GRN"},
            {"color": "#3A5F0B", "size": "L", "stock": 10, "sku": "MG-TS-L-GRN"},
        ],
    },
    {
        "name": "Gradient Graphic T-Shirt",
        "slug": "gradient-graphic-tshirt",
        "description": "Trendy gradient graphic tee for daily casual looks.",
        "image_url": "/images/products/orange-tshirt.png",
        "price": Decimal("145.00"),
        "original_price": Decimal("179.00"),
        "discount_label": "-19%",
        "rating": Decimal("4.20"),
        "stock": 28,
        "category_slugs": ["women", "t-shirts", "party"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#1F2937", "size": "S", "stock": 9, "sku": "GG-TS-S-DRK"},
            {"color": "#D1D5DB", "size": "M", "stock": 8, "sku": "GG-TS-M-LGT"},
        ],
    },
    {
        "name": "Gray Zip Hoodie",
        "slug": "gray-zip-hoodie",
        "description": "Mid-weight cotton blend hoodie with a smooth zip and roomy pockets.",
        "image_url": "/images/products/black-tshirt.png",
        "price": Decimal("429.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.55"),
        "stock": 22,
        "category_slugs": ["men", "hoodies", "casual"],
        "primary_category": "hoodies",
        "variants": [
            {"color": "#6B7280", "size": "M", "stock": 14, "sku": "GZ-HD-M-GRY"},
            {"color": "#6B7280", "size": "L", "stock": 12, "sku": "GZ-HD-L-GRY"},
            {"color": "#374151", "size": "M", "stock": 10, "sku": "GZ-HD-M-DGR"},
            {"color": "#374151", "size": "L", "stock": 9, "sku": "GZ-HD-L-DGR"},
        ],
    },
    {
        "name": "Basic White Tee",
        "slug": "basic-white-tee",
        "description": "Ultra-soft everyday tee in breathable cotton.",
        "image_url": "/images/products/basic_white_tee.webp",
        "price": Decimal("199.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.35"),
        "stock": 40,
        "category_slugs": ["men", "t-shirts", "casual"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#FFFFFF", "size": "S", "stock": 20, "sku": "BW-TS-S-WHT"},
            {"color": "#FFFFFF", "size": "M", "stock": 25, "sku": "BW-TS-M-WHT"},
            {"color": "#FFFFFF", "size": "L", "stock": 18, "sku": "BW-TS-L-WHT"},
            {"color": "#F3F4F6", "size": "M", "stock": 15, "sku": "BW-TS-M-OFF"},
            {"color": "#F3F4F6", "size": "L", "stock": 14, "sku": "BW-TS-L-OFF"},
        ],
    },
    {
        "name": "Navy Stripe Polo",
        "slug": "navy-stripe-polo",
        "description": "Breathable pique polo with subtle stripes; collar keeps its shape wash after wash.",
        "image_url": "/images/products/green-shirt.png",
        "price": Decimal("319.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.45"),
        "stock": 26,
        "category_slugs": ["men", "shirts", "casual"],
        "primary_category": "shirts",
        "variants": [
            {"color": "#1E3A5F", "size": "M", "stock": 10, "sku": "NS-PL-M-NVY"},
            {"color": "#1E3A5F", "size": "L", "stock": 9, "sku": "NS-PL-L-NVY"},
            {"color": "#1E3A5F", "size": "XL", "stock": 7, "sku": "NS-PL-XL-NVY"},
        ],
    },
    {
        "name": "Classic Oxford Shirt",
        "slug": "classic-oxford-shirt",
        "description": "Crisp oxford weave shirt for office or weekend layering.",
        "image_url": "/images/products/green-shirt.png",
        "price": Decimal("389.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.62"),
        "stock": 20,
        "category_slugs": ["men", "shirts", "formal"],
        "primary_category": "shirts",
        "variants": [
            {"color": "#F8FAFC", "size": "M", "stock": 8, "sku": "CO-SH-M-WHT"},
            {"color": "#F8FAFC", "size": "L", "stock": 7, "sku": "CO-SH-L-WHT"},
            {"color": "#93C5FD", "size": "M", "stock": 5, "sku": "CO-SH-M-BLU"},
        ],
    },
    {
        "name": "Indigo Slim Jeans",
        "slug": "indigo-slim-jeans",
        "description": "Stretch slim fit with deep indigo wash and reinforced stitching.",
        "image_url": "/images/products/blue-jeans.png",
        "price": Decimal("459.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.58"),
        "stock": 16,
        "category_slugs": ["men", "jeans", "casual"],
        "primary_category": "jeans",
        "variants": [
            {"color": "#1E3A8A", "size": "32", "stock": 8, "sku": "IS-JN-32-IND"},
            {"color": "#1E3A8A", "size": "34", "stock": 8, "sku": "IS-JN-34-IND"},
        ],
    },
    {
        "name": "Linen Blend Shirt",
        "slug": "linen-blend-shirt",
        "description": "Lightweight linen-cotton blend for warm days; relaxed drape.",
        "image_url": "/images/products/green-shirt.png",
        "price": Decimal("339.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.48"),
        "stock": 22,
        "category_slugs": ["women", "shirts", "formal"],
        "primary_category": "shirts",
        "variants": [
            {"color": "#E8DCC4", "size": "S", "stock": 8, "sku": "LB-SH-S-SND"},
            {"color": "#E8DCC4", "size": "M", "stock": 9, "sku": "LB-SH-M-SND"},
            {"color": "#A7F3D0", "size": "M", "stock": 5, "sku": "LB-SH-M-MNT"},
        ],
    },
    {
        "name": "Cropped Graphic Tee",
        "slug": "cropped-graphic-tee",
        "description": "Soft cropped tee with vintage-inspired graphic print.",
        "image_url": "/images/products/blue-short.png",
        "price": Decimal("179.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.28"),
        "stock": 32,
        "category_slugs": ["women", "t-shirts", "party"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#F472B6", "size": "S", "stock": 12, "sku": "CG-TS-S-PNK"},
            {"color": "#F472B6", "size": "M", "stock": 11, "sku": "CG-TS-M-PNK"},
            {"color": "#1F2937", "size": "M", "stock": 9, "sku": "CG-TS-M-DRK"},
        ],
    },
    {
        "name": "Oversized Crew Sweatshirt",
        "slug": "oversized-crew-sweatshirt",
        "description": "Plush fleece crew with dropped shoulders and ribbed trims.",
        "image_url": "/images/products/shopping.webp",
        "price": Decimal("369.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.52"),
        "stock": 18,
        "category_slugs": ["women", "hoodies", "casual"],
        "primary_category": "hoodies",
        "variants": [
            {"color": "#D1D5DB", "size": "S", "stock": 6, "sku": "OC-HD-S-LGT"},
            {"color": "#D1D5DB", "size": "M", "stock": 7, "sku": "OC-HD-M-LGT"},
            {"color": "#374151", "size": "M", "stock": 5, "sku": "OC-HD-M-CHR"},
        ],
    },
    {
        "name": "Athletic Training Tee",
        "slug": "athletic-training-tee",
        "description": "Moisture-wicking knit with mesh panels for gym sessions.",
        "image_url": "/images/products/moss-green-tshirt.png",
        "price": Decimal("225.00"),
        "original_price": Decimal("259.00"),
        "discount_label": "-13%",
        "rating": Decimal("4.33"),
        "stock": 36,
        "category_slugs": ["men", "t-shirts", "gym"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#0D9488", "size": "S", "stock": 12, "sku": "AT-TS-S-TL"},
            {"color": "#0D9488", "size": "M", "stock": 14, "sku": "AT-TS-M-TL"},
            {"color": "#0D9488", "size": "L", "stock": 10, "sku": "AT-TS-L-TL"},
        ],
    },
    {
        "name": "Straight Leg Blue Jeans",
        "slug": "straight-leg-blue-jeans",
        "description": "High-rise straight leg with classic blue wash and soft stretch.",
        "image_url": "/images/products/blue-jeans.png",
        "price": Decimal("479.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.65"),
        "stock": 14,
        "category_slugs": ["women", "jeans", "casual"],
        "primary_category": "jeans",
        "variants": [
            {"color": "#2563EB", "size": "32", "stock": 7, "sku": "SL-JN-32-BLU"},
            {"color": "#2563EB", "size": "34", "stock": 7, "sku": "SL-JN-34-BLU"},
        ],
    },
    {
        "name": "Minimal Pocket Tee",
        "slug": "minimal-pocket-tee",
        "description": "Heavyweight cotton tee with chest pocket and clean silhouette.",
        "image_url": "/images/products/black-tshirt.png",
        "price": Decimal("215.00"),
        "original_price": None,
        "discount_label": None,
        "rating": Decimal("4.38"),
        "stock": 28,
        "category_slugs": ["men", "t-shirts", "casual"],
        "primary_category": "t-shirts",
        "variants": [
            {"color": "#171717", "size": "M", "stock": 10, "sku": "MP-TS-M-BLK"},
            {"color": "#E5E5E5", "size": "M", "stock": 10, "sku": "MP-TS-M-GRY"},
            {"color": "#E5E5E5", "size": "L", "stock": 8, "sku": "MP-TS-L-GRY"},
        ],
    },
    {
        "name": "Relaxed Zip Hoodie",
        "slug": "relaxed-zip-hoodie",
        "description": "Easy zip hoodie in mid-weight fleece; kangaroo pockets.",
        "image_url": "/images/products/tải xuống (2).webp",
        "price": Decimal("399.00"),
        "original_price": Decimal("459.00"),
        "discount_label": "-13%",
        "rating": Decimal("4.50"),
        "stock": 19,
        "category_slugs": ["women", "hoodies", "party"],
        "primary_category": "hoodies",
        "variants": [
            {"color": "#7C3AED", "size": "S", "stock": 6, "sku": "RZ-HD-S-PUR"},
            {"color": "#7C3AED", "size": "M", "stock": 7, "sku": "RZ-HD-M-PUR"},
            {"color": "#18181B", "size": "M", "stock": 6, "sku": "RZ-HD-M-BLK"},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed catalog products with image URLs from project assets."

    @transaction.atomic
    def handle(self, *args, **options):
        category_map = {}
        for item in CATEGORY_SEEDS:
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "sort_order": item["sort_order"],
                    "is_active": True,
                },
            )
            category_map[item["slug"]] = category

        for item in DRESS_STYLE_SEEDS:
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "sort_order": item["sort_order"],
                    "image_url": item["image_url"],
                    "is_active": True,
                },
            )
            category_map[item["slug"]] = category

        created_count = 0
        updated_count = 0
        variant_count = 0

        for seed in PRODUCT_SEEDS:
            product_defaults = {
                "name": seed["name"],
                "description": seed["description"],
                "image_url": seed["image_url"],
                "price": seed["price"],
                "original_price": seed["original_price"],
                "discount_label": seed["discount_label"],
                "rating": seed["rating"],
                "stock": seed["stock"],
            }
            product, created = Product.objects.update_or_create(
                slug=seed["slug"],
                defaults=product_defaults,
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

            wanted_slugs = set(seed["category_slugs"])
            existing_links = ProductCategory.objects.filter(product=product).select_related("category")
            existing_slug_to_link = {link.category.slug: link for link in existing_links}

            # Remove stale mappings
            for slug, link in existing_slug_to_link.items():
                if slug not in wanted_slugs:
                    link.delete()

            # Upsert mappings
            for slug in seed["category_slugs"]:
                category = category_map[slug]
                ProductCategory.objects.update_or_create(
                    product=product,
                    category=category,
                    defaults={"is_primary": slug == seed["primary_category"]},
                )

            # Replace variants by unique key (color, size)
            for variant in seed["variants"]:
                ProductVariant.objects.update_or_create(
                    product=product,
                    color=variant["color"],
                    size=variant["size"],
                    defaults={
                        "stock": variant["stock"],
                        "sku": variant["sku"],
                    },
                )
                variant_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                (
                    "Catalog seed completed. "
                    f"Products created={created_count}, updated={updated_count}, "
                    f"variants upserted={variant_count}."
                )
            )
        )
