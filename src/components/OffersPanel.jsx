import { useState } from "react";
import { FiCheck, FiEdit2, FiPercent, FiPlus, FiTag, FiTrash2, FiX } from "react-icons/fi";

export function OffersPanel({
  offers,
  loading,
  onCreateOffer,
  onDeleteOffer,
  onUpdateOffer,
}) {
  const [draftPromoCode, setDraftPromoCode] = useState("");
  const [draftDiscountPercentage, setDraftDiscountPercentage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingPromoCode, setEditingPromoCode] = useState("");
  const [editingDiscountPercentage, setEditingDiscountPercentage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCreateForm = () => {
    setDraftPromoCode("");
    setDraftDiscountPercentage("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!draftPromoCode.trim() || !draftDiscountPercentage.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateOffer({
        promoCode: draftPromoCode.trim(),
        discountPercentage: Number(draftDiscountPercentage),
      });
      resetCreateForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (offerId) => {
    if (!editingPromoCode.trim() || !editingDiscountPercentage.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateOffer(offerId, {
        promoCode: editingPromoCode.trim(),
        discountPercentage: Number(editingDiscountPercentage),
      });
      setEditingId(null);
      setEditingPromoCode("");
      setEditingDiscountPercentage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (offerId) => {
    setIsSubmitting(true);
    try {
      await onDeleteOffer(offerId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Checkout incentives</p>
          <h3>Offers</h3>
          <p>Create promo codes and control extra percentage discounts applied on top of product pricing.</p>
        </div>
      </div>

      <form className="offer-create-bar" onSubmit={handleCreate}>
        <label className="field-shell field-shell-grow">
          <span>Promo code</span>
          <input
            type="text"
            placeholder="SAVE10"
            value={draftPromoCode}
            onChange={(event) => setDraftPromoCode(event.target.value.toUpperCase())}
          />
        </label>
        <label className="field-shell">
          <span>Discount percentage</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="10"
            value={draftDiscountPercentage}
            onChange={(event) => setDraftDiscountPercentage(event.target.value)}
          />
        </label>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          <FiPlus className="button-icon" />
          Add offer
        </button>
      </form>

      {loading ? (
        <div className="empty-state">
          <h4>Loading offers...</h4>
          <p>The promo-code list is being fetched from the backend.</p>
        </div>
      ) : offers.length ? (
        <div className="category-list">
          {offers.map((offer) => {
            const isEditing = editingId === offer._id;

            return (
              <article key={offer._id} className="category-card offer-card">
                <div className="category-card-main offer-card-main">
                  <span className="eyebrow">Promo code</span>

                  {isEditing ? (
                    <div className="offer-card-edit-grid">
                      <input
                        className="inline-editor"
                        type="text"
                        value={editingPromoCode}
                        onChange={(event) => setEditingPromoCode(event.target.value.toUpperCase())}
                      />
                      <input
                        className="inline-editor"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={editingDiscountPercentage}
                        onChange={(event) => setEditingDiscountPercentage(event.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <h4>{offer.promoCode}</h4>
                      <div className="offer-meta-row">
                        <span className="soft-chip">
                          <FiPercent className="button-icon" />
                          {offer.discountPercentage}% off
                        </span>
                        <span className="soft-chip">
                          <FiTag className="button-icon" />
                          Promo active
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="category-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveEdit(offer._id)}
                      >
                        <FiCheck className="button-icon" />
                        Save
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingPromoCode("");
                          setEditingDiscountPercentage("");
                        }}
                      >
                        <FiX className="button-icon" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingId(offer._id);
                          setEditingPromoCode(offer.promoCode);
                          setEditingDiscountPercentage(String(offer.discountPercentage));
                        }}
                      >
                        <FiEdit2 className="button-icon" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-danger-button"
                        disabled={isSubmitting}
                        onClick={() => handleDelete(offer._id)}
                      >
                        <FiTrash2 className="button-icon" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No offers available</h4>
          <p>Add a promo code to start applying checkout discounts from the admin panel.</p>
        </div>
      )}
    </section>
  );
}
