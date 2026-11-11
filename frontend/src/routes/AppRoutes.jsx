import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Repositories from '../pages/Repositories';
import Issues from '../pages/Issues';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PublicRoute from '../components/common/PublicRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing Page: The Open Source Universe */}
      <Route path="/" element={<Landing />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Public Repository Discovery */}
      <Route path="/repositories" element={<Repositories />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />

      {/* 404 Deep Space Telemetry Missing Fallback */}
      <Route
        path="*"
        element={
          <div className="content-card rounded-2xl border border-white/10 p-12 text-center max-w-lg mx-auto my-16 shadow-2xl">
            <div className="text-6xl font-extrabold text-[#ff7200] mb-3">
              404
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              Page Not Found
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              The requested page could not be found. Check the URL or return to home.
            </p>
            <Link
              to="/"
              className="inline-block mt-6 btn-orange px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Return Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
