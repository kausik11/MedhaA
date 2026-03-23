const navItems = [
  {
    id: "products",
    label: "Products",
    eyebrow: "Catalog",
    description: "Add products and manage the visible inventory.",
  },
  {
    id: "categories",
    label: "Categories",
    eyebrow: "Structure",
    description: "Maintain product categories used across the catalog.",
  },
];

export function Sidebar({ activeView, onChangeView, stats }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <p className="eyebrow">Medha Botanics</p>
        <h1>Admin panel</h1>
        <p className="sidebar-copy">
          Manage product categories and product inventory from one workspace.
        </p>
      </div>

      <nav className="sidebar-nav" aria-label="Admin sections">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeView === item.id ? "is-active" : ""}`}
            type="button"
            onClick={() => onChangeView(item.id)}
          >
            <span className="sidebar-link-top">
              <span className="eyebrow">{item.eyebrow}</span>
              <span className="sidebar-stat">
                {item.id === "products" ? stats.products : stats.categories}
              </span>
            </span>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <p className="eyebrow">API routes</p>
        <p>
          <code>/api/products</code>
        </p>
        <p>
          <code>/api/product-categories</code>
        </p>
      </div>
    </aside>
  );
}
