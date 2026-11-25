
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { getProducts } from "../services/products";
import "./Products.css";

function Products() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      name: product.name,
      image: product.image,
      price: Number(product.price),
    });
  };

  if (loading) {
    return <h2 style={{ padding: 40 }}>Loading products...</h2>;
  }

  if (error) {
    return <h2 style={{ padding: 40 }}>Error: {error}</h2>;
  }

  return (
    <main className="products-page">
      <div className="products-heading">
        <h1>Explore Our Products</h1>
        <p>Discover amazing products at great prices.</p>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="product-search"
      />

      <div className="category-filters">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />

            <div className="product-info">
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>⭐ {product.rating}</p>
              <h2>
                ₹{Number(product.price).toLocaleString("en-IN")}
              </h2>

              <button onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p style={{ textAlign: "center", padding: 30 }}>
          No products found.
        </p>
      )}
    </main>
  );
}

export default Products;
