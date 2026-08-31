import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  onFocus,
  className = '',
  autoFocus = false,
  ...props
}) {
  const getInitialString = (val) => {
    if (typeof val === 'string') return val;
    if (val && val.target && val.target.value !== undefined) return String(val.target.value);
    return val ? String(val) : '';
  };

  const [internalValue, setInternalValue] = useState(getInitialString(value));
  const inputRef = useRef(null);

  // Sync internal value if prop value changes externally
  useEffect(() => {
    const next = getInitialString(value);
    if (next !== internalValue) {
      setInternalValue(next);
    }
  }, [value]);

  const handleChange = (e) => {
    const nextVal = e && e.target !== undefined ? e.target.value : (typeof e === 'string' ? e : '');
    setInternalValue(nextVal);
    if (typeof onChange === 'function') {
      onChange(nextVal);
    }
  };

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (typeof onChange === 'function') {
      onChange(internalValue);
    }
    if (typeof onSearch === 'function') {
      onSearch(internalValue);
    }
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClear = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setInternalValue('');
    if (typeof onClear === 'function') {
      onClear();
    }
    if (typeof onChange === 'function') {
      onChange('');
    }
    if (typeof onSearch === 'function') {
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`search-bar-wrapper ${className}`}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', margin: 0 }}
    >
      <button
        type="submit"
        aria-label="Submit search"
        style={{
          position: 'absolute',
          left: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: internalValue ? 'var(--color-primary)' : 'var(--text-secondary)',
          zIndex: 2,
        }}
      >
        <Search size={18} />
      </button>

      <input
        ref={inputRef}
        type="text"
        className="input"
        value={internalValue}
        onChange={handleChange}
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        style={{
          paddingLeft: '40px',
          paddingRight: internalValue ? '70px' : '14px',
          width: '100%',
        }}
        {...props}
      />

      {internalValue ? (
        <div style={{ position: 'absolute', right: '6px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
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
          <button
            type="submit"
            aria-label="Execute search"
            className="btn btn-primary"
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 4px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              height: '24px'
            }}
          >
            Search
          </button>
        </div>
      ) : null}
    </form>
  );
}
