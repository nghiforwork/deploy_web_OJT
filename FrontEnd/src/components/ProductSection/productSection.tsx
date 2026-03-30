// src/components/ProductSection/productSection.tsx
import Link from 'next/link';
import ProductCard from '../ProductCard/productCard';
import styles from './productSection.module.scss';
import type { CatalogProduct } from "@/types/catalog";

interface ProductSectionProps {
  title: string;
  products: CatalogProduct[];
  hideBorder?: boolean;
  viewAllHref?: string;
}

export default function ProductSection({
  title,
  products,
  hideBorder,
  viewAllHref,
}: ProductSectionProps) {
  return (
    <section className={`${styles.section} ${hideBorder ? styles.noBorder : ''}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className={styles.cardLink}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
        {viewAllHref ? (
          <Link href={viewAllHref} className={styles.viewAllBtn}>
            View All
          </Link>
        ) : (
          <button type="button" className={styles.viewAllBtn}>
            View All
          </button>
        )}
      </div>
    </section>
  );
}