import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function RequireClient({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || role !== 'client') {
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, []);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
}
