import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pickupApi } from '../../services/api';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export const NgoDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [availableList, setAvailableList] = useState([]);
  const [acceptedList, setAcceptedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNgoData = async () => {
    setLoading(true);
    try {
      const [statsRes, availRes, acceptedRes] = await Promise.all([
        pickupApi.getNgoStats().catch(() => ({ data: null })),
        pickupApi.getAvailableDonations().catch(() => ({ data: [] })),
        pickupApi.getAcceptedDonations().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setAvailableList(availRes.data || []);
      setAcceptedList(acceptedRes.data || []);
    } catch (err) {
      console.error('Failed to load NGO dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [user]);

  const availableCount = stats?.availableDonations ?? availableList.length;
  const acceptedCount = stats?.acceptedDonations ?? acceptedList.length;
  const completedCount = stats?.completedCollections ?? acceptedList.filter(p => p.status === 'COMPLETED').length;
  const pendingCount = stats?.pendingCollections ?? (acceptedCount - completedCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>NGO Partner & Shelter Allocation Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 font-['Outfit']">
            {user?.organizationName || user?.fullName || 'NGO Partner Hub'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Review verified clothing donations submitted by donors across campus and residential hubs, accept eligible lots with mutual protection, and coordinate doorstep collections.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/ngo/browse"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Browse Available Donations ({availableCount})</span>
            </Link>

            <Link
              to="/ngo/accepted"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Manage Accepted ({acceptedCount})</span>
            </Link>

            <Link
              to="/ngo/collections"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Fleet & Route Logistics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Donations</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : availableCount}
            </div>
            <span className="text-[10px] text-slate-500">Ready for acceptance</span>
          </div>
        </div>

        {/* Accepted Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accepted by You</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : acceptedCount}
            </div>
            <span className="text-[10px] text-slate-500">Allocated to your organization</span>
          </div>
        </div>

        {/* Pending Pickups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Collections</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : pendingCount}
            </div>
            <span className="text-[10px] text-slate-500">Collection in transit</span>
          </div>
        </div>

        {/* Completed Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Deliveries</span>
            <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {loading ? '...' : completedCount}
            </div>
            <span className="text-[10px] text-slate-500">Delivered to shelter hub</span>
          </div>
        </div>

      </div>

      {/* Available for Acceptance Spotlight */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Fresh Donations Ready for Acceptance
            </h2>
            <p className="text-xs text-slate-500">
              Verified donor lots available on a first-come, mutually locked basis
            </p>
          </div>
          <Link
            to="/ngo/browse"
            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Scanning for available clothing lots...
          </div>
        ) : availableList.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No unaccepted donations at the moment</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All currently submitted lots have been matched with partner organizations. New donor intakes appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {availableList.slice(0, 4).map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs font-['Outfit']">
                      Donation #{item.id}: {item.title || item.clothTypes || 'Clothing Lot'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Available (Score: {item.qualityScore || 85}/100)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.scheduledDate} ({item.timeSlot})</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.pickupAddress?.streetAddress}, {item.pickupAddress?.city}</span>
                    </span>
                    <span>•</span>
                    <span>{item.bagCount} bags</span>
                  </div>
                </div>

                <div>
                  <Link
                    to="/ngo/browse"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <span>Inspect & Accept</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

