import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, Leaf, Globe, ArrowUp, ExternalLink, Code2 } from 'lucide-react';

export const Footer = ({ onTabChange, onOpenVerify }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
      scrollToTop();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-['Outfit']">EcoThread</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Transforming pre-loved garments into dignity and climate resilience. Doorstep collection, scientific QC grading, and zero-cost credit redistribution.
            </p>
            <div className="text-[11px] text-slate-500">
              © 2026 EcoThread Foundation. Registered Section 8 Non-Profit.
            </div>
          </div>

          {/* Quick Platform Portals */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 font-['Outfit']">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Portals</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => handleNav('donor')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 py-0.5 text-left"
                >
                  <span className="text-emerald-500">🌿</span>
                  <span>Donor Portal & Doorstep Pickup</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('beneficiary')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-0.5 text-left"
                >
                  <span className="text-amber-500">🛍️</span>
                  <span>Beneficiary Seasonal Store</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('logistics')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 py-0.5 text-left"
                >
                  <span className="text-blue-500">🚚</span>
                  <span>Fleet Driver Route Manifest</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="hover:text-purple-400 transition-colors flex items-center gap-1.5 py-0.5 text-left"
                >
                  <span className="text-purple-500">⚙️</span>
                  <span>Warehouse QC & Quota Admin</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Tax Exemption & Verification */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 font-['Outfit']">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Section 80G Certified</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              All door-to-door garment donations qualify for 50% income tax deduction under Section 80G of the Indian Income Tax Act.
            </p>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 font-mono text-[11px] text-emerald-400 mb-2.5 flex items-center justify-between">
              <span>Reg: NGO-80G/CSR/2026/88421</span>
            </div>
            {onOpenVerify && (
              <button
                onClick={onOpenVerify}
                className="w-full py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold border border-emerald-500/40 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify 80G Digital Certificate</span>
              </button>
            )}
          </div>

          {/* Tech Architecture & Developer Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 font-['Outfit']">
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Live API & System</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400 mb-3">
              <div>Backend: <span className="text-slate-200">Spring Boot 3.3.5 (Java 21)</span></div>
              <div>Security: <span className="text-slate-200">Stateless JWT + BCrypt</span></div>
              <div>Database: <span className="text-slate-200">H2 In-Memory Engine</span></div>
              <div>Tax Invoicing: <span className="text-slate-200">OpenPDF SHA-256 Engine</span></div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <a
                href="/swagger-ui/index.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
              >
                <span>Interactive Swagger UI Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/h2-console"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
              >
                <span>Live H2 Database Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            EcoThread Circular Redistribution Platform • Built with sustainable software engineering principles.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
