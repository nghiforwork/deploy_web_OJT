"use client";
import React, { useState } from "react";
import { SlidersHorizontal, ChevronRight, Check } from "lucide-react";
import styles from "./filterSidebar.module.scss";

const CATEGORIES = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];
const COLORS = [
  "#00C129",
  "#F50606",
  "#F5DD06",
  "#F57906",
  "#06CAF5",
  "#063AF5",
  "#7D06F5",
  "#F506A4",
  "#FFFFFF",
  "#000000",
];
const SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];
const DRESS_STYLES = ["Casual", "Formal", "Party", "Gym"];

const FilterSidebar = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState(50);
  const [maxPrice, setMaxPrice] = useState(200);
  const minLimit = 0;
  const maxLimit = 500;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 20);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 20);
    setMaxPrice(value);
  };

  const minPercent = (minPrice / maxLimit) * 100;
  const maxPercent = 100 - (maxPrice / maxLimit) * 100;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <SlidersHorizontal size={20} />
      </div>

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
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              value={minPrice}
              onChange={handleMinChange}
              className={styles.rangeInput}
            />
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              value={maxPrice}
              onChange={handleMaxChange}
              className={styles.rangeInput}
            />

            <div className={styles.sliderControl}>
              <div className={styles.track}></div>
              <div 
                className={styles.rangeProgress} 
                style={{ left: `${minPercent}%`, right: `${maxPercent}%` }}
              ></div>
              <div className={styles.thumb} style={{ left: `${minPercent}%` }}></div>
              <div className={styles.thumb} style={{ left: `${100 - maxPercent}%` }}></div>
            </div>
          </div>
          
          <div className={styles.priceLabels}>
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Colors</h4>
        <div className={styles.colorsGrid}>
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() =>
                setSelectedColor(color === selectedColor ? null : color)
              }
              className={`${styles.colorCircle} ${color === "#FFFFFF" ? styles.white : ""}`}
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <Check
                  size={12}
                  color={color === "#FFFFFF" ? "black" : "white"}
                />
              )}
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
              // 2. Cập nhật class: Chỉ active khi trùng với state selectedSize
              className={selectedSize === size ? styles.activeSize : ""}
              // 3. Thêm sự kiện click để toggle size
              onClick={() =>
                setSelectedSize(size === selectedSize ? null : size)
              }
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

      <button className={styles.applyBtn}>Apply Filter</button>
    </aside>
  );
};

export default FilterSidebar;
