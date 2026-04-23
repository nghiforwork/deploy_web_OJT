"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import { getAuthSession } from "@/services/authService";
import { fetchMyOrders, type OrderListItemDto } from "@/services/order.service";
import styles from "./page.module.scss";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [authGate, setAuthGate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderListItemDto[]>([]);

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
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyOrders();
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setError("Unable to load orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authGate]);

  if (authGate) return null;

  return (
    <main>
      <Navigation />
      <section className={styles.section}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>
            ← Back to home
          </Link>
          <h1 className={styles.title}>My orders</h1>
          <p className={styles.subtitle}>View order status and totals. Open an order for line items.</p>

          {error ? <p className={styles.error}>{error}</p> : null}

          {loading ? (
            <p className={styles.empty}>Loading…</p>
          ) : orders.length === 0 ? (
            <p className={styles.empty}>You have no orders yet.</p>
          ) : (
            <ul className={styles.list}>
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.orderId}>Order #{o.order_number ?? o.id}</span>
                      <span className={styles.meta}>{formatDate(o.created_at)}</span>
                    </div>
                    <div className={styles.cardTop}>
                      <span className={styles.meta}>
                        {o.items_count} item{o.items_count === 1 ? "" : "s"}
                      </span>
                      <span className={styles.total}>${Number(o.total_amount).toFixed(2)}</span>
                    </div>
                    <span className={styles.status}>{o.status.replace("_", " ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
