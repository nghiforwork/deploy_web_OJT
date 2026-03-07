"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./sortDropdown.module.scss";

const SORT_OPTIONS = [
  "Most Popular",
  "Newest",
  "Price: Low → High",
  "Price: High → Low",
  "Top Rated",
];

const SortDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Most Popular");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.sortContainer} ref={dropdownRef}>
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <span>Sort by: </span>
        <strong>{selected}</strong>
        <ChevronDown 
          size={16} 
          className={`${styles.icon} ${isOpen ? styles.rotated : ""}`} 
        />
      </div>

      {isOpen && (
        <ul className={styles.menu}>
          {SORT_OPTIONS.map((option) => (
            <li 
              key={option} 
              className={selected === option ? styles.active : ""}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortDropdown;