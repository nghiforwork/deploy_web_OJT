import Link from 'next/link';
import styles from './layout.module.scss';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.blogLayout}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <Link
            href='/'
            className={styles.homeLink}
          >
            ← Back to Home
          </Link>
          <nav>
            <ul className={styles.navList}>
              <li>
                <Link
                  href='/blog'
                  className={styles.navLink}
                >
                  All Posts
                </Link>
              </li>
              <li>
                <Link
                  href='/blog/categories'
                  className={styles.navLink}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href='/blog/tags'
                  className={styles.navLink}
                >
                  Tags
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
