import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const token = localStorage.getItem('careconnect_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (isMounted) {
            setUser(res.data);
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          localStorage.removeItem('careconnect_token');
          if (isMounted) {
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('careconnect_token', token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { token, ...userData } = res.data;
    localStorage.setItem('careconnect_token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('careconnect_token');
    setUser(null);
  }, []);

  const updateUserState = useCallback((updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateUserState,
    isAuthenticated: !!user,
  }), [user, loading, login, register, logout, updateUserState]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
