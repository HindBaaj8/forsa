import React from 'react';

export default function Card({ children, title, subtitle, className = '', onClick, ...props }) {
  return (
    <div className={`card ${className}`} onClick={onClick} {...props}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}