import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  hint, 
  placeholder, 
  required, 
  icon: Icon,
  className = '',
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="req"> *</span>}
        </label>
      )}
      <div className="field-wrap">
        {Icon && <Icon size={16} className="field-icon" />}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'err' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button type="button" className="field-eye" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="form-err">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}