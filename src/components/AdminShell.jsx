import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ProductFormModal } from "./ProductFormModal";
import { Sidebar } from "./Sidebar";
import { ADMIN_DEFAULT_ROUTE, getAdminRoute } from "../constants/adminRoutes";
import { getApiBaseUrl } from "../lib/api";

export function AdminShell({
  categories,
  editingProduct,
  isProductModalOpen,
  isProductSubmitting,
  isRefreshing,
  isSidebarCollapsed,
  onCloseProductModal,
  onLogout,
  onRefresh,
  onSubmitProduct,
  onToggleSidebar,
  setIsSidebarCollapsed,
  user,
}) {
  const location = useLocation();
  const currentRoute = getAdminRoute(location.pathname) || getAdminRoute(ADMIN_DEFAULT_ROUTE);

  return (
    <div className={`admin-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />

      <div className="dashboard-column">
        <Header
          currentRoute={currentRoute}
          isRefreshing={isRefreshing}
          isSidebarCollapsed={isSidebarCollapsed}
          onLogout={onLogout}
          onRefresh={onRefresh}
          onToggleSidebar={onToggleSidebar}
          user={user}
        />

        <main className="dashboard-main">
          <Outlet />
        </main>

        <Footer apiBaseUrl={getApiBaseUrl()} />
      </div>

      <ProductFormModal
        categories={categories}
        product={editingProduct}
        isOpen={isProductModalOpen}
        isSubmitting={isProductSubmitting}
        onClose={onCloseProductModal}
        onSubmit={onSubmitProduct}
      />
    </div>
  );
}
