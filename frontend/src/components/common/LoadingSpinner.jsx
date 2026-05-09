// components/common/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <span>جاري التحميل...</span>
    </div>
  );
}