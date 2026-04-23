"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import { getAuthSession } from "@/services/authService";
import { cancelOrder, fetchOrderDetail, type CancelOrderReason, type OrderDetailDto } from "@/services/order.service";
import styles from "./page.module.scss";

const CANCEL_REASONS: { value: CancelOrderReason; label: string }[] = [
  { value: "changed_mind", label: "Changed my mind" },
  { value: "wrong_items", label: "Ordered wrong items" },
  { value: "found_better_price", label: "Found a better price" },
  { value: "delivery_too_slow", label: "Delivery is too slow" },
  { value: "other", label: "Other" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const orderId = Number(params.orderId);

  const [authGate, setAuthGate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelOrderReason>("changed_mind");
  const [cancelNote, setCancelNote] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access) {
      router.replace(`/?auth=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthGate(false);
  }, [pathname, router]);

  useEffect(() => {
    if (authGate || !Number.isFinite(orderId) || orderId < 1) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderDetail(orderId);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setError("Order not found or you do not have access.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authGate, orderId]);

  if (authGate) return null;

  const canCancel = order?.status === "pending" || order?.status === "paid";

  async function handleConfirmCancel() {
    if (!Number.isFinite(orderId) || orderId < 1) return;
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      await cancelOrder(orderId, { reason: cancelReason, note: cancelNote });
      router.replace("/orders");
    } catch {
      setCancelError("Unable to cancel this order. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  }

  return (
    <main>
      <Navigation />
      <section className={styles.section}>
        <div className={styles.container}>
          <Link href="/orders" className={styles.backLink}>
            ← All orders
          </Link>

          {loading ? (
            <p className={styles.meta}>Loading…</p>
          ) : error || !order ? (
            <p className={styles.error}>{error ?? "Unable to load order."}</p>
          ) : (
            <>
              <h1 className={styles.title}>Order #{order.order_number ?? order.id}</h1>
              <p className={styles.meta}>
                Placed {new Date(order.created_at).toLocaleString()} · Status: {order.status}
              </p>

              {canCancel ? (
                <div className={styles.actionsRow}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setCancelOpen(true)}>
                    Cancel order
                  </button>
                </div>
              ) : null}

              <div className={styles.grid}>
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Shipping</h2>
                  <p className={styles.rowMuted}>{order.shipping_full_name}</p>
                  <p className={styles.rowMuted}>{order.shipping_phone}</p>
                  <p className={styles.rowMuted}>
                    {order.shipping_address_line1}, {order.shipping_city}
                    {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}
                  </p>
                  <h2 className={styles.panelTitle} style={{ marginTop: 20 }}>
                    Payment
                  </h2>
                  <p className={styles.rowMuted}>
                    {String(order.payment_method).replace(/_/g, " ")}
                  </p>
                </div>

                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>Summary</h2>
                  <div className={styles.row}>
                    <span>Subtotal</span>
                    <span>${Number(order.subtotal_amount).toFixed(2)}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Discount</span>
                    <span>-${Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Shipping</span>
                    <span>${Number(order.shipping_amount).toFixed(2)}</span>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>

                  <h2 className={styles.panelTitle} style={{ marginTop: 24 }}>
                    Items
                  </h2>
                  <ul className={styles.itemList}>
                    {order.items.map((it) => (
                      <li key={it.id} className={styles.item}>
                        <p className={styles.itemName}>{it.product_name}</p>
                        {(it.variant_color || it.variant_size) && (
                          <p className={styles.itemSub}>
                            Color: {it.variant_color || "—"} · Size: {it.variant_size || "—"}
                          </p>
                        )}
                        <p className={styles.itemSub}>
                          ${Number(it.unit_price).toFixed(2)} × {it.quantity} = $
                          {Number(it.line_total).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />

      {cancelOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Cancel order">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Cancel order #{order?.order_number ?? orderId}
              </h2>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  if (cancelSubmitting) return;
                  setCancelOpen(false);
                  setCancelError(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className={styles.modalHelp}>Select a reason. This will permanently delete the order.</p>

            <label className={styles.fieldLabel} htmlFor="cancel-reason">
              Reason
            </label>
            <select
              id="cancel-reason"
              className={styles.select}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value as CancelOrderReason)}
              disabled={cancelSubmitting}
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <label className={styles.fieldLabel} htmlFor="cancel-note">
              Note (optional)
            </label>
            <textarea
              id="cancel-note"
              className={styles.textarea}
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              disabled={cancelSubmitting}
              rows={3}
              placeholder="Add more details…"
            />

            {cancelError ? <p className={styles.modalError}>{cancelError}</p> : null}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  if (cancelSubmitting) return;
                  setCancelOpen(false);
                  setCancelError(null);
                }}
                disabled={cancelSubmitting}
              >
                Keep order
              </button>
              <button type="button" className={styles.dangerBtn} onClick={handleConfirmCancel} disabled={cancelSubmitting}>
                {cancelSubmitting ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
