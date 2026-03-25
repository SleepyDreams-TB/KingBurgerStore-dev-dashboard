// This is the base URL of your live API
// Every request in the app will start with this
const BASE_URL = "https://api.kingburger.site"
const DEV_KEY = import.meta.env.VITE_DEV_KEY
// ==================== CORE FETCH FUNCTION ====================
// Instead of writing fetch() everywhere, we have one central function
// that all our API calls use. This way if anything changes (like adding
// a header), we only change it in one place.
async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem("token")

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    // credentials: "include" tells the browser to send the httpOnly
    // cookie (your JWT token) with every request automatically
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  // If the server returned an error status, throw it so we can
  // catch it in the component and show an error message
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Something went wrong")
  }

  return data
}

// ==================== AUTH ====================
export const auth = {
  loginStep: (userName, password) => {
    const form = new FormData()
    form.append("userName", userName)
    form.append("password", password)
    return request("/auth/login-step", { method: "POST", body: form, headers: {} })
  },

  qrStep: (user_id, digit_code) => {
    const form = new FormData()
    form.append("user_id", user_id)
    form.append("digit_code", digit_code)
    return request("/auth/qr-step", { method: "POST", body: form, headers: {} })
  },
  devLogin: (userName, password, digit_code) => {
    const form = new FormData()
    form.append("userName", userName)
    form.append("password", password)
    form.append("digit_code", digit_code)
    form.append("dev_key", DEV_KEY)

    return request("/auth/dev-login", { method: "POST", body: form, headers: {} })
  },

  me: () => request("/auth/me"),

  logout: () => request("/auth/logout", { method: "POST" }),
}

// ==================== PRODUCTS ====================
export const products = {
  getAll: (category) =>
    request(`/products/${category ? `?category=${category}` : ""}`),

  getOne: (id) => request(`/products/${id}`),

  create: (productData) =>
    request("/products/", { method: "POST", body: JSON.stringify(productData) }),

  update: (id, updates) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(updates) }),

  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
}

// ==================== ORDERS ====================
export const orders = {
  getAll: (params = {}) => {
    // Build query string from whatever filters are passed in
    // e.g. { page: 1, status: "pending" } → "?page=1&status=pending"
    const query = new URLSearchParams(params).toString()
    return request(`/api/orders/me${query ? `?${query}` : ""}`)
  },
} 