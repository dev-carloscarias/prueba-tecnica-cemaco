import { FaExclamationCircle, FaTimes } from 'react-icons/fa'

/**
 * Aviso de error accesible para el panel de administración.
 */
export function AdminAlert({ message, onDismiss, className = '' }) {
  if (!message) return null
  return (
    <div className={`admin-alert ${className}`.trim()} role="alert">
      <FaExclamationCircle className="admin-alert__icon" aria-hidden />
      <p className="admin-alert__text">{message}</p>
      {onDismiss && (
        <button
          type="button"
          className="admin-alert__dismiss"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
        >
          <FaTimes aria-hidden />
        </button>
      )}
    </div>
  )
}
