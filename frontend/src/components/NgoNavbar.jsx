import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Search, 
  CheckCircle2, 
  Truck, 
  Globe2, 
  Building, 
  LogOut,
  ShoppingCart
} from 'lucide-react';

export const NgoNavbar = ({ onOpenCart = null }) => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with NGO Badge */}
          <Link to="/ngo/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">EcoThread</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">NGO Hub</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Textile Intake, Acceptance & Community Allocation</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/ngo/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/ngo/browse" className={navLinkClass}>
              <Search className="w-3.5 h-3.5" />
              <span>Browse Donations</span>
            </NavLink>

            <NavLink to="/ngo/accepted" className={navLinkClass}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accepted Donations</span>
            </NavLink>

            <NavLink to="/ngo/collections" className={navLinkClass}>
              <Truck className="w-3.5 h-3.5" />
              <span>Collections & Fleet</span>
            </NavLink>

            <NavLink to="/ngo/impact" className={navLinkClass}>
              <Globe2 className="w-3.5 h-3.5" />
              <span>Impact</span>
            </NavLink>

            <NavLink to="/ngo/profile" className={navLinkClass}>
              <Building className="w-3.5 h-3.5" />
              <span>Org Profile</span>
            </NavLink>
          </nav>

          {/* Right Profile & Cart Actions */}
          <div className="flex items-center gap-2.5">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="View Community Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            <Link
              to="/ngo/profile"
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                {user?.organizationName ? user.organizationName[0].toUpperCase() : (user?.fullName ? user.fullName[0].toUpperCase() : 'N')}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800 line-clamp-1 leading-tight max-w-[130px]">
                  {user?.organizationName || user?.fullName || 'NGO Partner'}
                </div>
                <div className="text-[9px] text-indigo-700 font-medium uppercase">NGO Partner</div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* Mobile Bottom Tab Sub-navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 text-xs no-scrollbar">
          <NavLink to="/ngo/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/ngo/browse" className={navLinkClass}>Browse</NavLink>
          <NavLink to="/ngo/accepted" className={navLinkClass}>Accepted</NavLink>
          <NavLink to="/ngo/collections" className={navLinkClass}>Collections</NavLink>
          <NavLink to="/ngo/impact" className={navLinkClass}>Impact</NavLink>
          <NavLink to="/ngo/profile" className={navLinkClass}>Profile</NavLink>
        </div>
      </div>
    </header>
  );
};

