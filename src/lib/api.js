const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");
const AUTH_STORAGE_KEY = "medha_admin_auth";

let authSession = loadStoredSession();

function loadStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getAuthSession() {
  return authSession;
}

export function setAuthSession(session) {
  authSession = session && session.token && session.user ? session : null;

  if (typeof window === "undefined") {
    return;
  }

  if (!authSession) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
}

export function clearAuthSession() {
  setAuthSession(null);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (authSession?.token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authSession.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    searchParams.set(key, `${value}`);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const api = {
  login(payload) {
    return request("/users/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  sendRegistrationEmailOtp(payload) {
    return request("/users/send-registration-email-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  verifyRegistrationEmailOtp(payload) {
    return request("/users/verify-registration-email-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  sendEmailVerificationOtp() {
    return request("/users/send-email-verification-otp", {
      method: "POST",
    });
  },
  verifyEmailOtp(payload) {
    return request("/users/verify-email-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  sendForgotPasswordOtp(payload) {
    return request("/users/forgot-password/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  verifyForgotPasswordOtp(payload) {
    return request("/users/forgot-password/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  resetForgotPassword(payload) {
    return request("/users/forgot-password/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  registerUser(formData) {
    return request("/users/register", {
      method: "POST",
      body: formData,
    });
  },
  getUsers() {
    return request("/users");
  },
  getUserById(userId) {
    return request(`/users/${userId}`);
  },
  updateUser(userId, formData) {
    return request(`/users/${userId}`, {
      method: "PUT",
      body: formData,
    });
  },
  getProducts(params) {
    return request(`/products${buildQueryString(params)}`);
  },
  getProductById(productId) {
    return request(`/products/${productId}`);
  },
  getProductBySlug(slug) {
    return request(`/products/slug/${encodeURIComponent(slug)}`);
  },
  createProduct(formData) {
    return request("/products", {
      method: "POST",
      body: formData,
    });
  },
  updateProduct(productId, formData) {
    return request(`/products/${productId}`, {
      method: "PUT",
      body: formData,
    });
  },
  deleteProduct(productId) {
    return request(`/products/${productId}`, {
      method: "DELETE",
    });
  },
  updateProductPublicationStatus(productId, payload) {
    return request(`/products/${productId}/publication-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  getProductCategories() {
    return request("/product-categories");
  },
  createProductCategory(payload) {
    return request("/product-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  updateProductCategory(categoryId, payload) {
    return request(`/product-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteProductCategory(categoryId) {
    return request(`/product-categories/${categoryId}`, {
      method: "DELETE",
    });
  },
  getOffers() {
    return request("/offers");
  },
  createOffer(payload) {
    return request("/offers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  updateOffer(offerId, payload) {
    return request(`/offers/${offerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteOffer(offerId) {
    return request(`/offers/${offerId}`, {
      method: "DELETE",
    });
  },
  getAddresses() {
    return request("/addresses");
  },
  createAddress(payload) {
    return request("/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  updateAddress(addressId, payload) {
    return request(`/addresses/${addressId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteAddress(addressId) {
    return request(`/addresses/${addressId}`, {
      method: "DELETE",
    });
  },
  getOrders() {
    return request("/orders");
  },
  getOrderStatusByOrderId(orderId) {
    return request(`/orders/order-id/${encodeURIComponent(orderId)}/status`);
  },
  createOrder(payload) {
    return request("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  updateOrderStatus(orderId, payload) {
    return request(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteOrder(orderId) {
    return request(`/orders/${orderId}`, {
      method: "DELETE",
    });
  },
};
