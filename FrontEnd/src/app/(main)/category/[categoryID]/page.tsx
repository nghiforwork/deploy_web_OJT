"use client";
import React, {
  Suspense,
  useState,
  use,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import ProductCard from "@/components/ProductCard/productCard";
import FilterSidebar, {
  PRICE_SLIDER_MAX,
  getDressStyleLabel,
} from "@/components/FilterSidebar/filterSidebar";
import Breadcrumb from "@/components/Breadcrumb/breadcrumb";
import type { CatalogProduct } from "@/types/catalog";
import styles from "./category.module.scss";
import SortDropdown from "@/components/SortDropdown/sortDropdown";
import { SlidersHorizontal } from "lucide-react";
import { fetchCatalogProducts } from "@/services/catalog.service";

const PAGE_SIZE = 9;

const SORT_ORDERING_BY_LABEL: Record<string, string> = {
  "Most Popular": "-stock",
  Newest: "-created_at",
  "Price: Low → High": "price",
  "Price: High → Low": "-price",
  "Top Rated": "-rating",
};

function formatCategoryTitle(categoryID: string): string {
  const id = categoryID.toLowerCase();
  if (id === "all") return "All products";
  return categoryID
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function normalizeRouteCategorySlug(categoryID: string): string {
  const id = categoryID.toLowerCase();
  return id === "all" ? "all" : id;
}

type DraftFilters = {
  categorySlug: string;
  dressStyle: string | null;
  color: string | null;
  size: string | null;
  priceMin: number;
  priceMax: number;
};

/** Đọc bộ lọc đã áp từ URL (nguồn sự thật cho API / breadcrumb). */
function parseFiltersFromSearchParams(sp: URLSearchParams): {
  dressStyle: string | null;
  color: string | null;
  size: string | null;
  priceMin: number;
  priceMax: number;
} {
  const ds = sp.get("dress_style");
  const dressStyle = ds && ds.length > 0 ? ds : null;
  const colorRaw = sp.get("color");
  const color = colorRaw && colorRaw.length > 0 ? colorRaw : null;
  const sizeRaw = sp.get("size");
  const size = sizeRaw && sizeRaw.length > 0 ? sizeRaw : null;

  let priceMin = 0;
  let priceMax = PRICE_SLIDER_MAX;
  const minStr = sp.get("min_price");
  const maxStr = sp.get("max_price");
  if (minStr !== null && minStr !== "") {
    const n = Number(minStr);
    if (!Number.isNaN(n)) priceMin = n;
  }
  if (maxStr !== null && maxStr !== "") {
    const n = Number(maxStr);
    if (!Number.isNaN(n)) priceMax = n;
  }

  return { dressStyle, color, size, priceMin, priceMax };
}

function buildCatalogQueryString(
  f: Omit<DraftFilters, "categorySlug">,
): string {
  const p = new URLSearchParams();
  if (f.dressStyle) p.set("dress_style", f.dressStyle);
  if (f.color) p.set("color", f.color);
  if (f.size) p.set("size", f.size);
  p.set("min_price", String(f.priceMin));
  p.set("max_price", String(f.priceMax));
  return p.toString();
}

function CategoryPageSuspenseFallback() {
  return (
    <>
      <Navigation />
      <main className="layout">
        <p style={{ padding: 24 }}>Loading…</p>
      </main>
      <Footer />
    </>
  );
}

function CategoryPageContent({
  params,
}: {
  params: Promise<{ categoryID: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categoryID } = use(params);
  const categoryName = formatCategoryTitle(categoryID);
  const categorySlugForApi =
    categoryID.toLowerCase() === "all" ? null : categoryID.toLowerCase();

  const filterKey = searchParams.toString();
  const appliedFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [filterKey],
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortLabel, setSortLabel] = useState<string>(() => {
    const sortParam = searchParams.get("sort");
    if (
      sortParam &&
      Object.prototype.hasOwnProperty.call(SORT_ORDERING_BY_LABEL, sortParam)
    ) {
      return sortParam;
    }
    return "Most Popular";
  });

  const [draftCategorySlug, setDraftCategorySlug] = useState(() =>
    normalizeRouteCategorySlug(categoryID),
  );
  const [draftDressStyle, setDraftDressStyle] = useState<string | null>(null);
  const [draftColor, setDraftColor] = useState<string | null>(null);
  const [draftSize, setDraftSize] = useState<string | null>(null);
  const [draftPriceMin, setDraftPriceMin] = useState(0);
  const [draftPriceMax, setDraftPriceMax] = useState(PRICE_SLIDER_MAX);

  const draftFiltersRef = useRef<DraftFilters>({
    categorySlug: normalizeRouteCategorySlug(categoryID),
    dressStyle: null,
    color: null,
    size: null,
    priceMin: 0,
    priceMax: PRICE_SLIDER_MAX,
  });

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function revertDraftToApplied() {
    const nextCategorySlug = normalizeRouteCategorySlug(categoryID);
    const f = parseFiltersFromSearchParams(searchParams);
    setDraftCategorySlug(nextCategorySlug);
    setDraftDressStyle(f.dressStyle);
    setDraftColor(f.color);
    setDraftSize(f.size);
    setDraftPriceMin(f.priceMin);
    setDraftPriceMax(f.priceMax);
    draftFiltersRef.current = {
      categorySlug: nextCategorySlug,
      dressStyle: f.dressStyle,
      color: f.color,
      size: f.size,
      priceMin: f.priceMin,
      priceMax: f.priceMax,
    };
  }

  function handleSidebarClose() {
    revertDraftToApplied();
    setIsFilterOpen(false);
  }

  function handleApplyFilters() {
    const {
      categorySlug,
      dressStyle,
      color,
      size,
      priceMin,
      priceMax,
    } = draftFiltersRef.current;
    const currentSlug = normalizeRouteCategorySlug(categoryID);
    const q = buildCatalogQueryString({
      dressStyle,
      color,
      size,
      priceMin,
      priceMax,
    });
    const path = `/category/${categorySlug}`;
    const href = q ? `${path}?${q}` : path;

    if (categorySlug !== currentSlug) {
      router.push(href);
    } else {
      router.replace(href);
    }
    setPage(1);
    setIsFilterOpen(false);
  }

  function handleDraftCategoryChange(slug: string) {
    setDraftCategorySlug(slug);
    draftFiltersRef.current.categorySlug = slug;
  }

  function handleDraftDressStyleChange(slug: string | null) {
    setDraftDressStyle(slug);
    draftFiltersRef.current.dressStyle = slug;
  }

  function handleDraftColorChange(color: string | null) {
    setDraftColor(color);
    draftFiltersRef.current.color = color;
  }

  function handleDraftSizeChange(size: string | null) {
    setDraftSize(size);
    draftFiltersRef.current.size = size;
  }

  function handleDraftPriceChange(min: number, max: number) {
    setDraftPriceMin(min);
    setDraftPriceMax(max);
    draftFiltersRef.current.priceMin = min;
    draftFiltersRef.current.priceMax = max;
  }

  useEffect(() => {
    const slug = normalizeRouteCategorySlug(categoryID);
    const f = parseFiltersFromSearchParams(searchParams);
    setDraftCategorySlug(slug);
    setDraftDressStyle(f.dressStyle);
    setDraftColor(f.color);
    setDraftSize(f.size);
    setDraftPriceMin(f.priceMin);
    setDraftPriceMax(f.priceMax);

    // Cập nhật sort từ query (?sort=Newest, ?sort=Most%20Popular, ...)
    // để "View All" trên Home giữ đúng thứ tự.
    const sortParam = searchParams.get("sort");
    if (
      sortParam &&
      Object.prototype.hasOwnProperty.call(SORT_ORDERING_BY_LABEL, sortParam)
    ) {
      setSortLabel(sortParam);
    } else {
      setSortLabel("Most Popular");
    }

    draftFiltersRef.current = {
      categorySlug: slug,
      dressStyle: f.dressStyle,
      color: f.color,
      size: f.size,
      priceMin: f.priceMin,
      priceMax: f.priceMax,
    };
  }, [categoryID, filterKey]);

  useEffect(() => {
    setPage(1);
  }, [categoryID, filterKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { count, results } = await fetchCatalogProducts({
          page,
          pageSize: PAGE_SIZE,
          categorySlug: categorySlugForApi,
          dressStyleSlug: appliedFilters.dressStyle,
          minPrice: appliedFilters.priceMin,
          maxPrice: appliedFilters.priceMax,
          color: appliedFilters.color,
          size: appliedFilters.size,
          ordering: SORT_ORDERING_BY_LABEL[sortLabel] ?? "-created_at",
        });
        if (!cancelled) {
          setProducts(results);
          setTotalCount(count);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load products. Check that the API is running and NEXT_PUBLIC_API matches your Django server (e.g. http://127.0.0.1:8000/).",
          );
          setProducts([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    categoryID,
    page,
    categorySlugForApi,
    appliedFilters,
    sortLabel,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);

  const appliedDressStyleLabel = appliedFilters.dressStyle
    ? getDressStyleLabel(appliedFilters.dressStyle) ??
      formatCategoryTitle(appliedFilters.dressStyle)
    : null;
  const pageHeading = appliedDressStyleLabel
    ? `${appliedDressStyleLabel} · ${categoryName}`
    : categoryName;

  useEffect(() => {
    document.title = `${pageHeading} | SHOP.CO`;
  }, [pageHeading]);

  return (
    <>
      <Navigation />
      <main className="layout">
        <Breadcrumb
          dressStyleSegment={appliedDressStyleLabel}
          category={categoryName}
        />

        <div className={styles.categoryLayout}>
          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={handleSidebarClose}
            draftCategorySlug={draftCategorySlug}
            onDraftCategoryChange={handleDraftCategoryChange}
            dressStyleSlug={draftDressStyle}
            onDressStyleChange={handleDraftDressStyleChange}
            priceMin={draftPriceMin}
            priceMax={draftPriceMax}
            onPriceChange={handleDraftPriceChange}
            selectedColor={draftColor}
            selectedSize={draftSize}
            onColorChange={handleDraftColorChange}
            onSizeChange={handleDraftSizeChange}
            onApplyFilters={handleApplyFilters}
          />

          <div className={styles.mainContent}>
            <div className={styles.toolbar}>
              <h2>{pageHeading}</h2>
              <div className={styles.meta}>
                <span>
                  {loading
                    ? "Loading…"
                    : `Showing ${rangeStart}-${rangeEnd} of ${totalCount} Products`}
                </span>
                <SortDropdown
                  value={sortLabel}
                  onChange={(next) => {
                    setSortLabel(next);
                    setPage(1);
                  }}
                />

                <button
                  type="button"
                  className={styles.mobileFilterBtn}
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal size={20} />
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.meta} style={{ color: "#b42318", marginBottom: 16 }}>
                {error}
              </p>
            )}

            <div className={styles.productGrid}>
              {loading && (
                <p className={styles.meta} style={{ gridColumn: "1 / -1" }}>
                  Loading products…
                </p>
              )}
              {!loading &&
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              {!loading && !error && products.length === 0 && (
                <p className={styles.meta} style={{ gridColumn: "1 / -1" }}>
                  No products found.
                </p>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.navBtn}
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className={styles.pages}>
                <span style={{ padding: "0 8px", fontSize: 14 }}>
                  Page {page} of {totalPages}
                </span>
              </div>
              <button
                type="button"
                className={styles.navBtn}
                disabled={loading || page >= totalPages || totalCount === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ categoryID: string }>;
}) {
  return (
    <Suspense fallback={<CategoryPageSuspenseFallback />}>
      <CategoryPageContent params={params} />
    </Suspense>
  );
}
