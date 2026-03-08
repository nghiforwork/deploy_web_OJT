"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import styles from "./page.module.scss";

const MOCK_CART_ITEMS = [
  { id: 1, title: "Gradient T-Shirt", size: "Large", color: "Black", price: 145, quantity: 1, image: "/images/Image cart/image 8.png" },
  { id: 2, title: "Casual Shirt", size: "L", color: "Navy", price: 89, quantity: 2, image: "/images/Image cart/image 9.png" },
  { id: 3, title: "Slim Fit Jeans", size: "32", color: "Blue", price: 120, quantity: 1, image: "/images/Image cart/image 10.png" },
];

export default function CartPage() {
  const [items, setItems] = useState(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountPercent = 20;
  const discountAmount = (subtotal * discountPercent) / 100;
  const deliveryFee = 15;
  const total = subtotal - discountAmount + deliveryFee;

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

          <div className={styles.cartContent}>
            {/* Left: Cart Items */}
            <section className={styles.cartItems}>
              {items.length === 0 ? (
                <p className={styles.emptyCart}>Your cart is empty.</p>
              ) : (
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.cartItem}>
                      <div className={styles.itemImage}>
                        {item.image && (
                          <Image src={item.image} alt={item.title} fill sizes="(max-width: 479px) 80px, (max-width: 767px) 100px, 120px" className={styles.itemImg} />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <p className={styles.itemMeta}>Size: {item.size} | Color: {item.color}</p>
                        <p className={styles.itemPrice}>${item.price * item.quantity}</p>
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
              <Link href="#" className={styles.checkoutBtn}>
                Go to Checkout
                <ArrowRightIcon />
              </Link>
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
