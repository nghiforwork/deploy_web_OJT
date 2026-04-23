"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import { getAuthSession } from "@/services/authService";
import { deleteCartItem, fetchMyCart, updateCartItem, type CartDto, type CartItemDto } from "@/services/cart.service";
import styles from "./page.module.scss";

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "black-orange-tshirt": "/images/products/black-orange-tshirt.png",
  "purple-shirt": "/images/products/purple-shirt.png",
  "black-jeans": "/images/products/black-jeans.png",
  "moss-green-tshirt": "/images/products/moss-green-tshirt.png",
  "gradient-graphic-tshirt": "/images/Image product/image 9.png",
  "gray-zip-hoodie": "/images/Image product/image 7.png",
  "basic-white-tee": "/images/Image product/image 10.png",
};

const FALLBACK_IMAGE_BY_PRODUCT_ID: Record<number, string> = {
  1: "/images/products/black-orange-tshirt.png",
  2: "/images/products/purple-shirt.png",
  3: "/images/products/black-jeans.png",
  5: "/images/Image product/image 9.png",
  6: "/images/Image product/image 7.png",
  7: "/images/Image product/image 10.png",
  25: "/images/products/moss-green-tshirt.png",
  26: "/images/Image product/image 9.png",
};

function cartItemHasVariant(item: CartItemDto): boolean {
  if (item.variant_color || item.variant_size) return true;
  const raw = item.product_variant_id;
  if (raw === null || raw === undefined) return false;
  if (typeof raw === "number") return Number.isFinite(raw) && raw > 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0;
}

