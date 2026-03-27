import { FiEdit2, FiEye, FiEyeOff } from "react-icons/fi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatPrice = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Price unavailable";
  }

  return currencyFormatter.format(value);
};

const getPlainText = (value) =>
  `${value || ""}`
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function ProductCard({ product, onDelete, onEdit, onTogglePublicationStatus }) {
  const imageUrl = product.images?.[0]?.imageUrl;
  const categoryNames = Array.isArray(product.category)
    ? product.category.map((item) => item.name).filter(Boolean)
    : [];
  const selectedPricing = product.selectedPricing || null;
  const effectivePrice = selectedPricing?.currentPrice ?? product.discountPrice ?? product.actualPrice;
  const actualPrice = selectedPricing?.actualPrice ?? product.actualPrice;
  const discountPrice = selectedPricing?.discountPrice ?? product.discountPrice ?? effectivePrice;
  const pricePerCapsule =
    selectedPricing?.pricePerCapsule ??
    (typeof product.pricePerCapsule === "number" && !Number.isNaN(product.pricePerCapsule)
      ? product.pricePerCapsule
      : typeof effectivePrice === "number" &&
          !Number.isNaN(effectivePrice) &&
          typeof product.quantity === "number" &&
          product.quantity > 0
        ? Number((effectivePrice / product.quantity).toFixed(2))
        : null);
  const actualPricePerCapsule = selectedPricing?.actualPricePerCapsule ?? null;
  const selectedQuantity = selectedPricing?.selectedQuantity ?? product.selectedQuantity ?? product.quantity;
  const baseQuantity = selectedPricing?.baseQuantity ?? product.quantity;
  const discountAmount = selectedPricing?.discountAmount ?? null;
  const discountPercentage = selectedPricing?.discountPercentage ?? product.discountPercentage ?? 0;
  const descriptionPreview = getPlainText(product.description);
  const publicationStatus = product.publicationStatus || "published";
  const isDraft = publicationStatus === "draft";

  return (
    <article className="product-card">
      <div className="product-card-media">
        <div className="product-card-image-wrap">
          {imageUrl ? (
            <img className="product-card-image" src={imageUrl} alt={product.title} />
          ) : (
            <div className="product-card-placeholder">No image</div>
          )}
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          <span className="product-type-chip">{product.type}</span>
          <span
            className={`product-status-chip ${isDraft ? "is-draft" : "is-published"}`}
          >
            {publicationStatus}
          </span>
          {product.slug ? <span className="product-slug-chip">{product.slug}</span> : null}
        </div>

        <div className="product-card-heading">
          <h3>{product.title}</h3>
          <p className="product-card-description">{descriptionPreview}</p>
        </div>

        <div className="product-card-meta-grid">
          <div className="product-meta-pill">
            <span>Generic</span>
            <strong>{product.genericName}</strong>
          </div>
          <div className="product-meta-pill">
            <span>Selected pack</span>
            <strong>{selectedQuantity} capsules</strong>
          </div>
          <div className="product-meta-pill">
            <span>Base pack</span>
            <strong>{baseQuantity} capsules</strong>
          </div>
        </div>

        <div className="product-card-meta-grid product-meta-grid-secondary">
          <div className="product-meta-pill">
            <span>Dose</span>
            <strong>{product.dose}</strong>
          </div>
          <div className="product-meta-pill">
            <span>Price / capsule</span>
            <strong>{pricePerCapsule != null ? formatPrice(pricePerCapsule) : "Unavailable"}</strong>
          </div>
          <div className="product-meta-pill">
            <span>Actual / capsule</span>
            <strong>
              {actualPricePerCapsule != null ? formatPrice(actualPricePerCapsule) : "Unavailable"}
            </strong>
          </div>
        </div>

        {categoryNames.length ? (
          <div className="chip-row">
            {categoryNames.map((name) => (
              <span key={name} className="soft-chip">
                {name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="product-card-aside">
        <div className="product-card-pricing">
          <span className="product-price-label">Current price</span>
          <strong>{formatPrice(effectivePrice)}</strong>
          {discountPercentage ? (
            <span className="product-discount-note">{discountPercentage}% off</span>
          ) : (
            <span className="product-discount-note">No active discount</span>
          )}
        </div>

        <div className="product-price-breakdown product-price-breakdown-dense">
          <div className="product-price-stat">
            <span>Actual price</span>
            <strong>{formatPrice(actualPrice)}</strong>
          </div>
          <div className="product-price-stat">
            <span>Discount price</span>
            <strong>{formatPrice(discountPrice)}</strong>
          </div>
          <div className="product-price-stat">
            <span>Discount amount</span>
            <strong>{discountAmount != null ? formatPrice(discountAmount) : "Unavailable"}</strong>
          </div>
          <div className="product-price-stat">
            <span>Price per capsule</span>
            <strong>{pricePerCapsule != null ? formatPrice(pricePerCapsule) : "Unavailable"}</strong>
          </div>
          <div className="product-price-stat">
            <span>Actual per capsule</span>
            <strong>
              {actualPricePerCapsule != null ? formatPrice(actualPricePerCapsule) : "Unavailable"}
            </strong>
          </div>
          <div className="product-price-stat">
            <span>Pack mapping</span>
            <strong>{baseQuantity} to {selectedQuantity}</strong>
          </div>
        </div>

        <div className="card-action-row">
          <button type="button" className="ghost-button" onClick={() => onEdit(product)}>
            <FiEdit2 className="button-icon" />
            Edit
          </button>
          {isDraft ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => onTogglePublicationStatus(product, "published")}
            >
              <FiEye className="button-icon" />
              Publish
            </button>
          ) : (
            <button
              type="button"
              className="ghost-danger-button"
              onClick={() => onDelete(product)}
            >
              <FiEyeOff className="button-icon" />
              Move to draft
            </button>
          )}
        </div>
      </aside>
    </article>
  );
}
