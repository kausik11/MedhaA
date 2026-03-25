import { FiLogOut, FiMenu, FiRefreshCw } from "react-icons/fi";

export function Header({
  activeView,
  isRefreshing,
  isSidebarCollapsed,
  onRefresh,
  onLogout,
  onToggleSidebar,
  stats,
  user,
}) {
  const title = activeView === "products"
    ? "Products workspace"
    : activeView === "categories"
      ? "Product categories workspace"
      : activeView === "offers"
        ? "Offers workspace"
        : activeView === "addresses"
          ? "Addresses workspace"
          : activeView === "orderStatus"
            ? "Order status workspace"
            : "Orders workspace";
  const subtitle = activeView === "products"
    ? "Open the add-product modal, upload images, and review the live catalog below."
    : activeView === "categories"
      ? "Add, rename, or remove categories used by the backend product routes."
      : activeView === "offers"
        ? "Create promo codes, adjust discount percentages, and keep checkout incentives current."
        : activeView === "addresses"
          ? "Review delivery addresses, update contact details, and keep shipping destinations organized."
          : activeView === "orderStatus"
            ? "Look up a single order by order ID and review the latest status history without opening the full orders workspace."
            : "Review incoming orders, inspect totals, and push each order through the fulfillment pipeline.";

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
          <div className="stat-pill">
            <span>Offers</span>
            <strong>{stats.offers}</strong>
          </div>
          <div className="stat-pill">
            <span>Addresses</span>
            <strong>{stats.addresses}</strong>
          </div>
          <div className="stat-pill">
            <span>Orders</span>
            <strong>{stats.orders}</strong>
          </div>
        </div>

        <div className="header-button-row">
          <div className="admin-user-pill">
            <span>Signed in as</span>
            <strong>{user?.firstName || user?.email}</strong>
            <small>{user?.role}</small>
          </div>
          <button type="button" className="ghost-button refresh-button" onClick={onToggleSidebar}>
            <FiMenu className="button-icon" />
            {isSidebarCollapsed ? "Expand menu" : "Collapse menu"}
          </button>
          <button type="button" className="ghost-button refresh-button" onClick={onRefresh}>
            <FiRefreshCw className={`button-icon ${isRefreshing ? "spin-icon" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="ghost-danger-button refresh-button" onClick={onLogout}>
            <FiLogOut className="button-icon" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
