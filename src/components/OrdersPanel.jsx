import { useState } from "react";
import { FiMapPin, FiPackage, FiPlus, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";

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

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatStatusLabel = (value) =>
  `${value || ""}`.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());

export function OrdersPanel({
  addresses,
  loading,
  offers,
  orders,
  products,
  onCreateOrder,
  onDeleteOrder,
  onUpdateOrderStatus,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [busyOrderId, setBusyOrderId] = useState("");
  const [createForm, setCreateForm] = useState({
    orderItems: [{ productId: "", quantity: 1 }],
    shippingDetails: "",
    billingAddress: "",
    isSameAsShipping: true,
    promoCode: "",
    orderStatus: "pending",
    paymentMethod: "COD",
  });

  const resetCreateForm = () => {
    setCreateForm({
      orderItems: [{ productId: "", quantity: 1 }],
      shippingDetails: "",
      billingAddress: "",
      isSameAsShipping: true,
      promoCode: "",
      orderStatus: "pending",
      paymentMethod: "COD",
    });
    setIsCreateModalOpen(false);
  };

  const getAddressId = (value) =>
    typeof value === "string" ? value : value?._id || "";

  const resolveAddress = (value) => {
    const addressId = getAddressId(value);
    if (!addressId) {
      return typeof value === "object" && value ? value : null;
    }

    return (
      addresses.find((address) => address._id === addressId) ||
      (typeof value === "object" && value ? value : null)
    );
  };

  const updateCreateField = (field, value) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateOrderItem = (index, field, value) => {
    setCreateForm((current) => ({
      ...current,
      orderItems: current.orderItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addOrderItem = () => {
    setCreateForm((current) => ({
      ...current,
      orderItems: [...current.orderItems, { productId: "", quantity: 1 }],
    }));
  };

  const removeOrderItem = (index) => {
    setCreateForm((current) => ({
      ...current,
      orderItems:
        current.orderItems.length > 1
          ? current.orderItems.filter((_, itemIndex) => itemIndex !== index)
          : current.orderItems,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      orderItems: createForm.orderItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
      shippingDetails: createForm.shippingDetails,
      isSameAsShipping: createForm.isSameAsShipping,
      paymentMethod: createForm.paymentMethod,
      orderStatus: createForm.orderStatus,
    };

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

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Fulfillment desk</p>
          <h3>Orders</h3>
          <p>Track checkout totals, addresses, line items, and move each order through fulfillment stages.</p>
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
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              {(() => {
                const shippingAddress = resolveAddress(order.shippingDetails);
                const billingAddress = resolveAddress(order.billingAddress);

                return (
                  <>
              <div className="order-card-top">
                <div className="order-card-heading">
                  <div className="offer-meta-row">
                    <span className="eyebrow">Order</span>
                    <span className="soft-chip">{formatStatusLabel(order.orderStatus)}</span>
                  </div>
                  <h4>{order.orderId}</h4>
                  <p className="address-card-copy">
                    Created {formatDate(order.createdAt)} | Updated {formatDate(order.updatedAt)}
                  </p>
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
                              Qty {item.quantity} | {item.category || "Uncategorized"}
                            </p>
                          </div>
                          <div className="order-item-price">
                            <span>{formatCurrency(item.finalPrice)}</span>
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
                  <p className="address-card-copy">
                    {shippingAddress?.fullName || "-"}
                  </p>
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
                      <p className="address-card-copy">
                        {billingAddress?.fullName || "-"}
                      </p>
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
                    disabled={busyOrderId === order._id}
                    onClick={() => handleStatusSave(order)}
                  >
                    <FiRefreshCw className="button-icon" />
                    Save status
                  </button>
                  <button
                    type="button"
                    className="ghost-danger-button"
                    disabled={busyOrderId === order._id}
                    onClick={() => handleDelete(order._id)}
                  >
                    <FiTrash2 className="button-icon" />
                    Delete
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
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No orders available</h4>
          <p>Orders will appear here once checkout requests start hitting the backend.</p>
        </div>
      )}

      {isCreateModalOpen ? (
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
                <h3>New order</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetCreateForm}>
                <FiX className="button-icon" />
                Close
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreateSubmit}>
              <div className="modal-section">
                <div className="modal-section-heading">
                  <h4>Items</h4>
                </div>

                <div className="order-create-items">
                  {createForm.orderItems.map((item, index) => (
                    <div key={`create-item-${index}`} className="order-create-item-row">
                      <label className="field-shell field-shell-grow">
                        <span>Product</span>
                        <select
                          value={item.productId}
                          onChange={(event) =>
                            updateOrderItem(index, "productId", event.target.value)
                          }
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
                        <span>Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateOrderItem(index, "quantity", event.target.value)
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="ghost-danger-button"
                        onClick={() => removeOrderItem(index)}
                        disabled={createForm.orderItems.length === 1}
                      >
                        <FiTrash2 className="button-icon" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="ghost-button" onClick={addOrderItem}>
                  <FiPlus className="button-icon" />
                  Add item
                </button>
              </div>

              <div className="modal-section">
                <div className="modal-grid">
                  <label className="field-shell">
                    <span>Shipping address</span>
                    <select
                      value={createForm.shippingDetails}
                      onChange={(event) => updateCreateField("shippingDetails", event.target.value)}
                    >
                      <option value="">Select shipping address</option>
                      {addresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.fullName} - {address.city}, {address.country}
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
                    checked={createForm.isSameAsShipping}
                    onChange={(event) =>
                      updateCreateField("isSameAsShipping", event.target.checked)
                    }
                  />
                  Billing address same as shipping
                </label>

                {!createForm.isSameAsShipping ? (
                  <label className="field-shell">
                    <span>Billing address</span>
                    <select
                      value={createForm.billingAddress}
                      onChange={(event) => updateCreateField("billingAddress", event.target.value)}
                    >
                      <option value="">Select billing address</option>
                      {addresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.fullName} - {address.city}, {address.country}
                        </option>
                      ))}
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
                  disabled={busyOrderId === "creating"}
                >
                  <FiPlus className="button-icon" />
                  Create order
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
