"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Twitter, Facebook, Instagram, Github } from 'lucide-react';
import styles from './footer.module.scss';

const FOOTER_LINKS = [
  {
    title: 'COMPANY',
    links: ['About', 'Features', 'Works', 'Career']
  },
  {
    title: 'HELP',
    links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy']
  },
  {
    title: 'FAQ',
    links: ['Account', 'Manage Deliveries', 'Orders', 'Payments']
  },
  {
    title: 'RESOURCES',
    links: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist']
  }
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="layout">
        <section className={styles.newsletterBanner}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterHeading}>
              STAY UP TO DATE ABOUT OUR LATEST OFFERS
            </h2>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputWrapper}>
                <Mail className={styles.mailIcon} size={20} />
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className={styles.emailInput}
                />
              </div>
              <button type="submit" className={styles.subscribeBtn}>
                Subscribe to Newsletter
              </button>
            </form>
          </div>
        </section>

        <div className={styles.footerMain}>
          <div className={styles.footerGrid}>
            <div className={styles.brandColumn}>
              <h3 className={styles.brandLogo}>SHOP.CO</h3>
              <p className={styles.brandDesc}>
                We have clothes that suits your style and which you're proud to wear. From women to men.
              </p>
              <div className={styles.socialIcons}>
                <Link href="#" className={styles.socialLink}><Twitter size={18} fill="currentColor" /></Link>
                <Link href="#" className={styles.socialLink}><Facebook size={18} fill="currentColor" /></Link>
                <Link href="#" className={styles.socialLink}><Instagram size={18} /></Link>
                <Link href="#" className={styles.socialLink}><Github size={18} fill="currentColor" /></Link>
              </div>
            </div>

            {FOOTER_LINKS.map((group, index) => (
              <div key={index} className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>{group.title}</h4>
                <ul className={styles.linkList}>
                  {group.links.map((link, i) => (
                    <li key={i}>
                      <Link href="#" className={styles.footerLink}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              Shop.co © 2000–2023, All Rights Reserved
            </p>
            <div className={styles.paymentIcons}>
              <div className={styles.paymentBadge}><Image src="/images/footer/VISA.jpeg" alt="Visa" width={40} height={25} /></div>
              <div className={styles.paymentBadge}><Image src="/images/footer/mastercard.svg" alt="Mastercard" width={40} height={25} /></div>
              <div className={styles.paymentBadge}><Image src="/images/footer/paypal.png" alt="Paypal" width={40} height={25} /></div>
              <div className={styles.paymentBadge}><Image src="/images/footer/applepay.png" alt="Apple Pay" width={40} height={25} /></div>
              <div className={styles.paymentBadge}><Image src="/images/footer/googlepay.png" alt="Google Pay" width={40} height={25} /></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;