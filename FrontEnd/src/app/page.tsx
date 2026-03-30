import DressStyle from "@/components/DressStyle/dressStyle";
import Footer from "@/components/Footer/footer";
import Hero from "@/components/Hero/hero";
import Navigation from "@/components/Navigation/navigation";
import ProductSection from "@/components/ProductSection/productSection";
import TestimonialSection from "@/components/Testimonials/TestimonialSection";
import { fetchCatalogProducts } from "@/services/catalog.service";

import type { CatalogProduct } from "@/types/catalog";

export default async function Home() {
  const pageSize = 4;

  // NEW ARRIVALS: lấy sản phẩm mới nhất theo created_at.
  // TOP SELLING: hiện tại backend đang hỗ trợ ordering theo stock (Most Popular = -stock).
  let newArrivals: CatalogProduct[] = [];
  let topSelling: CatalogProduct[] = [];

  try {
    const [newArrivalsRes, topSellingRes] = await Promise.all([
      fetchCatalogProducts({
        page: 1,
        pageSize,
        ordering: "-created_at",
      }),
      fetchCatalogProducts({
        page: 1,
        pageSize,
        ordering: "-stock",
      }),
    ]);

    newArrivals = newArrivalsRes.results;
    topSelling = topSellingRes.results;
  } catch {
    // Nếu API lỗi/không chạy, vẫn render layout trang với danh sách rỗng.
    newArrivals = [];
    topSelling = [];
  }

  return (
    <main>
      <Navigation />
      <Hero />
      <ProductSection
        title="NEW ARRIVALS"
        products={newArrivals}
        viewAllHref="/category/all?sort=Newest"
      />
      <ProductSection
        title="TOP SELLING"
        products={topSelling}
        hideBorder
        viewAllHref="/category/all?sort=Most%20Popular"
      />
      <DressStyle />
      <TestimonialSection />
      <Footer />
    </main>
  );
}
