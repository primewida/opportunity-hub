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
  const displayValue = typeof value === 'string' ? value : (value?.target?.value ?? String(value ?? ''));

  const handleChange = (e) => {
    const val = e?.target ? e.target.value : String(e ?? '');
    if (typeof onChange === 'function') {
      onChange(val);
    }
  };

  const handleClear = () => {
    onClear?.();
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
        value={displayValue}
        onChange={handleChange}
        onFocus={onFocus}
        placeholder={placeholder}
        style={{ paddingLeft: '40px', paddingRight: displayValue ? '40px' : '12px', width: '100%' }}
        {...props}
      />
      {displayValue && (
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
      )}
    </div>
  );
}
