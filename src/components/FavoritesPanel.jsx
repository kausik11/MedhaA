import { FiHeart, FiUser } from "react-icons/fi";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

function getProductPrice(product) {
  const actualPrice = Number(product?.selectedPricing?.actualPrice ?? product?.actualPrice);
  const discountPrice = Number(
    product?.selectedPricing?.discountPrice ??
      product?.selectedPricing?.currentPrice ??
      product?.discountPrice
  );

  return {
    actualPrice: Number.isFinite(actualPrice) ? actualPrice : 0,
    discountPrice:
      Number.isFinite(discountPrice) && discountPrice > 0
        ? discountPrice
        : Number.isFinite(actualPrice)
          ? actualPrice
          : 0,
  };
}

export function FavoritesPanel({ favorites, currentUser, loading }) {
  const favoriteGroups = Array.isArray(favorites)
    ? favorites
    : favorites
      ? [favorites]
      : [];
  const totalItems = favoriteGroups.reduce(
    (total, entry) => total + (entry?.itemCount || 0),
    0
  );
  const isAdminView =
    currentUser?.role === "administrator" || currentUser?.role === "superadmin";

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Customer intent</p>
          <h3>Favourites</h3>
          <p>
            {isAdminView
              ? "Review products each user saved as favourites and spot purchase intent across the catalog."
              : "Review your saved favourite products."}
          </p>
        </div>
      </div>

      <article className="category-card user-verification-card">
        <div className="category-card-main">
          <span className="eyebrow">
            {isAdminView ? "Admin favourite overview" : "Current account"}
          </span>
          <h4>{isAdminView ? "All user favourites" : currentUser?.email || "Signed-in account"}</h4>
          <div className="offer-meta-row">
            <span className="soft-chip">
              <FiHeart className="button-icon" />
              {favoriteGroups.length} users
            </span>
            <span className="soft-chip">{totalItems} saved products</span>
          </div>
        </div>
      </article>

      {loading ? (
        <div className="empty-state">
          <h4>Loading favourites...</h4>
          <p>The favourites overview is being fetched from the backend.</p>
        </div>
      ) : favoriteGroups.length ? (
        <div className="order-list">
          {favoriteGroups.map((entry) => {
            const ownerName =
              `${entry.user?.firstName || ""} ${entry.user?.lastName || ""}`.trim() ||
              entry.user?.email ||
              "User";

            return (
              <article
                key={entry._id || `${entry.user?._id || "favorites"}`}
                className="order-card"
              >
                <div className="order-card-top">
                  <div className="order-card-heading">
                    <div className="offer-meta-row">
                      <span className="eyebrow">User favourites</span>
                      <span className="soft-chip">
                        <FiUser className="button-icon" />
                        {entry.user?.role || "normal"}
                      </span>
                    </div>
                    <h4>{ownerName}</h4>
                    <p className="address-card-copy">
                      {entry.user?.email || "No email"}
                      {entry.user?.phoneNumber ? ` | ${entry.user.phoneNumber}` : ""}
                    </p>
                  </div>

                  <div className="order-price-stack">
                    <span className="eyebrow">Saved products</span>
                    <strong>{entry.itemCount || 0}</strong>
                  </div>
                </div>

                <div className="order-meta-grid">
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
                    <FiHeart className="button-icon" />
                    <strong>Favourite items</strong>
                  </div>
                  <div className="order-items-list">
                    {Array.isArray(entry.products) && entry.products.length ? (
                      entry.products.map((product, index) => {
                        const { actualPrice, discountPrice } = getProductPrice(product);

                        return (
                          <div
                            key={`${entry._id || entry.user?._id || "favorites"}-item-${index}`}
                            className="order-item-row"
                          >
                            <div>
                              <strong>{product?.title || "Product"}</strong>
                              <p className="address-card-copy">
                                {product?.type || "Wellness product"}
                              </p>
                              <p className="address-card-copy">
                                MRP {formatCurrency(actualPrice)} | Price {formatCurrency(discountPrice)}
                              </p>
                            </div>
                            <div className="order-item-price">
                              <span>{formatCurrency(discountPrice)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="address-card-copy">No favourite products found.</p>
                    )}
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No favourites available</h4>
          <p>Saved products will appear here once customers use the heart button.</p>
        </div>
      )}
    </section>
  );
}
