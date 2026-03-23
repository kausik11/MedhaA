import { useDeferredValue, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { ProductCard } from "./ProductCard";

export function ProductsPanel({
  categories,
  loading,
  onDeleteProduct,
  onEditProduct,
  onOpenAddProduct,
  products,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const searchValue = deferredSearchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchValue ||
      [product.title, product.genericName, product.description, product.slug]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(searchValue));

    const categoryNames = Array.isArray(product.category)
      ? product.category.map((item) => item.name)
      : [];
    const matchesCategory =
      categoryFilter === "all" || categoryNames.includes(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Catalog control</p>
          <h3>Products</h3>
          <p>
            Add new products from the modal and review all available products with images below.
          </p>
        </div>

        <button type="button" className="primary-button" onClick={onOpenAddProduct}>
          <FiPlus className="button-icon" />
          Add product
        </button>
      </div>

      <div className="filter-bar">
        <label className="field-shell">
          <span>Search products</span>
          <input
            type="search"
            placeholder="Search title, slug, generic name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <label className="field-shell">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="empty-state">
          <h4>Loading products...</h4>
          <p>The catalog is being fetched from the backend.</p>
        </div>
      ) : filteredProducts.length ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={onDeleteProduct}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No products found</h4>
          <p>Create your first product or adjust the filters to see more items.</p>
        </div>
      )}
    </section>
  );
}
