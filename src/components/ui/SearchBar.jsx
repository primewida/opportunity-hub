import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  onFocus,
  className = '',
  ...props
}) {
  // Guarantee a primitive string for the input
  const strValue = typeof value === 'string'
    ? value
    : (value && value.target && value.target.value !== undefined ? String(value.target.value) : (value ? String(value) : ''));

  const handleChange = (e) => {
    const nextVal = e && e.target !== undefined ? e.target.value : (typeof e === 'string' ? e : '');
    if (typeof onChange === 'function') {
      onChange(nextVal);
    }
  };

  const handleClear = () => {
    if (typeof onClear === 'function') {
      onClear();
    }
    if (typeof onChange === 'function') {
      onChange('');
    }
  };

  return (
    <div className={`search-bar-wrapper ${className}`} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--text-secondary)',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
      <input
        type="text"
        className="input"
        value={strValue}
        onChange={handleChange}
        onInput={handleChange}
        onFocus={onFocus}
        placeholder={placeholder}
        style={{ paddingLeft: '40px', paddingRight: strValue ? '40px' : '12px', width: '100%' }}
        {...props}
      />
      {strValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm, 6px)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
