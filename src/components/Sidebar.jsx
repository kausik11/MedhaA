import { FiBox, FiChevronLeft, FiChevronRight, FiGrid } from "react-icons/fi";

const navItems = [
  {
    id: "products",
    label: "Products",
    eyebrow: "Catalog",
    description: "Add products and manage the visible inventory.",
    icon: FiBox,
  },
  {
    id: "categories",
    label: "Categories",
    eyebrow: "Structure",
    description: "Maintain product categories used across the catalog.",
    icon: FiGrid,
  },
];

export function Sidebar({
  activeView,
  isCollapsed,
  onChangeView,
  onToggleCollapse,
  stats,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top-row">
        <div className="brand-block">
          {!isCollapsed ? (
            <>
              <p className="eyebrow">Medha Botanics</p>
              <h1>Admin panel</h1>
              <p className="sidebar-copy">
                Manage product categories and product inventory from one workspace.
              </p>
            </>
          ) : (
            <div className="sidebar-mini-brand">MB</div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight className="button-icon" /> : <FiChevronLeft className="button-icon" />}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Admin sections">
        {navItems.map((item) => {
          const ItemIcon = item.icon;

          return (
            <button
              key={item.id}
              className={`sidebar-link ${activeView === item.id ? "is-active" : ""}`}
              type="button"
              onClick={() => onChangeView(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              {isCollapsed ? (
                <>
                  <span className="sidebar-nav-icon-wrap">
                    <ItemIcon className="sidebar-nav-icon" />
                  </span>
                  <span className="sidebar-stat sidebar-stat-compact">
                    {item.id === "products" ? stats.products : stats.categories}
                  </span>
                </>
              ) : (
                <>
                  <span className="sidebar-link-top">
                    <span className="eyebrow">{item.eyebrow}</span>
                    <span className="sidebar-stat">
                      {item.id === "products" ? stats.products : stats.categories}
                    </span>
                  </span>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed ? (
        <div className="sidebar-card">
          <p className="eyebrow">API routes</p>
          <p>
            <code>/api/products</code>
          </p>
          <p>
            <code>/api/product-categories</code>
          </p>
        </div>
      ) : null}
    </aside>
  );
}
