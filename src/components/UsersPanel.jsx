import { useMemo, useState } from "react";
import { FiCheck, FiMail, FiPlus, FiRefreshCw, FiShield, FiUser, FiX } from "react-icons/fi";

const USER_ROLES = ["normal", "administrator", "superadmin"];

const EMPTY_USER_FORM = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  address: "",
  designation: "",
  password: "",
  role: "normal",
  userImage: null,
};

export function UsersPanel({
  currentUser,
  loading,
  onCreateUser,
  onSendCurrentUserVerificationOtp,
  onUpdateUser,
  onVerifyCurrentUserEmailOtp,
  users,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formState, setFormState] = useState(EMPTY_USER_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [verifiedEmailToken, setVerifiedEmailToken] = useState("");
  const [isSendingRegistrationOtp, setIsSendingRegistrationOtp] = useState(false);
  const [isVerifyingRegistrationOtp, setIsVerifyingRegistrationOtp] = useState(false);
  const [currentUserOtp, setCurrentUserOtp] = useState("");
  const [isSendingCurrentUserOtp, setIsSendingCurrentUserOtp] = useState(false);
  const [isVerifyingCurrentUserOtp, setIsVerifyingCurrentUserOtp] = useState(false);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) => {
        if (left.role !== right.role) {
          return left.role.localeCompare(right.role);
        }

        return `${left.firstName || ""} ${left.lastName || ""}`.localeCompare(
          `${right.firstName || ""} ${right.lastName || ""}`
        );
      }),
    [users]
  );

  const isEditMode = Boolean(editingUser?._id);

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormState(EMPTY_USER_FORM);
    setRegistrationOtp("");
    setEmailVerificationToken("");
    setVerifiedEmailToken("");
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormState(EMPTY_USER_FORM);
    setRegistrationOtp("");
    setEmailVerificationToken("");
    setVerifiedEmailToken("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormState({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      address: user.address || "",
      designation: user.designation || "",
      password: "",
      role: user.role || "normal",
      userImage: null,
    });
    setRegistrationOtp("");
    setEmailVerificationToken("");
    setVerifiedEmailToken("");
    setIsModalOpen(true);
  };

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSendRegistrationOtp = async () => {
    if (!formState.email.trim()) {
      return;
    }

    setIsSendingRegistrationOtp(true);
    try {
      const response = await onCreateUser.sendRegistrationOtp({
        email: formState.email.trim(),
        firstName: formState.firstName.trim(),
      });
      setEmailVerificationToken(response.emailVerificationToken || "");
      setVerifiedEmailToken("");
      setRegistrationOtp("");
    } finally {
      setIsSendingRegistrationOtp(false);
    }
  };

  const handleVerifyRegistrationOtp = async () => {
    if (!formState.email.trim() || !registrationOtp.trim() || !emailVerificationToken) {
      return;
    }

    setIsVerifyingRegistrationOtp(true);
    try {
      const response = await onCreateUser.verifyRegistrationOtp({
        email: formState.email.trim(),
        otp: registrationOtp.trim(),
        emailVerificationToken,
      });
      setVerifiedEmailToken(response.verifiedEmailToken || "");
    } finally {
      setIsVerifyingRegistrationOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("firstName", formState.firstName.trim());
      payload.append("lastName", formState.lastName.trim());
      payload.append("phoneNumber", formState.phoneNumber.trim());
      payload.append("email", formState.email.trim());
      payload.append("role", formState.role);

      if (formState.address.trim()) {
        payload.append("address", formState.address.trim());
      }

      if (formState.designation.trim()) {
        payload.append("designation", formState.designation.trim());
      }

      if (formState.userImage) {
        payload.append("userImage", formState.userImage);
      }

      if (isEditMode) {
        if (formState.password.trim()) {
          payload.append("password", formState.password);
        }
        await onUpdateUser(editingUser._id, payload);
      } else {
        if (!verifiedEmailToken) {
          throw new Error("Verify the email OTP before creating the user.");
        }

        payload.append("password", formState.password);
        payload.append("verifiedEmailToken", verifiedEmailToken);
        await onCreateUser.submit(payload);
      }

      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCurrentUserOtp = async () => {
    setIsSendingCurrentUserOtp(true);
    try {
      await onSendCurrentUserVerificationOtp();
    } finally {
      setIsSendingCurrentUserOtp(false);
    }
  };

  const handleVerifyCurrentUserOtp = async () => {
    if (!currentUserOtp.trim()) {
      return;
    }

    setIsVerifyingCurrentUserOtp(true);
    try {
      await onVerifyCurrentUserEmailOtp(currentUserOtp.trim());
      setCurrentUserOtp("");
    } finally {
      setIsVerifyingCurrentUserOtp(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="panel-hero">
        <div>
          <p className="eyebrow">Account administration</p>
          <h3>Users</h3>
          <p>Manage admin and normal users, update roles, and keep account data current.</p>
        </div>
        <button type="button" className="primary-button" onClick={openCreateModal}>
          <FiPlus className="button-icon" />
          Add user
        </button>
      </div>

      <article className="category-card user-verification-card">
        <div className="category-card-main">
          <span className="eyebrow">Current admin</span>
          <h4>{currentUser?.email || "Signed-in account"}</h4>
          <div className="offer-meta-row">
            <span className="soft-chip">
              <FiShield className="button-icon" />
              {currentUser?.role || "administrator"}
            </span>
            <span className="soft-chip">
              {currentUser?.isVerifiedEmail ? "Email verified" : "Email not verified"}
            </span>
          </div>
        </div>

        {!currentUser?.isVerifiedEmail ? (
          <div className="user-verification-actions">
            <button
              type="button"
              className="ghost-button"
              disabled={isSendingCurrentUserOtp}
              onClick={handleSendCurrentUserOtp}
            >
              <FiMail className="button-icon" />
              {isSendingCurrentUserOtp ? "Sending..." : "Send verification OTP"}
            </button>
            <label className="field-shell field-shell-grow">
              <span>OTP</span>
              <input
                type="text"
                value={currentUserOtp}
                onChange={(event) => setCurrentUserOtp(event.target.value)}
                placeholder="Enter OTP"
              />
            </label>
            <button
              type="button"
              className="primary-button"
              disabled={isVerifyingCurrentUserOtp}
              onClick={handleVerifyCurrentUserOtp}
            >
              <FiCheck className="button-icon" />
              {isVerifyingCurrentUserOtp ? "Verifying..." : "Verify email"}
            </button>
          </div>
        ) : null}
      </article>

      {loading ? (
        <div className="empty-state">
          <h4>Loading users...</h4>
          <p>User accounts are being fetched from the backend.</p>
        </div>
      ) : sortedUsers.length ? (
        <div className="category-list">
          {sortedUsers.map((user) => (
            <article key={user._id} className="category-card address-card">
              <div className="category-card-main address-card-main">
                {user.userImage ? (
                  <div className="user-avatar-row">
                    <img
                      className="user-avatar-image"
                      src={user.userImage}
                      alt={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
                    />
                  </div>
                ) : null}
                <span className="eyebrow">{user.role}</span>
                <h4>{`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}</h4>
                <div className="offer-meta-row">
                  <span className="soft-chip">
                    <FiUser className="button-icon" />
                    {user.email}
                  </span>
                  <span className="soft-chip">{user.phoneNumber || "No phone"}</span>
                  <span className="soft-chip">
                    {user.isVerifiedEmail ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="address-card-copy">
                  {user.designation || "No designation"}{user.address ? `, ${user.address}` : ""}
                </p>
              </div>

              <div className="category-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => openEditModal(user)}
                >
                  <FiRefreshCw className="button-icon" />
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h4>No users available</h4>
          <p>Create a user to start managing account access from the admin panel.</p>
        </div>
      )}

      {isModalOpen ? (
        <div className="modal-overlay" role="presentation" onClick={resetForm}>
          <div
            className="modal-shell address-modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label={isEditMode ? "Edit user" : "Add user"}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">{isEditMode ? "Update user" : "Add user"}</p>
                <h3>{isEditMode ? "Edit user account" : "Create a new user account"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={resetForm}>
                <FiX className="button-icon" />
                Close
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              {!isEditMode ? (
                <div className="modal-section">
                  <div className="modal-section-heading">
                    <p className="eyebrow">Registration OTP</p>
                    <h4>Email verification for signup</h4>
                  </div>

                  <div className="user-verification-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={isSendingRegistrationOtp}
                      onClick={handleSendRegistrationOtp}
                    >
                      <FiMail className="button-icon" />
                      {isSendingRegistrationOtp ? "Sending..." : "Send registration OTP"}
                    </button>
                    <label className="field-shell field-shell-grow">
                      <span>OTP</span>
                      <input
                        type="text"
                        value={registrationOtp}
                        onChange={(event) => setRegistrationOtp(event.target.value)}
                        placeholder="Enter OTP"
                      />
                    </label>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isVerifyingRegistrationOtp}
                      onClick={handleVerifyRegistrationOtp}
                    >
                      <FiCheck className="button-icon" />
                      {isVerifyingRegistrationOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>

                  {verifiedEmailToken ? (
                    <div className="notice-banner is-success">
                      <span>Email verified for registration.</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="modal-section">
                <div className="address-form-grid">
                  <label className="field-shell">
                    <span>First name</span>
                    <input
                      required
                      type="text"
                      value={formState.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Last name</span>
                    <input
                      required
                      type="text"
                      value={formState.lastName}
                      onChange={(event) => updateField("lastName", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Phone number</span>
                    <input
                      required
                      type="text"
                      value={formState.phoneNumber}
                      onChange={(event) => updateField("phoneNumber", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={(event) => updateField("email", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Role</span>
                    <select
                      value={formState.role}
                      onChange={(event) => updateField("role", event.target.value)}
                    >
                      {USER_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-shell">
                    <span>{isEditMode ? "New password" : "Password"}</span>
                    <input
                      {...(isEditMode ? {} : { required: true })}
                      type="password"
                      value={formState.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      placeholder={isEditMode ? "Leave empty to keep current password" : "Enter password"}
                    />
                  </label>
                  <label className="field-shell">
                    <span>Designation</span>
                    <input
                      type="text"
                      value={formState.designation}
                      onChange={(event) => updateField("designation", event.target.value)}
                    />
                  </label>
                  <label className="field-shell address-form-span-2">
                    <span>Address</span>
                    <input
                      type="text"
                      value={formState.address}
                      onChange={(event) => updateField("address", event.target.value)}
                    />
                  </label>
                  <label className="field-shell">
                    <span>User image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        updateField("userImage", event.target.files?.[0] || null)
                      }
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
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update user"
                      : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
