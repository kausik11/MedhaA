import { FiBox, FiChevronLeft, FiChevronRight, FiGrid, FiTag } from "react-icons/fi";

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
    return stats.offers;
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
