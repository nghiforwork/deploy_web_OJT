"use client"
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './breadcrumb.module.scss';

const Breadcrumb = ({
  dressStyleSegment,
  category,
}: {
  /** Nhãn cấp Dress Style khi có chọn style; không có thì ẩn cấp này. */
  dressStyleSegment?: string | null;
  category: string;
}) => {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {dressStyleSegment && (
        <>
          <ChevronRight size={16} aria-hidden />
          <span>{dressStyleSegment}</span>
        </>
      )}
      <ChevronRight size={16} aria-hidden />
      <span>{category}</span>
    </nav>
  );
};

export default Breadcrumb;