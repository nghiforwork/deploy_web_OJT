"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import ProductCard from "@/components/ProductCard/productCard";
import type { CatalogProduct } from "@/types/catalog";
import styles from "./page.module.scss";

const PRODUCT_IMAGES = [
  "/images/Image product/image 2.png",
  "/images/Image product/image 5.png",
  "/images/Image product/image 6.png",
];

const MOCK_PRODUCT = {
  id: 1,
  name: "ONE LIFE GRAPHIC TSHIRT",
  image: PRODUCT_IMAGES[0],
  images: PRODUCT_IMAGES,
  rating: 4.5,
  price: 260,
  originalPrice: 300,
  discountLabel: "-30%",
  description:
    "This graphic t-shirt which is perfect for any occasion. Crafted from a soft cotton blend, it offers superior comfort and style. The graphic print adds a touch of personality to your everyday look. Whether you're heading to a casual outing or just relaxing at home, this tee has you covered.",
  colors: [
    { name: "Olive", value: "#8B7355" },
    { name: "Dark Green", value: "#2D5016" },
    { name: "Navy", value: "#1e3a5f" },
  ],
  sizes: ["Small", "Medium", "Large", "X-Large"],
};

const MOCK_REVIEWS = [
  { id: 1, name: "Samantha D.", rating: 5, text: "The quality is amazing! Fits perfectly and the fabric is so soft. Will definitely buy again.", date: "August 15, 2023", verified: true },
  { id: 2, name: "James M.", rating: 5, text: "Love the design and the fit. Exactly as described. Fast shipping too.", date: "August 12, 2023", verified: true },
  { id: 3, name: "Emily R.", rating: 4, text: "Great t-shirt, runs a bit large. Would recommend sizing down.", date: "August 10, 2023", verified: false },
  { id: 4, name: "David K.", rating: 5, text: "Perfect for casual wear. The graphic is crisp and the material is comfortable.", date: "August 8, 2023", verified: true },
  { id: 5, name: "Lisa T.", rating: 4, text: "Really nice shirt. Good value for money.", date: "August 5, 2023", verified: true },
  { id: 6, name: "Michael P.", rating: 5, text: "Excellent product. Would recommend to anyone looking for a quality graphic tee.", date: "August 3, 2023", verified: true },
];

const RELATED_PRODUCTS: CatalogProduct[] = [
  {
    id: 2,
    name: "Polo with Contrast Trims",
    slug: "polo-with-contrast-trims",
    image_url: "/images/Image product/image 7.png",
    rating: 4.5,
    price: 212,
    original_price: 232,
    discount_label: "-20%",
  },
  {
    id: 3,
    name: "Black Striped T-shirt",
    slug: "black-striped-t-shirt",
    image_url: "/images/Image product/image 8.png",
    rating: 5.0,
    price: 120,
    original_price: 160,
    discount_label: "-30%",
  },
  {
    id: 4,
    name: "Gradient Graphic T-shirt",
    slug: "gradient-graphic-t-shirt",
    image_url: "/images/Image product/image 9.png",
    rating: 4.0,
    price: 145,
  },
  {
    id: 5,
    name: "Checkered Shirt",
    slug: "checkered-shirt",
    image_url: "/images/Image product/image 10.png",
    rating: 4.5,
    price: 180,
  },
];

type TabId = "details" | "reviews" | "faq";

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2); // Large
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("reviews");

  const product = MOCK_PRODUCT;

  return (
    <main>
      <Navigation />
      <section className={styles.productSection}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSep}>&gt;</span>
            <Link href="#">Shop</Link>
            <span className={styles.breadcrumbSep}>&gt;</span>
            <Link href="#">Men</Link>
            <span className={styles.breadcrumbSep}>&gt;</span>
            <span>T-shirts</span>
          </nav>

          {/* Product layout: 2-column grid */}
          <div className={styles.productLayout}>
            {/* Left: Thumbnails column + Main image */}
            <div className={styles.imageColumn}>
              <div className={styles.thumbnailsColumn}>
                {product.images.slice(0, 3).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.thumb} ${selectedImage === i ? styles.thumbActive : ""}`}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
              <div className={styles.mainImage}>
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.mainImg}
                  priority
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className={styles.infoColumn}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={styles.starWrap}>
                      <StarIcon filled={i <= Math.floor(product.rating)} />
                    </span>
                  ))}
                </div>
                <span className={styles.ratingText}>{product.rating}/5</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price}>${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>${product.originalPrice}</span>
                    {product.discountLabel && (
                      <span className={styles.discountTag}>{product.discountLabel}</span>
                    )}
                  </>
                )}
              </div>
              <p className={styles.description}>{product.description}</p>

              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>Select Colors</span>
                <div className={styles.colorSwatches}>
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`${styles.colorSwatch} ${selectedColor === i ? styles.colorSwatchActive : ""}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setSelectedColor(i)}
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
                  {product.sizes.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.sizeBtn} ${selectedSize === i ? styles.sizeBtnActive : ""}`}
                      onClick={() => setSelectedSize(i)}
                    >
                      {s}
                    </button>
                  ))}
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
                <Link href="/cart" className={styles.addToCartBtn}>
                  Add to Cart
                </Link>
              </div>
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

          {/* You might also like */}
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>YOU MIGHT ALSO LIKE</h2>
            <div className={styles.relatedGrid}>
              {RELATED_PRODUCTS.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className={styles.relatedCard}>
                  <ProductCard product={p} />
                </Link>
              ))}
            </div>
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
