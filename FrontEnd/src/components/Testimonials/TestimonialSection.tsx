"use client";
import React, { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import styles from "./testimonials.module.scss";
import { Testimonial } from "@/types/testimonial";

const TESTIMONIAL_DATA: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    verified: true,
    content:
      "I'm blown away by the quality and style of the clothes I received from SHOP.CO. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
  },
  {
    id: 2,
    name: "Alex K.",
    rating: 5,
    verified: true,
    content:
      "Finding clothes that align with my personal style used to be a challenge until I discovered SHOP.CO. The range of options they offer is truly remarkable, catering to a variety of tastes.",
  },
  {
    id: 3,
    name: "James L.",
    rating: 5,
    verified: true,
    content:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon SHOP.CO. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
  {
    id: 4,
    name: "Mooen X.",
    rating: 5,
    verified: true,
    content:
      "The customer service was amazing! They helped me find the perfect size and the shipping was incredibly fast. Highly recommend for anyone looking for quality.",
  },
  {
    id: 5,
    name: "Mooen S.",
    rating: 5,
    verified: true,
    content:
      "The customer service was amazing! They helped me find the perfect size and the shipping was incredibly fast. Highly recommend for anyone looking for quality.",
  },
];

const TestimonialSection = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.testimonialSection}>
      <div className="layout">
        <div className={styles.header}>
          <h2 className={styles.title}>OUR HAPPY CUSTOMERS</h2>
          <div className={styles.navigation}>
            <button onClick={() => scroll("left")} aria-label="Previous">
              <ArrowLeft size={24} />
            </button>
            <button onClick={() => scroll("right")} aria-label="Next">
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <div className={styles.slider} ref={sliderRef}>
          {TESTIMONIAL_DATA.map((item) => (
            <TestimonialCard
              key={item.id}
              name={item.name}
              rating={item.rating}
              content={item.content}
              verified={item.verified}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
