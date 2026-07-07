import React, { useRef, useEffect, useState } from 'react';
import './TabBar.css';

export default function TabBar({ tabs = [], activeTab, onChange }) {
  const tabRefs = useRef({});
  const containerRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="tab-bar" ref={containerRef} role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el; }}
            className={`tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
            onClick={() => onChange?.(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            {Icon && <Icon size={18} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
      <div
        className="tab-bar__indicator"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`
        }}
      />
    </div>
  );
}
