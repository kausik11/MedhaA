import { useDeferredValue, useMemo, useState } from "react";
import {
  FiEdit2,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

const EMPTY_FORM = {
  fullName: "",
  rating: "5",
  message: "",
  image: null,
};

const normalizeSearchValue = (value) => `${value ?? ""}`.toLowerCase().trim();

export function TestimonialsPanel({
  loading,
  onCreateTestimonial,
  onDeleteTestimonial,
  onGetTestimonialById,
  onUpdateTestimonial,
  testimonials,
}) {
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredTestimonials = useMemo(() => {
    const query = normalizeSearchValue(deferredSearchTerm);

    if (!query) {
      return testimonials;
    }

    const tokens = query.split(/\s+/).filter(Boolean);

    return testimonials.filter((testimonial) => {
      const haystack = [
        testimonial.fullName,
        testimonial.message,
        testimonial.rating,
        `${testimonial.rating} star`,
        `${testimonial.rating} stars`,
      ]
        .filter(Boolean)
        .map((value) => normalizeSearchValue(value));

      return tokens.every((token) => haystack.some((value) => value.includes(token)));
    });
  }, [deferredSearchTerm, testimonials]);

  const hasSearchTerm = Boolean(searchTerm.trim());
  const isEditMode = Boolean(editingTestimonial?._id);

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setEditingTestimonial(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setFormState(EMPTY_FORM);
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (testimonialId) => {
    setIsSubmitting(true);

    try {
      const testimonial = await onGetTestimonialById(testimonialId);
      setEditingTestimonial(testimonial);
      setFormState({
        fullName: testimonial.fullName || "",
        rating: String(testimonial.rating || 5),
        message: testimonial.message || "",
        image: null,
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEditMode && !formState.image) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("fullName", formState.fullName.trim());
      payload.append("rating", formState.rating);
      payload.append("message", formState.message.trim());

      if (formState.image) {
        payload.append("image", formState.image);
      }

      if (isEditMode) {
        await onUpdateTestimonial(editingTestimonial._id, payload);
      } else {
        await onCreateTestimonial(payload);
      }

      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (testimonialId) => {
    setIsSubmitting(true);

    try {
      await onDeleteTestimonial(testimonialId);

      if (editingTestimonial?._id === testimonialId) {
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
          <p className="eyebrow">Brand trust</p>
          <h3>Testimonials</h3>
          <p>Manage customer testimonial cards, ratings, quotes, and profile images shown in the storefront.</p>
        </div>
        <button type="button" className="primary-button" onClick={openCreateModal}>
          <FiPlus className="button-icon" />
          Add testimonial
        </button>
      </div>

      <div className="filter-bar testimonial-filter-bar">
        <label className="field-shell">
          <span>Search testimonials</span>
          <div className="testimonial-search-shell">
            <FiSearch className="testimonial-search-icon" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, rating, or quote..."
              aria-label="Search testimonials"
            />
          </div>
        </label>

        <div className="testimonial-filter-summary" aria-live="polite">
          <span className="soft-chip">
            {filteredTestimonials.length} of {testimonials.length} testimonials
          </span>
        </div>

        <button
          type="button"
          className="ghost-button"
          onClick={() => setSearchTerm("")}
          disabled={!hasSearchTerm}
        >
          Clear search
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <h4>Loading testimonials...</h4>
          <p>The testimonial feed is being fetched from the backend.</p>
        </div>
      ) : filteredTestimonials.length ? (
        <div className="category-list">
          {filteredTestimonials.map((testimonial) => (
            <article key={testimonial._id} className="category-card testimonial-card">
              <div className="category-card-main testimonial-card-main">
                <div className="testimonial-media">
                  {testimonial.imageUrl ? (
                    <img
                      className="testimonial-image"
                      src={testimonial.imageUrl}
                      alt={testimonial.fullName}
                    />
                  ) : (
                    <div className="testimonial-image testimonial-image-placeholder">
                      <FiMessageSquare className="button-icon" />
                    </div>
                  )}
                </div>

                <div className="testimonial-copy">
                  <span className="eyebrow">Customer voice</span>
                  <h4>{testimonial.fullName}</h4>
                  <div className="offer-meta-row">
                    <span className="soft-chip">
                      <FiStar className="button-icon" />
                      {testimonial.rating}/5 rating
                    </span>
                  </div>
                  <p className="testimonial-message">{testimonial.message}</p>
                </div>
              </div>

              <div className="category-actions">
                <button
                  type="button"
                  className="ghost-button"
                  disabled={isSubmitting}
                  onClick={() => openEditModal(testimonial._id)}
                >
                  <FiEdit2 className="button-icon" />
                  Edit
                </button>
                <button
                  type="button"
                  className="ghost-danger-button"
                  disabled={isSubmitting}
                  onClick={() => handleDelete(testimonial._id)}
                >
                  <FiTrash2 className="button-icon" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : testimonials.length ? (
        <div className="empty-state">
          <h4>No matching testimonials</h4>
          <p>Try a different customer name, rating, or message keyword.</p>
        </div>
      ) : (
        <div className="empty-state">
          <h4>No testimonials available</h4>
          <p>Add a testimonial to manage customer proof from the admin panel.</p>
        </div>
      )}

      {isModalOpen ? (
        <div className="modal-overlay" role="presentation" onClick={resetForm}>
          <div
            className="modal-shell testimonial-modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={isEditMode ? "Edit testimonial" : "Add testimonial"}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">{isEditMode ? "Update testimonial" : "Add testimonial"}</p>
                <h3>{isEditMode ? "Edit testimonial card" : "Create a new testimonial card"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetForm}>
                <FiX className="button-icon" />
                Close
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-section">
                <div className="modal-grid">
                  <label className="field-shell modal-grid-span-2">
                    <span>Full name</span>
                    <input
                      required
                      type="text"
                      value={formState.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                    />
                  </label>

                  <label className="field-shell">
                    <span>Rating</span>
                    <select
                      value={formState.rating}
                      onChange={(event) => updateField("rating", event.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} star{rating === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field-shell modal-grid-span-2">
                    <span>Message</span>
                    <textarea
                      required
                      rows="5"
                      value={formState.message}
                      onChange={(event) => updateField("message", event.target.value)}
                      placeholder="Write the testimonial quote shown on the storefront"
                    />
                  </label>

                  <label className="field-shell">
                    <span>{isEditMode ? "Replace image" : "Image"}</span>
                    <input
                      {...(isEditMode ? {} : { required: true })}
                      type="file"
                      accept="image/*"
                      onChange={(event) => updateField("image", event.target.files?.[0] || null)}
                    />
                  </label>

                  <div className="testimonial-preview-shell">
                    <span>Current preview</span>
                    {formState.image ? (
                      <div className="testimonial-preview-copy">
                        <FiUpload className="button-icon" />
                        {formState.image.name}
                      </div>
                    ) : editingTestimonial?.imageUrl ? (
                      <img
                        className="testimonial-preview-image"
                        src={editingTestimonial.imageUrl}
                        alt={editingTestimonial.fullName}
                      />
                    ) : (
                      <div className="testimonial-preview-copy">Upload an image</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  <FiPlus className="button-icon" />
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update testimonial"
                      : "Create testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
