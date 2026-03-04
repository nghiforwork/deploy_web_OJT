import Hero from "@/components/Hero/hero";
import Navigation from "@/components/Navigation/navigation";
import ProductSection from "@/components/ProductSection/productSection";
import { Product } from "@/types/product";

export default function Home() {
  const newArrivals: Product[] = [
    {
      id: 1,
      name: "T-shirt with Tape Details",
      image: "/images/products/black-tshirt.png",
      rating: 4.5,
      price: 120,
    },
    {
      id: 2,
      name: "Skinny Fit Jeans",
      image: "/images/products/blue-jeans.png",
      rating: 3.5,
      price: 240,
      originalPrice: 260,
      discountLabel: "-20%",
    },
    {
      id: 3,
      name: "Checkered Shirt",
      image: "/images/products/purple-shirt.png",
      rating: 4.5,
      price: 180,
    },
    {
      id: 4,
      name: "Sleeve Striped T-shirt",
      image: "/images/products/black-orange-tshirt.png",
      rating: 4.5,
      price: 130,
      originalPrice: 160,
      discountLabel: "-30%",
    },
  ];

  const topSelling: Product[] = [
    {
      id: 5,
      name: "Vertical Striped Shirt",
      image: "/images/products/green-shirt.png",
      rating: 5.0,
      price: 212,
      originalPrice: 232,
      discountLabel: "-20%",
    },
    {
      id: 6,
      name: "Courage Graphic T-shirt",
      image: "/images/products/orange-tshirt.png",
      rating: 4.0,
      price: 145,
    },
    {
      id: 7,
      name: "Loose Fit Bermuda Shorts",
      image: "/images/products/blue-short.png",
      rating: 3.0,
      price: 80,
    },
    {
      id: 8,
      name: "Faded Skinny Jeans",
      image: "/images/products/black-jeans.png",
      rating: 4.5,
      price: 210,
    },
  ];

  return (
    <main>
      <Navigation />
      <Hero />
      <ProductSection title="NEW ARRIVALS" products={newArrivals} />
      <ProductSection title="TOP SELLING" products={topSelling} />
    </main>
  );
}
