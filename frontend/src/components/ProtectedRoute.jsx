import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
          <Sprout className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold animate-pulse">Securing session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRole) {
    const isDonorAllowed = allowedRole === 'ROLE_DONOR';
    const isUserDonor = user.role === 'ROLE_DONOR';

    if (isDonorAllowed && !isUserDonor) {
      // NGO or Admin trying to access donor routes -> redirect to NGO dashboard
      return <Navigate to="/ngo/dashboard" replace />;
    }

    const isNgoAllowed = allowedRole === 'ROLE_NGO';
    const isUserNgo = user.role === 'ROLE_NGO' || user.role === 'ROLE_ADMIN' || user.role === 'ROLE_BENEFICIARY' || user.role === 'ROLE_LOGISTICS';

    if (isNgoAllowed && !isUserNgo) {
      // Donor trying to access NGO routes -> redirect to Donor dashboard
      return <Navigate to="/donor/dashboard" replace />;
    }
  }

  return children;
};

