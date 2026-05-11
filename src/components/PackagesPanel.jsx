import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit2, FiLayers, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { api } from "../lib/api";

const PACK_SIZE_OPTIONS = [60, 90, 120];

const emptyForm = {
  title: "",
  items: [{ productId: "", selectedQuantity: "60", quantity: "1" }],
  actualPrice: "",
  imageFile: null,
  clearImage: false,
  monthPack: "1",
  priceBasedOn: "selected_quantity",
  description: "",
  isActive: true,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getProductTitle = (product) => product?.title || "Product removed";
const getDiscountPrice = (actualPrice) => {
  const parsedPrice = Number(actualPrice);
  return Number.isFinite(parsedPrice) ? Number((parsedPrice * 0.75).toFixed(2)) : 0;
};

const createEmptyItem = () => ({ productId: "", selectedQuantity: "60", quantity: "1" });

const getPackageItems = (packageItem) => {
  if (Array.isArray(packageItem.items) && packageItem.items.length) {
    return packageItem.items;
  }

  if (packageItem.product) {
    return [
      {
        product: packageItem.product,
        selectedQuantity: packageItem.selectedQuantity,
        quantity: packageItem.quantity,
      },
    ];
  }

  return [];
};

function PackageForm({
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  productError,
  productLoading,
  products,
  submitLabel,
}) {
  return (
    <form className="package-create-bar" onSubmit={onSubmit}>
      <label className="field-shell field-shell-grow">
        <span>Package title</span>
        <input
          type="text"
          placeholder="Monthly immunity pack"
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
        />
      </label>

      <label className="field-shell">
        <span>Actual price</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="2500"
          value={form.actualPrice}
          onChange={(event) => onChange("actualPrice", event.target.value)}
        />
      </label>

      <label className="field-shell">
        <span>25% discount price</span>
        <input
          type="text"
          value={formatCurrency(getDiscountPrice(form.actualPrice))}
          readOnly
        />
      </label>

      <label className="field-shell package-image-field">
        <span>Package image</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => onChange("imageFile", event.target.files?.[0] || null)}
        />
      </label>

      {onCancel ? (
        <label className="checkbox-chip package-active-toggle">
          <input
            type="checkbox"
            checked={form.clearImage}
            onChange={(event) => onChange("clearImage", event.target.checked)}
          />
          Clear image
        </label>
      ) : null}

      <div className="package-items-editor">
        <div className="package-items-heading">
          <span>Products</span>
          <button
            type="button"
            className="ghost-button package-add-item-button"
            onClick={() => onChange("items", [...form.items, createEmptyItem()])}
          >
            <FiPlus className="button-icon" />
            Add product
          </button>
        </div>
        {productError ? <small className="field-error-text">{productError}</small> : null}
        {form.items.map((item, index) => (
          <div className="package-item-row" key={`${index}-${item.productId}`}>
            <label className="field-shell field-shell-grow">
              <span>Product</span>
              <select
                value={item.productId}
                onChange={(event) => {
                  const nextItems = form.items.map((currentItem, itemIndex) =>
                    itemIndex === index
                      ? { ...currentItem, productId: event.target.value }
                      : currentItem
                  );
                  onChange("items", nextItems);
                }}
                disabled={productLoading}
              >
                <option value="">
                  {productLoading ? "Loading products..." : "Select product"}
                </option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <span>Product pack</span>
              <select
                value={item.selectedQuantity}
                onChange={(event) => {
                  const nextItems = form.items.map((currentItem, itemIndex) =>
                    itemIndex === index
                      ? { ...currentItem, selectedQuantity: event.target.value }
                      : currentItem
                  );
                  onChange("items", nextItems);
                }}
              >
                {PACK_SIZE_OPTIONS.map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantity} capsules
                  </option>
                ))}
              </select>
            </label>

            <label className="field-shell">
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(event) => {
                  const nextItems = form.items.map((currentItem, itemIndex) =>
                    itemIndex === index
                      ? { ...currentItem, quantity: event.target.value }
                      : currentItem
                  );
                  onChange("items", nextItems);
                }}
              />
            </label>

            <button
              type="button"
              className="ghost-danger-button package-remove-item-button"
              disabled={form.items.length === 1}
              onClick={() => {
                onChange(
                  "items",
                  form.items.filter((_item, itemIndex) => itemIndex !== index)
                );
              }}
            >
              <FiTrash2 className="button-icon" />
              Remove
            </button>
          </div>
        ))}
      </div>

      <label className="field-shell">
        <span>Month pack</span>
        <input
          type="number"
          min="1"
          step="1"
          value={form.monthPack}
          onChange={(event) => onChange("monthPack", event.target.value)}
        />
      </label>

      <label className="field-shell">
        <span>Price based on</span>
        <select
          value={form.priceBasedOn}
          onChange={(event) => onChange("priceBasedOn", event.target.value)}
        >
          <option value="selected_quantity">Selected quantity</option>
          <option value="selected_month_pack">Selected month pack</option>
        </select>
      </label>

      <label className="checkbox-chip package-active-toggle">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => onChange("isActive", event.target.checked)}
        />
        Active
      </label>

      <label className="field-shell package-description-field">
        <span>Description</span>
        <textarea
          rows="2"
          placeholder="Optional package note"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </label>

      <div className="package-form-actions">
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          <FiCheck className="button-icon" />
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            <FiX className="button-icon" />
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function PackagesPanel({
  loading,
  onCreatePackage,
  onDeletePackage,
  onUpdatePackage,
  packages,
  products,
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownProducts, setDropdownProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");

      try {
        const productsData = await api.getProducts();
        if (!isCancelled) {
          setDropdownProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setDropdownProducts(Array.isArray(products) ? products : []);
          setProductsError(error.message || "Unable to load products.");
        }
      } finally {
        if (!isCancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const productOptions = useMemo(
    () => {
      const sourceProducts = dropdownProducts.length ? dropdownProducts : products;
      return sourceProducts.filter((product) => product?._id);
    },
    [dropdownProducts, products]
  );

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateEditingForm = (key, value) => {
    setEditingForm((current) => ({ ...current, [key]: value }));
  };

  const toPayload = (source) => {
    const formData = new FormData();
    formData.append("title", source.title.trim());
    formData.append("items", JSON.stringify(source.items.map((item) => ({
      productId: item.productId,
      selectedQuantity: Number(item.selectedQuantity),
      quantity: Number(item.quantity),
    }))));
    formData.append("actualPrice", String(Number(source.actualPrice) || 0));
    formData.append("monthPack", String(Number(source.monthPack) || 1));
    formData.append("priceBasedOn", source.priceBasedOn);
    formData.append("description", source.description.trim());
    formData.append("isActive", String(Boolean(source.isActive)));
    if (source.imageFile) {
      formData.append("image", source.imageFile);
    }
    if (source.clearImage) {
      formData.append("clearImage", "true");
    }
    return formData;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.actualPrice || form.items.some((item) => !item.productId)) return;

    setIsSubmitting(true);
    try {
      await onCreatePackage(toPayload(form));
      setForm(emptyForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (packageItem) => {
    setEditingId(packageItem._id);
    setEditingForm({
      title: packageItem.title || "",
      items: getPackageItems(packageItem).map((item) => ({
        productId: item.product?._id || item.product || "",
        selectedQuantity: `${item.selectedQuantity || 60}`,
        quantity: `${item.quantity || 1}`,
      })),
      actualPrice: `${packageItem.actualPrice || ""}`,
      imageFile: null,
      clearImage: false,
      monthPack: `${packageItem.monthPack || 1}`,
      priceBasedOn: packageItem.priceBasedOn || "selected_quantity",
      description: packageItem.description || "",
      isActive: packageItem.isActive !== false,
    });
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (
      !editingId ||
      !editingForm.title.trim() ||
      !editingForm.actualPrice ||
      editingForm.items.some((item) => !item.productId)
    ) return;

    setIsSubmitting(true);
    try {
      await onUpdatePackage(editingId, toPayload(editingForm));
      setEditingId(null);
      setEditingForm(emptyForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (packageId) => {
    setIsSubmitting(true);
    try {
      await onDeletePackage(packageId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Product bundles</p>
          <h3>Packages</h3>
          <p>Create packages from database products and let backend pricing follow the selected rule.</p>
        </div>
      </div>

      <PackageForm
        form={form}
        isSubmitting={isSubmitting}
        onChange={updateForm}
        onSubmit={handleCreate}
        productError={productsError}
        productLoading={productsLoading}
        products={productOptions}
        submitLabel="Add package"
      />

      {loading ? (
        <div className="empty-state">
          <h4>Loading packages...</h4>
          <p>The package list is being fetched from the backend.</p>
        </div>
      ) : packages.length ? (
        <div className="category-list">
          {packages.map((packageItem) => {
            const isEditing = editingId === packageItem._id;
            const pricingLabel =
              packageItem.priceBasedOn === "selected_month_pack"
                ? `${packageItem.monthPack} month pack`
                : `${getPackageItems(packageItem).reduce(
                    (total, item) => total + (Number(item.quantity) || 0),
                    0
                  )} total quantity`;

            return (
              <article key={packageItem._id} className="category-card package-card">
                {isEditing ? (
                  <PackageForm
                    form={editingForm}
                    isSubmitting={isSubmitting}
                    onCancel={() => {
                      setEditingId(null);
                      setEditingForm(emptyForm);
                    }}
                    onChange={updateEditingForm}
                    onSubmit={handleSaveEdit}
                    productError={productsError}
                    productLoading={productsLoading}
                    products={productOptions}
                    submitLabel="Save package"
                  />
                ) : (
                  <>
                    <div className="category-card-main package-card-main">
                      <span className="eyebrow">Package</span>
                      <h4>{packageItem.title}</h4>
                      <div className="offer-meta-row">
                        {getPackageItems(packageItem).map((item, index) => (
                          <span
                            className="soft-chip"
                            key={`${item.product?._id || item.product || index}-${index}`}
                          >
                            <FiLayers className="button-icon" />
                            {getProductTitle(item.product)} x {item.quantity}
                          </span>
                        ))}
                        <span className="soft-chip">{packageItem.selectedQuantity} capsules</span>
                        <span className="soft-chip">{pricingLabel}</span>
                        <span className="soft-chip">
                          {packageItem.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {packageItem.description ? (
                        <p className="package-description">{packageItem.description}</p>
                      ) : null}
                    </div>

                    <div className="package-price-block">
                      <span>25% discount price</span>
                      <strong>{formatCurrency(packageItem.packageTotal)}</strong>
                      <small>
                        Actual {formatCurrency(packageItem.actualPrice)} | 25% off
                      </small>
                    </div>

                    <div className="category-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleEdit(packageItem)}
                      >
                        <FiEdit2 className="button-icon" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-danger-button"
                        disabled={isSubmitting || packageItem.isActive === false}
                        onClick={() => handleDelete(packageItem._id)}
                      >
                        <FiTrash2 className="button-icon" />
                        Deactivate
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No packages available</h4>
          <p>Add a package by selecting a product, pack size, and pricing rule.</p>
        </div>
      )}
    </section>
  );
}
