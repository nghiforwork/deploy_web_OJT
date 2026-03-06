import React from 'react';
import { Star, Check } from 'lucide-react';
import styles from './testimonials.module.scss';
import { Testimonial } from '@/types/testimonial';

interface TestimonialCardProps extends Omit<Testimonial, 'id'> {}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, content, rating, verified = true }) => {
  return (
    <div className={styles.card}>
      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={20} 
            fill={i < rating ? "#FFC633" : "none"} 
            stroke={i < rating ? "#FFC633" : "#e0e0e0"} 
          />
        ))}
      </div>
      <div className={styles.userInfo}>
        <span className={styles.name}>{name}</span>
        {verified && (
          <div className={styles.badge}>
            <Check size={12} color="white" strokeWidth={4} />
          </div>
        )}
      </div>
      <p className={styles.content}>"{content}"</p>
    </div>
  );
};

export default TestimonialCard;