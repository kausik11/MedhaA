import { FiBox, FiChevronLeft, FiChevronRight, FiGrid, FiMapPin, FiPackage, FiSearch, FiTag } from "react-icons/fi";

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
  {
    id: "offers",
    label: "Offers",
    eyebrow: "Checkout",
    description: "Manage promo codes and percentage discounts for orders.",
    icon: FiTag,
  },
  {
    id: "addresses",
    label: "Addresses",
    eyebrow: "Delivery",
    description: "Manage delivery addresses used across orders.",
    icon: FiMapPin,
  },
  {
    id: "orders",
    label: "Orders",
    eyebrow: "Fulfillment",
    description: "Review orders and update their fulfillment status.",
    icon: FiPackage,
  },
  {
    id: "orderStatus",
    label: "Track order",
    eyebrow: "Support",
    description: "Fetch the latest status timeline for a specific order ID.",
    icon: FiSearch,
  },
];

export function Sidebar({
  activeView,
  isCollapsed,
  onChangeView,
  onToggleCollapse,
  stats,
}) {
  const getStatValue = (itemId) => {
    if (itemId === "products") return stats.products;
    if (itemId === "categories") return stats.categories;
    if (itemId === "offers") return stats.offers;
    if (itemId === "addresses") return stats.addresses;
    if (itemId === "orderStatus") return stats.orders;
    return stats.orders;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top-row">
        <div className="brand-block">
          {!isCollapsed ? (
            <>
              <p className="eyebrow">Medha Botanics</p>
              <h1>Admin</h1>
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
                    {getStatValue(item.id)}
                  </span>
                </>
              ) : (
                <>
                  <span className="sidebar-link-compact">
                    <span className="sidebar-nav-icon-wrap">
                      <ItemIcon className="sidebar-nav-icon" />
                    </span>
                    <strong>{item.label}</strong>
                    <span className="sidebar-stat">
                      {getStatValue(item.id)}
                    </span>
                  </span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
