import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ConfirmToast } from "./components/ConfirmToast";
import { AdminShell } from "./components/AdminShell";
import { CategoriesPanel } from "./components/CategoriesPanel";
import { AddressesPanel } from "./components/AddressesPanel";
import { OffersPanel } from "./components/OffersPanel";
import { OrdersPanel } from "./components/OrdersPanel";
import { OrderStatusPanel } from "./components/OrderStatusPanel";
import { ProductsPanel } from "./components/ProductsPanel";
import { LoginScreen } from "./components/LoginScreen";
import {
  api,
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "./lib/api";
import { ADMIN_DEFAULT_ROUTE } from "./constants/adminRoutes";

function App() {
  const navigate = useNavigate();
  const [authSession, setAuthSessionState] = useState(() => getAuthSession());
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
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
    if (!authSession?.token) {
      return undefined;
    }

    let isCancelled = false;

    const loadDashboard = async () => {
      const isInitialLoad = refreshToken === 0;

      if (isInitialLoad) {
        setProductsLoading(true);
        setCategoriesLoading(true);
        setOffersLoading(true);
        setAddressesLoading(true);
        setOrdersLoading(true);
      } else {  
        setIsRefreshing(true);
      }

      try {
        const [productsData, categoriesData, offersData, addressesData, ordersData] = await Promise.all([
          api.getProducts(),
          api.getProductCategories(),
          api.getOffers(),
          api.getAddresses(),
          api.getOrders(),
        ]);

        if (isCancelled) {
          return;
        }

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setOffers(Array.isArray(offersData) ? offersData : []);
        setAddresses(Array.isArray(addressesData) ? addressesData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        if (!isCancelled) {
          if (error.status === 401 || error.status === 403) {
            clearAuthSession();
            setAuthSessionState(null);
            setProducts([]);
            setCategories([]);
            setOffers([]);
            setAddresses([]);
            setOrders([]);
            showNotice("error", "Your admin session has expired. Please sign in again.");
            return;
          }
          showNotice("error", error.message || "Unable to refresh dashboard data.");
        }
      } finally {
        if (!isCancelled) {
          setProductsLoading(false);
          setCategoriesLoading(false);
          setOffersLoading(false);
          setAddressesLoading(false);
          setOrdersLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [authSession, refreshToken]);

  const handleCredentialChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsAuthSubmitting(true);

    try {
      const response = await api.login(credentials);
      const nextSession = {
        token: response.token,
        user: response.user,
      };

      setAuthSession(nextSession);
      setAuthSessionState(nextSession);
      setCredentials({ email: "", password: "" });
      navigate(ADMIN_DEFAULT_ROUTE, { replace: true });
      showNotice("success", "Admin session started.");
    } catch (error) {
      showNotice("error", error.message || "Unable to sign in.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSessionState(null);
    setCredentials({ email: "", password: "" });
    setProducts([]);
    setCategories([]);
    setOffers([]);
    setAddresses([]);
    setOrders([]);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    navigate("/login", { replace: true });
    showNotice("success", "Logged out.");
  };

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

  const handleCreateAddress = async (payload) => {
    try {
      const createdAddress = await api.createAddress(payload);
      setAddresses((current) => [createdAddress, ...current]);
      showNotice("success", "Address created successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to create address.");
      throw error;
    }
  };

  const handleUpdateAddress = async (addressId, payload) => {
    try {
      const updatedAddress = await api.updateAddress(addressId, payload);
      setAddresses((current) =>
        current.map((address) => (address._id === addressId ? updatedAddress : address))
      );
      showNotice("success", "Address updated successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to update address.");
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = await confirmAction({
      title: "Delete address?",
      message: "This will permanently remove the delivery address from the backend.",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteAddress(addressId);
      setAddresses((current) => current.filter((address) => address._id !== addressId));
      showNotice("success", "Address deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to delete address.");
      throw error;
    }
  };

  const handleCreateOrder = async (payload) => {
    try {
      const createdOrder = await api.createOrder(payload);
      setOrders((current) => [createdOrder, ...current]);
      showNotice("success", "Order created successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to create order.");
      throw error;
    }
  };

  const handleUpdateOrderStatus = async (orderId, payload) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, payload);
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? updatedOrder : order))
      );
      showNotice("success", "Order status updated successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to update order status.");
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = await confirmAction({
      title: "Delete order?",
      message: "This will permanently remove the order from the backend.",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteOrder(orderId);
      setOrders((current) => current.filter((order) => order._id !== orderId));
      showNotice("success", "Order deleted successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to delete order.");
      throw error;
    }
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
    addresses: addresses.length,
    orders: orders.length,
  };

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            authSession?.token ? (
              <Navigate replace to={ADMIN_DEFAULT_ROUTE} />
            ) : (
              <LoginScreen
                credentials={credentials}
                isSubmitting={isAuthSubmitting}
                onChange={handleCredentialChange}
                onSubmit={handleLogin}
              />
            )
          }
        />
        <Route
          path="/"
          element={
            authSession?.token ? (
              <AdminShell
                categories={categories}
                editingProduct={editingProduct}
                isProductModalOpen={isProductModalOpen}
                isProductSubmitting={isProductSubmitting}
                isRefreshing={isRefreshing}
                isSidebarCollapsed={isSidebarCollapsed}
                onCloseProductModal={handleCloseProductModal}
                onLogout={handleLogout}
                onRefresh={handleRefresh}
                onSubmitProduct={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                stats={stats}
                user={authSession.user}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        >
          <Route index element={<Navigate replace to={ADMIN_DEFAULT_ROUTE} />} />
          <Route
            path="products"
            element={
              <ProductsPanel
                categories={categories}
                products={products}
                loading={productsLoading}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={handleOpenEditProduct}
                onOpenAddProduct={handleOpenCreateProduct}
              />
            }
          />
          <Route
            path="categories"
            element={
              <CategoriesPanel
                categories={categories}
                loading={categoriesLoading}
                onCreateCategory={handleCreateCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpdateCategory={handleUpdateCategory}
              />
            }
          />
          <Route
            path="offers"
            element={
              <OffersPanel
                offers={offers}
                loading={offersLoading}
                onCreateOffer={handleCreateOffer}
                onDeleteOffer={handleDeleteOffer}
                onUpdateOffer={handleUpdateOffer}
              />
            }
          />
          <Route
            path="addresses"
            element={
              <AddressesPanel
                addresses={addresses}
                loading={addressesLoading}
                onCreateAddress={handleCreateAddress}
                onDeleteAddress={handleDeleteAddress}
                onUpdateAddress={handleUpdateAddress}
              />
            }
          />
          <Route
            path="orders"
            element={
              <OrdersPanel
                addresses={addresses}
                loading={ordersLoading}
                offers={offers}
                orders={orders}
                products={products}
                onCreateOrder={handleCreateOrder}
                onDeleteOrder={handleDeleteOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            }
          />
          <Route path="orders/status" element={<OrderStatusPanel orders={orders} />} />
        </Route>
        <Route
          path="*"
          element={<Navigate replace to={authSession?.token ? ADMIN_DEFAULT_ROUTE : "/login"} />}
        />
      </Routes>
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
    </>
  );
}

export default App;
