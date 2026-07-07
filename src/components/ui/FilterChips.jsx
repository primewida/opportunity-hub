import React from 'react';

export default function FilterChips({
  options = [],
  selected,
  onChange,
  multiSelect = false
}) {
  const isSelected = (option) => {
    if (multiSelect) {
      return Array.isArray(selected) && selected.includes(option);
    }
    return selected === option;
  };

  const handleClick = (option) => {
    if (multiSelect) {
      const current = Array.isArray(selected) ? selected : [];
      const next = current.includes(option)
        ? current.filter((s) => s !== option)
        : [...current, option];
      onChange?.(next);
    } else {
      onChange?.(selected === option ? null : option);
    }
  };

  return (
    <div className="scrollable-x" role="group" aria-label="Filter options">
      {options.map((option) => (
        <button
          key={option}
          className={`chip ${isSelected(option) ? 'chip-active' : ''}`}
          onClick={() => handleClick(option)}
          aria-pressed={isSelected(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
