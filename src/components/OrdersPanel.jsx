import { useState } from "react";
import {
  FiEdit2,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PRODUCT_QUANTITY_OPTIONS = [60, 90, 120];
const EMPTY_ORDER_ITEM = {
  productId: "",
  quantity: 1,
  selectedQuantity: PRODUCT_QUANTITY_OPTIONS[0],
};

const createEmptyCreateForm = () => ({
  userId: "",
  useCustomerCart: true,
  orderItems: [{ ...EMPTY_ORDER_ITEM }],
  shippingDetails: "",
  billingAddress: "",
  isSameAsShipping: true,
  promoCode: "",
  orderStatus: "pending",
});

const getEntityId = (value) =>
  typeof value === "string" ? value : value?._id || "";

const createEditFormFromOrder = (order) => ({
  userId: getEntityId(order.user),
  orderItems:
    Array.isArray(order.orderItems) && order.orderItems.length
      ? order.orderItems.map((item) => ({
          productId: getEntityId(item.productId),
          quantity: Number(item.quantity) || 1,
          selectedQuantity:
            Number(item.selectedQuantity) || PRODUCT_QUANTITY_OPTIONS[0],
        }))
      : [{ ...EMPTY_ORDER_ITEM }],
  shippingDetails: getEntityId(order.shippingDetails),
  billingAddress: order.isSameAsShipping
    ? getEntityId(order.shippingDetails)
    : getEntityId(order.billingAddress),
  isSameAsShipping: Boolean(order.isSameAsShipping),
  orderStatus: order.orderStatus || "pending",
  note: "",
});

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatStatusLabel = (value) =>
  `${value || ""}`.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());

const getUserFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.email || "User";

const getAddressUserId = (address) => {
  const value = address?.user;
  return typeof value === "string" ? value : value?._id || "";
};

const sanitizeOrderItems = (items = []) =>
  items
    .map((item) => ({
      productId: `${item.productId || ""}`.trim(),
      quantity: Number(item.quantity),
      selectedQuantity: Number(item.selectedQuantity) || PRODUCT_QUANTITY_OPTIONS[0],
    }))
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);

const findUserById = (users, userId) =>
  users.find((user) => user._id === userId) || null;

