import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  History, 
  Globe2, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';

export const DonorNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with Donor Badge */}
          <Link to="/donor/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">EcoThread</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Donor</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Campus Circular Fashion & Donation Portal</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/donor/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/donor/create" className={navLinkClass}>
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Donation</span>
            </NavLink>

            <NavLink to="/donor/donations" className={navLinkClass}>
              <Package className="w-3.5 h-3.5" />
              <span>My Donations</span>
            </NavLink>

            <NavLink to="/donor/history" className={navLinkClass}>
              <History className="w-3.5 h-3.5" />
              <span>Donation History</span>
            </NavLink>

            <NavLink to="/donor/impact" className={navLinkClass}>
              <Globe2 className="w-3.5 h-3.5" />
              <span>Impact & 80G</span>
            </NavLink>

            <NavLink to="/donor/profile" className={navLinkClass}>
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* Right Profile Pill & Logout */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/donor/profile"
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'D'}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800 line-clamp-1 leading-tight">{user?.fullName || 'Donor'}</div>
                <div className="text-[9px] text-emerald-700 font-medium uppercase">Clothing Donor</div>
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
          <NavLink to="/donor/dashboard" className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/donor/create" className={navLinkClass}>Create</NavLink>
          <NavLink to="/donor/donations" className={navLinkClass}>My Donations</NavLink>
          <NavLink to="/donor/history" className={navLinkClass}>History</NavLink>
          <NavLink to="/donor/impact" className={navLinkClass}>Impact</NavLink>
          <NavLink to="/donor/profile" className={navLinkClass}>Profile</NavLink>
        </div>
      </div>
    </header>
  );
};

