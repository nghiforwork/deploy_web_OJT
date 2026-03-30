import styles from "./dressStyle.module.scss";
import Image from "next/image";
import Link from "next/link";
import { fetchDressStyles } from "@/services/catalog.service";

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  casual: "/images/dress-style/casual.png",
  formal: "/images/dress-style/formal.png",
  party: "/images/dress-style/party.png",
  gym: "/images/dress-style/gym.png",
};

function getCardLayoutClass(slug: string): string {
  // Duy trì layout giống bản hard-code hiện tại.
  // Casual/Gym: short; Formal/Party: long.
  return slug === "formal" || slug === "party" ? styles.long : styles.short;
}

export default async function DressStyle() {
  let dressStyles: { id: number; name: string; slug: string; image_url: string | null }[] =
    [];

  try {
    dressStyles = await fetchDressStyles();
  } catch {
    // Nếu API lỗi/không chạy, fallback render bằng dữ liệu tĩnh.
    dressStyles = [
      { id: 1, name: "Casual", slug: "casual", image_url: null },
      { id: 2, name: "Formal", slug: "formal", image_url: null },
      { id: 3, name: "Party", slug: "party", image_url: null },
      { id: 4, name: "Gym", slug: "gym", image_url: null },
    ];
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>BROWSE BY DRESS STYLE</h2>

        <div className={styles.grid}>
          {dressStyles.map((item) => (
            <Link
              href={`/category/all?dress_style=${encodeURIComponent(item.slug)}`}
              key={item.id ?? item.slug}
              className={`${styles.card} ${getCardLayoutClass(item.slug)}`}
            >
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <Image
                src={
                  item.image_url ??
                  FALLBACK_IMAGE_BY_SLUG[item.slug] ??
                  FALLBACK_IMAGE_BY_SLUG.casual
                }
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
