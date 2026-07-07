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
  const handleClear = () => {
    onClear?.();
    onChange?.({ target: { value: '' } });
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
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        style={{ paddingLeft: '40px', paddingRight: value ? '40px' : '12px', width: '100%' }}
        {...props}
      />
      {value && (
        <button
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
