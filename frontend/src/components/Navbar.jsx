import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Sprout, 
  ShoppingBag, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  Coins, 
  ShoppingCart,
  User as UserIcon,
  LogOut,
  LogIn,
  GraduationCap,
  Sparkles,
  Compass,
  QrCode,
  Radio
} from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  onTabChange, 
  onOpenCart, 
  onOpenLogin, 
  onOpenVerify,
  onOpenScanner,
  onOpenNgoLocator,
  onOpenLiveMap,
  onOpenPassport
}) => {
  const { user, logout, cart, totalCartCredits } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('donor')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit']">EcoThread</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">Circular</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Textile Recovery & Campus Redistribution</p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('donor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'donor'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>Donor</span>
            </button>

            <button
              onClick={() => onTabChange('campus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'campus'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
              <span>Campus Circularity</span>
            </button>

            <button
              onClick={() => onTabChange('beneficiary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'beneficiary'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Store</span>
            </button>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Warehouse QC</span>
            </button>

            <button
              onClick={() => onTabChange('logistics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'logistics'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Logistics</span>
            </button>
          </nav>

          {/* Feature Innovation Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* NGO Needs & Eco-Route Button */}
            <button
              onClick={onOpenNgoLocator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50/80 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-all shadow-xs"
              title="NGO Urgent Needs & Travel Emission Locator"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">NGO Needs & Routes</span>
            </button>

            {/* Live NGO & Fleet Radar Button */}
            <button
              onClick={onOpenLiveMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/90 text-emerald-900 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
              title="Live NGO Locations & Logistics Fleet Tracker"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Live Radar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </button>

            {/* Digital Passport Trigger */}
            <button
              onClick={() => onOpenPassport && onOpenPassport('ECO-TRC-2026-8841')}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Garment Digital Passport"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Beneficiary Seasonal Credits Counter */}
            {user?.role === 'ROLE_BENEFICIARY' && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <Coins className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span>{user.credits ?? 0}</span>
              </div>
            )}

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Current User Pill & Dropdown / Logout */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">{user.role?.replace('ROLE_', '')}</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => onTabChange('donor')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'donor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Donor
          </button>
          <button
            onClick={() => onTabChange('campus')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'campus' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Campus Hub
          </button>
          <button
            onClick={() => onTabChange('beneficiary')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'beneficiary' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Store
          </button>
          <button
            onClick={() => onTabChange('admin')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Warehouse QC
          </button>
          <button
            onClick={() => onTabChange('logistics')}
            className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'logistics' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Logistics
          </button>
        </div>
      </div>
    </header>
  );
};
