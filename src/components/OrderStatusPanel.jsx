import { useMemo, useState } from "react";
import { FiClock, FiPackage, FiSearch } from "react-icons/fi";
import { api } from "../lib/api";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatStatusLabel = (value) =>
  `${value || ""}`.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());

export function OrderStatusPanel({ orders }) {
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const recentOrders = useMemo(
    () =>
      [...orders]
        .filter((order) => order?.orderId)
        .sort((left, right) => {
          const leftDate = new Date(left?.updatedAt || left?.createdAt || 0).getTime();
          const rightDate = new Date(right?.updatedAt || right?.createdAt || 0).getTime();
          return rightDate - leftDate;
        })
        .slice(0, 6),
    [orders]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextOrderId = orderId.trim();
    if (!nextOrderId) {
      setErrorMessage("Enter an order ID to fetch the current status.");
      setLookupResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await api.getOrderStatusByOrderId(nextOrderId);
      setLookupResult(result);
    } catch (error) {
      setLookupResult(null);
      setErrorMessage(error.message || "Unable to fetch order status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (nextOrderId) => {
    setOrderId(nextOrderId);
    setErrorMessage("");
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Tracking desk</p>
          <h3>Order status</h3>
          <p>Look up a single order by `orderId` and review its latest fulfillment state with the full status timeline.</p>
        </div>
      </div>

      <div className="status-lookup-shell">
        <form className="status-lookup-form" onSubmit={handleSubmit}>
          <label className="field-shell field-shell-grow">
            <span>Order ID</span>
            <input
              type="text"
              placeholder="ORD-20260324-N9POJK"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button" disabled={isLoading}>
            <FiSearch className="button-icon" />
            {isLoading ? "Checking..." : "Check status"}
          </button>
        </form>

        {recentOrders.length ? (
          <div className="status-suggestion-row">
            {recentOrders.map((order) => (
              <button
                key={order._id}
                type="button"
                className="soft-chip status-suggestion-chip"
                onClick={() => handleQuickSelect(order.orderId)}
              >
                {order.orderId}
              </button>
            ))}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="empty-state">
            <h4>Status lookup failed</h4>
            <p>{errorMessage}</p>
          </div>
        ) : null}
      </div>

      {lookupResult ? (
        <article className="order-card status-result-card">
          <div className="order-card-top">
            <div className="order-card-heading">
              <div className="offer-meta-row">
                <span className="eyebrow">Tracked order</span>
                <span className="soft-chip">{formatStatusLabel(lookupResult.orderStatus)}</span>
              </div>
              <h4>{lookupResult.orderId}</h4>
              <p className="address-card-copy">
                Created {formatDate(lookupResult.createdAt)} | Updated {formatDate(lookupResult.updatedAt)}
              </p>
            </div>
          </div>

          <div className="status-summary-grid">
            <div className="order-detail-block">
              <div className="order-detail-heading">
                <FiPackage className="button-icon" />
                <strong>Current status</strong>
              </div>
              <p className="status-result-primary">{formatStatusLabel(lookupResult.orderStatus)}</p>
              <p className="address-card-copy">
                Use this panel when you only need the delivery state and timeline for one order.
              </p>
            </div>

            <div className="order-detail-block">
              <div className="order-detail-heading">
                <FiClock className="button-icon" />
                <strong>Timeline</strong>
              </div>
              <p className="status-result-primary">
                {Array.isArray(lookupResult.statusHistory) ? lookupResult.statusHistory.length : 0} updates
              </p>
              <p className="address-card-copy">
                Each change is sourced from `/api/orders/order-id/:orderId/status`.
              </p>
            </div>
          </div>

          <div className="order-history-block">
            <span className="eyebrow">Status history</span>
            <div className="order-history-list">
              {Array.isArray(lookupResult.statusHistory) && lookupResult.statusHistory.length ? (
                lookupResult.statusHistory.map((entry, index) => (
                  <div key={`${lookupResult.orderId}-history-${index}`} className="order-history-row">
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
      ) : (
        <div className="empty-state">
          <h4>No order selected</h4>
          <p>Enter an order ID above to fetch its current status and timeline.</p>
        </div>
      )}
    </section>
  );
}
