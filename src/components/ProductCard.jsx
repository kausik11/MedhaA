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

export function ProductCard({ product, onDelete, onEdit }) {
  const imageUrl = product.images?.[0]?.imageUrl;
  const categoryNames = Array.isArray(product.category)
    ? product.category.map((item) => item.name).filter(Boolean)
    : [];
  const effectivePrice = product.discountPrice ?? product.actualPrice;
  const descriptionPreview = getPlainText(product.description);

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
            <span>Quantity</span>
            <strong>{product.quantity} capsules</strong>
          </div>
          <div className="product-meta-pill">
            <span>Dose</span>
            <strong>{product.dose}</strong>
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
          {product.discountPercentage ? (
            <span className="product-discount-note">{product.discountPercentage}% off</span>
          ) : (
            <span className="product-discount-note">No active discount</span>
          )}
        </div>

        <div className="card-action-row">
          <button type="button" className="ghost-button" onClick={() => onEdit(product)}>
            Edit
          </button>
          <button
            type="button"
            className="ghost-danger-button"
            onClick={() => onDelete(product._id)}
          >
            Delete
          </button>
        </div>
      </aside>
    </article>
  );
}
