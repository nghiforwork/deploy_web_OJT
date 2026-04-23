"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import { getAuthSession } from "@/services/authService";
import { fetchMyCart, type CartDto } from "@/services/cart.service";
import { checkoutFromCart, type PaymentMethod } from "@/services/order.service";
import styles from "./page.module.scss";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Credit / debit card" },
  { value: "cod", label: "Cash on delivery" },
  { value: "bank_transfer", label: "Bank transfer" },
];

export default function OrderCheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [authGate, setAuthGate] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [cart, setCart] = useState<CartDto | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access) {
      router.replace(`/?auth=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthGate(false);
  }, [pathname, router]);

  useEffect(() => {
    if (authGate) return;
    let cancelled = false;
    async function load() {
      setCartLoading(true);
      setCartError(null);
      try {
        const data = await fetchMyCart();
        if (!cancelled) {
          setCart(data);
          if (!data.items?.length) {
            router.replace("/cart");
          }
        }
      } catch {
        if (!cancelled) setCartError("Unable to load your cart.");
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authGate, router]);

  if (authGate) return null;

  const items = cart?.items ?? [];
  const total = Number(cart?.total_amount ?? 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await checkoutFromCart({
        payment_method: paymentMethod,
        shipping_full_name: fullName.trim(),
        shipping_phone: phone.trim(),
        shipping_address_line1: address1.trim(),
        shipping_city: city.trim(),
        shipping_postal_code: postal.trim(),
      });
      router.push(`/orders/${created.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Checkout failed. Please check stock and try again.";
      setSubmitError(typeof msg === "string" ? msg : "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Navigation />
      <section className={styles.section}>
        <div className={styles.container}>
          <Link href="/cart" className={styles.backLink}>
            ← Back to cart
          </Link>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>Choose payment and enter shipping details to place your order.</p>

          {cartError ? <p className={styles.error}>{cartError}</p> : null}

          {cartLoading ? (
            <p className={styles.hint}>Loading cart…</p>
          ) : (
            <div className={styles.layout}>
              <aside className={styles.summary}>
                <h2 className={styles.summaryTitle}>Order summary</h2>
                {items.map((it) => (
                  <div key={it.id} className={styles.line}>
                    <span className={styles.lineName}>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span>${Number(it.line_total).toFixed(2)}</span>
                  </div>
                ))}
                <div className={styles.totalLine}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </aside>

              <form className={styles.form} onSubmit={onSubmit}>
                <fieldset className={styles.field} style={{ border: "none", margin: 0, padding: 0 }}>
                  <legend className={styles.label}>Payment method</legend>
                  <div className={styles.paymentOptions}>
                    {PAYMENT_OPTIONS.map((opt) => (
                      <label key={opt.value} className={styles.radioRow}>
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    className={styles.input}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="address1">
                    Address
                  </label>
                  <input
                    id="address1"
                    className={styles.input}
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    required
                    autoComplete="address-line1"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    autoComplete="address-level2"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="postal">
                    Postal code (optional)
                  </label>
                  <input
                    id="postal"
                    className={styles.input}
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    autoComplete="postal-code"
                  />
                </div>

                {submitError ? <p className={styles.error}>{submitError}</p> : null}

                <button type="submit" className={styles.submitBtn} disabled={submitting || items.length === 0}>
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
