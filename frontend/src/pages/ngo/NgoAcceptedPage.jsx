import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi } from '../../services/api';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Truck, 
  RefreshCw, 
  Package, 
  Undo2, 
  Save, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const NgoAcceptedPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [acceptedList, setAcceptedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [releasingId, setReleasingId] = useState(null);

  const fetchAccepted = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getAcceptedDonations();
      setAcceptedList(res.data || []);
    } catch (err) {
      console.error('Failed to load accepted donations', err);
      showToast('Could not load accepted donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccepted();
  }, [user]);

  const handleUpdateStatus = async (pickupId, newStatus) => {
    setUpdatingId(pickupId);
    try {
      await pickupApi.updateStatus(pickupId, { status: newStatus });
      showToast(`Donation #${pickupId} status updated to ${newStatus}`, 'success');
      await fetchAccepted();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecline = async (pickupId) => {
    const reason = window.prompt("Reason for releasing this donation back to available pool:", "Capacity constraint");
    if (!reason) return;

    setReleasingId(pickupId);
    try {
      await pickupApi.declineDonation(pickupId, reason);
      showToast('Donation released back to community pool.', 'info');
      await fetchAccepted();
    } catch (err) {
      showToast('Could not release donation', 'error');
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Donations Accepted by Your Organization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your allocated clothing lots, dispatch field drivers, and confirm depot delivery
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAccepted}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/ngo/browse"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
          >
            <span>Browse More Donations</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading your accepted donations...
        </div>
      ) : acceptedList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">No donations accepted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Visit the browse page to review available donor contributions and accept items for your shelter.
          </p>
          <Link
            to="/ngo/browse"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm"
          >
            <span>Browse Available Donations</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {acceptedList.map((item) => {
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base font-['Outfit']">
                        Donation #{item.id}: {item.title || item.clothTypes || 'Clothing Lot'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.pickupAddress?.streetAddress}, {item.pickupAddress?.city}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.scheduledDate} ({item.timeSlot})</span>
                      </span>
                      <span>•</span>
                      <span>{item.bagCount} bags (~{item.estimatedWeightKg || 4} kg)</span>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        disabled={updatingId === item.id}
                        className="text-xs px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                      >
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="ASSIGNED">ASSIGNED (Driver Assigned)</option>
                        <option value="PICKED_UP">PICKED_UP (In Van)</option>
                        <option value="DELIVERED_TO_HUB">DELIVERED_TO_HUB (At Depot)</option>
                        <option value="COMPLETED">COMPLETED (Verified & Distributed)</option>
                      </select>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => handleDecline(item.id)}
                        disabled={releasingId === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                        title="Release back to available pool"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Donor Contact & Driver Notes */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Donor Contact: </span>
                    <span className="font-semibold text-slate-800">{item.donor?.fullName} ({item.donor?.phone || item.donor?.email})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Collection Mode: </span>
                    <span className="font-semibold text-slate-800">{item.pickupOrDropoff || 'PICKUP'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Collection Notes: </span>
                    <span className="text-slate-700">{item.driverNotes || 'No notes added'}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

