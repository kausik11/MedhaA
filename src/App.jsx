import { startTransition, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ConfirmToast } from "./components/ConfirmToast";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CategoriesPanel } from "./components/CategoriesPanel";
import { OffersPanel } from "./components/OffersPanel";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductsPanel } from "./components/ProductsPanel";
import { Sidebar } from "./components/Sidebar";
import { api, getApiBaseUrl } from "./lib/api";

const VIEWS = {
  products: "products",
  categories: "categories",
  offers: "offers",
};

function App() {
  const [activeView, setActiveView] = useState(VIEWS.products);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const showNotice = (type, message) => {
    if (type === "error") {
      toast.error(message);
      return;
    }

    toast.success(message);
  };

  const confirmAction = ({ message, title }) =>
    new Promise((resolve) => {
      let confirmationToastId;

      const handleClose = (confirmed) => {
        toast.dismiss(confirmationToastId);
        resolve(confirmed);
      };

      confirmationToastId = toast(
        <ConfirmToast
          title={title}
          message={message}
          onCancel={() => handleClose(false)}
          onConfirm={() => handleClose(true)}
        />,
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
          className: "confirmation-toast-wrapper",
        }
      );
    });

  useEffect(() => {
    let isCancelled = false;

    const loadDashboard = async () => {
      const isInitialLoad = refreshToken === 0;

      if (isInitialLoad) {
        setProductsLoading(true);
        setCategoriesLoading(true);
        setOffersLoading(true);
      } else {  
        setIsRefreshing(true);
      }

      try {
        const [productsData, categoriesData, offersData] = await Promise.all([
          api.getProducts(),
          api.getProductCategories(),
          api.getOffers(),
        ]);

        if (isCancelled) {
          return;
        }

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setOffers(Array.isArray(offersData) ? offersData : []);
      } catch (error) {
        if (!isCancelled) {
          showNotice("error", error.message || "Unable to refresh dashboard data.");
        }
      } finally {
        if (!isCancelled) {
          setProductsLoading(false);
          setCategoriesLoading(false);
          setOffersLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [refreshToken]);

  const handleCreateProduct = async (formData) => {
    setIsProductSubmitting(true);

    try {
      const createdProduct = await api.createProduct(formData);
      setProducts((current) => [createdProduct, ...current]);
      setIsProductModalOpen(false);
      showNotice("success", "Product created successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to create product.");
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData) => {
    if (!editingProduct?._id) {
      return;
    }

    setIsProductSubmitting(true);

    try {
      const updatedProduct = await api.updateProduct(editingProduct._id, formData);
      setProducts((current) =>
        current.map((product) =>
          product._id === editingProduct._id ? updatedProduct : product
        )
      );
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showNotice("success", "Product updated successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to update product.");
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = await confirmAction({
      title: "Delete product?",
      message: "This will permanently remove the product from the catalog.",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteProduct(productId);
      setProducts((current) => current.filter((product) => product._id !== productId));
      showNotice("success", "Product deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to delete product.");
    }
  };

  const handleCreateCategory = async (name) => {
    try {
      const createdCategory = await api.createProductCategory({ name });
      setCategories((current) =>
        [...current, createdCategory].sort((left, right) => left.name.localeCompare(right.name))
      );
      showNotice("success", "Category created successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to create category.");
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryId, name) => {
    try {
      const updatedCategory = await api.updateProductCategory(categoryId, { name });
      setCategories((current) =>
        current
          .map((category) => (category._id === categoryId ? updatedCategory : category))
          .sort((left, right) => left.name.localeCompare(right.name))
      );
      setProducts((current) =>
        current.map((product) => ({
          ...product,
          category: Array.isArray(product.category)
            ? product.category.map((category) =>
                category._id === categoryId ? { ...category, ...updatedCategory } : category
              )
            : product.category,
        }))
      );
      showNotice("success", "Category updated successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to update category.");
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = await confirmAction({
      title: "Delete category?",
      message: "This will remove the category if no product is currently using it.",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteProductCategory(categoryId);
      setCategories((current) => current.filter((category) => category._id !== categoryId));
      setProducts((current) =>
        current.map((product) => ({
          ...product,
          category: Array.isArray(product.category)
            ? product.category.filter((category) => category._id !== categoryId)
            : product.category,
        }))
      );
      showNotice("success", "Category deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to delete category.");
      throw error;
    }
  };

  const handleCreateOffer = async (payload) => {
    try {
      const createdOffer = await api.createOffer(payload);
      setOffers((current) => [createdOffer, ...current]);
      showNotice("success", "Offer created successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to create offer.");
      throw error;
    }
  };

  const handleUpdateOffer = async (offerId, payload) => {
    try {
      const updatedOffer = await api.updateOffer(offerId, payload);
      setOffers((current) =>
        current.map((offer) => (offer._id === offerId ? updatedOffer : offer))
      );
      showNotice("success", "Offer updated successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to update offer.");
      throw error;
    }
  };

  const handleDeleteOffer = async (offerId) => {
    const confirmed = await confirmAction({
      title: "Delete offer?",
      message: "This will permanently remove the promo code from the backend.",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteOffer(offerId);
      setOffers((current) => current.filter((offer) => offer._id !== offerId));
      showNotice("success", "Offer deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to delete offer.");
      throw error;
    }
  };

  const handleViewChange = (nextView) => {
    startTransition(() => {
      setActiveView(nextView);
    });
  };

  const handleRefresh = () => {
    setRefreshToken((current) => current + 1);
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const stats = {
    products: products.length,
    categories: categories.length,
    offers: offers.length,
  };

  return (
    <div className={`admin-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        activeView={activeView}
        isCollapsed={isSidebarCollapsed}
        onChangeView={handleViewChange}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        stats={stats}
      />

      <div className="dashboard-column">
        <Header
          activeView={activeView}
          isRefreshing={isRefreshing}
          isSidebarCollapsed={isSidebarCollapsed}
          onRefresh={handleRefresh}
          onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
          stats={stats}
        />

        <main className="dashboard-main">
          {activeView === VIEWS.products ? (
            <ProductsPanel
              categories={categories}
              products={products}
              loading={productsLoading}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleOpenEditProduct}
              onOpenAddProduct={handleOpenCreateProduct}
            />
          ) : activeView === VIEWS.categories ? (
            <CategoriesPanel
              categories={categories}
              loading={categoriesLoading}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          ) : (
            <OffersPanel
              offers={offers}
              loading={offersLoading}
              onCreateOffer={handleCreateOffer}
              onDeleteOffer={handleDeleteOffer}
              onUpdateOffer={handleUpdateOffer}
            />
          )}
        </main>

        <Footer apiBaseUrl={getApiBaseUrl()} />
      </div>

      <ProductFormModal
        categories={categories}
        product={editingProduct}
        isOpen={isProductModalOpen}
        isSubmitting={isProductSubmitting}
        onClose={handleCloseProductModal}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
      />

      <ToastContainer
        position="top-right"
        autoClose={2600}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}

export default App;
