import Image from 'next/image';
import { Star, StarHalf } from 'lucide-react';
import styles from './productCard.module.scss';
import { Product } from '@/types/product';

export default function ProductCard({ product }: { product: Product }) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={18} fill="#FFC633" color="#FFC633" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={18} fill="#FFC633" color="#FFC633" />);
    }
    return stars;
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          sizes="(max-width: 768px) 100vw, 25vw"
          className={styles.img} 
        />
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <div className={styles.ratingGroup}>
        <div className={styles.stars}>{renderStars(product.rating)}</div>
        <span className={styles.score}>{product.rating}/<span className={styles.total}>5</span></span>
      </div>
      <div className={styles.priceGroup}>
        <span className={styles.price}>${product.price}</span>
        {product.originalPrice && (
          <>
            <span className={styles.oldPrice}>${product.originalPrice}</span>
            {product.discountLabel && (
              <span className={styles.discountBadge}>{product.discountLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}