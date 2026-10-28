import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pickupApi } from '../../services/api';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Droplet, 
  Globe2, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Truck,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';

export const DonorDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, pickupsRes] = await Promise.all([
        pickupApi.getDonorStats().catch(() => ({ data: null })),
        pickupApi.getPickups().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setRecentDonations(pickupsRes.data || []);
    } catch (err) {
      console.error('Failed to load donor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const totalDonations = stats?.totalDonations ?? recentDonations.length;
  const pendingDonations = stats?.pendingDonations ?? recentDonations.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
  const completedDonations = stats?.completedDonations ?? recentDonations.filter(p => p.status === 'COMPLETED').length;
  const recoveredItemsCount = stats?.recoveredItemsCount ?? (completedDonations * 10);
  const waterSavedLiters = stats?.waterSavedLiters ?? (recoveredItemsCount * 2700);
  const co2PreventedKg = stats?.co2PreventedKg ?? (recoveredItemsCount * 3.6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Circular Fashion & Doorstep Collection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 font-['Outfit']">
            Welcome back, {user?.fullName || 'Campus Donor'}! 🌱
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Every garment you donate through EcoThread is verified by AI, assigned to partner NGOs, and repurposed to offset virgin textile production while earning Section 80G tax deductions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/donor/create"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Donation</span>
            </Link>

            <Link
              to="/donor/donations"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <Package className="w-4 h-4 text-emerald-300" />
              <span>Manage My Donations</span>
            </Link>

            <Link
              to="/donor/impact"
              className="flex items-center gap-2 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-teal-400/40"
            >
              <Globe2 className="w-4 h-4 text-teal-300" />
              <span>Environmental Impact & 80G</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Calculated Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Donations</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : totalDonations}
            </div>
            <span className="text-[10px] text-slate-500">Submitted by you</span>
          </div>
        </div>

        {/* Pending Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending / In Progress</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : pendingDonations}
            </div>
            <span className="text-[10px] text-slate-500">Awaiting or in collection</span>
          </div>
        </div>

        {/* Completed Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed & Verified</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : completedDonations}
            </div>
            <span className="text-[10px] text-slate-500">80G tax receipt ready</span>
          </div>
        </div>

        {/* Items Recovered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Garments Diverted</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : recoveredItemsCount}
            </div>
            <span className="text-[10px] text-slate-500">Passed to community shelter</span>
          </div>
        </div>

      </div>

      {/* Environmental Offsets Card */}
      <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl border border-teal-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Verified Environmental Offset</h3>
              <p className="text-xs text-slate-600">Calculated strictly from completed donations</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Water Conserved</span>
              <span className="text-lg font-black text-blue-700">{waterSavedLiters.toLocaleString()} L</span>
            </div>
            <div className="w-px h-8 bg-slate-300"></div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">CO₂ Prevented</span>
              <span className="text-lg font-black text-emerald-700">{co2PreventedKg.toFixed(1)} Kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donation Activity Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">Recent Donation Activity</h2>
            <p className="text-xs text-slate-500">Live status of your submitted clothes and pickups</p>
          </div>
          <Link
            to="/donor/donations"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading recent donation records...
          </div>
        ) : recentDonations.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No donations submitted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Schedule your first clothing donation to begin circular fashion recovery and earn an 80G tax receipt.
            </p>
            <Link
              to="/donor/create"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Donation</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentDonations.slice(0, 5).map((pickup) => {
              const isCompleted = pickup.status === 'COMPLETED';
              const isAccepted = pickup.status === 'ACCEPTED';
              const isPending = pickup.status === 'SUBMITTED' || pickup.status === 'PENDING';

              return (
                <div key={pickup.id} className="p-5 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-xs font-['Outfit']">
                        Donation #{pickup.id}: {pickup.title || pickup.clothTypes || 'Clothing Lot'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isAccepted
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {pickup.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.scheduledDate} ({pickup.timeSlot})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.pickupAddress?.city || 'Bengaluru'}</span>
                      </span>
                    </div>

                    {pickup.assignedNgoUser && (
                      <div className="text-[11px] text-indigo-700 font-semibold pt-0.5">
                        Assigned NGO: {pickup.assignedNgoUser.organizationName || pickup.assignedNgoUser.fullName}
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to="/donor/donations"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 p-2 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <span>Track Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

