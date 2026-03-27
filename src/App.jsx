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
import { UsersPanel } from "./components/UsersPanel";
import { LoginScreen } from "./components/LoginScreen";
import {
  api,
  clearAuthSession,
  getAuthSession,
  normalizeAuthSession,
  setAuthSession,
} from "./lib/api";
import { ADMIN_DEFAULT_ROUTE } from "./constants/adminRoutes";

function App() {
  const navigate = useNavigate();
  const [authSession, setAuthSessionState] = useState(() => getAuthSession());
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
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
  const currentUser = authSession?.user ?? null;
  const isAuthenticated = Boolean(authSession?.token && currentUser);

  const syncAuthSession = (session) => {
    const nextSession = normalizeAuthSession(session);
    setAuthSession(nextSession);
    setAuthSessionState(nextSession);
    return nextSession;
  };

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
        setUsersLoading(true);
        setCategoriesLoading(true);
        setOffersLoading(true);
        setAddressesLoading(true);
        setOrdersLoading(true);
      } else {  
        setIsRefreshing(true);
      }

      try {
        const [productsData, usersData, categoriesData, offersData, addressesData, ordersData] = await Promise.all([
          api.getProducts(),
          api.getUsers(),
          api.getProductCategories(),
          api.getOffers(),
          api.getAddresses(),
          api.getOrders(),
        ]);

        if (isCancelled) {
          return;
        }

        setProducts(Array.isArray(productsData) ? productsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
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
            setUsers([]);
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
          setUsersLoading(false);
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
      const nextSession = syncAuthSession({
        token: response.token,
        user: response.user,
      });
      if (!nextSession) {
        throw new Error("Invalid admin session received from the server.");
      }
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
    setUsers([]);
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

  const handleUpdateProductPublicationStatus = async (
    product,
    publicationStatus
  ) => {
    const nextActionLabel =
      publicationStatus === "published" ? "publish" : "move to draft";
    const confirmed = await confirmAction({
      title:
        publicationStatus === "published"
          ? "Publish product?"
          : "Move product to draft?",
      message:
        publicationStatus === "published"
          ? "This product will become visible in the public catalog."
          : "This product will be hidden from the public catalog.",
    });

    if (!confirmed) {
      return;
    }

    try {
      const updatedProduct = await api.updateProductPublicationStatus(product._id, {
        publicationStatus,
      });
      setProducts((current) =>
        current.map((item) => (item._id === product._id ? updatedProduct : item))
      );
      showNotice(
        "success",
        `Product ${nextActionLabel === "publish" ? "published" : "moved to draft"} successfully.`
      );
    } catch (error) {
      showNotice(
        "error",
        error.message ||
          `Unable to ${nextActionLabel === "publish" ? "publish" : "move product to draft"}.`
      );
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = await confirmAction({
      title: "Move product to draft?",
      message: "This will hide the product from the public catalog without deleting it.",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.deleteProduct(product._id);
      const updatedProduct = response?.product
        ? response.product
        : { ...product, publicationStatus: "draft" };
      setProducts((current) =>
        current.map((item) => (item._id === product._id ? updatedProduct : item))
      );
      showNotice("success", "Product moved to draft successfully.");
    } catch (error) {
      showNotice("error", error.message || "Unable to move product to draft.");
    }
  };

  const handleCreateUser = {
    sendRegistrationOtp: async (payload) => {
      const response = await api.sendRegistrationEmailOtp(payload);
      showNotice("success", response.message || "Registration OTP sent successfully.");
      return response;
    },
    verifyRegistrationOtp: async (payload) => {
      const response = await api.verifyRegistrationEmailOtp(payload);
      showNotice("success", response.message || "Registration OTP verified successfully.");
      return response;
    },
    submit: async (formData) => {
      try {
        const response = await api.registerUser(formData);
        const createdUser = response?.user || response;
        setUsers((current) => [createdUser, ...current]);
        showNotice("success", "User created successfully.");
        return response;
      } catch (error) {
        showNotice("error", error.message || "Unable to create user.");
        throw error;
      }
    },
  };

  const handleUpdateUser = async (userId, formData) => {
    try {
      const updatedUser = await api.updateUser(userId, formData);
      setUsers((current) =>
        current.map((user) => (user._id === userId ? updatedUser : user))
      );

      if (authSession?.user?._id === userId) {
        syncAuthSession({
          ...authSession,
          user: updatedUser,
        });
      }

      showNotice("success", "User updated successfully.");
      return updatedUser;
    } catch (error) {
      showNotice("error", error.message || "Unable to update user.");
      throw error;
    }
  };

  const handleSendCurrentUserVerificationOtp = async () => {
    try {
      const response = await api.sendEmailVerificationOtp();
      showNotice("success", response.message || "Email OTP sent successfully.");
      return response;
    } catch (error) {
      showNotice("error", error.message || "Unable to send email verification OTP.");
      throw error;
    }
  };

  const handleVerifyCurrentUserEmailOtp = async (otp) => {
    try {
      const response = await api.verifyEmailOtp({ otp });
      const updatedUser = response?.user;

      if (updatedUser) {
        setUsers((current) =>
          current.map((user) => (user._id === updatedUser._id ? updatedUser : user))
        );

        if (authSession?.token) {
          syncAuthSession({
            ...authSession,
            user: updatedUser,
          });
        }
      }

      showNotice("success", response.message || "Email verified successfully.");
      return response;
    } catch (error) {
      showNotice("error", error.message || "Unable to verify email OTP.");
      throw error;
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

  const handleOpenEditProduct = async (product) => {
    try {
      const latestProduct = await api.getProductById(product._id);
      setEditingProduct(latestProduct);
      setIsProductModalOpen(true);
    } catch (error) {
      showNotice("error", error.message || "Unable to load product details.");
    }
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const stats = {
    products: products.length,
    users: users.length,
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
            isAuthenticated ? (
              <Navigate replace to={ADMIN_DEFAULT_ROUTE} />
            ) : (
              <LoginScreen
                isSubmitting={isAuthSubmitting}
                credentials={credentials}
                onSubmit={handleLogin}
                onChange={handleCredentialChange}
                onSendForgotPasswordOtp={async (payload) => {
                  try {
                    setIsAuthSubmitting(true);
                    const response = await api.sendForgotPasswordOtp(payload);
                    showNotice("success", response.message || "Password reset OTP sent.");
                    return response;
                  } catch (error) {
                    showNotice("error", error.message || "Unable to send password reset OTP.");
                    throw error;
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                }}
                onVerifyForgotPasswordOtp={async (payload) => {
                  try {
                    setIsAuthSubmitting(true);
                    const response = await api.verifyForgotPasswordOtp(payload);
                    showNotice("success", response.message || "Password reset OTP verified.");
                    return response;
                  } catch (error) {
                    showNotice("error", error.message || "Unable to verify password reset OTP.");
                    throw error;
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                }}
                onResetForgotPassword={async (payload) => {
                  try {
                    setIsAuthSubmitting(true);
                    const response = await api.resetForgotPassword(payload);
                    showNotice("success", response.message || "Password reset successfully.");
                    return response;
                  } catch (error) {
                    showNotice("error", error.message || "Unable to reset password.");
                    throw error;
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                }}
              />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
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
                user={currentUser}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        >
          <Route index element={<Navigate replace to={ADMIN_DEFAULT_ROUTE} />} />
          <Route
            path="users"
            element={
              <UsersPanel
                currentUser={currentUser}
                loading={usersLoading}
                onCreateUser={handleCreateUser}
                onSendCurrentUserVerificationOtp={handleSendCurrentUserVerificationOtp}
                onUpdateUser={handleUpdateUser}
                onVerifyCurrentUserEmailOtp={handleVerifyCurrentUserEmailOtp}
                users={users}
              />
            }
          />
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
                onToggleProductPublicationStatus={handleUpdateProductPublicationStatus}
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
          element={<Navigate replace to={isAuthenticated ? ADMIN_DEFAULT_ROUTE : "/login"} />}
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
