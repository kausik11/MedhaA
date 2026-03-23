import { FiAlertTriangle } from "react-icons/fi";

export function ConfirmToast({ message, title, onCancel, onConfirm }) {
  return (
    <div className="confirm-toast">
      <div className="confirm-toast-icon">
        <FiAlertTriangle />
      </div>

      <div className="confirm-toast-body">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>

      <div className="confirm-toast-actions">
        <button type="button" className="ghost-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="ghost-danger-button" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}
