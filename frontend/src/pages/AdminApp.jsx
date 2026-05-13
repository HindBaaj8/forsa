import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminApp = () => {
  return (
    <div>
      <h1>Admin Panel</h1>

      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </div>
  );
};

export default AdminApp;