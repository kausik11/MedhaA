import { FiBox, FiChevronLeft, FiChevronRight, FiGrid, FiMapPin, FiPackage, FiSearch, FiTag } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/adminRoutes";

const navIcons = {
  products: FiBox,
  categories: FiGrid,
  offers: FiTag,
  addresses: FiMapPin,
  orders: FiPackage,
  orderStatus: FiSearch,
};

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
}) {
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
        {ADMIN_ROUTES.map((item) => {
          const ItemIcon = navIcons[item.id];

          return (
            <NavLink
              key={item.id}
              className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
              end
              to={item.path}
              title={isCollapsed ? item.label : undefined}
            >
              {isCollapsed ? (
                <span className="sidebar-nav-icon-wrap">
                  <ItemIcon className="sidebar-nav-icon" />
                </span>
              ) : (
                <span className="sidebar-link-compact">
                  <span className="sidebar-nav-icon-wrap">
                    <ItemIcon className="sidebar-nav-icon" />
                  </span>
                  <span className="sidebar-link-copy">
                    <strong>{item.label}</strong>
                    <small>{item.eyebrow}</small>
                  </span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
