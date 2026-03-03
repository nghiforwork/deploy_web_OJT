// import React from "react";
// import Image from "next/image";
// import styles from "./hero.module.scss";

// export default function Hero() {
//   return (
//     <section className={styles.hero}>
//       <div className="layout">
//         <div className={styles.container}>
//           <div className={styles.content}>
//             <h1 className={styles.title}>
//               FIND CLOTHES THAT MATCHES YOUR STYLE
//             </h1>
//             <p className={styles.description}>
//               Browse through our diverse range of meticulously crafted garments,
//               designed to bring out your individuality and cater to your sense
//               of style.
//             </p>
//             <button className={styles.shopBtn}>Shop Now</button>

//             <div className={styles.stats}>
//               <div className={styles.statItem}>
//                 <h3>200+</h3>
//                 <p>International Brands</p>
//               </div>
//               <div className={styles.divider}></div>
//               <div className={styles.statItem}>
//                 <h3>2,000+</h3>
//                 <p>High-Quality Products</p>
//               </div>
//               <div className={styles.divider}></div>
//               <div className={styles.statItem}>
//                 <h3>30,000+</h3>
//                 <p>Happy Customers</p>
//               </div>
//             </div>
//           </div>

//           <div className={styles.imageWrapper}>
//             <Image src="/images/hero/couple.jpg" alt="Fashion Models" />

//             <div className={`${styles.decorativeStar} ${styles.starLarge}`}>
//               <Image src="/images/hero/bigstar-icon.png" alt="Big Star" />
//             </div>

//             <div className={`${styles.decorativeStar} ${styles.starSmall}`}>
//               <Image src="/images/hero/smallstar-icon.png" alt="Small Star" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className={styles.brandBar}>
//         <div className="layout">
//           <div className={styles.brandList}>
//             <Image src="/images/hero/versace-logo.png" alt="Versace" />
//             <Image src="/images/hero/zara-logo.png" alt="Zara" />
//             <Image src="/images/hero/gucci-logo.png" alt="Gucci" />
//             <Image src="/images/hero/prada-logo.png" alt="Prada" />
//             <Image src="/images/hero/calvinklein-logo.png" alt="Calvin Klein" />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import Image from "next/image";
import styles from "./hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="layout">
        <div className={styles.container}>

          {/* LEFT CONTENT */}
          <div className={styles.content}>
            <h1 className={styles.title}>
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>

            <p className={styles.description}>
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense of style.
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

          {/* RIGHT IMAGE */}
          <div className={styles.imageWrapper}>
            <Image
              src="/images/hero/couple.jpg"
              alt="Fashion Models"
              width={600}
              height={700}
              priority
            />

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

      {/* BRAND BAR */}
      <div className={styles.brandBar}>
        <div className="layout">
          <div className={styles.brandList}>
            <Image src="/images/hero/versace-logo.png" alt="Versace" width={120} height={40} />
            <Image src="/images/hero/zara-logo.png" alt="Zara" width={120} height={40} />
            <Image src="/images/hero/gucci-logo.png" alt="Gucci" width={120} height={40} />
            <Image src="/images/hero/prada-logo.png" alt="Prada" width={120} height={40} />
            <Image src="/images/hero/calvinklein-logo.png" alt="Calvin Klein" width={140} height={40} />
          </div>
        </div>
      </div>
    </section>
  );
}
