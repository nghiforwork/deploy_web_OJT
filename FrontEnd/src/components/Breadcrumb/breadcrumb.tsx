"use client"
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './breadcrumb.module.scss';

const Breadcrumb = ({ category }: { category: string }) => {
  return (
    <nav className={styles.breadcrumb}>
      <Link href="/">Home</Link>
      <ChevronRight size={16} />
      <span>{category}</span>
    </nav>
  );
};

export default Breadcrumb;