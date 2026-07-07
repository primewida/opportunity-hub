import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

export default function Accordion({ items = [], allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = useCallback((index) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, [allowMultiple]);

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div key={index} className={`accordion__item ${isOpen ? 'accordion__item--open' : ''}`}>
            <button
              className="accordion__trigger"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span className="accordion__trigger-text">{item.title}</span>
              <ChevronDown
                size={18}
                className={`accordion__chevron ${isOpen ? 'accordion__chevron--open' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="accordion__content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="accordion__content-inner">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
