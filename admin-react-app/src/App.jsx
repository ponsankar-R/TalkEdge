import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

function getStoredAdmin() {
  const email = localStorage.getItem('talkedge_admin_email');
  const token = localStorage.getItem('talkedge_admin_token');
  return token && email ? { email } : null;
}

export default function App() {
  const [admin, setAdmin] = useState(getStoredAdmin());

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            admin ? <Navigate to="/" replace /> : <Login onLoggedIn={setAdmin} />
          }
        />
        <Route
          path="/"
          element={
            admin ? (
              <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
