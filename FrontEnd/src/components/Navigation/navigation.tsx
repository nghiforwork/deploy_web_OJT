"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navigation.module.scss";
import { Search, ShoppingCart, CircleUserRound, ChevronDown, X, Menu } from "lucide-react";
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, getAuthSession, type AuthSessionState } from "@/services/authService";

/** Phase 1: real routes aligned with catalog seeds (men, women, t-shirts, …). */
const NAV = {
  shopAll: "/category/all",
  shopMen: "/category/men",
  shopWomen: "/category/women",
  onSale: "/category/all?on_sale=1",
  newArrivals: "/category/all?sort=Newest",
  brands: "/category/all",
} as const;

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [authSession, setAuthSession] = useState<AuthSessionState | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleShop = (e: React.MouseEvent) => {
        e.preventDefault(); 
        setIsShopOpen(!isShopOpen);
    };

    useEffect(() => {
        const syncAuthSession = () => setAuthSession(getAuthSession());
        syncAuthSession();

        window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuthSession);
        window.addEventListener("storage", syncAuthSession);
        return () => {
            window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncAuthSession);
            window.removeEventListener("storage", syncAuthSession);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearAuthSession();
        setAuthSession(null);
        setIsUserDropdownOpen(false);
        setIsLogoutConfirmOpen(false);
        router.replace("/");
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
                        <Link href={NAV.shopAll}>Shop <ChevronDown size={16} /></Link>
                        <ul className={styles.dropdown}>
                            <li><Link href={NAV.shopMen}>Male</Link></li>
                            <li><Link href={NAV.shopWomen}>Female</Link></li>
                        </ul>
                    </li>
                    <li>
                        <Link href={NAV.onSale} className={styles.underlineAnimation}>
                            On Sale
                        </Link>
                    </li>
                    <li>
                        <Link href={NAV.newArrivals} className={styles.underlineAnimation}>
                            New Arrivals
                        </Link>
                    </li>
                    <li>
                        <Link href={NAV.brands} className={styles.underlineAnimation}>
                            Brands
                        </Link>
                    </li>
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
                                <li>
                                    <Link href={NAV.shopAll} className={styles.navItem} onClick={toggleMenu}>
                                        All products
                                    </Link>
                                </li>
                                <li>
                                    <Link href={NAV.shopMen} className={styles.navItem} onClick={toggleMenu}>
                                        Male
                                    </Link>
                                </li>
                                <li>
                                    <Link href={NAV.shopWomen} className={styles.navItem} onClick={toggleMenu}>
                                        Female
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link href={NAV.onSale} className={styles.navItem} onClick={toggleMenu}>
                                On Sale
                            </Link>
                        </li>
                        <li>
                            <Link href={NAV.newArrivals} className={styles.navItem} onClick={toggleMenu}>
                                New Arrivals
                            </Link>
                        </li>
                        <li>
                            <Link href={NAV.brands} className={styles.navItem} onClick={toggleMenu}>
                                Brands
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input type="text" placeholder="Search for products..." className={styles.searchInput} />
                </div>

                <div className={styles.actions}>
                    <Search className={styles.searchIconMobile} size={24} />
                    <Link href={authSession ? "/cart" : `${pathname}?auth=login`} aria-label="Cart"><ShoppingCart size={24} /></Link>
                    {authSession ? (
                        <div className={styles.userMenu} ref={userDropdownRef}>
                            <button
                                type="button"
                                className={styles.userMenuButton}
                                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                                aria-expanded={isUserDropdownOpen}
                                aria-haspopup="menu"
                                aria-label="User menu"
                            >
                                <CircleUserRound size={24} />
                                <span className={styles.greeting}>Hi {authSession.user.displayName}</span>
                                <ChevronDown size={16} className={isUserDropdownOpen ? styles.rotated : ""} />
                            </button>
                            {isUserDropdownOpen && (
                                <ul className={styles.userDropdown} role="menu">
                                    <li role="none">
                                        <Link href="/account" role="menuitem" onClick={() => setIsUserDropdownOpen(false)}>My Account</Link>
                                    </li>
                                    <li role="none">
                                        <Link href="/orders" role="menuitem" onClick={() => setIsUserDropdownOpen(false)}>Orders</Link>
                                    </li>
                                    <li role="none">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setIsUserDropdownOpen(false);
                                                setIsLogoutConfirmOpen(true);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        <Link href={`${pathname}?auth=login`} aria-label="Login"><CircleUserRound size={24} /></Link>
                    )}
                </div>
            </nav>
            {isLogoutConfirmOpen && (
                <div
                    className={styles.logoutConfirmOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm logout"
                    onClick={() => setIsLogoutConfirmOpen(false)}
                >
                    <div className={styles.logoutConfirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Log out?</h3>
                        <p>Are you sure you want to log out of your account?</p>
                        <div className={styles.logoutConfirmActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setIsLogoutConfirmOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className={styles.confirmBtn} onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}