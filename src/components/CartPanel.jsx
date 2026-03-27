import { FiShoppingCart, FiUser } from "react-icons/fi";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

export function CartPanel({
  cart,
  currentUser,
  loading,
}) {
  const carts = Array.isArray(cart) ? cart : cart ? [cart] : [];
  const totalDistinctLines = carts.reduce((total, entry) => total + (entry?.itemCount || 0), 0);
  const totalUnits = carts.reduce((total, entry) => total + (entry?.totalQuantity || 0), 0);
  const totalAmount = carts.reduce((total, entry) => total + Number(entry?.totalAmount || 0), 0);
  const isAdminView = currentUser?.role === "administrator" || currentUser?.role === "superadmin";

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Checkout intelligence</p>
          <h3>Cart</h3>
          <p>
            {isAdminView
              ? "Review all user carts, inspect selected pack sizes, and verify backend cart totals."
              : "Review the authenticated cart and inspect pack-size pricing totals."}
          </p>
        </div>
      </div>

      <article className="category-card user-verification-card">
        <div className="category-card-main">
          <span className="eyebrow">{isAdminView ? "Admin cart overview" : "Current cart owner"}</span>
          <h4>{isAdminView ? "All user carts" : currentUser?.email || "Signed-in account"}</h4>
          <div className="offer-meta-row">
            <span className="soft-chip">
              <FiShoppingCart className="button-icon" />
              {carts.length} carts
            </span>
            <span className="soft-chip">{totalDistinctLines} distinct lines</span>
            <span className="soft-chip">{totalUnits} units total</span>
            <span className="soft-chip">{formatCurrency(totalAmount)} combined total</span>
          </div>
        </div>
      </article>

      {loading ? (
        <div className="empty-state">
          <h4>Loading carts...</h4>
          <p>The cart overview is being fetched from the backend.</p>
        </div>
      ) : carts.length ? (
        <div className="order-list">
          {carts.map((entry) => {
            const ownerName =
              `${entry.user?.firstName || ""} ${entry.user?.lastName || ""}`.trim() ||
              entry.user?.email ||
              "User";

            return (
              <article key={entry._id || `${entry.user?._id || "cart"}`} className="order-card">
                <div className="order-card-top">
                  <div className="order-card-heading">
                    <div className="offer-meta-row">
                      <span className="eyebrow">User cart</span>
                      <span className="soft-chip">
                        <FiUser className="button-icon" />
                        {entry.user?.role || "normal"}
                      </span>
                    </div>
                    <h4>{ownerName}</h4>
                    <p className="address-card-copy">
                      {entry.user?.email || "No email"}{entry.user?.phoneNumber ? ` | ${entry.user.phoneNumber}` : ""}
                    </p>
                  </div>

                  <div className="order-price-stack">
                    <span className="eyebrow">Cart total</span>
                    <strong>{formatCurrency(entry.totalAmount)}</strong>
                  </div>
                </div>

                <div className="order-meta-grid">
                  <div className="product-meta-pill">
                    <span>Distinct lines</span>
                    <strong>{entry.itemCount || 0}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Total units</span>
                    <strong>{entry.totalQuantity || 0}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(entry.subtotal)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Discount</span>
                    <strong>{formatCurrency(entry.productDiscountTotal)}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Created</span>
                    <strong>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "-"}</strong>
                  </div>
                  <div className="product-meta-pill">
                    <span>Updated</span>
                    <strong>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "-"}</strong>
                  </div>
                </div>

                <section className="order-detail-block">
                  <div className="order-detail-heading">
                    <FiShoppingCart className="button-icon" />
                    <strong>Cart items</strong>
                  </div>
                  <div className="order-items-list">
                    {Array.isArray(entry.items) && entry.items.length ? (
                      entry.items.map((item, index) => (
                        <div
                          key={`${entry._id || entry.user?._id || "cart"}-item-${index}`}
                          className="order-item-row"
                        >
                          <div>
                            <strong>{item.product?.title || "Product"}</strong>
                            <p className="address-card-copy">
                              Units {item.quantity} | Pack {item.selectedQuantity} capsules
                            </p>
                            <p className="address-card-copy">
                              Unit {formatCurrency(item.discountedUnitPrice)} | Per capsule {formatCurrency(item.pricePerCapsule)}
                            </p>
                          </div>
                          <div className="order-item-price">
                            <span>{formatCurrency(item.lineTotal)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="address-card-copy">No line items found.</p>
                    )}
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No carts available</h4>
          <p>User cart activity will appear here once authenticated customers add items.</p>
        </div>
      )}
    </section>
  );
}
