import { useState } from "react";
import { FiMapPin, FiPlus, FiRefreshCw, FiTrash2, FiUser, FiX } from "react-icons/fi";

const createEmptyForm = () => ({
  userId: "",
  fullName: "",
  mobileNumber: "",
  alternateMobileNumber: "",
  pincode: "",
  state: "",
  country: "",
  houseNo: "",
  street: "",
  city: "",
  landmark: "",
});

const getAddressUserId = (address) => {
  const value = address?.user;

  if (value && typeof value === "object") {
    return value._id || "";
  }

  return value || "";
};

const getUserLabel = (user) => {
  if (!user || typeof user !== "object") {
    return "Unknown user";
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.email || "Unknown user";
};

export function AddressesPanel({
  addresses,
  loading,
  onCreateAddress,
  onDeleteAddress,
  onUpdateAddress,
  users = [],
}) {
  const [formState, setFormState] = useState(() => createEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sortedUsers = [...users].sort((left, right) =>
    getUserLabel(left).localeCompare(getUserLabel(right))
  );

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState(createEmptyForm());
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await onUpdateAddress(editingId, formState);
      } else {
        await onCreateAddress(formState);
      }
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    setIsSubmitting(true);
    try {
      await onDeleteAddress(addressId);
      if (editingId === addressId) {
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Delivery destinations</p>
          <h3>Addresses</h3>
          <p>Manage delivery addresses and review the automatically calculated delivery window for each destination.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          disabled={!sortedUsers.length}
          onClick={() => {
            setEditingId(null);
            setFormState(createEmptyForm());
            setIsModalOpen(true);
          }}
        >
          <FiPlus className="button-icon" />
          Add address
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <h4>Loading addresses...</h4>
          <p>The delivery address list is being fetched from the backend.</p>
        </div>
      ) : addresses.length ? (
        <div className="category-list">
          {addresses.map((address) => {
            const addressUserId = getAddressUserId(address);
            const assignedUser =
              users.find((user) => user._id === addressUserId) ||
              (address?.user && typeof address.user === "object" ? address.user : null);

            return (
              <article key={address._id} className="category-card address-card">
                <div className="category-card-main address-card-main">
                  <span className="eyebrow">Delivery address</span>
                  <h4>{address.fullName}</h4>
                  <div className="offer-meta-row">
                    <span className="soft-chip">
                      <FiUser className="button-icon" />
                      {getUserLabel(assignedUser)}
                    </span>
                    <span className="soft-chip">
                      <FiMapPin className="button-icon" />
                      {address.city}, {address.state}
                    </span>
                    <span className="soft-chip">{address.country}</span>
                    <span className="soft-chip">{address.deliveryTime}</span>
                  </div>
                  <p className="address-card-copy">
                    {address.houseNo}, {address.street}, {address.city}, {address.state}, {address.country} - {address.pincode}
                  </p>
                  <div className="address-card-copy-group">
                    <span>Mobile: {address.mobileNumber}</span>
                    {address.alternateMobileNumber ? (
                      <span>Alt: {address.alternateMobileNumber}</span>
                    ) : null}
                    {address.landmark ? <span>Landmark: {address.landmark}</span> : null}
                  </div>
                </div>

                <div className="category-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setEditingId(address._id);
                      setFormState({
                        userId: getAddressUserId(address),
                        fullName: address.fullName || "",
                        mobileNumber: address.mobileNumber || "",
                        alternateMobileNumber: address.alternateMobileNumber || "",
                        pincode: address.pincode || "",
                        state: address.state || "",
                        country: address.country || "",
                        houseNo: address.houseNo || "",
                        street: address.street || "",
                        city: address.city || "",
                        landmark: address.landmark || "",
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <FiRefreshCw className="button-icon" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ghost-danger-button"
                    disabled={isSubmitting}
                    onClick={() => handleDelete(address._id)}
                  >
                    <FiTrash2 className="button-icon" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No addresses available</h4>
          <p>Add an address to manage delivery destinations from the admin panel.</p>
        </div>
      )}

      {isModalOpen ? (
        <div className="modal-overlay" role="presentation" onClick={resetForm}>
          <div
            className="modal-shell address-modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit address" : "Add address"}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">{editingId ? "Update address" : "Add address"}</p>
                <h3>{editingId ? "Edit delivery address" : "Create a new delivery address"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetForm}>
                <FiX className="button-icon" />
                Close
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-section">
                <div className="address-form-grid">
                  <label className="field-shell address-form-span-2">
                    <span>User</span>
                    <select
                      required
                      value={formState.userId}
                      onChange={(event) => updateField("userId", event.target.value)}
                    >
                      <option value="">Select user</option>
                      {sortedUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {getUserLabel(user)}{user.email ? ` (${user.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-shell">
                    <span>Full name</span>
                    <input
                      required
                      type="text"
                      value={formState.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Mobile number</span>
                    <input
                      required
                      type="text"
                      value={formState.mobileNumber}
                      onChange={(event) => updateField("mobileNumber", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Alternate mobile number</span>
                    <input
                      type="text"
                      value={formState.alternateMobileNumber}
                      onChange={(event) => updateField("alternateMobileNumber", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Pincode</span>
                    <input
                      required
                      type="text"
                      value={formState.pincode}
                      onChange={(event) => updateField("pincode", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>State</span>
                    <input
                      required
                      type="text"
                      value={formState.state}
                      onChange={(event) => updateField("state", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Country</span>
                    <input
                      required
                      type="text"
                      value={formState.country}
                      onChange={(event) => updateField("country", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>House no</span>
                    <input
                      required
                      type="text"
                      value={formState.houseNo}
                      onChange={(event) => updateField("houseNo", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Street</span>
                    <input
                      required
                      type="text"
                      value={formState.street}
                      onChange={(event) => updateField("street", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>City</span>
                    <input
                      required
                      type="text"
                      value={formState.city}
                      onChange={(event) => updateField("city", event.target.value)}
                    />
                  </label>
                  <label className="field-shell address-form-span-2">
                    <span>Landmark</span>
                    <input
                      type="text"
                      value={formState.landmark}
                      onChange={(event) => updateField("landmark", event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  <FiPlus className="button-icon" />
                  {editingId ? "Update address" : "Add address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
