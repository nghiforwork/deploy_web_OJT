"use client";
import React, { useState } from "react";
import { SlidersHorizontal, ChevronRight, Check, X } from "lucide-react"; // Thêm icon X
import styles from "./filterSidebar.module.scss";

const CATEGORIES = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];
const COLORS = ["#00C129", "#F50606", "#F5DD06", "#F57906", "#06CAF5", "#063AF5", "#7D06F5", "#F506A4", "#FFFFFF", "#000000"];
const SIZES = ["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"];
const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ isOpen, onClose }: FilterSidebarProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(50);
  const [maxPrice, setMaxPrice] = useState(200);

  const maxLimit = 500;
  const minPercent = (minPrice / maxLimit) * 100;
  const maxPercent = 100 - (maxPrice / maxLimit) * 100;

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
            <ul className={styles.list}>
              {CATEGORIES.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item} <ChevronRight size={16} />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h4>Price</h4>
            <div className={styles.priceSliderContainer}>
              <div className={styles.priceSlider}>
                <input type="range" min={0} max={maxLimit} value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className={styles.rangeInput} />
                <input type="range" min={0} max={maxLimit} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className={styles.rangeInput} />
                <div className={styles.sliderControl}>
                  <div className={styles.track}></div>
                  <div className={styles.rangeProgress} style={{ left: `${minPercent}%`, right: `${maxPercent}%` }}></div>
                  <div className={styles.thumb} style={{ left: `${minPercent}%` }}></div>
                  <div className={styles.thumb} style={{ left: `${100 - maxPercent}%` }}></div>
                </div>
              </div>
              <div className={styles.priceLabels}>
                <span>${minPrice}</span> <span>${maxPrice}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Colors</h4>
            <div className={styles.colorsGrid}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color === selectedColor ? null : color)}
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
                  key={size}
                  className={selectedSize === size ? styles.activeSize : ""}
                  onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4>Dress Style</h4>
            <ul className={styles.list}>
              {DRESS_STYLES.map((style) => (
                <li key={style} className={styles.listItem}>
                  {style} <ChevronRight size={16} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className={styles.applyBtn} onClick={onClose}>
          Apply Filter
        </button>
      </aside>
    </>
  );
};

export default FilterSidebar;