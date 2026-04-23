import type { CatalogProduct } from "@/types/catalog";

const PLACEHOLDER_IMAGE = "/images/Image product/image 2.png";

const IMAGE_FALLBACK_BY_SLUG: Record<string, string> = {
  "black-orange-tshirt": "/images/products/black-orange-tshirt.png",
  "purple-shirt": "/images/products/25143838_55536476_600.webp",
  "black-jeans": "/images/products/black-jeans.png",
  "moss-green-tshirt": "/images/products/moss-green-tshirt.png",
  "gradient-graphic-tshirt": "/images/products/orange-tshirt.png",
  "relaxed-zip-hoodie": "/images/products/tải xuống (2).webp",
  "basic-white-tee": "/images/products/basic_white_tee.webp",
};

export function resolveCatalogProductImageSrc(product: CatalogProduct): string {
  const rawImage = product.image_url?.trim();
  const mappedFallback = IMAGE_FALLBACK_BY_SLUG[product.slug ?? ""];
  const imageSrc = rawImage && rawImage !== "" ? rawImage : mappedFallback ?? PLACEHOLDER_IMAGE;
  return encodeURI(imageSrc);
}
