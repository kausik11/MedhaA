import { useEffect, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

const createInitialState = () => ({
  title: "",
  type: "vitamin",
  genericName: "",
  dose: "",
  quantity: "60",
  description: "",
  actualPrice: "",
  discountPercentage: "",
  composition: "",
  keyHealthBenefits: "",
  usageDirection: "",
  safetyInformation: "",
  storageCondition: "",
  disclaimer: "",
  tags: "",
  metadata: "",
  supportInfo: "",
  category: [],
  images: [],
  countryOfOrigin: "",
  manufacturingGenericName: "",
  marketedBy: "",
  marketedAddress: "",
  dosage: "",
  bestTime: "",
  avoid: "",
  maximumBenefit: "",
  effectiveWith: "",
  form: "",
  nonVegetarianSupplement: false,
});

const createFormState = (product) => {
  if (!product) {
    return createInitialState();
  }

  return {
    title: product.title || "",
    type: product.type || "vitamin",
    genericName: product.genericName || "",
    dose: product.dose || "",
    quantity: `${product.quantity || 60}`,
    description: product.description || "",
    actualPrice:
      product.actualPrice != null && !Number.isNaN(product.actualPrice)
        ? `${product.actualPrice}`
        : "",
    discountPercentage:
      product.discountPercentage != null && !Number.isNaN(product.discountPercentage)
        ? `${product.discountPercentage}`
        : "",
    composition: product.composition || "",
    keyHealthBenefits: product.keyHealthBenefits || "",
    usageDirection: product.usageDirection || "",
    safetyInformation: product.safetyInformation || "",
    storageCondition: product.storageCondition || "",
    disclaimer: product.disclaimer || "",
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    metadata: Array.isArray(product.metadata) ? product.metadata.join(", ") : "",
    supportInfo: Array.isArray(product.supportInfo) ? product.supportInfo.join(", ") : "",
    category: Array.isArray(product.category) ? product.category.map((item) => item._id) : [],
    images: [],
    countryOfOrigin: product.manufacturingDetails?.countryOfOrigin || "",
    manufacturingGenericName: product.manufacturingDetails?.genericName || "",
    marketedBy: product.manufacturingDetails?.marketedBy || "",
    marketedAddress: product.manufacturingDetails?.marketedAddress || "",
    dosage: product.extraInfo?.dosage || "",
    bestTime: product.extraInfo?.bestTime || "",
    avoid: product.extraInfo?.avoid || "",
    maximumBenefit: product.extraInfo?.maximumBenefit || "",
    effectiveWith: product.extraInfo?.effectiveWith || "",
    form: product.extraInfo?.form || "",
    nonVegetarianSupplement: Boolean(product.nonVegetarianSupplement),
  };
};

export function ProductFormModal({
  categories,
  isOpen,
  isSubmitting,
  onClose,
  product,
  onSubmit,
}) {
  const [formState, setFormState] = useState(createInitialState);
  const isEditMode = Boolean(product?._id);

  const normalizeRichText = (value) => {
    const normalizedValue = `${value || ""}`.trim();

    if (
      !normalizedValue ||
      normalizedValue === "<p><br></p>" ||
      normalizedValue === "<div><br></div>"
    ) {
      return "";
    }

    return normalizedValue;
  };

  useEffect(() => {
    if (isOpen) {
      setFormState(createFormState(product));
    }
  }, [isOpen, product]);

  if (!isOpen) {
    return null;
  }

  const updateField = (key, value) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleCategory = (categoryId) => {
    setFormState((current) => {
      const nextCategories = current.category.includes(categoryId)
        ? current.category.filter((item) => item !== categoryId)
        : [...current.category, categoryId];

      return {
        ...current,
        category: nextCategories,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("title", formState.title);
    payload.append("type", formState.type);
    payload.append("genericName", formState.genericName);
    payload.append("dose", formState.dose);
    payload.append("quantity", formState.quantity);
    payload.append("description", normalizeRichText(formState.description));
    payload.append("actualPrice", formState.actualPrice);
    payload.append("nonVegetarianSupplement", `${formState.nonVegetarianSupplement}`);

    if (formState.discountPercentage) {
      payload.append("discountPercentage", formState.discountPercentage);
    }

    if (formState.composition) {
      payload.append("composition", formState.composition);
    }

    if (formState.keyHealthBenefits) {
      payload.append("keyHealthBenefits", normalizeRichText(formState.keyHealthBenefits));
    }

    if (formState.usageDirection) {
      payload.append("usageDirection", normalizeRichText(formState.usageDirection));
    }

    if (formState.safetyInformation) {
      payload.append("safetyInformation", normalizeRichText(formState.safetyInformation));
    }

    if (formState.storageCondition) {
      payload.append("storageCondition", formState.storageCondition);
    }

    if (formState.disclaimer) {
      payload.append("disclaimer", normalizeRichText(formState.disclaimer));
    }

    if (formState.tags) {
      payload.append("tags", formState.tags);
    }

    if (formState.metadata) {
      payload.append("metadata", formState.metadata);
    }

    if (formState.supportInfo) {
      payload.append("supportInfo", formState.supportInfo);
    }

    if (formState.countryOfOrigin) {
      payload.append("countryOfOrigin", formState.countryOfOrigin);
    }

    if (formState.manufacturingGenericName) {
      payload.append("manufacturingGenericName", formState.manufacturingGenericName);
    }

    if (formState.marketedBy) {
      payload.append("marketedBy", formState.marketedBy);
    }

    if (formState.marketedAddress) {
      payload.append("marketedAddress", formState.marketedAddress);
    }

    if (formState.dosage) {
      payload.append("dosage", normalizeRichText(formState.dosage));
    }

    if (formState.bestTime) {
      payload.append("bestTime", normalizeRichText(formState.bestTime));
    }

    if (formState.avoid) {
      payload.append("avoid", normalizeRichText(formState.avoid));
    }

    if (formState.maximumBenefit) {
      payload.append("maximumBenefit", normalizeRichText(formState.maximumBenefit));
    }

    if (formState.effectiveWith) {
      payload.append("effectiveWith", normalizeRichText(formState.effectiveWith));
    }

    if (formState.form) {
      payload.append("form", formState.form);
    }

    if (formState.category.length) {
      payload.append("category", formState.category.join(","));
    }

    formState.images.forEach((file) => {
      payload.append("images", file);
    });

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{isEditMode ? "Edit product" : "Create product"}</p>
            <h3 id="add-product-title">
              {isEditMode ? "Update product" : "Add a new product"}
            </h3>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <section className="modal-section">
            <div className="modal-section-heading">
              <p className="eyebrow">Core details</p>
              <h4>Basic product information</h4>
            </div>

            <div className="modal-grid">
              <label className="field-shell">
                <span>Product title</span>
                <input
                  required
                  type="text"
                  value={formState.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Type</span>
                <select
                  value={formState.type}
                  onChange={(event) => updateField("type", event.target.value)}
                >
                  <option value="vitamin">Vitamin</option>
                  <option value="enzyme">Enzyme</option>
                  <option value="booster">Booster</option>
                </select>
              </label>

              <label className="field-shell">
                <span>Generic name</span>
                <input
                  required
                  type="text"
                  value={formState.genericName}
                  onChange={(event) => updateField("genericName", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Dose</span>
                <input
                  required
                  type="text"
                  value={formState.dose}
                  onChange={(event) => updateField("dose", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Quantity</span>
                <select
                  value={formState.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                >
                  <option value="60">60 capsules</option>
                  <option value="90">90 capsules</option>
                  <option value="120">120 capsules</option>
                </select>
              </label>

              <label className="field-shell">
                <span>Supplement type</span>
                <select
                  value={formState.nonVegetarianSupplement ? "true" : "false"}
                  onChange={(event) =>
                    updateField("nonVegetarianSupplement", event.target.value === "true")
                  }
                >
                  <option value="false">Vegetarian</option>
                  <option value="true">Non-vegetarian</option>
                </select>
              </label>

              <label className="field-shell">
                <span>Actual price</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.actualPrice}
                  onChange={(event) => updateField("actualPrice", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Discount percentage</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formState.discountPercentage}
                  onChange={(event) => updateField("discountPercentage", event.target.value)}
                />
              </label>

              <label className="field-shell modal-grid-span-2">
                <span>{isEditMode ? "Replace images" : "Images"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    updateField("images", Array.from(event.target.files || []).slice(0, 5))
                  }
                />
              </label>
            </div>

            {isEditMode && Array.isArray(product?.images) && product.images.length ? (
              <div className="field-shell field-shell-full">
                <span>Current images</span>
                <div className="modal-image-row">
                  {product.images.map((image) => (
                    <img
                      key={image.imagePublicId || image.imageUrl}
                      className="modal-image-thumb"
                      src={image.imageUrl}
                      alt={product.title}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="modal-section">
            <div className="modal-section-heading">
              <p className="eyebrow">Content</p>
              <h4>Description and guidance</h4>
            </div>

            <RichTextEditor
              label="Description"
              required
              value={formState.description}
              onChange={(value) => updateField("description", value)}
            />

            <div className="modal-grid">
              <label className="field-shell">
                <span>Composition</span>
                <input
                  type="text"
                  value={formState.composition}
                  onChange={(event) => updateField("composition", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Storage condition</span>
                <input
                  type="text"
                  value={formState.storageCondition}
                  onChange={(event) => updateField("storageCondition", event.target.value)}
                />
              </label>
            </div>

            <div className="modal-rich-grid">
              <RichTextEditor
                label="Key health benefits"
                value={formState.keyHealthBenefits}
                onChange={(value) => updateField("keyHealthBenefits", value)}
              />
              <RichTextEditor
                label="Usage direction"
                value={formState.usageDirection}
                onChange={(value) => updateField("usageDirection", value)}
              />
              <RichTextEditor
                label="Safety information"
                value={formState.safetyInformation}
                onChange={(value) => updateField("safetyInformation", value)}
              />
              <RichTextEditor
                label="Disclaimer"
                value={formState.disclaimer}
                onChange={(value) => updateField("disclaimer", value)}
              />
            </div>
          </section>

          <section className="modal-section">
            <div className="modal-section-heading">
              <p className="eyebrow">Discovery</p>
              <h4>Categories, metadata, and support</h4>
            </div>

            <div className="modal-grid">
              <label className="field-shell">
                <span>Tags</span>
                <input
                  type="text"
                  placeholder="Comma separated"
                  value={formState.tags}
                  onChange={(event) => updateField("tags", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Metadata</span>
                <input
                  type="text"
                  placeholder="Comma separated"
                  value={formState.metadata}
                  onChange={(event) => updateField("metadata", event.target.value)}
                />
              </label>

              <label className="field-shell modal-grid-span-2">
                <span>Support info</span>
                <input
                  type="text"
                  placeholder="Comma separated"
                  value={formState.supportInfo}
                  onChange={(event) => updateField("supportInfo", event.target.value)}
                />
              </label>
            </div>

            <div className="field-shell field-shell-full">
              <span>Categories</span>
              <div className="checkbox-grid">
                {categories.map((category) => (
                  <label key={category._id} className="checkbox-chip">
                    <input
                      type="checkbox"
                      checked={formState.category.includes(category._id)}
                      onChange={() => toggleCategory(category._id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="modal-section">
            <div className="modal-section-heading">
              <p className="eyebrow">Manufacturing</p>
              <h4>Origin and marketed details</h4>
            </div>

            <div className="modal-grid">
              <label className="field-shell">
                <span>Country of origin</span>
                <input
                  type="text"
                  value={formState.countryOfOrigin}
                  onChange={(event) => updateField("countryOfOrigin", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Manufacturing generic name</span>
                <input
                  type="text"
                  value={formState.manufacturingGenericName}
                  onChange={(event) =>
                    updateField("manufacturingGenericName", event.target.value)
                  }
                />
              </label>

              <label className="field-shell">
                <span>Marketed by</span>
                <input
                  type="text"
                  value={formState.marketedBy}
                  onChange={(event) => updateField("marketedBy", event.target.value)}
                />
              </label>

              <label className="field-shell">
                <span>Marketed address</span>
                <input
                  type="text"
                  value={formState.marketedAddress}
                  onChange={(event) => updateField("marketedAddress", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="modal-section">
            <div className="modal-section-heading">
              <p className="eyebrow">Extra info</p>
              <h4>Usage details and best results</h4>
            </div>

            <div className="modal-rich-grid">
              <RichTextEditor
                label="Dosage"
                value={formState.dosage}
                onChange={(value) => updateField("dosage", value)}
              />
              <RichTextEditor
                label="Best time"
                value={formState.bestTime}
                onChange={(value) => updateField("bestTime", value)}
              />
              <RichTextEditor
                label="Avoid"
                value={formState.avoid}
                onChange={(value) => updateField("avoid", value)}
              />
              <RichTextEditor
                label="Maximum benefit"
                value={formState.maximumBenefit}
                onChange={(value) => updateField("maximumBenefit", value)}
              />
              <RichTextEditor
                label="Effective with"
                value={formState.effectiveWith}
                onChange={(value) => updateField("effectiveWith", value)}
              />
            </div>

            <div className="modal-grid">
              <label className="field-shell">
                <span>Form</span>
                <input
                  type="text"
                  value={formState.form}
                  onChange={(event) => updateField("form", event.target.value)}
                />
              </label>
            </div>
          </section>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update product" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
