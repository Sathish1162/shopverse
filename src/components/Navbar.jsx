
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        ShopVerse
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
      >
        <span className={menuOpen ? "bar bar1 active" : "bar bar1"}></span>
        <span className={menuOpen ? "bar bar2 active" : "bar bar2"}></span>
        <span className={menuOpen ? "bar bar3 active" : "bar bar3"}></span>
      </button>

      <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>

        <Link to="/products" onClick={closeMenu}>Products</Link>

        <Link to="/cart" onClick={closeMenu}>
          Cart <span className="cart-count">({cartCount})</span>
        </Link>

        {user && (
          <Link to="/my-orders" onClick={closeMenu}>
            My Orders
          </Link>
        )}

        {user?.app_metadata?.role === "admin" && (
          <Link to="/admin" onClick={closeMenu}>
            Admin
          </Link>
        )}

        {user ? (
          <>
            <span className="nav-user">
              {user.user_metadata?.full_name || user.email}
            </span>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>

            <Link
              to="/register"
              className="register-link"
              onClick={closeMenu}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
