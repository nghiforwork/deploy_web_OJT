"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import ProductCard from "@/components/ProductCard/productCard";
import type { CatalogProduct } from "@/types/catalog";
import {
  fetchCatalogProductDetail,
  fetchCatalogProductDetailByNumericId,
  fetchCatalogProducts,
} from "@/services/catalog.service";
import { getAuthSession } from "@/services/authService";
import { addCartItem } from "@/services/cart.service";
import { resolveCatalogProductImageSrc } from "@/utils/catalogProductImage";
import styles from "./page.module.scss";

function normalizeVariantColor(value: string): string {
  let s = String(value).trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(s)) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    s = `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}

/** Cùng logic với useMemo uiModel — dùng lại khi add để luôn khớp `fresh` từ API. */
function buildColorSizeOptionsFromProduct(p: CatalogProduct): {
  colorEntries: { name: string; value: string }[];
  sizes: string[];
} {
  const variants = p.variants ?? [];
  const colorValues = Array.from(new Set(variants.map((v) => v.color))).filter(Boolean);
  const sizes = Array.from(new Set(variants.map((v) => v.size))).filter(Boolean);
  return {
    colorEntries: colorValues.map((value) => ({ name: value, value })),
    sizes,
  };
}

function normalizeVariantSize(value: string): string {
  return String(value).trim().toLowerCase();
}

function resolveVariantId(
  p: CatalogProduct,
  colorHex: string,
  sizeLabel: string,
): number | undefined {
  const variants = p.variants ?? [];
  if (variants.length === 0) return undefined;
  const colorKey = normalizeVariantColor(colorHex);
  const sizeKey = normalizeVariantSize(sizeLabel);
  const match = variants.find(
    (v) => normalizeVariantColor(String(v.color)) === colorKey && normalizeVariantSize(String(v.size)) === sizeKey,
  );
  if (!match) return undefined;
  const raw = (match as { id?: unknown }).id;
  if (raw == null || raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const MOCK_REVIEWS = [
  { id: 1, name: "Samantha D.", rating: 5, text: "The quality is amazing! Fits perfectly and the fabric is so soft. Will definitely buy again.", date: "August 15, 2023", verified: true },
  { id: 2, name: "James M.", rating: 5, text: "Love the design and the fit. Exactly as described. Fast shipping too.", date: "August 12, 2023", verified: true },
  { id: 3, name: "Emily R.", rating: 4, text: "Great t-shirt, runs a bit large. Would recommend sizing down.", date: "August 10, 2023", verified: false },
  { id: 4, name: "David K.", rating: 5, text: "Perfect for casual wear. The graphic is crisp and the material is comfortable.", date: "August 8, 2023", verified: true },
  { id: 5, name: "Lisa T.", rating: 4, text: "Really nice shirt. Good value for money.", date: "August 5, 2023", verified: true },
  { id: 6, name: "Michael P.", rating: 5, text: "Excellent product. Would recommend to anyone looking for a quality graphic tee.", date: "August 3, 2023", verified: true },
];

const DRESS_STYLE_SLUGS = new Set(["casual", "formal", "party", "gym"]);

const PRODUCT_IMAGE_THUMB_SLOTS = 3;

/** Breadcrumb: Home → Shop → Men|Women (if any) → primary type category → current product name. */
function buildProductBreadcrumbSegments(product: CatalogProduct): { label: string; href: string }[] {
  const segments: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/category/all" },
  ];
  const cats = product.categories ?? [];
  const dept = cats.find((c) => c.slug === "men" || c.slug === "women");
  let typeCat = product.primary_category ?? null;
  if (typeCat && DRESS_STYLE_SLUGS.has(typeCat.slug)) {
    typeCat = cats.find((c) => !DRESS_STYLE_SLUGS.has(c.slug)) ?? typeCat;
  }
  if (dept) {
    segments.push({ label: dept.name, href: `/category/${dept.slug}` });
  }
  if (typeCat && typeCat.slug !== dept?.slug) {
    segments.push({ label: typeCat.name, href: `/category/${typeCat.slug}` });
  }
  return segments;
}

/** Slug cho API related: primary / category không phải dress-style, hoặc dress-style nếu chỉ có loại đó. */
function pickRelatedCatalogQuery(product: CatalogProduct): {
  categorySlug?: string | null;
  dressStyleSlug?: string | null;
} | null {
  const primary = product.primary_category;
  if (primary && !DRESS_STYLE_SLUGS.has(primary.slug)) {
    return { categorySlug: primary.slug };
  }
  const cats = product.categories ?? [];
  const nonDress = cats.find((c) => !DRESS_STYLE_SLUGS.has(c.slug));
  if (nonDress) {
    return { categorySlug: nonDress.slug };
  }
  const onlyDress = cats.find((c) => DRESS_STYLE_SLUGS.has(c.slug));
  if (onlyDress) {
    return { dressStyleSlug: onlyDress.slug };
  }
  return null;
}

type TabId = "details" | "reviews" | "faq";

export default function ProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ productID: string }>();
  const productID = params?.productID;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("reviews");

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartActionError, setCartActionError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!productID) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCatalogProductDetail(productID);
        if (cancelled) return;
        setProduct(data);
        setSelectedImage(0);
        setSelectedColor(0);
        setSelectedSize(0);
      } catch {
        if (cancelled) return;
        setError(
          "Unable to load product. Check that the API is running and NEXT_PUBLIC_API matches your Django server.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [productID]);

  useEffect(() => {
    if (!product) {
      setRelatedProducts([]);
      setRelatedLoading(false);
      return;
    }
    const current = product;
    let cancelled = false;
    async function loadRelated() {
      setRelatedLoading(true);
      try {
        const query = pickRelatedCatalogQuery(current);
        if (!query) {
          if (!cancelled) setRelatedProducts([]);
          return;
        }
        const { results } = await fetchCatalogProducts({
          categorySlug: query.categorySlug ?? undefined,
          dressStyleSlug: query.dressStyleSlug ?? undefined,
          pageSize: 12,
          ordering: "-created_at",
        });
        const filtered = results.filter((p) => p.id !== current.id).slice(0, 4);
        if (!cancelled) setRelatedProducts(filtered);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }
    void loadRelated();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const uiModel = useMemo(() => {
    if (!product) return null;

    const imageSrc = resolveCatalogProductImageSrc(product);

    const { colorEntries, sizes } = buildColorSizeOptionsFromProduct(product);

    const rating = Number(product.rating ?? 0);
    const price = Number(product.price ?? 0);
    const originalPrice = product.original_price == null ? null : Number(product.original_price);

    return {
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      imageSrc,
      rating: Number.isFinite(rating) ? rating : 0,
      price: Number.isFinite(price) ? price : 0,
      originalPrice: originalPrice != null && Number.isFinite(originalPrice) ? originalPrice : null,
      discountLabel: product.discount_label ?? null,
      colors: colorEntries,
      sizes,
    };
  }, [product]);

  const isComboValid = useMemo(() => {
    const variants = product?.variants ?? [];
    return (colorHex: string, sizeLabel: string) =>
      variants.some(
        (v) =>
          normalizeVariantColor(String(v.color)) === normalizeVariantColor(colorHex) &&
          normalizeVariantSize(String(v.size)) === normalizeVariantSize(sizeLabel),
      );
  }, [product]);

  const handleSelectColor = useCallback(
    (index: number) => {
      setSelectedColor(index);
      if (!uiModel) return;
      const c = uiModel.colors[index]?.value ?? "";
      setSelectedSize((prev) => {
        const sizeVal = uiModel.sizes[prev] ?? "";
        if (isComboValid(c, sizeVal)) return prev;
        const next = uiModel.sizes.findIndex((s) => isComboValid(c, s));
        return next >= 0 ? next : prev;
      });
    },
    [uiModel, isComboValid],
  );

  const handleSelectSize = useCallback(
    (index: number) => {
      setSelectedSize(index);
      if (!uiModel) return;
      const s = uiModel.sizes[index] ?? "";
      setSelectedColor((prev) => {
        const colorVal = uiModel.colors[prev]?.value ?? "";
        if (isComboValid(colorVal, s)) return prev;
        const next = uiModel.colors.findIndex((col) => isComboValid(col.value, s));
        return next >= 0 ? next : prev;
      });
    },
    [uiModel, isComboValid],
  );

  const breadcrumbSegments = useMemo(() => (product ? buildProductBreadcrumbSegments(product) : []), [product]);

  if (loading) {
    return (
      <main>
        <Navigation />
        <section className={styles.productSection}>
          <div className={styles.container}>Loading...</div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !uiModel) {
    return (
      <main>
        <Navigation />
        <section className={styles.productSection}>
          <div className={styles.container}>{error ?? "Product not found."}</div>
        </section>
        <Footer />
      </main>
    );
  }

  async function handleAddToCart() {
    setCartActionError(null);
    if (!product || !uiModel) return;
    const authSession = getAuthSession();
    if (!authSession?.access) {
      router.push(`/?auth=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      /* Luôn dùng màu/size theo UI (uiModel) — thứ tự swatch/size khớp lựa chọn người dùng.
         Dùng `fresh` chỉ để resolve id: thứ tự `variants` trên API có thể khác Set trên `fresh` vs `product`. */
      const colorVal = uiModel.colors[selectedColor]?.value ?? "";
      const sizeVal = String(uiModel.sizes[selectedSize] ?? "");
      /* Bước 1: theo URL (slug hoặc id). Bước 2: luôn GET lại theo id số để có đủ variants[].id (slug→list đôi khi mỏng). */
      let fresh = await fetchCatalogProductDetail(productID ?? product.id);
      const pid = Number(fresh.id);
      if (Number.isFinite(pid) && pid > 0) {
        fresh = await fetchCatalogProductDetailByNumericId(pid);
      }
      setProduct(fresh);
      const variantId = resolveVariantId(fresh, colorVal, sizeVal);
      const catalogRequiresVariant = (fresh.variants?.length ?? 0) > 0;
      const uiShowsVariantPickers = uiModel.colors.length > 0 && uiModel.sizes.length > 0;
      if ((catalogRequiresVariant || uiShowsVariantPickers) && variantId == null) {
        setCartActionError("Please select a valid color and size combination.");
        return;
      }
      await addCartItem(fresh.id, quantity, variantId);
      router.push("/cart");
    } catch {
      setCartActionError("Unable to add this product to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <main>
      <Navigation />
      <section className={styles.productSection}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumbSegments.map((seg, i) => (
              <React.Fragment key={`${seg.href}-${seg.label}-${i}`}>
                {i > 0 ? <span className={styles.breadcrumbSep}>&gt;</span> : null}
                <Link href={seg.href}>{seg.label}</Link>
              </React.Fragment>
            ))}
            <span className={styles.breadcrumbSep}>&gt;</span>
            <span aria-current="page">{uiModel.name}</span>
          </nav>

          {/* Product layout: 2-column grid */}
          <div className={styles.productLayout}>
            <div className={styles.imageColumn}>
              <div className={styles.thumbnailsColumn}>
                {Array.from({ length: PRODUCT_IMAGE_THUMB_SLOTS }, (_, i) => (
                  <button
                    key={`product-image-thumb-${i}`}
                    type="button"
                    className={`${styles.thumb} ${selectedImage === i ? styles.thumbActive : ""}`}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`Product image ${i + 1}`}
                  >
                    <Image src={uiModel.imageSrc} alt="" fill sizes="120px" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
              <div className={styles.mainImage}>
                <Image
                  src={uiModel.imageSrc}
                  alt={uiModel.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.mainImg}
                  priority
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className={styles.infoColumn}>
              <h1 className={styles.productTitle}>{uiModel.name}</h1>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={styles.starWrap}>
                      <StarIcon filled={i <= Math.floor(uiModel.rating)} />
                    </span>
                  ))}
                </div>
                <span className={styles.ratingText}>{uiModel.rating}/5</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>${uiModel.price}</span>
                {uiModel.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>${uiModel.originalPrice}</span>
                    {uiModel.discountLabel && (
                      <span className={styles.discountTag}>{uiModel.discountLabel}</span>
                    )}
                  </>
                )}
              </div>
              <p className={styles.description}>{uiModel.description}</p>

              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>Select Colors</span>
                <div className={styles.colorSwatches}>
                  {uiModel.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`${styles.colorSwatch} ${selectedColor === i ? styles.colorSwatchActive : ""}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => handleSelectColor(i)}
                      aria-label={c.name}
                      title={c.name}
                    >
                      {selectedColor === i && <CheckmarkIcon className={styles.colorCheck} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.optionDivider} />

              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>Choose Size</span>
                <div className={styles.sizeButtons}>
                  {uiModel.sizes.map((s, i) => {
                    const colorForSize = uiModel.colors[selectedColor]?.value ?? "";
                    const sizeUnavailable = !isComboValid(colorForSize, s);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={sizeUnavailable}
                        className={`${styles.sizeBtn} ${selectedSize === i ? styles.sizeBtnActive : ""} ${sizeUnavailable ? styles.sizeBtnDisabled : ""}`}
                        onClick={() => handleSelectSize(i)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.optionDivider} />

              <div className={styles.actionRow}>
                <div className={styles.quantitySelector}>
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase">
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
              {cartActionError && <p className={styles.description}>{cartActionError}</p>}
            </div>
          </div>

          {/* Tabs - căn giữa */}
          <div className={styles.tabsWrapper}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={activeTab === "details" ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab("details")}
              >
                Product Details
              </button>
              <button
                type="button"
                className={activeTab === "reviews" ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab("reviews")}
              >
                Rating &amp; Reviews
              </button>
              <button type="button" className={activeTab === "faq" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("faq")}>
                FAQs
              </button>
            </div>
            <div className={styles.tabDivider} />
          </div>

          {/* Nội dung tab - căn giữa */}
          <div className={styles.tabContentWrapper}>
          {/* Tab content: Reviews (default) */}
          {activeTab === "reviews" && (
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.reviewsTitle}>All Reviews (451)</h2>
                <div className={styles.reviewsActions}>
                  <button type="button" className={styles.filterBtn} aria-label="Filter">
                    <FilterIcon />
                  </button>
                  <div className={styles.sortDropdown}>
                    <span>Latest</span>
                    <ChevronDownIcon />
                  </div>
                  <button type="button" className={styles.writeReviewBtn}>
                    Write a Review
                  </button>
                </div>
              </div>
              <div className={styles.reviewGrid}>
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewCardTop}>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={styles.starWrap}>
                            <StarIcon filled={i <= r.rating} />
                          </span>
                        ))}
                      </div>
                      <button type="button" className={styles.dotsBtn} aria-label="More options">
                        <DotsIcon />
                      </button>
                    </div>
                    <p className={styles.reviewerName}>
                      {r.name}
                      {r.verified && <CheckmarkIcon className={styles.reviewCheck} />}
                    </p>
                    <p className={styles.reviewText}>{r.text}</p>
                    <p className={styles.reviewDate}>Posted on {r.date}</p>
                  </div>
                ))}
              </div>
              <div className={styles.loadMoreWrap}>
                <button type="button" className={styles.loadMoreBtn}>
                  Load More Reviews
                </button>
              </div>
            </div>
          )}
          {activeTab === "details" && (
            <div className={styles.tabContent}>
              <p>Product details content – materials, care instructions, etc.</p>
            </div>
          )}
          {activeTab === "faq" && (
            <div className={styles.tabContent}>
              <p>FAQs content.</p>
            </div>
          )}
          </div>

          {/* You might also like — từ catalog theo category / dress-style */}
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>YOU MIGHT ALSO LIKE</h2>
            {relatedLoading ? (
              <p className={styles.tabContent}>Loading suggestions…</p>
            ) : relatedProducts.length === 0 ? (
              <p className={styles.tabContent}>No related products to show.</p>
            ) : (
              <div className={styles.relatedGrid}>
                {relatedProducts.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className={styles.relatedCard}>
                    <ProductCard product={p} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#FFC633" : "none"} stroke={filled ? "#FFC633" : "#e5e7eb"} strokeWidth="2" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
