
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from Supabase
  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      if (authLoading) return;

      if (!user) {
        if (active) {
          setCartItems([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          products (*)
        `)
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        console.error("Cart loading error:", error.message);
      } else {
        setCartItems(
          data.map((item) => ({
            ...item.products,
            cartItemId: item.id,
            quantity: item.quantity,
          }))
        );
      }

      setLoading(false);
    };

    loadCart();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Add product to cart
  const addToCart = async (product) => {
    if (!user) {
      alert("Please login to add products to your cart.");
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      await updateQuantity(
        product.id,
        existingItem.quantity + 1
      );
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      })
      .select(`
        id,
        quantity,
        products (*)
      `)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setCartItems((previous) => [
      ...previous,
      {
        ...data.products,
        cartItemId: data.id,
        quantity: data.quantity,
      },
    ]);
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1 || !user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .select("id");

    if (error || !data?.length) {
      alert(error?.message || "Unable to update cart.");
      return;
    }

    setCartItems((previous) =>
      previous.map((item) =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remove product
  const removeFromCart = async (productId) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      alert(error.message);
      return;
    }

    setCartItems((previous) =>
      previous.filter((item) => item.id !== productId)
    );
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
