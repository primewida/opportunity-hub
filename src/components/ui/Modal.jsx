import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './Modal.css';

const SIZE_MAP = {
  sm: '400px',
  md: '560px',
  lg: '720px'
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const desktopVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};

const mobileVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 350 } },
  exit: { y: '100%', transition: { duration: 0.2 } }
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalOverflow; };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Desktop modal */}
          <motion.div
            className="modal-container modal-container--desktop"
            style={{ maxWidth: SIZE_MAP[size] || SIZE_MAP.md }}
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button className="modal-close" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>

          {/* Mobile bottom sheet */}
          <motion.div
            className="modal-container modal-container--mobile"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="modal-handle" />
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button className="modal-close" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
