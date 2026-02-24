import Link from 'next/link';
import styles from './layout.module.scss';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.mainLayout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link
                href='/'
                className={styles.navLink}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className={styles.navLink}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className={styles.navLink}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href='/blog'
                className={styles.navLink}
              >
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
