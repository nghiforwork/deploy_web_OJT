// src/components/ProductSection/productSection.tsx
import ProductCard from '../ProductCard/productCard';
import styles from './productSection.module.scss';
import { Product } from '@/types/product';

interface ProductSectionProps {
  title: string;
  products: Product[];
  hideBorder?: boolean;
}

export default function ProductSection({ title, products, hideBorder }: ProductSectionProps) {
  return (
    <section className={`${styles.section} ${hideBorder ? styles.noBorder : ''}`}>
      <div className={styles.container}> 
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <button className={styles.viewAllBtn}>View All</button>
      </div>
    </section>
  );
}