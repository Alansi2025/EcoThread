import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  ROLE_DONOR: { email: 'donor@ecothread.org', password: 'password123', label: 'Donor' },
  ROLE_NGO: { email: 'ngo@ecothread.org', password: 'password123', label: 'NGO / Shelter Partner' },
  ROLE_ADMIN: { email: 'admin@ecothread.org', password: 'password123', label: 'Warehouse Admin' },
  ROLE_LOGISTICS: { email: 'driver@ecothread.org', password: 'password123', label: 'Logistics Driver' },
  ROLE_BENEFICIARY: { email: 'beneficiary@ecothread.org', password: 'password123', label: 'Beneficiary' },
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
          console.warn('Stored token invalid or expired, clearing session.');
          localStorage.removeItem('ecothread_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    const handleAuthExpired = () => {
      console.warn('Session expired or invalidated. Resetting user state.');
      setUser(null);
      setToken(null);
    };

    window.addEventListener('ecothread_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('ecothread_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      if (rememberMe) {
        localStorage.setItem('ecothread_token', data.token);
      } else {
        sessionStorage.setItem('ecothread_token', data.token);
        localStorage.setItem('ecothread_token', data.token);
      }
      setToken(data.token);
      
      // Fetch full profile with organization details
      const profileRes = await authApi.getMe().catch(() => ({ data: data }));
      setUser(profileRes.data);
      return { success: true, user: profileRes.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Invalid email or password';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleData) => {
    setLoading(true);
    try {
      const res = await authApi.googleLogin(googleData);
      const data = res.data;
      localStorage.setItem('ecothread_token', data.token);
      setToken(data.token);
      const profileRes = await authApi.getMe().catch(() => ({ data: data }));
      setUser(profileRes.data);
      return { success: true, user: profileRes.data };
    } catch (err) {
      return { success: false, error: err.response?.data || 'Google authentication failed' };
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
      const profileRes = await authApi.getMe().catch(() => ({ data: data }));
      setUser(profileRes.data);
      return { success: true, user: profileRes.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.response?.data || 'Failed to update profile' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('ecothread_token');
    sessionStorage.removeItem('ecothread_token');
    setToken(null);
    setUser(null);
    setCart([]);
  };

  const switchRole = async (targetRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (!creds) return;
    return await login(creds.email, creds.password, true);
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
      if (prev.some((i) => i.id === item.id)) return prev;
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

  const isDonor = user?.role === 'ROLE_DONOR';
  const isNgo = user?.role === 'ROLE_NGO' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_BENEFICIARY';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        updateProfile,
        logout,
        switchRole,
        refreshUserData,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalCartCredits,
        isDonor,
        isNgo,
        demoCredentials: DEMO_CREDENTIALS
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
