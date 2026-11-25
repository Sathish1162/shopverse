
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import "./Checkout.css";

function Checkout() {
  const { cartItems, loading: cartLoading } = useCart();
  const { user } = useAuth();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data, error: orderError } = await supabase.rpc(
        "place_order",
        {
          p_customer_name: customer.name.trim(),
          p_phone: customer.phone.trim(),
          p_delivery_address: customer.address.trim(),
        }
      );

      if (orderError) {
        throw orderError;
      }

      setOrderId(data);
      setOrderPlaced(true);
    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return <h2 style={{ padding: 40 }}>Loading checkout...</h2>;
  }

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with ShopVerse.</p>
        <h3>Order ID: {orderId}</h3>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <Link to="/products">Shop Now</Link>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>
      <p className="checkout-subtitle">
        Enter your delivery information.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Delivery Details</h2>

          <label>Customer Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={customer.name}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter 10-digit phone number"
            pattern="[0-9]{10}"
            maxLength={10}
            value={customer.phone}
            onChange={handleChange}
            required
          />

          <label>Delivery Address</label>
          <textarea
            name="address"
            placeholder="Enter your complete delivery address"
            value={customer.address}
            onChange={handleChange}
            maxLength={500}
            required
          />

          {error && (
            <p style={{ color: "red" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="place-order-btn"
            disabled={submitting}
          >
            {submitting
              ? "Placing Order..."
              : `Place Order · ₹${total.toLocaleString("en-IN")}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="checkout-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                ₹
                {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
