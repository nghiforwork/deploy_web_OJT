"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navigation.module.scss";
import { Search, ShoppingCart, CircleUserRound, ChevronDown, X, Menu } from "lucide-react";

export default function Navigation() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleShop = (e: React.MouseEvent) => {
        e.preventDefault(); 
        setIsShopOpen(!isShopOpen);
    };

    return (
        <header className={styles.header}>
            <div className={styles.promoBar}>
                <p>Sign up and get 20% off to your first order. <Link href={`${pathname}?auth=signup`}>Sign Up Now</Link></p>
                <X className={styles.closeIcon} size={16} />
            </div>

            <nav className={`${styles.mainNav} layout`}>
                <div className={styles.leftSection}>
                    <Menu className={styles.burgerIcon} size={24} onClick={toggleMenu} />
                    <div className={styles.logo}>
                        <Link href="/">SHOP.CO</Link>
                    </div>
                </div>

                <ul className={styles.navLinks}>
                    <li className={styles.hasDropdown}>
                        <Link href="#">Shop <ChevronDown size={16} /></Link>
                        <ul className={styles.dropdown}>
                            <li><Link href="#">Male</Link></li>
                            <li><Link href="#">Female</Link></li>
                        </ul>
                    </li>
                    <li><Link href="#" className={styles.underlineAnimation}>On Sale</Link></li>
                    <li><Link href="#" className={styles.underlineAnimation}>New Arrivals</Link></li>
                    <li><Link href="#" className={styles.underlineAnimation}>Brands</Link></li>
                </ul>

                <div className={`${styles.overlay} ${isMenuOpen ? styles.active : ""}`} onClick={toggleMenu}></div>
                <div className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}>
                    <div className={styles.sidebarHeader}>
                        <X size={24} onClick={toggleMenu} />
                        <div className={styles.logo}>SHOP.CO</div>
                    </div>
                    
                    <ul className={styles.mobileNavLinks}>
                        <li>
                            <div className={styles.mobileShopToggle} onClick={toggleShop}>
                                Shop <ChevronDown size={18} className={isShopOpen ? styles.rotated : ""} />
                            </div>
                            <ul className={`${styles.mobileDropdown} ${isShopOpen ? styles.show : ""}`}>
                                <li><Link href="#" onClick={toggleMenu}>Male</Link></li>
                                <li><Link href="#" onClick={toggleMenu}>Female</Link></li>
                            </ul>
                        </li>
                        <li><Link href="#" className={styles.navItem} onClick={toggleMenu}>On Sale</Link></li>
                        <li><Link href="#" className={styles.navItem} onClick={toggleMenu}>New Arrivals</Link></li>
                        <li><Link href="#" className={styles.navItem} onClick={toggleMenu}>Brands</Link></li>
                    </ul>
                </div>

                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input type="text" placeholder="Search for products..." className={styles.searchInput} />
                </div>

                <div className={styles.actions}>
                    <Search className={styles.searchIconMobile} size={24} />
                    <Link href="/cart" aria-label="Cart"><ShoppingCart size={24} /></Link>
                    <Link href={`${pathname}?auth=login`} aria-label="Login"><CircleUserRound size={24} /></Link>
                </div>
            </nav>
        </header>
    );
}