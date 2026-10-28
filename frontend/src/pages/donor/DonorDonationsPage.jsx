import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi, invoiceApi } from '../../services/api';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Plus, 
  Ban, 
  CheckCircle2, 
  RefreshCw, 
  CalendarClock, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const STATUS_STEPS = ['SUBMITTED', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED_TO_HUB', 'COMPLETED'];

export const DonorDonationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getPickups();
      setDonations(res.data || []);
    } catch (err) {
      console.error('Failed to load donations', err);
      showToast('Error loading donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const handleDownloadPdf = async (pickupId) => {
    setDownloadingId(pickupId);
    try {
      await invoiceApi.downloadPdf(pickupId, `EcoThread_80G_Receipt_${pickupId}.pdf`);
      showToast('Downloaded official Section 80G Tax Exemption Certificate!', 'success');
    } catch (err) {
      window.open(`/api/invoices/download/${pickupId}`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelDonation = async (pickupId) => {
    const reason = window.prompt("Please enter a brief cancellation reason:", "Plans changed / No longer available");
    if (!reason) return;

    setCancellingId(pickupId);
    try {
      await pickupApi.cancelPickup(pickupId, reason);
      showToast('Donation cancelled successfully.', 'info');
      await fetchDonations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel donation.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            My Submitted Clothing Donations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of item verification, NGO assignment, collection vans, and tax certificates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDonations}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/donor/create"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Donation</span>
          </Link>
        </div>
      </div>

      {/* Donation List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading your donation records...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">No donations submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You haven't scheduled any clothing collections yet. Give your gently worn apparel a second life!
          </p>
          <Link
            to="/donor/create"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Donation</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((pickup) => {
            const isCompleted = pickup.status === 'COMPLETED';
            const isCancelled = pickup.status === 'CANCELLED';
            const isAccepted = pickup.status === 'ACCEPTED';
            const canCancel = pickup.status === 'SUBMITTED' || pickup.status === 'PENDING' || pickup.status === 'UNDER_REVIEW';

            return (
              <div 
                key={pickup.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base font-['Outfit']">
                        Donation #{pickup.id}: {pickup.title || pickup.clothTypes || 'Clothing Lot'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isAccepted
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {pickup.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.scheduledDate}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.timeSlot}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.pickupAddress?.streetAddress}, {pickup.pickupAddress?.city}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pickup.bagCount} bags (~{pickup.estimatedWeightKg || 4} kg)</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelDonation(pickup.id)}
                        disabled={cancellingId === pickup.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => handleDownloadPdf(pickup.id)}
                        disabled={downloadingId === pickup.id}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === pickup.id ? 'Generating...' : 'Download 80G Receipt (PDF)'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Assigned NGO / Driver Information Callout */}
                {pickup.assignedNgoUser && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-indigo-950">
                          Assigned NGO: {pickup.assignedNgoUser.organizationName || pickup.assignedNgoUser.fullName}
                        </div>
                        <div className="text-[11px] text-indigo-700">
                          {pickup.assignedNgoUser.serviceArea || pickup.assignedNgoUser.address || 'Local Partner Shelter'}
                        </div>
                      </div>
                    </div>
                    {pickup.driverNotes && (
                      <span className="text-[11px] text-slate-500 italic">
                        "{pickup.driverNotes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Progress Stepper (if not cancelled) */}
                {!isCancelled && (
                  <div className="pt-2">
                    <div className="hidden sm:grid grid-cols-6 gap-2 text-center text-[10px]">
                      {STATUS_STEPS.map((step, idx) => {
                        const stepIndex = STATUS_STEPS.indexOf(pickup.status);
                        const isPassed = stepIndex >= idx;
                        const isCurrent = pickup.status === step;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 transition-all ${
                              isPassed 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-200 text-slate-500'
                            } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}>
                              {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span className={`font-semibold capitalize truncate max-w-[100px] ${
                              isPassed ? 'text-emerald-900' : 'text-slate-400'
                            }`}>
                              {step.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

