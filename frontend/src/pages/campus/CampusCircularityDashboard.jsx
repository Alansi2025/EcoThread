import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Trophy, Leaf, Droplets, Wind, Scale, 
  Sparkles, QrCode, ArrowRight, ShieldCheck, Compass,
  TrendingUp, Award, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { campusApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CampusCircularityDashboard = ({ onOpenScanner, onOpenNgoLocator, onOpenPassport }) => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampusStats();
  }, []);

  const fetchCampusStats = async () => {
    setLoading(true);
    try {
      const res = await campusApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load campus stats:', err);
      addToast('Error fetching campus circularity stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-slate-400">
        <GraduationCap className="w-12 h-12 mx-auto animate-bounce text-emerald-600 mb-3" />
        <p className="text-sm font-semibold">Aggregating hostel textile recovery data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 md:p-10 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-4">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>Campus Circular Fashion & Textile Recovery Pilot</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            EcoThread Circular Campus
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base mt-2 font-medium">
            Transforming semester-end hostel move-out textile waste into verified student thrift, community aid, and zero-landfill acoustic fiber.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onOpenPassport && onOpenPassport('ECO-TRC-2026-8841')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 text-xs"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              Verify Garment Digital Passport
            </button>
            <button
              onClick={onOpenNgoLocator}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2 text-xs backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              Locate NGOs by Urgent Need
            </button>
          </div>
        </div>

        {/* Circularity Rate Floating Badge */}
        <div className="mt-6 md:mt-0 md:absolute md:top-8 md:right-8 bg-emerald-950/60 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl text-center shadow-xl">
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
            Confirmed Circularity Rate
          </span>
          <span className="text-4xl md:text-5xl font-black text-emerald-400 mt-1 block">
            {stats.overallCircularityRate}%
          </span>
          <span className="text-[11px] text-emerald-200/80 font-medium block mt-1">
            Zero Municipal Landfill Waste
          </span>
        </div>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weighed Dry Mass */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Diverted</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.totalWeightCollectedKg} kg</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{stats.totalGarmentsDiverted} garments sorted</span>
          </div>
        </div>

        {/* Avoided Water Depletion */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Water Conserved</span>
            <span className="text-2xl font-black text-teal-900 mt-0.5 block">
              {(stats.totalWaterSavedLiters / 1000000).toFixed(2)}M L
            </span>
            <span className="text-[11px] text-teal-600 font-semibold">WRAP LCA Benchmark</span>
          </div>
        </div>

        {/* Avoided Carbon Footprint */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Carbon Avoided</span>
            <span className="text-2xl font-black text-indigo-900 mt-0.5 block">{stats.totalCo2SavedKg} kg</span>
            <span className="text-[11px] text-indigo-600 font-semibold">GHG Prevention</span>
          </div>
        </div>

        {/* Active Campus Drive */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Hostels</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.hostelLeaderboard?.length || 5} Blocks</span>
            <span className="text-[11px] text-amber-600 font-semibold">Move-Out Drive Active</span>
          </div>
        </div>

      </div>

      {/* Confirmed Recovery Outcomes Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Confirmed Textile Recovery Outcomes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified destination distribution distinguishing student reuse, bulk humanitarian aid, and industrial downcycling.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            100% Traceable via Digital Passports
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Reused: Store */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">1. Student & Beneficiary Store</span>
              <span className="text-xs font-black text-emerald-700">67.2%</span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-2">{stats.reusedStoreCount} Items</div>
            <p className="text-[11px] text-emerald-700 mt-1">Grade-A sanitized apparel listed for tokenized student & beneficiary checkout.</p>
          </div>

          {/* Community Bulk */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">2. Community Shelter Bulk</span>
              <span className="text-xs font-black text-amber-700">22.4%</span>
            </div>
            <div className="text-2xl font-black text-amber-950 mt-2">{stats.communityBulkCount} Items</div>
            <p className="text-[11px] text-amber-700 mt-1">Grade-B durable clothing dispatched to verified NGO partner shelters.</p>
          </div>

          {/* Industrial Shredding */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">3. Industrial Fiber Downcycling</span>
              <span className="text-xs font-black text-purple-700">10.4%</span>
            </div>
            <div className="text-2xl font-black text-purple-950 mt-2">{stats.fiberRecycledCount} Items</div>
            <p className="text-[11px] text-purple-700 mt-1">Mechanically shredded by Shivalik Mills into automotive & acoustic insulation.</p>
          </div>

          {/* In Intake */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">4. Processing & Intake</span>
              <span className="text-xs font-black text-slate-600">0.0% Landfill</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.awaitingSortingCount} Items</div>
            <p className="text-[11px] text-slate-500 mt-1">Under steam press sanitization and passport tagging at central depot.</p>
          </div>

        </div>
      </div>

      {/* Hostel Move-Out Leaderboard & Live Passports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Hostel Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Hostel Move-Out Leaderboard
              </h3>
              <p className="text-xs text-slate-500">Live rankings based on verified kilograms diverted from hostel cleanouts.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Autumn Semester 2026</span>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.hostelLeaderboard?.map((h, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    idx === 1 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                    idx === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{h.hostelName}</h4>
                    <span className="text-xs text-slate-400">{h.garmentsCollected} garments • {h.circularityPercent}% circularity</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-700">{h.weightKg} kg</span>
                  <span className="block text-[11px] text-amber-600 font-bold">{h.ecoScore} EcoPts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Digital Product Passports Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                Live Digital Passports
              </h3>
              <p className="text-xs text-slate-500">Verified textile lots with scannable custody records.</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.recentPassports?.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => onOpenPassport && onOpenPassport(p.passportId)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {p.passportId}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {p.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {p.sourceCampus} • {p.weightKg} kg
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {p.finalOutcome?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-indigo-600 text-xs font-bold flex items-center justify-end gap-1 mt-1 group-hover:translate-x-1 transition-transform">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transparent LCA Credibility & Scientific Methodology Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-400">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex-1 text-xs text-slate-300 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Scientific LCA Credibility & Measurement Standard
          </span>
          <p className="leading-relaxed">
            {stats.methodologyNote}
          </p>
          <span className="text-[10px] text-slate-400 block pt-1">
            Compliant with ISO 14040/44 Life Cycle Assessment Principles • Zero inflated marketing claims.
          </span>
        </div>
      </div>

    </div>
  );
};
