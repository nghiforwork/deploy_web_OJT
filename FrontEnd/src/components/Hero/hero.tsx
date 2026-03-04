import Image from "next/image";
import styles from "./hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="layout">
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>

            <p className={styles.description}>
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense
              of style.
            </p>

            <button className={styles.shopBtn}>Shop Now</button>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <h3>200+</h3>
                <p>International Brands</p>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.statItem}>
                <h3>2,000+</h3>
                <p>High-Quality Products</p>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.statItem}>
                <h3>30,000+</h3>
                <p>Happy Customers</p>
              </div>
            </div>
          </div>

          <div className={styles.imageWrapper}>
            <div className={styles.imageBox}>
              <Image
                src="/images/hero/couple.jpg"
                alt="Fashion Models"
                width={600}
                height={700}
                priority
              />
            </div>

            <div className={`${styles.decorativeStar} ${styles.starLarge}`}>
              <Image
                src="/images/hero/bigstar-icon.png"
                alt="Big Star"
                width={80}
                height={80}
              />
            </div>

            <div className={`${styles.decorativeStar} ${styles.starSmall}`}>
              <Image
                src="/images/hero/smallstar-icon.png"
                alt="Small Star"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.brandBar}>
        <div className="layout">
          <div className={styles.brandList}>
            <Image
              src="/images/hero/versace-logo.png"
              alt="Versace"
              width={166}
              height={33}
            />
            <Image
              src="/images/hero/zara-logo.png"
              alt="Zara"
              width={91}
              height={38}
            />
            <Image
              src="/images/hero/gucci-logo.png"
              alt="Gucci"
              width={156}
              height={36}
            />
            <Image
              src="/images/hero/prada-logo.png"
              alt="Prada"
              width={194}
              height={32}
            />
            <Image
              src="/images/hero/calvinklein-logo.png"
              alt="Calvin Klein"
              width={206}
              height={33}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
