import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import profileApi from '../api/profileApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch authenticated user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await profileApi.getProfile();
      if (data?.success && data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If token is invalid or expired, clear auth
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data?.success && data?.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Also fetch full profile with preferences
      try {
        const profileData = await profileApi.getProfile();
        if (profileData?.success && profileData?.user) {
          setUser(profileData.user);
        }
      } catch (e) {
        console.warn('Could not immediately fetch extended profile:', e);
      }
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    if (data?.success && data?.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserInState = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUserProfile,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
