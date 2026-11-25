
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import "./MyOrders.css";

function MyOrders() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            product_name,
            unit_price,
            quantity
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setError(error.message);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <h2 className="orders-message">Loading your orders...</h2>;
  }

  if (!user) {
    return (
      <div className="orders-empty">
        <h2>Please log in to view your orders.</h2>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  if (error) {
    return <h2 className="orders-message">Error: {error}</h2>;
  }

  return (
    <main className="my-orders-page">
      <div className="orders-heading">
        <h1>My Orders</h1>
        <p>Track and manage your ShopVerse purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders yet!</h2>
          <p>Your purchases will appear here.</p>
          <Link to="/products">Explore Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <span>Order ID</span>
                  <h3>{order.id}</h3>
                </div>

                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <p className="order-date">
                Ordered on:{" "}
                {new Date(order.created_at).toLocaleString("en-IN")}
              </p>

              <div className="ordered-products">
                {order.order_items.map((item) => (
                  <div className="ordered-product" key={item.id}>
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <strong>
                      ₹
                      {(Number(item.unit_price) * item.quantity)
                        .toLocaleString("en-IN")}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span>Total Amount</span>
                <h2>
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyOrders;
