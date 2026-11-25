
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">WELCOME TO SHOPVERSE</p>
          <h1>Discover Your<br />Next Favourite Thing.</h1>
          <p>
            Explore amazing products, great deals and
            everything you need in one place.
          </p>
          <Link to="/products" className="shop-btn">
            Shop Now →
          </Link>
        </div>
      </section>

      <section className="categories">
        <h2>Explore Categories</h2>
        <div className="category-grid">
          <div className="category-card">💻<h3>Electronics</h3></div>
          <div className="category-card">👕<h3>Fashion</h3></div>
          <div className="category-card">🏠<h3>Home & Living</h3></div>
          <div className="category-card">⌚<h3>Accessories</h3></div>
        </div>
      </section>
    </div>
  );
}

export default Home;
