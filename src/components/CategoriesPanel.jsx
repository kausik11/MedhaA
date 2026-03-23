import { useState } from "react";

export function CategoriesPanel({
  categories,
  loading,
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategory,
}) {
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!draftName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory(draftName.trim());
      setDraftName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (categoryId) => {
    if (!editingName.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateCategory(categoryId, editingName.trim());
      setEditingId(null);
      setEditingName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setIsSubmitting(true);
    try {
      await onDeleteCategory(categoryId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Catalog structure</p>
          <h3>Categories</h3>
          <p>Use this panel to manage the categories available to the product forms.</p>
        </div>
      </div>

      <form className="category-create-bar" onSubmit={handleCreate}>
        <label className="field-shell field-shell-grow">
          <span>New category name</span>
          <input
            type="text"
            placeholder="Add a new category..."
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
          />
        </label>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          Add category
        </button>
      </form>

      {loading ? (
        <div className="empty-state">
          <h4>Loading categories...</h4>
          <p>The category list is being fetched from the backend.</p>
        </div>
      ) : categories.length ? (
        <div className="category-list">
          {categories.map((category) => {
            const isEditing = editingId === category._id;

            return (
              <article key={category._id} className="category-card">
                <div className="category-card-main">
                  <span className="eyebrow">{category.isDefault ? "Default" : "Custom"}</span>

                  {isEditing ? (
                    <input
                      className="inline-editor"
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                  ) : (
                    <h4>{category.name}</h4>
                  )}
                </div>

                <div className="category-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveEdit(category._id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setEditingId(category._id);
                          setEditingName(category.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-danger-button"
                        disabled={isSubmitting}
                        onClick={() => handleDelete(category._id)}
                      >
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
          <h4>No categories available</h4>
          <p>Add a category to start structuring products in the admin panel.</p>
        </div>
      )}
    </section>
  );
}
