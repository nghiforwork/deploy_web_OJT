import styles from "./dressStyle.module.scss";
import Image from "next/image";
import Link from "next/link";

const STYLES_DATA = [
  {
    id: 1,
    name: "Casual",
    image: "/images/dress-style/casual.png",
    className: styles.short,
  },
  {
    id: 2,
    name: "Formal",
    image: "/images/dress-style/formal.png",
    className: styles.long,
  },
  {
    id: 3,
    name: "Party",
    image: "/images/dress-style/party.png",
    className: styles.long,
  },
  {
    id: 4,
    name: "Gym",
    image: "/images/dress-style/gym.png",
    className: styles.short,
  },
];

export default function DressStyle() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>BROWSE BY DRESS STYLE</h2>

        <div className={styles.grid}>
          {STYLES_DATA.map((item) => (
            <Link
              href="/category/casual"
              key={item.id}
              className={`${styles.card} ${item.className}`}
            >
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <Image
                src={item.image}
                alt={item.name}
                fill
                className={styles.cardImg}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
