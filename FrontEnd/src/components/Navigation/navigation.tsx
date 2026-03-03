import Link from "next/link";
import styles from "./navigation.module.scss";
import { Search, ShoppingCart, CircleUserRound, ChevronDown, X } from "lucide-react";


export default function Navigation() {
    return (
        <header className={styles.header}>
            {/* 1. Top Promo Bar */}
            <div className={styles.promoBar}>
                <p>Sign up and get 20% off to your first order. <Link href="/signup">Sign Up Now</Link></p>
                <X className={styles.closeIcon} size={16} />
            </div>

            {/* 2. Main Nav */}
            <nav className={`${styles.mainNav} layout`}>
                <div className={styles.logo}>
                    <Link href="/">SHOP.CO</Link>
                </div>

                <ul className={styles.navLinks}>
                    <li>
                        <Link href="/shop">Shop <ChevronDown size={16} /></Link>
                    </li>
                    <li><Link href="/on-sale">On Sale</Link></li>
                    <li><Link href="/new-arrivals">New Arrivals</Link></li>
                    <li><Link href="/brands">Brands</Link></li>
                </ul>

                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for products..." 
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.actions}>
                    <Link href="/cart"><ShoppingCart size={24} /></Link>
                    <Link href="/profile"><CircleUserRound size={24} /></Link>
                </div>
            </nav>
        </header>
    );
}