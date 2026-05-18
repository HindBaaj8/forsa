import React from 'react';

export default function Logo({ size = 'md', variant = 'light', className = '' }) {
  const sizes = {
    sm: { width: 32, height: 32, fontSize: 18 },
    md: { width: 42, height: 42, fontSize: 24 },
    lg: { width: 56, height: 56, fontSize: 32 },
    xl: { width: 80, height: 80, fontSize: 44 },
  };

  const currentSize = sizes[size] || sizes.md;

  // الألوان حسب الـ variant
  const colors = {
    light: { main: '#FFC800', dark: '#0a2647' },
    dark: { main: '#FFC800', dark: '#ffffff' },
    gold: { main: '#FFC800', dark: '#0a2647' },
  };

  const colorSet = colors[variant] || colors.light;

  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        background: `linear-gradient(135deg, ${colorSet.main}, ${colorSet.dark})`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <span style={{ fontSize: currentSize.fontSize, fontWeight: 900, color: '#fff' }}>
        ف⚡ع
      </span>
    </div>
  );
}