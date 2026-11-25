
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const navigate = useNavigate();

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={65} />

        <h2>Your Cart is Empty</h2>

        <p>
          You haven't added any products to your cart yet.
        </p>

        <Link to="/products">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <span className="products-label">
            YOUR SHOPPING BAG
          </span>

          <h1>Shopping Cart</h1>

          <p>{totalItems} items in your cart</p>
        </div>
      </div>

      <div className="cart-layout">

        {/* Cart Products */}
        <div className="cart-items">

          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item-info">

                <h3>{item.name}</h3>

                <p className="cart-price">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                <div className="quantity-controls">

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>

                </div>

                <p className="item-subtotal">
                  Subtotal: ₹
                  {(item.price * item.quantity).toLocaleString("en-IN")}
                </p>

              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={20} />
              </button>

            </div>
          ))}

          <Link to="/products" className="continue-shopping">
            ← Continue Shopping
          </Link>

        </div>

        {/* Order Summary */}
        <div className="cart-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span className="free-delivery">FREE</span>
          </div>

          <div className="summary-row total-row">
            <strong>Total Amount</strong>
            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

          <button
            type="button"
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>

          <p className="secure-message">
            Secure checkout · ShopVerse
          </p>

        </div>

      </div>
    </main>
  );
}

export default Cart;
