import { useState, useEffect } from "react"
import { products as productsApi } from "../services/api"
import Sidebar from "../components/Sidebar"

export default function Products() {
  const [productList, setProductList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    sku: "",
    stock_quantity: "",
    image_url: "",
  })

  // ── Fetch products only once on mount ──
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await productsApi.getAll()
        setProductList(data.products)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)
    try {
      await productsApi.create({
        ...form,
        price: parseFloat(form.price),
        category: parseInt(form.category),
        stock_quantity: parseInt(form.stock_quantity),
      })

      setForm({
        name: "", description: "", price: "", category: "",
        brand: "", sku: "", stock_quantity: "", image_url: "",
      })
      setShowForm(false)

      // Only update the list, sidebar stays untouched
      const data = await productsApi.getAll()
      setProductList(data.products)

    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await productsApi.delete(id)
      setProductList(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const categoryNames = { 1: "Services", 2: "Supplies", 3: "Packages" }

  return (
    <div style={styles.page}>
      {/* Sidebar stays persistent */}
      <Sidebar activePage="/products" />

      {/* Main content updates without affecting sidebar */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Products</h1>
            <p style={styles.sub}>{productList.length} products in database</p>
          </div>
          <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>

        {loading && <p style={styles.center}>Loading products...</p>}
        {error && <p style={styles.center}>Error: {error}</p>}

        {!loading && !error && (
          <>
            {showForm && (
              <form onSubmit={handleCreate} style={styles.form}>
                <h3 style={{ color: "#fff", marginBottom: "1rem" }}>New Product</h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name *</label>
                    <input style={styles.input} name="name" value={form.name} onChange={handleFormChange} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Brand</label>
                    <input style={styles.input} name="brand" value={form.brand} onChange={handleFormChange} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>SKU</label>
                    <input style={styles.input} name="sku" value={form.sku} onChange={handleFormChange} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price (R) *</label>
                    <input style={styles.input} name="price" type="number" value={form.price} onChange={handleFormChange} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Stock Quantity</label>
                    <input style={styles.input} name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleFormChange} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select style={styles.input} name="category" value={form.category} onChange={handleFormChange} required>
                      <option value="">Select category</option>
                      <option value="1">1 - Services</option>
                      <option value="2">2 - Supplies</option>
                      <option value="3">3 - Packages</option>
                    </select>
                  </div>
                  <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
                    <label style={styles.label}>Image URL</label>
                    <input style={styles.input} name="image_url" value={form.image_url} onChange={handleFormChange} />
                  </div>
                  <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
                    <label style={styles.label}>Description *</label>
                    <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }} name="description" value={form.description} onChange={handleFormChange} required />
                  </div>
                </div>
                {formError && <p style={styles.error}>{formError}</p>}
                <button style={styles.addButton} type="submit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Product"}
                </button>
              </form>
            )}

            <div style={styles.table}>
              <div style={{ ...styles.row, ...styles.tableHeader }}>
                <span>Name</span>
                <span>Category</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Actions</span>
              </div>

              {productList.length === 0 && <p style={{ color: "#666", padding: "1rem" }}>No products found.</p>}

              {productList.map(product => (
                <div key={product.id} style={styles.row}>
                  <span style={{ color: "#fff" }}>{product.name}</span>
                  <span style={{ color: "#aaa" }}>{categoryNames[product.category] || product.category}</span>
                  <span style={{ color: "#f5a623" }}>R {product.price}</span>
                  <span style={{ color: "#aaa" }}>{product.stock_quantity ?? "--"}</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff" },
  main: { flex: 1, padding: "2.5rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" },
  heading: { margin: 0, fontSize: "1.8rem" },
  sub: { color: "#666", marginTop: "0.25rem" },
  addButton: { padding: "0.6rem 1.2rem", backgroundColor: "#f5a623", border: "none", borderRadius: "8px", color: "#000", fontWeight: "bold", cursor: "pointer" },
  form: { backgroundColor: "#1a1a1a", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #2a2a2a" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#aaa", fontSize: "0.85rem" },
  input: { padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0f0f0f", color: "#fff", fontSize: "0.95rem" },
  table: { backgroundColor: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden" },
  tableHeader: { backgroundColor: "#222", color: "#666", fontSize: "0.85rem" },
  row: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "0.9rem 1.25rem", borderBottom: "1px solid #2a2a2a", alignItems: "center" },
  deleteBtn: { padding: "0.35rem 0.75rem", backgroundColor: "transparent", border: "1px solid #e74c3c", color: "#e74c3c", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" },
  error: { color: "#e74c3c", fontSize: "0.9rem", margin: "0 0 1rem 0" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#aaa", backgroundColor: "#0f0f0f" },
}