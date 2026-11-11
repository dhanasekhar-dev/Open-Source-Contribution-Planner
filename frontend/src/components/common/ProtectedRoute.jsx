import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const defaultMsg =
      location.pathname.startsWith('/issues')
        ? 'Please sign in to view and filter repository issues.'
        : location.pathname.startsWith('/profile')
        ? 'Please sign in to view and manage your developer profile.'
        : location.pathname.startsWith('/dashboard')
        ? 'Please sign in to access your contribution dashboard.'
        : 'Please sign in to access this feature.';

    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: location.state?.message || defaultMsg,
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
