const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export const api = {
  getProducts() {
    return request("/products");
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
};
