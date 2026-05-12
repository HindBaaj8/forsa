import React from 'react';

export default function LoadingSpinner({ fullPage = false, text = 'جاري التحميل...' }) {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}