export function OrdersPanel({
  addresses,
  loading,
  offers,
  orders,
  products,
  users,
  onCreateOrder,
  onDeleteOrder,
  onUpdateOrder,
  onUpdateOrderStatus,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [createForm, setCreateForm] = useState(() => createEmptyCreateForm());
  const [editForm, setEditForm] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [busyOrderId, setBusyOrderId] = useState("");

  const getAvailableAddresses = (userId) =>
    userId ? addresses.filter((address) => getAddressUserId(address) === userId) : [];

  const resolveAddress = (value) => {
    const addressId = getEntityId(value);
    if (!addressId) {
      return typeof value === "object" && value ? value : null;
    }

    return (
      addresses.find((address) => address._id === addressId) ||
      (typeof value === "object" && value ? value : null)
    );
  };

  const resetCreateForm = () => {
    setCreateForm(createEmptyCreateForm());
    setIsCreateModalOpen(false);
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditForm(null);
  };

  const updateCreateField = (field, value) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateCreateCustomer = (userId) => {
    setCreateForm((current) => ({
      ...current,
      userId,
      shippingDetails: "",
      billingAddress: "",
      isSameAsShipping: true,
    }));
  };

  const updateCreateOrderItem = (index, field, value) => {
    setCreateForm((current) => ({
      ...current,
      orderItems: current.orderItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addCreateOrderItem = () => {
    setCreateForm((current) => ({
      ...current,
      orderItems: [...current.orderItems, { ...EMPTY_ORDER_ITEM }],
    }));
  };

  const removeCreateOrderItem = (index) => {
    setCreateForm((current) => ({
      ...current,
      orderItems:
        current.orderItems.length > 1
          ? current.orderItems.filter((_, itemIndex) => itemIndex !== index)
          : current.orderItems,
    }));
  };

  const updateEditField = (field, value) => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  };

  const updateEditOrderItem = (index, field, value) => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            orderItems: current.orderItems.map((item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item
            ),
          }
        : current
    );
  };

  const addEditOrderItem = () => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            orderItems: [...current.orderItems, { ...EMPTY_ORDER_ITEM }],
          }
        : current
    );
  };

  const removeEditOrderItem = (index) => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            orderItems:
              current.orderItems.length > 1
                ? current.orderItems.filter((_, itemIndex) => itemIndex !== index)
                : current.orderItems,
          }
        : current
    );
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      userId: createForm.userId,
      shippingDetails: createForm.shippingDetails,
      isSameAsShipping: createForm.isSameAsShipping,
      orderStatus: createForm.orderStatus,
      paymentMethod: "COD",
    };

    if (!createForm.useCustomerCart) {
      payload.orderItems = sanitizeOrderItems(createForm.orderItems);
    }

    if (!createForm.isSameAsShipping) {
      payload.billingAddress = createForm.billingAddress;
    }

    if (createForm.promoCode) {
      payload.promoCode = createForm.promoCode;
    }

    setBusyOrderId("creating");
    try {
      await onCreateOrder(payload);
      resetCreateForm();
    } finally {
      setBusyOrderId("");
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingOrder?._id || !editForm) {
      return;
    }

    const payload = {
      orderItems: sanitizeOrderItems(editForm.orderItems),
      shippingDetails: editForm.shippingDetails,
      isSameAsShipping: editForm.isSameAsShipping,
      orderStatus: editForm.orderStatus,
      note: editForm.note,
    };

    if (!editForm.isSameAsShipping) {
      payload.billingAddress = editForm.billingAddress;
    }

    setBusyOrderId(editingOrder._id);
    try {
      await onUpdateOrder(editingOrder._id, payload);
      closeEditModal();
    } finally {
      setBusyOrderId("");
    }
  };

  const getNextStatus = (order) => statusDrafts[order._id] || order.orderStatus;
  const getNextNote = (order) => noteDrafts[order._id] || "";

  const handleStatusSave = async (order) => {
    const nextStatus = getNextStatus(order);
    const note = getNextNote(order);

    setBusyOrderId(order._id);
    try {
      await onUpdateOrderStatus(order._id, {
        orderStatus: nextStatus,
        note,
      });
      setNoteDrafts((current) => ({
        ...current,
        [order._id]: "",
      }));
    } finally {
      setBusyOrderId("");
    }
  };

  const handleDelete = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      await onDeleteOrder(orderId);
    } finally {
      setBusyOrderId("");
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditForm(createEditFormFromOrder(order));
  };

  const renderOrderItemEditor = ({
    items,
    onAdd,
    onChange,
    onRemove,
  }) => (
    <>
      <div className="order-create-items">
        {items.map((item, index) => (
          <div key={`order-item-${index}`} className="order-create-item-row">
            <label className="field-shell field-shell-grow">
              <span>Product</span>
              <select
                value={item.productId}
                onChange={(event) => onChange(index, "productId", event.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-shell">
              <span>Units</span>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => onChange(index, "quantity", event.target.value)}
              />
            </label>
            <label className="field-shell">
              <span>Pack</span>
              <select
                value={item.selectedQuantity}
                onChange={(event) =>
                  onChange(index, "selectedQuantity", event.target.value)
                }
              >
                {PRODUCT_QUANTITY_OPTIONS.map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantity} capsules
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ghost-danger-button"
              onClick={() => onRemove(index)}
              disabled={items.length === 1}
            >
              <FiTrash2 className="button-icon" />
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="ghost-button" onClick={onAdd}>
        <FiPlus className="button-icon" />
        Add item
      </button>
    </>
  );

  const renderAddressOptions = (availableAddresses) =>
    availableAddresses.map((address) => (
      <option key={address._id} value={address._id}>
        {address.fullName} - {address.city}, {address.country}
      </option>
    ));

  const renderCreateModal = () => {
    const availableAddresses = getAvailableAddresses(createForm.userId);

    return (
      <div className="modal-overlay" role="presentation" onClick={resetCreateForm}>
        <div
          className="modal-shell order-modal-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Create order"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <p className="eyebrow">Create order</p>
              <h3>Admin order creation</h3>
            </div>
            <button type="button" className="ghost-button" onClick={resetCreateForm}>
              <FiX className="button-icon" />
              Close
            </button>
          </div>

          <form className="modal-form" onSubmit={handleCreateSubmit}>
            <div className="modal-section">
              <div className="modal-grid">
                <label className="field-shell">
                  <span>Customer</span>
                  <select
                    value={createForm.userId}
                    onChange={(event) => updateCreateCustomer(event.target.value)}
                  >
                    <option value="">Select customer</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {getUserFullName(user)} | {user.email || "No email"} | {user.role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-shell">
                  <span>Promo code</span>
                  <select
                    value={createForm.promoCode}
                    onChange={(event) => updateCreateField("promoCode", event.target.value)}
                  >
                    <option value="">No promo code</option>
                    {offers.map((offer) => (
                      <option key={offer._id} value={offer.promoCode}>
                        {offer.promoCode} ({offer.discountPercentage}%)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-shell">
                  <span>Initial status</span>
                  <select
                    value={createForm.orderStatus}
                    onChange={(event) => updateCreateField("orderStatus", event.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={createForm.useCustomerCart}
                  onChange={(event) =>
                    updateCreateField("useCustomerCart", event.target.checked)
                  }
                />
                Use selected customer's cart items for this order
              </label>
            </div>

            <div className="modal-section">
              <div className="modal-section-heading">
                <h4>Items</h4>
              </div>

              {createForm.useCustomerCart ? (
                <p className="address-card-copy">
                  The backend will build this order from the selected customer's current cart.
                </p>
              ) : (
                renderOrderItemEditor({
                  items: createForm.orderItems,
                  onAdd: addCreateOrderItem,
                  onChange: updateCreateOrderItem,
                  onRemove: removeCreateOrderItem,
                })
              )}
            </div>

            <div className="modal-section">
              <div className="modal-grid">
                <label className="field-shell">
                  <span>Shipping address</span>
                  <select
                    value={createForm.shippingDetails}
                    onChange={(event) =>
                      updateCreateField("shippingDetails", event.target.value)
                    }
                    disabled={!createForm.userId}
                  >
                    <option value="">
                      {createForm.userId
                        ? "Select shipping address"
                        : "Select customer first"}
                    </option>
                    {renderAddressOptions(availableAddresses)}
                  </select>
                </label>

                <label className="field-shell">
                  <span>Payment method</span>
                  <input type="text" value="COD" readOnly />
                </label>
              </div>

              <label className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={createForm.isSameAsShipping}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      isSameAsShipping: event.target.checked,
                      billingAddress: event.target.checked ? "" : current.billingAddress,
                    }))
                  }
                />
                Billing address same as shipping
              </label>

              {!createForm.isSameAsShipping ? (
                <label className="field-shell">
                  <span>Billing address</span>
                  <select
                    value={createForm.billingAddress}
                    onChange={(event) =>
                      updateCreateField("billingAddress", event.target.value)
                    }
                    disabled={!createForm.userId}
                  >
                    <option value="">
                      {createForm.userId
                        ? "Select billing address"
                        : "Select customer first"}
                    </option>
                    {renderAddressOptions(availableAddresses)}
                  </select>
                </label>
              ) : null}
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={resetCreateForm}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={busyOrderId === "creating" || !createForm.userId}
              >
                <FiPlus className="button-icon" />
                Create order
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingOrder || !editForm) {
      return null;
    }

    const availableAddresses = getAvailableAddresses(editForm.userId);
    const orderUser = findUserById(users, editForm.userId) || editingOrder.user;

    return (
      <div className="modal-overlay" role="presentation" onClick={closeEditModal}>
        <div
          className="modal-shell order-modal-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Edit order"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <p className="eyebrow">Update order</p>
              <h3>{editingOrder.orderId}</h3>
            </div>
            <button type="button" className="ghost-button" onClick={closeEditModal}>
              <FiX className="button-icon" />
              Close
            </button>
          </div>

          <form className="modal-form" onSubmit={handleEditSubmit}>
            <div className="modal-section">
              <div className="modal-grid">
                <label className="field-shell">
                  <span>Customer</span>
                  <input
                    type="text"
                    readOnly
                    value={`${getUserFullName(orderUser)} | ${orderUser?.email || "No email"}`}
                  />
                </label>

                <label className="field-shell">
                  <span>Order status</span>
                  <select
                    value={editForm.orderStatus}
                    onChange={(event) => updateEditField("orderStatus", event.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-shell">
                  <span>Payment method</span>
                  <input type="text" readOnly value={editingOrder.paymentMethod || "COD"} />
                </label>
              </div>

              <p className="address-card-copy">
                Promo code and payment details are locked after order placement. This form only updates items, addresses, and status.
              </p>
            </div>

            <div className="modal-section">
              <div className="modal-section-heading">
                <h4>Items</h4>
              </div>
              {renderOrderItemEditor({
                items: editForm.orderItems,
                onAdd: addEditOrderItem,
                onChange: updateEditOrderItem,
                onRemove: removeEditOrderItem,
              })}
            </div>

            <div className="modal-section">
              <div className="modal-grid">
                <label className="field-shell">
                  <span>Shipping address</span>
                  <select
                    value={editForm.shippingDetails}
                    onChange={(event) => updateEditField("shippingDetails", event.target.value)}
                  >
                    <option value="">Select shipping address</option>
                    {renderAddressOptions(availableAddresses)}
                  </select>
                </label>

                <label className="field-shell modal-grid-span-2">
                  <span>Status note</span>
                  <input
                    type="text"
                    placeholder="Optional note for status history"
                    value={editForm.note}
                    onChange={(event) => updateEditField("note", event.target.value)}
                  />
                </label>
              </div>

              <label className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={editForm.isSameAsShipping}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? {
                            ...current,
                            isSameAsShipping: event.target.checked,
                            billingAddress: event.target.checked
                              ? ""
                              : current.billingAddress,
                          }
                        : current
                    )
                  }
                />
                Billing address same as shipping
              </label>

              {!editForm.isSameAsShipping ? (
                <label className="field-shell">
                  <span>Billing address</span>
                  <select
                    value={editForm.billingAddress}
                    onChange={(event) => updateEditField("billingAddress", event.target.value)}
                  >
                    <option value="">Select billing address</option>
                    {renderAddressOptions(availableAddresses)}
                  </select>
                </label>
              ) : null}
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={closeEditModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={busyOrderId === editingOrder._id}
              >
                <FiRefreshCw className="button-icon" />
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Fulfillment desk</p>
          <h3>Orders</h3>
          <p>Manage customer orders, create orders on behalf of users, update active order details, and archive completed records without hard deletion.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FiPlus className="button-icon" />
          Create order
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <h4>Loading orders...</h4>
          <p>The order feed is being fetched from the backend.</p>
        </div>
      ) : orders.length ? (
        <div className="order-list">
          {orders.map((order) => {
            const shippingAddress = resolveAddress(order.shippingDetails);
            const billingAddress = resolveAddress(order.billingAddress);
            const isArchived = Boolean(order.isDeleted);

            return (
              <article key={order._id} className="order-card">
                <div className="order-card-top">
                  <div className="order-card-heading">
                    <div className="offer-meta-row">
                      <span className="eyebrow">Order</span>
                      <span className="soft-chip">{formatStatusLabel(order.orderStatus)}</span>
                      <span className="soft-chip">
                        <FiUser className="button-icon" />
                        {getUserFullName(order.user)}
                      </span>
                      {isArchived ? <span className="soft-chip">Archived</span> : null}
                    </div>
                    <h4>{order.orderId}</h4>
                    <p className="address-card-copy">
                      {order.user?.email || "No email"} | {order.user?.phoneNumber || "No phone"} | {order.user?.role || "normal"}
                    </p>
                    <p className="address-card-copy">
                      Created {formatDate(order.createdAt)} | Updated {formatDate(order.updatedAt)}
                    </p>
                    {isArchived ? (
                      <p className="address-card-copy">
                        Archived {formatDate(order.deletedAt)}
                      </p>
                    ) : null}
                  </div>

                  <div className="order-price-stack">
                    <span className="eyebrow">Total amount</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>
                </div>

                <div className="order-meta-grid">
                  <div className="product-meta-pill">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(order.subtotal)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Product discount</span>
                    <strong>{formatCurrency(order.productDiscountTotal)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Promo discount</span>
                    <strong>
                      {order.promoCode
                        ? `${order.promoCode} | ${formatCurrency(order.promoDiscountAmount)}`
                        : formatCurrency(0)}
                    </strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Shipping</span>
                    <strong>{formatCurrency(order.shippingCharges)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>GST</span>
                    <strong>{formatCurrency(order.gst)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Payment</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                </div>

                <div className="order-split-grid">
                  <section className="order-detail-block">
                    <div className="order-detail-heading">
                      <FiPackage className="button-icon" />
                      <strong>Items</strong>
                    </div>
                    <div className="order-items-list">
                      {Array.isArray(order.orderItems) && order.orderItems.length ? (
                        order.orderItems.map((item, index) => (
                          <div key={`${order._id}-item-${index}`} className="order-item-row">
                            <div>
                              <strong>{item.productId?.title || "Product"}</strong>
                              <p className="address-card-copy">
                                Units {item.quantity} | Pack {item.selectedQuantity} capsules
                              </p>
                              <p className="address-card-copy">
                                {item.category || "Uncategorized"} | {formatCurrency(item.finalPrice)}
                              </p>
                            </div>
                            <div className="order-item-price">
                              <span>{formatCurrency(item.pricePerCapsule)}</span>
                              <span className="address-card-copy">per capsule</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="address-card-copy">No line items found.</p>
                      )}
                    </div>
                  </section>

                  <section className="order-detail-block">
                    <div className="order-detail-heading">
                      <FiMapPin className="button-icon" />
                      <strong>Shipping</strong>
                    </div>
                    <p className="address-card-copy">{shippingAddress?.fullName || "-"}</p>
                    <p className="address-card-copy">
                      {shippingAddress
                        ? `${shippingAddress.houseNo}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.pincode}`
                        : "-"}
                    </p>
                    <div className="address-card-copy-group">
                      <span>Mobile: {shippingAddress?.mobileNumber || "-"}</span>
                      <span>Delivery: {shippingAddress?.deliveryTime || "-"}</span>
                    </div>
                  </section>

                  <section className="order-detail-block">
                    <div className="order-detail-heading">
                      <FiMapPin className="button-icon" />
                      <strong>Billing</strong>
                    </div>
                    {order.isSameAsShipping ? (
                      <p className="address-card-copy">Same as shipping address.</p>
                    ) : (
                      <>
                        <p className="address-card-copy">{billingAddress?.fullName || "-"}</p>
                        <p className="address-card-copy">
                          {billingAddress
                            ? `${billingAddress.houseNo}, ${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state}, ${billingAddress.country} - ${billingAddress.pincode}`
                            : "-"}
                        </p>
                      </>
                    )}
                  </section>
                </div>

                <div className="order-status-row">
                  <label className="field-shell">
                    <span>Status</span>
                    <select
                      value={getNextStatus(order)}
                      onChange={(event) =>
                        setStatusDrafts((current) => ({
                          ...current,
                          [order._id]: event.target.value,
                        }))
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-shell field-shell-grow">
                    <span>Status note</span>
                    <input
                      type="text"
                      placeholder="Optional note for status history"
                      value={getNextNote(order)}
                      onChange={(event) =>
                        setNoteDrafts((current) => ({
                          ...current,
                          [order._id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="order-action-row">
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={busyOrderId === order._id || isArchived}
                      onClick={() => openEditModal(order)}
                    >
                      <FiEdit2 className="button-icon" />
                      Edit details
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={busyOrderId === order._id || isArchived}
                      onClick={() => handleStatusSave(order)}
                    >
                      <FiRefreshCw className="button-icon" />
                      Save status
                    </button>
                    <button
                      type="button"
                      className="ghost-danger-button"
                      disabled={busyOrderId === order._id || isArchived}
                      onClick={() => handleDelete(order._id)}
                    >
                      <FiTrash2 className="button-icon" />
                      {isArchived ? "Archived" : "Archive"}
                    </button>
                  </div>
                </div>

                <div className="order-history-block">
                  <span className="eyebrow">Status history</span>
                  <div className="order-history-list">
                    {Array.isArray(order.statusHistory) && order.statusHistory.length ? (
                      order.statusHistory.map((entry, index) => (
                        <div key={`${order._id}-history-${index}`} className="order-history-row">
                          <strong>{formatStatusLabel(entry.status)}</strong>
                          <span>{formatDate(entry.timestamp)}</span>
                          <span>{entry.note || "No note"}</span>
                        </div>
                      ))
                    ) : (
                      <p className="address-card-copy">No status history available.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No orders available</h4>
          <p>Orders will appear here once checkout requests start hitting the backend.</p>
        </div>
      )}

      {isCreateModalOpen ? renderCreateModal() : null}
      {editingOrder ? renderEditModal() : null}
    </section>
  );
}
