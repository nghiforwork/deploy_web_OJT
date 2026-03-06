"use client"
import React from "react";
import Navigation from "@/components/Navigation/navigation";
import Footer from "@/components/Footer/footer";
import ProductCard from "@/components/ProductCard/productCard";
import FilterSidebar from "@/components/FilterSidebar/filterSidebar";
import Breadcrumb from "@/components/Breadcrumb/breadcrumb";
import { Product } from "@/types/product";
import styles from "./category.module.scss";

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Gradient Graphic T-shirt", price: 145, rating: 3.5, image: "/images/products/black-orange-tshirt.png" },
  { id: 2, name: "Polo with Tipping Details", price: 180, rating: 4.5, image: "/images/products/green-shirt.png" },
  { id: 3, name: "Black Striped T-shirt", price: 120, rating: 5.0, image: "/images/products/black-tshirt.png", discountLabel: "-30%" },
  { id: 4, name: "Skinny Fit Jeans", price: 240, rating: 4.5, image: "/images/products/blue-jeans.png", discountLabel: "-20%" },
  { id: 5, name: "Checkered Shirt", price: 180, rating: 4.5, image: "/images/products/purple-shirt.png" },
  { id: 6, name: "Sleeve Striped T-shirt", price: 130, rating: 4.5, image: "/images/products/orange-tshirt.png", discountLabel: "-30%" },
  { id: 7, name: "Vertical Striped Shirt", price: 212, rating: 5.0, image: "/images/products/green-shirt.png", discountLabel: "-20%" },
  { id: 8, name: "Courage Graphic T-shirt", price: 145, rating: 4.0, image: "/images/products/black-orange-tshirt.png" },
  { id: 9, name: "Loose Fit Bermuda Shorts", price: 80, rating: 3.0, image: "/images/products/blue-short.png" },
];

export default async function CategoryPage({ params }: { params: Promise<{ categoryID: string }> }) {
  const { categoryID } = await params;
  const categoryName = categoryID.charAt(0).toUpperCase() + categoryID.slice(1);

  return (
    <>
      <Navigation />
      <main className="layout">
        <Breadcrumb category={categoryName} />
        
        <div className={styles.categoryLayout}>
          <FilterSidebar />
          
          <div className={styles.mainContent}>
            <div className={styles.toolbar}>
              <h2>{categoryName}</h2>
              <div className={styles.meta}>
                <span>Showing 1-9 of 100 Products</span>
                <div className={styles.sortBy}>
                  Sort by: <strong>Most Popular</strong>
                </div>
              </div>
            </div>

            <div className={styles.productGrid}>
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.pagination}>
              <button className={styles.navBtn}>Previous</button>
              <div className={styles.pages}>
                <button className={styles.activePage}>1</button>
                <button>2</button>
                <button>3</button>
                <span>...</span>
                <button>10</button>
              </div>
              <button className={styles.navBtn}>Next</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}