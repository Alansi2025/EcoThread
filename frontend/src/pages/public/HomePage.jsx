import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sprout, 
  Sparkles, 
  HeartHandshake, 
  Building2, 
  ShieldCheck, 
  Droplet, 
  Globe2, 
  ArrowRight,
  Truck,
  CheckCircle2,
  TreePine,
  Layers,
  Camera
} from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_60%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-6 border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>AI-Driven Circular Fashion & Campus Textile Recovery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto font-['Outfit'] leading-tight">
            Transform Textile Waste into Verified <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Community Impact</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            EcoThread connects student and community donors directly with verified NGOs. Instant Cloud Vision AI quality inspection, doorstep collections, and Section 80G tax deductions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to={user.role === 'ROLE_DONOR' ? '/donor/dashboard' : '/ngo/dashboard'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Enter Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <HeartHandshake className="w-4 h-4 text-slate-950" />
                  <span>Donate Clothes as Donor</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <span>Join as NGO Partner</span>
                </Link>
              </>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-white/10 pt-10">
            <div>
              <div className="text-3xl font-black text-emerald-400 font-['Outfit']">24,500+</div>
              <div className="text-xs text-slate-400 mt-1">Garments Diverted</div>
            </div>
            <div>
              <div className="text-3xl font-black text-teal-400 font-['Outfit']">66.1M L</div>
              <div className="text-xs text-slate-400 mt-1">Water Footprint Saved</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400 font-['Outfit']">88.2 Tonnes</div>
              <div className="text-xs text-slate-400 mt-1">CO₂ Prevented</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-400 font-['Outfit']">100%</div>
              <div className="text-xs text-slate-400 mt-1">Audited Traceability</div>
            </div>
          </div>

        </div>
      </section>

      {/* Two Dedicated Paths: Donor vs NGO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">
            Tailored Experiences
          </span>
          <h2 className="text-3xl font-black text-slate-900 font-['Outfit']">
            A Platform Designed for Two Distinct Missions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Donor Column */}
          <div className="bg-gradient-to-b from-emerald-50/60 to-white p-8 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                For Campus & Individual Donors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Take photos of unused apparel with your phone. Our Google Cloud Vision AI instantly analyzes fabric quality, wear, and tear. Clothes scoring ≥ 50 are shared directly with local shelters, while items &lt; 50 are sent for zero-landfill industrial textile recycling.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant AI garment defect & wear grading</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free doorstep hostel/home pickup scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Audited Section 80G tax exemption receipts</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>Access Donor Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* NGO Column */}
          <div className="bg-gradient-to-b from-indigo-50/60 to-white p-8 rounded-3xl border border-indigo-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-['Outfit']">
                For Verified NGOs & Shelters
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Browse incoming verified donations submitted by donors in your area. Accept suitable lots with mutual locking protection, coordinate collection logistics with live GPS radar, and assemble dignity packages for families in need.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Discover real-time available apparel donations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Mutual concurrency lock (no duplicate claims)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Fleet route management & ESG impact reporting</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>Access NGO Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

