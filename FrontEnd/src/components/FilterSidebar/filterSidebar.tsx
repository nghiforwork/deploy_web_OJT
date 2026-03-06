"use client"
import React from 'react';
import { SlidersHorizontal, ChevronRight, Check } from 'lucide-react';
import styles from './filterSidebar.module.scss';

const CATEGORIES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
const COLORS = ['#00C129', '#F50606', '#F5DD06', '#F57906', '#06CAF5', '#063AF5', '#7D06F5', '#F506A4', '#FFFFFF', '#000000'];
const SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
const DRESS_STYLES = ['Casual', 'Formal', 'Party', 'Gym'];

const FilterSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <SlidersHorizontal size={20} />
      </div>

      <div className={styles.section}>
        <ul className={styles.list}>
          {CATEGORIES.map(item => (
            <li key={item} className={styles.listItem}>{item} <ChevronRight size={16} /></li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h4>Price</h4>
        <div className={styles.priceSlider}>
          <div className={styles.track}>
            <div className={styles.range} style={{ left: '20%', right: '30%' }}></div>
            <div className={styles.thumb} style={{ left: '20%' }}></div>
            <div className={styles.thumb} style={{ left: '70%' }}></div>
          </div>
          <div className={styles.priceLabels}><span>$50</span><span>$200</span></div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Colors</h4>
        <div className={styles.colorsGrid}>
          {COLORS.map(color => (
            <button key={color} className={`${styles.colorCircle} ${color === '#FFFFFF' ? styles.white : ''}`} style={{ backgroundColor: color }}>
              {color === '#000000' && <Check size={12} color="white" />}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Size</h4>
        <div className={styles.sizesGrid}>
          {SIZES.map(size => (
            <button key={size} className={size === 'Large' ? styles.activeSize : ''}>{size}</button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Dress Style</h4>
        <ul className={styles.list}>
          {DRESS_STYLES.map(style => (
            <li key={style} className={styles.listItem}>{style} <ChevronRight size={16} /></li>
          ))}
        </ul>
      </div>

      <button className={styles.applyBtn}>Apply Filter</button>
    </aside>
  );
};

export default FilterSidebar;