import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, HeartHandshake, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const roles = [
  { id: 'ROLE_DONOR', label: 'Donor Portal', icon: HeartHandshake, color: 'hover:border-emerald-500 hover:text-emerald-700' },
  { id: 'ROLE_BENEFICIARY', label: 'Beneficiary Store', icon: ShoppingBag, color: 'hover:border-amber-500 hover:text-amber-700' },
  { id: 'ROLE_LOGISTICS', label: 'Logistics Fleet', icon: Truck, color: 'hover:border-blue-500 hover:text-blue-700' },
  { id: 'ROLE_ADMIN', label: 'Warehouse QC & Admin', icon: ShieldCheck, color: 'hover:border-purple-500 hover:text-purple-700' },
];

export const RoleSwitcher = ({ activeTab, onTabChange }) => {
  const { user, switchRole } = useAuth();
  const { showToast } = useToast();

  const handleRoleClick = async (roleId) => {
    await switchRole(roleId);
    const target = roles.find((r) => r.id === roleId);
    showToast(`Switched persona to ${target?.label || roleId}`, 'info');
    if (onTabChange) {
      if (roleId === 'ROLE_DONOR') onTabChange('donor');
      else if (roleId === 'ROLE_BENEFICIARY') onTabChange('beneficiary');
      else if (roleId === 'ROLE_LOGISTICS') onTabChange('logistics');
      else if (roleId === 'ROLE_ADMIN') onTabChange('admin');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 shadow-inner border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300 uppercase tracking-wider">Demo Role Switcher:</span>
          <span className="text-slate-400 hidden sm:inline">Click any role to test its specific capabilities:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = user?.role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleClick(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"></span>}
              </button>
            );
          })}
          
          <button
            onClick={() => onTabChange && onTabChange('campus')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'campus'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'bg-teal-950/80 text-teal-300 hover:bg-teal-900 border border-teal-700/60'
            }`}
          >
            <span>🎓 Campus Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