function resolveProductImage(item: CartItemDto): string {
  const raw = item.product_image_url?.trim();
  if (raw) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return encodeURI(raw);
    if (raw.startsWith("/")) return encodeURI(raw);
    return encodeURI(`/${raw}`);
  }

  const slugFallback = FALLBACK_IMAGE_BY_SLUG[item.product_slug];
  if (slugFallback) return slugFallback;

  const idFallback = FALLBACK_IMAGE_BY_PRODUCT_ID[item.product_id];
  if (idFallback) return idFallback;

  return "/images/Image product/image 2.png";
}

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartDto | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [clearingLegacy, setClearingLegacy] = useState(false);

  useEffect(() => {
    const authSession = getAuthSession();
    if (!authSession?.access) {
      router.replace(`/?auth=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsCheckingAuth(false);
  }, [pathname, router]);

  useEffect(() => {
    if (isCheckingAuth) return;

    let cancelled = false;
    async function loadCart() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyCart();
        if (cancelled) return;
        setCart(data);
      } catch {
        if (cancelled) return;
        setError("Unable to load cart. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCart();
    return () => {
      cancelled = true;
    };
  }, [isCheckingAuth]);

  const legacyItems = useMemo(
    () => (cart?.items ?? []).filter((i) => !cartItemHasVariant(i)),
    [cart],
  );

  if (isCheckingAuth) {
    return null;
  }

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal_amount ?? 0);
  const discountAmount = Number(cart?.discount_amount ?? 0);
  const deliveryFee = Number(cart?.shipping_amount ?? 0);
  const total = Number(cart?.total_amount ?? 0);
  const discountPercent = subtotal ? Math.round((discountAmount / subtotal) * 100) : 0;

  const updateQuantity = async (id: number, delta: number) => {
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) return;
    const nextQty = Math.max(1, currentItem.quantity + delta);
    try {
      const updatedCart = await updateCartItem(id, nextQty);
      setCart(updatedCart);
    } catch {
      setError("Unable to update quantity. Please try again.");
    }
  };

  const removeItem = async (id: number) => {
    try {
      const updatedCart = await deleteCartItem(id);
      setCart(updatedCart);
    } catch {
      setError("Unable to remove item. Please try again.");
    }
  };

  const removeLegacyLines = async () => {
    if (legacyItems.length === 0) return;
    setClearingLegacy(true);
    setError(null);
    try {
      for (const it of legacyItems) {
        await deleteCartItem(it.id);
      }
      setCart(await fetchMyCart());
    } catch {
      setError("Unable to remove legacy cart lines. Please try again.");
    } finally {
      setClearingLegacy(false);
    }
  };

  return (
    <main>
      <Navigation />
      <section className={styles.cartSection}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSep} aria-hidden>&gt;</span>
            <span>Cart</span>
          </nav>
          <h1 className={styles.pageTitle}>YOUR CART</h1>
          {error && <p className={styles.emptyCart}>{error}</p>}
          {legacyItems.length > 0 ? (
            <div className={styles.legacyBanner} role="status">
              <p>
                {legacyItems.length} line(s) were saved before color/size could be stored. Remove them, then add
                products again from the product page so each variant shows correctly.
              </p>
              <button
                type="button"
                className={styles.legacyBannerBtn}
                disabled={clearingLegacy}
                onClick={() => void removeLegacyLines()}
              >
                {clearingLegacy ? "Removing…" : "Remove legacy lines"}
              </button>
            </div>
          ) : null}

          <div className={styles.cartContent}>
            {/* Left: Cart Items */}
            <section className={styles.cartItems}>
              {loading ? (
                <p className={styles.emptyCart}>Loading cart...</p>
              ) : items.length === 0 ? (
                <p className={styles.emptyCart}>Your cart is empty.</p>
              ) : (
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.cartItem}>
                      <div className={styles.itemImage}>
                        <Image
                          src={resolveProductImage(item)}
                          alt={item.product_name}
                          fill
                          sizes="(max-width: 479px) 80px, (max-width: 767px) 100px, 120px"
                          className={styles.itemImg}
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemTitle}>{item.product_name}</h3>
                        <p className={styles.itemMeta}>
                          {cartItemHasVariant(item) ? (
                            <span className={styles.variantLine}>
                              {item.variant_color ? (
                                <span
                                  className={styles.variantSwatch}
                                  style={{ backgroundColor: item.variant_color }}
                                  title={item.variant_color}
                                  aria-hidden
                                />
                              ) : null}
                              <span>
                                {item.variant_size ? <>Size: {item.variant_size}</> : null}
                                {item.variant_size && item.variant_color ? " · " : null}
                                {item.variant_color ? <>Color: {item.variant_color}</> : null}
                                {!item.variant_size && !item.variant_color ? (
                                  <>Variant #{item.product_variant_id}</>
                                ) : null}
                              </span>
                            </span>
                          ) : (
                            <>
                              Product #{item.product_id}
                              <span className={styles.itemMetaHint}>
                                {" "}
                                — no variant on this line. Remove it and re-add from the product page to save
                                color/size.
                              </span>
                            </>
                          )}
                        </p>
                        <p className={styles.itemPrice}>${Number(item.line_total).toFixed(2)}</p>
                        {item.quantity > 1 ? (
                          <p className={styles.itemPriceBreakdown}>
                            {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                          </p>
                        ) : null}
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <TrashIcon />
                        </button>
                        <div className={styles.quantitySelector}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Right: Order Summary */}
            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Discount (-{discountPercent}%)</span>
                  <span className={styles.discountPrice}>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotalRow}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className={styles.promoRow}>
                <div className={styles.promoInputWrap}>
                  <TagIcon />
                  <input
                    type="text"
                    placeholder="Add promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={styles.promoInput}
                    aria-label="Promo code"
                  />
                </div>
                <button type="button" className={styles.applyBtn}>Apply</button>
              </div>
              {items.length === 0 ? (
                <span className={`${styles.checkoutBtn} ${styles.checkoutBtnDisabled}`} aria-disabled="true">
                  Go to Checkout
                  <ArrowRightIcon />
                </span>
              ) : (
                <Link href="/orders/checkout" className={styles.checkoutBtn}>
                  Go to Checkout
                  <ArrowRightIcon />
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
