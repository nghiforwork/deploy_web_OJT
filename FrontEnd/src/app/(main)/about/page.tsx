export default function About() {

  const products = [
    {
      name: "Product 1",
      price: 100,
      description: "This is a product",
      image: "https://via.placeholder.com/150",
      category: "Category 1"
    },
    {
      name: "Product 2",
      price: 100,
      description: "This is a product",
      image: "https://via.placeholder.com/150",
      category: "Category 1"
    },
    {
      name: "Product 3",
      price: 100,
      description: "This is a product",
      image: "https://via.placeholder.com/150",
      category: "Category 1"
    },
  ]
  return (
    <div>
      <h1>About Page</h1>
      <div className="banner"></div>
      <p>This is the about page.</p>
    </div>
  );
}
