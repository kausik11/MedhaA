export function Header({ activeView, isRefreshing, onRefresh, stats }) {
  const title =
    activeView === "products" ? "Products workspace" : "Product categories workspace";
  const subtitle =
    activeView === "products"
      ? "Open the add-product modal, upload images, and review the live catalog below."
      : "Add, rename, or remove categories used by the backend product routes.";

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Operations</p>
        <h2>{title}</h2>
        <p className="header-copy">{subtitle}</p>
      </div>

      <div className="header-controls">
        <div className="header-stats">
          <div className="stat-pill">
            <span>Products</span>
            <strong>{stats.products}</strong>
          </div>
          <div className="stat-pill">
            <span>Categories</span>
            <strong>{stats.categories}</strong>
          </div>
        </div>

        <button type="button" className="ghost-button refresh-button" onClick={onRefresh}>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </header>
  );
}
