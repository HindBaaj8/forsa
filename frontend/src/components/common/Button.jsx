import React from 'react';

export default function Button({ 
  children, 
  variant = 'navy', 
  size = 'md', 
  full = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  ...props 
}) {
  const variantClasses = {
    navy: 'btn--navy',
    gold: 'btn--gold',
    success: 'btn--success',
    danger: 'btn--danger',
    ghost: 'btn--ghost',
    outline: 'btn--outline',
  };
  
  const sizeClasses = {
    sm: 'btn--sm',
    md: '',
    lg: 'btn--lg',
  };

  return (
    <button
      type={type}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${full ? 'btn--full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner-sm" />}
      {Icon && !loading && <Icon size={16} />}
      {children}
    </button>
  );
}