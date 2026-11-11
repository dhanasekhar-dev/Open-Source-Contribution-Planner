import React, { useEffect, useRef } from 'react';

/**
 * Reusable accessible confirmation dialog.
 * Styled with the application's dark theme, subtle borders, and smooth backdrop.
 */
const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  danger = true,
}) => {
  const cancelButtonRef = useRef(null);

  // Keyboard accessibility: Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    // Prevent background scrolling while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Focus cancel button for safe keyboard interaction
    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-message"
      onClick={onCancel}
    >
      <div
        className="content-card bg-[#0d1424] border border-white/10 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
              danger
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-[#ff7200]/10 text-[#ff7200] border-[#ff7200]/30'
            }`}
          >
            {danger ? '🗑️' : '⚠️'}
          </div>
          <div>
            <h3
              id="confirmation-modal-title"
              className="text-lg sm:text-xl font-bold text-white tracking-tight"
            >
              {title}
            </h3>
            <p
              id="confirmation-modal-message"
              className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white border border-white/10 bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md transition cursor-pointer flex items-center gap-2 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 border border-rose-500/40'
                : 'btn-orange'
            }`}
          >
            {isLoading && (
              <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
