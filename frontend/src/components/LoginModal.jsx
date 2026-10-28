import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  X, Lock, Mail, User, Phone, CheckCircle2, AlertCircle,
  HeartHandshake, ShoppingBag, Truck, ShieldCheck, ArrowRight,
  Sparkles, KeyRound, ChevronRight
} from 'lucide-react';

const PORTAL_DESTINATIONS = [
  {
    id: 'ROLE_DONOR',
    tab: 'donor',
    title: 'Donor Portal',
    roleLabel: 'Clothing Donor',
    icon: HeartHandshake,
    accentColor: 'from-emerald-600 to-teal-700',
    borderColor: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20',
    bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'Donation & Tax Acknowledgment',
    description: 'Schedule free doorstep clothing pickups, track recycling progress, and obtain verified 80G tax acknowledgment receipts.',
    demoEmail: 'donor@ecothread.org',
    demoName: 'Aarav Sharma'
  },
  {
    id: 'ROLE_BENEFICIARY',
    tab: 'beneficiary',
    title: 'Beneficiary & NGO Store',
    roleLabel: 'Beneficiary / NGO Partner',
    icon: ShoppingBag,
    accentColor: 'from-amber-600 to-orange-700',
    borderColor: 'hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20',
    bgBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeText: 'Student & NGO Store (150 Credits)',
    description: 'Access cleaned, Grade-A garments using seasonal welfare credits, browse community inventory, or order bulk packages.',
    demoEmail: 'beneficiary@ecothread.org',
    demoName: 'Priya Kumari (150 Credits)'
  },
  {
    id: 'ROLE_LOGISTICS',
    tab: 'logistics',
    title: 'Logistics Fleet Partner',
    roleLabel: 'Delivery & Fleet Partner',
    icon: Truck,
    accentColor: 'from-blue-600 to-cyan-700',
    borderColor: 'hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20',
    bgBadge: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeText: 'Field Fleet & Route Dispatch',
    description: 'Manage assigned donor pickups, navigate collection routes, confirm collected bags, and update live depot arrival statuses.',
    demoEmail: 'driver@ecothread.org',
    demoName: 'Ramesh Kumar'
  },
  {
    id: 'ROLE_ADMIN',
    tab: 'admin',
    title: 'Warehouse Admin & Supervisor',
    roleLabel: 'Warehouse Supervisor & QC',
    icon: ShieldCheck,
    accentColor: 'from-purple-700 to-indigo-800',
    borderColor: 'hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20',
    bgBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    badgeText: 'AI Quality Scanner & Intake Station',
    description: 'Operate the intake station with EcoGrade AI Quality Scanner, inspect garment defects, allocate beneficiary quotas, and audit ESG data.',
    demoEmail: 'admin@ecothread.org',
    demoName: 'QC Supervisor Neha'
  }
];

export const LoginModal = ({ isOpen, onClose, onRoleSelect }) => {
  const { login, register, switchRole } = useAuth();
  const { showToast } = useToast();

  const [selectedDestination, setSelectedDestination] = useState(PORTAL_DESTINATIONS[0]);
  const [showCustomLogin, setShowCustomLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPortalDirect = async (portal) => {
    setLoading(true);
    try {
      await switchRole(portal.id);
      showToast(`Logged in to ${portal.title} as ${portal.demoName}`, 'success');
      if (onRoleSelect) {
        onRoleSelect(portal.tab);
      }
      onClose();
    } catch (err) {
      showToast('Login failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const result = await register({ 
          fullName, 
          email, 
          password, 
          phone, 
          role: selectedDestination.id 
        });
        if (!result.success) throw new Error(result.error);
        showToast(`Account created! Welcome to ${selectedDestination.title}, ${fullName}!`, 'success');
      } else {
        const result = await login(email, password);
        if (!result.success) throw new Error(result.error);
        showToast('Signed in successfully!', 'success');
      }

      if (onRoleSelect) {
        onRoleSelect(selectedDestination.tab);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                EcoThread Access Gateway
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-0.5">
                Choose Where You Want to Go
              </h2>
              <p className="text-slate-300 text-xs">
                Select your designated role to enter the appropriate portal with tailored permissions.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showCustomLogin ? (
            <div className="space-y-6">
              
              {/* Role Destination Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PORTAL_DESTINATIONS.map((dest) => {
                  const Icon = dest.icon;
                  const isSelected = selectedDestination.id === dest.id;

                  return (
                    <div
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest)}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      } ${dest.borderColor}`}
                    >
                      <div>
                        {/* Top Badge & Icon */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${dest.accentColor} text-white flex items-center justify-center shadow-md`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${dest.bgBadge}`}>
                            {dest.badgeText}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {dest.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {dest.description}
                        </p>
                      </div>

                      {/* Bottom Direct Login Action */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400">
                          Demo Persona: <span className="font-semibold text-slate-700">{dest.demoName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPortalDirect(dest);
                          }}
                          disabled={loading}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 rounded-xl transition-all flex items-center gap-1 shadow-sm group-hover:bg-emerald-600"
                        >
                          Enter Portal <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Custom Email/Password Switcher */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 text-center sm:text-left">
                  <span className="font-bold text-slate-800 block">Want to sign in with your own personal account?</span>
                  <span>Use individual credentials or register a new identity for {selectedDestination.roleLabel}.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomLogin(true);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-700 rounded-xl shadow-xs transition-all whitespace-nowrap"
                >
                  Custom Email & Password Login
                </button>
              </div>

            </div>
          ) : (
            
            /* Custom Login & Registration Form */
            <div className="max-w-md mx-auto space-y-4 py-2">
              
              {/* Back to role picker button */}
              <button
                type="button"
                onClick={() => {
                  setShowCustomLogin(false);
                  setError(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
              >
                ← Back to Portal Selection
              </button>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedDestination.accentColor} text-white flex items-center justify-center flex-shrink-0`}>
                  <selectedDestination.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logging into:</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{selectedDestination.title}</h4>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                {isRegister && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Patel"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="+91 98450 12345"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={selectedDestination.demoEmail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : (isRegister ? `Create ${selectedDestination.roleLabel} Account` : 'Sign In')}
                </button>
              </form>

              {/* Toggle Register / Login */}
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError(null); }}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Here"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Protected with Role-Based Access Control (RBAC) & Stateless JWT Security.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
