import Image from "next/image";
import { Star, StarHalf } from "lucide-react";
import styles from "./productCard.module.scss";
import type { CatalogProduct } from "@/types/catalog";

const PLACEHOLDER_IMAGE = "/images/products/black-tshirt.png";

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const imageSrc =
    product.image_url && product.image_url.trim() !== ""
      ? product.image_url.trim()
      : PLACEHOLDER_IMAGE;
  const rating = toNumber(product.rating);
  const price = toNumber(product.price);
  const originalPrice =
    product.original_price != null && product.original_price !== ""
      ? toNumber(product.original_price)
      : undefined;

  const renderStars = (r: number) => {
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalfStar = r % 1 !== 0;

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
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className={styles.img}
        />
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <div className={styles.ratingGroup}>
        <div className={styles.stars}>{renderStars(rating)}</div>
        <span className={styles.score}>
          {rating}/<span className={styles.total}>5</span>
        </span>
      </div>
      <div className={styles.priceGroup}>
        <span className={styles.price}>${price}</span>
        {originalPrice !== undefined && originalPrice > 0 && (
          <>
            <span className={styles.oldPrice}>${originalPrice}</span>
            {product.discount_label && (
              <span className={styles.discountBadge}>{product.discount_label}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
