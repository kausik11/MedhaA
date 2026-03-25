import { useState } from "react";
import { FiBell, FiLogOut, FiMenu, FiRefreshCw, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/adminRoutes";

export function Header({
  currentRoute,
  isRefreshing,
  isSidebarCollapsed,
  onRefresh,
  onLogout,
  onToggleSidebar,
  user,
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const userInitial = user?.firstName?.[0] || user?.email?.[0] || "A";

  const handleSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return;
    }

    const matchedRoute = ADMIN_ROUTES.find((route) =>
      [route.label, route.eyebrow, route.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setSearchValue("");
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-section topbar-left">
        <button
          type="button"
          className="topbar-icon-button"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiMenu className="button-icon" />
        </button>

        <form className="topbar-search" onSubmit={handleSubmit}>
          <FiSearch className="topbar-search-icon" />
          <input
            list="admin-route-suggestions"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search content, services, users"
            aria-label="Search admin routes"
          />
          <datalist id="admin-route-suggestions">
            {ADMIN_ROUTES.map((route) => (
              <option key={route.id} value={route.label} />
            ))}
          </datalist>
        </form>
      </div>

      <div className="topbar-section topbar-right">
        <div className="topbar-route-chip">
          <span>{currentRoute?.eyebrow || "Workspace"}</span>
          <strong>{currentRoute?.label || "Admin"}</strong>
        </div>

        <button
          type="button"
          className="topbar-icon-button"
          onClick={onRefresh}
          aria-label="Refresh"
          title="Refresh"
        >
          <FiRefreshCw className={`button-icon ${isRefreshing ? "spin-icon" : ""}`} />
        </button>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <FiBell className="button-icon" />
        </button>

        <button
          type="button"
          className="topbar-profile"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
        >
          <span className="topbar-profile-badge">{userInitial.toUpperCase()}</span>
          <span className="topbar-profile-copy">
            <strong>{user?.firstName || user?.email}</strong>
            <small>{user?.role}</small>
          </span>
          <FiLogOut className="button-icon" />
        </button>
      </div>
    </header>
  );
}
