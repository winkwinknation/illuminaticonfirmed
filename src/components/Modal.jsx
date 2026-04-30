import React, { useEffect } from 'react';
import './Modal.css';

export const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && <h2 className="modal__title">{title}</h2>}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
};
