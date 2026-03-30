"use client";
import React from "react";
import { SlidersHorizontal, ChevronRight, Check, X } from "lucide-react";
import styles from "./filterSidebar.module.scss";

const COLORS = ["#00C129", "#F50606", "#F5DD06", "#F57906", "#06CAF5", "#063AF5", "#7D06F5", "#F506A4", "#FFFFFF", "#000000"];
const SIZES = ["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"];

/** Slug khớp với `Category.slug` trên API và đường dẫn `/category/[slug]`. */
const CATEGORY_NAV: { label: string; slug: string }[] = [
  { label: "All", slug: "all" },
  { label: "T-shirts", slug: "t-shirts" },
  { label: "Shorts", slug: "shorts" },
  { label: "Shirts", slug: "shirts" },
  { label: "Hoodie", slug: "hoodie" },
  { label: "Jeans", slug: "jeans" },
];

const DRESS_STYLE_OPTIONS: { label: string; slug: string }[] = [
  { label: "Casual", slug: "casual" },
  { label: "Formal", slug: "formal" },
  { label: "Party", slug: "party" },
  { label: "Gym", slug: "gym" },
];

/** Nhãn hiển thị cho slug dress style (breadcrumb, tiêu đề). */
export function getDressStyleLabel(slug: string | null): string | null {
  if (!slug) return null;
  const found = DRESS_STYLE_OPTIONS.find((o) => o.slug === slug);
  return found?.label ?? null;
}

/** Trùng với trần slider giá; mặc định khoảng lọc 0…MAX (không hẹp cửa ban đầu). */
export const PRICE_SLIDER_MAX = 500;

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  draftCategorySlug: string;
  onDraftCategoryChange: (slug: string) => void;
  dressStyleSlug: string | null;
  onDressStyleChange: (slug: string | null) => void;
  priceMin: number;
  priceMax: number;
  onPriceChange: (min: number, max: number) => void;
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onApplyFilters: () => void;
}

const listBtnReset: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "none",
  font: "inherit",
  textAlign: "left",
  padding: 0,
  cursor: "pointer",
};

const FilterSidebar = ({
  isOpen,
  onClose,
  draftCategorySlug,
  onDraftCategoryChange,
  dressStyleSlug,
  onDressStyleChange,
  priceMin,
  priceMax,
  onPriceChange,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  onApplyFilters,
}: FilterSidebarProps) => {
  const maxLimit = PRICE_SLIDER_MAX;
  const minPercent = (priceMin / maxLimit) * 100;
  const maxPercent = 100 - (priceMax / maxLimit) * 100;
  const routeLower = draftCategorySlug.toLowerCase();

  function handleMinChange(raw: number) {
    const v = Math.max(0, Math.min(raw, maxLimit));
    const nextMin = Math.min(v, priceMax);
    onPriceChange(nextMin, priceMax);
  }

  function handleMaxChange(raw: number) {
    const v = Math.max(0, Math.min(raw, maxLimit));
    const nextMax = Math.max(v, priceMin);
    onPriceChange(priceMin, nextMax);
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.showOverlay : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <X className={styles.closeIcon} size={24} onClick={onClose} />
          <SlidersHorizontal className={styles.filterIcon} size={20} />
        </div>

        <div className={styles.scrollContent}>
          <div className={styles.section}>
            <h4>Categories</h4>
            <ul className={styles.list}>
              {CATEGORY_NAV.map(({ label, slug }) => {
                const active = routeLower === slug;
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      style={listBtnReset}
                      className={`${styles.listItem} ${active ? styles.listItemActive : ""}`}
                      onClick={() => onDraftCategoryChange(slug)}
                    >
                      <span>{label}</span>
                      <ChevronRight size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>Price</h4>
            <div className={styles.priceSliderContainer}>
              <div className={styles.priceSlider}>
                <input type="range" min={0} max={maxLimit} value={priceMin} onChange={(e) => handleMinChange(Number(e.target.value))} className={styles.rangeInput} />
                <input type="range" min={0} max={maxLimit} value={priceMax} onChange={(e) => handleMaxChange(Number(e.target.value))} className={styles.rangeInput} />
                <div className={styles.sliderControl}>
                  <div className={styles.track}></div>
                  <div className={styles.rangeProgress} style={{ left: `${minPercent}%`, right: `${maxPercent}%` }}></div>
                  <div className={styles.thumb} style={{ left: `${minPercent}%` }}></div>
                  <div className={styles.thumb} style={{ left: `${100 - maxPercent}%` }}></div>
                </div>
              </div>
              <div className={styles.priceLabels}>
                <span>${priceMin}</span> <span>${priceMax}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Colors</h4>
            <div className={styles.colorsGrid}>
              {COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => onColorChange(color === selectedColor ? null : color)}
                  className={`${styles.colorCircle} ${color === "#FFFFFF" ? styles.white : ""}`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <Check size={12} color={color === "#FFFFFF" ? "black" : "white"} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4>Sizes</h4>
            <div className={styles.sizesGrid}>
              {SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={selectedSize === size ? styles.activeSize : ""}
                  onClick={() => onSizeChange(size === selectedSize ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4>Dress Style</h4>
            <ul className={styles.list}>
              {DRESS_STYLE_OPTIONS.map(({ label, slug }) => {
                const active = dressStyleSlug === slug;
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      style={listBtnReset}
                      className={`${styles.listItem} ${active ? styles.listItemActive : ""}`}
                      onClick={() => onDressStyleChange(active ? null : slug)}
                    >
                      <span>{label}</span>
                      <ChevronRight size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <button type="button" className={styles.applyBtn} onClick={onApplyFilters}>
          Apply Filter
        </button>
      </aside>
    </>
  );
};

export default FilterSidebar;
