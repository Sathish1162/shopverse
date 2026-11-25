
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import "./Admin.css";

function Admin() {
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const initialForm = {
    name: "",
    category: "Electronics",
    price: "",
    image: "",
    rating: "4.5",
    description: "",
  };

  const [form, setForm] = useState(initialForm);

  const isAdmin = user?.app_metadata?.role === "admin";

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
      setError("");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  if (authLoading) return <p className="admin-message">Checking access...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <h2 className="admin-message">Access denied. Admins only.</h2>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image || "",
      rating: String(product.rating || 4.5),
      description: product.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const productData = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      image: form.image.trim(),
      rating: Number(form.rating),
      description: form.description.trim(),
    };

    const result = editingId
      ? await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
      : await supabase
          .from("products")
          .insert([productData]);

    if (result.error) {
      setError(result.error.message);
    } else {
      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
      await fetchProducts();
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await fetchProducts();
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-label">SHOPVERSE MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your store products from one place.</p>
        </div>

        <button className="add-product-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Total Products</span>
          <h2>{products.length}</h2>
        </div>
        <div className="admin-stat-card">
          <span>Categories</span>
          <h2>{new Set(products.map((p) => p.category)).size}</h2>
        </div>
        <div className="admin-stat-card">
          <span>Store Status</span>
          <h2 className="store-active">Active</h2>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {showForm && (
        <section className="admin-form-section">
          <div className="admin-form-heading">
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            <button
              type="button"
              className="close-form-btn"
              onClick={() => setShowForm(false)}
            >
              <X />
            </button>
          </div>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            <label>
              Product Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>Accessories</option>
              </select>
            </label>

            <label>
              Price (₹)
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Rating
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
              />
            </label>

            <label className="full-field">
              Image URL
              <input
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </label>

            <label className="full-field">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </label>

            <button
              className="save-product-btn full-field"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
            </button>
          </form>
        </section>
      )}

      <section className="admin-products-section">
        <h2>Product Inventory</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-name">
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                    <td>⭐ {product.rating}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="edit-product-btn"
                          onClick={() => openEditForm(product)}
                          aria-label="Edit product"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="delete-product-btn"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Delete product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
