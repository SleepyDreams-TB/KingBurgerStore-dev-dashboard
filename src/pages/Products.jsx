import { useState, useEffect } from "react"
import { products as productsApi } from "../services/api"
import DashboardLayout from "../components/DashboardLayout"

const CATEGORY_NAMES = { 1: "Services", 2: "Supplies", 3: "Packages" }
const EMPTY_FORM = {
  name: "", description: "", price: "", category: "",
  brand: "", sku: "", stock_quantity: "", image_url: "",
}

export default function Products() {
  const [productList, setProductList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    (async () => {
      try {
        const data = await productsApi.getAll()
        setProductList(data.products)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
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
      setForm(EMPTY_FORM)
      setShowForm(false)
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

  return (
    <DashboardLayout activePage="/products" title="Products">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{productList.length} products in database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">New Product</h2>
          </div>
          <form onSubmit={handleCreate} className="form">
            <div className="form-grid">
              <div className="form-group">
                <label className="label">Name *</label>
                <input className="input" name="name" value={form.name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label className="label">Brand</label>
                <input className="input" name="brand" value={form.brand} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="label">SKU</label>
                <input className="input" name="sku" value={form.sku} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="label">Price (R) *</label>
                <input className="input" name="price" type="number" step="0.01" value={form.price} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label className="label">Stock Quantity</label>
                <input className="input" name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label className="label">Category *</label>
                <select className="select" name="category" value={form.category} onChange={handleFormChange} required>
                  <option value="">Select category</option>
                  <option value="1">Services</option>
                  <option value="2">Supplies</option>
                  <option value="3">Packages</option>
                </select>
              </div>
              <div className="form-group form-group-full">
                <label className="label">Image URL</label>
                <input className="input" name="image_url" value={form.image_url} onChange={handleFormChange} />
              </div>
              <div className="form-group form-group-full">
                <label className="label">Description *</label>
                <textarea className="textarea" name="description" value={form.description} onChange={handleFormChange} required />
              </div>
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={formLoading}>
                {formLoading ? <><span className="spinner" /> Creating…</> : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="table-loading">Loading products…</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={5} className="table-empty text-danger">Error: {error}</td></tr>
            )}
            {!loading && !error && productList.length === 0 && (
              <tr><td colSpan={5} className="table-empty">No products found.</td></tr>
            )}
            {!loading && !error && productList.map(product => (
              <tr key={product.id}>
                <td data-label="Name" className="cell-strong">{product.name}</td>
                <td data-label="Category" className="cell-muted">
                  {CATEGORY_NAMES[product.category] || product.category}
                </td>
                <td data-label="Price" className="cell-accent">R {product.price}</td>
                <td data-label="Stock" className="cell-muted">{product.stock_quantity ?? "--"}</td>
                <td data-label="Actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
