import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  ROLE_DONOR: { email: 'donor@ecothread.org', password: 'password123', label: 'Donor' },
  ROLE_BENEFICIARY: { email: 'beneficiary@ecothread.org', password: 'password123', label: 'Beneficiary' },
  ROLE_LOGISTICS: { email: 'driver@ecothread.org', password: 'password123', label: 'Logistics Driver' },
  ROLE_ADMIN: { email: 'admin@ecothread.org', password: 'password123', label: 'Warehouse Admin' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecothread_token'));
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ecothread_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('ecothread_cart', JSON.stringify(cart));
  }, [cart]);

  // Load current user profile if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('ecothread_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.warn('Stored token invalid, auto-logging in default demo donor...');
          await switchRole('ROLE_DONOR');
        }
      } else {
        // Default to Donor persona for seamless first-time review
        await switchRole('ROLE_DONOR');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      localStorage.setItem('ecothread_token', data.token);
      setToken(data.token);
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        credits: data.credits,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || 'Invalid login credentials' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const data = res.data;
      localStorage.setItem('ecothread_token', data.token);
      setToken(data.token);
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        credits: data.credits,
      });
      return { success: true, user: data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ecothread_token');
    setToken(null);
    setUser(null);
    setCart([]);
  };

  // Instant one-click persona switcher
  const switchRole = async (targetRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (!creds) return;
    try {
      const res = await authApi.login(creds.email, creds.password);
      const data = res.data;
      localStorage.setItem('ecothread_token', data.token);
      setToken(data.token);
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        credits: data.credits,
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const refreshUserData = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCredits = cart.reduce((acc, curr) => acc + (curr.creditCost || 0), 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalCartCredits,
        login,
        register,
        logout,
        switchRole,
        refreshUserData,
        DEMO_CREDENTIALS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
