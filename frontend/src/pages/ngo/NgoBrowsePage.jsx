import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi } from '../../services/api';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const NgoBrowsePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  // Accept Modal State
  const [selectedItemForAccept, setSelectedItemForAccept] = useState(null);
  const [acceptNotes, setAcceptNotes] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  // Detail Modal State
  const [detailItem, setDetailItem] = useState(null);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getAvailableDonations();
      setAvailableDonations(res.data || []);
    } catch (err) {
      console.error('Failed to load available donations', err);
      showToast('Could not fetch available donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, [user]);

  // Filter items
  const filteredDonations = availableDonations.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedCity !== 'ALL' && item.pickupAddress?.city !== selectedCity) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCloth = item.clothTypes?.toLowerCase().includes(q);
      const matchAddress = item.pickupAddress?.streetAddress?.toLowerCase().includes(q);
      return matchTitle || matchCloth || matchAddress;
    }
    return true;
  });

  const handleConfirmAccept = async () => {
    if (!selectedItemForAccept) return;
    setIsAccepting(true);

    try {
      await pickupApi.acceptDonation(selectedItemForAccept.id, acceptNotes);
      showToast(`🎉 Donation #${selectedItemForAccept.id} successfully accepted! Assigned to your organization.`, 'success');
      setSelectedItemForAccept(null);
      setAcceptNotes('');
      await fetchAvailable();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Could not accept donation. It may have already been accepted by another NGO.';
      showToast(errorMsg, 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const cities = ['ALL', ...new Set(availableDonations.map((d) => d.pickupAddress?.city).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Browse Available Donations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified donor contributions awaiting allocation to NGO shelters and community distribution centers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAvailable}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/ngo/accepted"
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>View Accepted Donations</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by apparel title, type, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Location:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white w-full sm:w-auto"
          >
            {cities.map((city) => (
              <option key={city} value={city}>{city === 'ALL' ? 'All Locations' : city}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid of Available Donations */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading available donor contributions...
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">No donations available matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Check back shortly or reset your search filters. New donations submitted by students and campus donors will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Image Preview & Badges */}
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"}
                  alt={item.title || "Donated apparel"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black shadow-md bg-emerald-600 text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{item.qualityScore || 85}/100</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white">
                    {item.pickupOrDropoff === 'DROPOFF' ? 'Drop-Box' : 'Doorstep Pickup'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-300 text-xs font-semibold flex items-center justify-between border border-emerald-500/30">
                    <span>Ready for Acceptance</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider">{item.category || 'General Apparel'}</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      {item.bagCount} bags (~{item.estimatedWeightKg || 4} kg)
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] line-clamp-1">
                    {item.title || item.clothTypes || 'Donated Clothing Lot'}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.conditionDescription || item.clothTypes || 'Reusable apparel verified for community donation.'}
                  </p>

                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.pickupAddress?.streetAddress}, {item.pickupAddress?.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{item.scheduledDate} • {item.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedItemForAccept(item)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Donation</span>
                  </button>

                  <button
                    onClick={() => setDetailItem(item)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="View Full Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Accept Confirmation Dialog (With Concurrency Check Note) */}
      {selectedItemForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Confirm Donation Acceptance
              </h3>
              <button
                onClick={() => setSelectedItemForAccept(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-2">
              <div className="font-bold text-sm">
                Donation #{selectedItemForAccept.id}: {selectedItemForAccept.title || selectedItemForAccept.clothTypes}
              </div>
              <div className="text-indigo-800">
                Location: {selectedItemForAccept.pickupAddress?.streetAddress}, {selectedItemForAccept.pickupAddress?.city}
              </div>
              <div className="text-indigo-800">
                Quantity: {selectedItemForAccept.bagCount} bags (~{selectedItemForAccept.estimatedWeightKg || 4} kg)
              </div>
              <div className="pt-2 text-[11px] text-indigo-700 italic border-t border-indigo-200/60">
                🔒 Backend mutual lock: Once accepted, this donation is locked to <strong>{user?.organizationName || user?.fullName}</strong> and removed from other NGOs' discovery feeds.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Collection Notes / Driver Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                placeholder="e.g. Assigned to Van #4. Will collect during the 09:00 AM slot..."
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForAccept(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={isAccepting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAccepting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Locking & Accepting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Accept Donation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Donation Details #{detailItem.id}
              </h3>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={detailItem.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"}
              alt={detailItem.title}
              className="w-full h-48 rounded-2xl object-cover"
            />

            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Title:</span>
                <span>{detailItem.title || detailItem.clothTypes}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Category:</span>
                <span>{detailItem.category || 'General Apparel'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Quality Score:</span>
                <span className="font-bold text-emerald-700">{detailItem.qualityScore || 85}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Address:</span>
                <span>{detailItem.pickupAddress?.streetAddress}, {detailItem.pickupAddress?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Scheduled Date:</span>
                <span>{detailItem.scheduledDate} ({detailItem.timeSlot})</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedItemForAccept(detailItem);
                  setDetailItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Accept Donation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

