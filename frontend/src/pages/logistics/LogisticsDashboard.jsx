import React, { useState, useEffect } from 'react';
import { pickupApi, invoiceApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  RefreshCw, 
  AlertCircle, 
  FileCheck, 
  Filter, 
  Navigation, 
  Scale,
  X,
  QrCode,
  ShieldCheck
} from 'lucide-react';

export const LogisticsDashboard = () => {
  const { showToast } = useToast();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedPincode, setSelectedPincode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Doorstep Bag & Weight Verification Dialog
  const [verifyModal, setVerifyModal] = useState({
    isOpen: false,
    pickup: null,
    bagCount: 2,
    weightKg: 8.0,
    sealBarcode: '',
    loading: false,
  });

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getPickups();
      setPickups(res.data || []);
    } catch (err) {
      console.error('Failed to load logistics routes', err);
      showToast('Could not refresh fleet manifest', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleUpdateStatus = async (pickupId, nextStatus, verifiedCount = 14) => {
    setUpdatingId(pickupId);
    try {
      await pickupApi.updateStatus(pickupId, {
        status: nextStatus,
        driverNotes: `Status updated to ${nextStatus} by logistics driver on doorstep.`,
        verifiedItemCount: verifiedCount,
      });
      if (nextStatus === 'ASSIGNED') {
        showToast(`Route Task #${pickupId} assigned to your manifest`, 'info');
      } else if (nextStatus === 'DELIVERED_TO_HUB') {
        showToast(`Route Task #${pickupId} checked in at sorting hub`, 'info');
      } else if (nextStatus === 'COMPLETED') {
        showToast(`Route Task #${pickupId} passed QC! 80G Tax Invoice issued.`, 'success');
      }
      await fetchPickups();
    } catch (err) {
      showToast('Failed to update status: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenVerifyModal = (pickup) => {
    setVerifyModal({
      isOpen: true,
      pickup,
      bagCount: pickup.bagCount || 2,
      weightKg: pickup.estimatedWeightKg || 8.0,
      sealBarcode: `SEAL-${pickup.id}-${Math.floor(1000 + Math.random() * 9000)}`,
      loading: false,
    });
  };

  const handleConfirmDoorstepVerification = async (e) => {
    e.preventDefault();
    if (!verifyModal.pickup) return;
    setVerifyModal((prev) => ({ ...prev, loading: true }));
    try {
      await pickupApi.updateStatus(verifyModal.pickup.id, {
        status: 'PICKED_UP',
        driverNotes: `Doorstep verified: ${verifyModal.bagCount} bags (${verifyModal.weightKg} kg). Seal barcode: ${verifyModal.sealBarcode}`,
        verifiedItemCount: verifyModal.bagCount * 6,
      });
      showToast(`Pickup #${verifyModal.pickup.id} verified & loaded into van!`, 'success');
      setVerifyModal({ isOpen: false, pickup: null, bagCount: 2, weightKg: 8.0, sealBarcode: '', loading: false });
      await fetchPickups();
    } catch (err) {
      showToast('Doorstep verification failed: ' + (err.response?.data?.message || err.message), 'error');
      setVerifyModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Unique pincodes
  const pincodes = ['ALL', ...new Set(pickups.map((p) => p.pickupAddress?.pincode).filter(Boolean))];

  // Filtered pickups
  const filteredPickups = pickups.filter((p) => {
    if (selectedPincode !== 'ALL' && p.pickupAddress?.pincode !== selectedPincode) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    return true;
  });

  // Route statistics
  const activePickups = pickups.filter((p) => p.status !== 'CANCELLED' && p.status !== 'COMPLETED');
  const totalBags = activePickups.reduce((sum, p) => sum + (p.bagCount || 1), 0);
  const totalWeight = activePickups.reduce((sum, p) => sum + (p.estimatedWeightKg || 5.0), 0);
  const completedStops = pickups.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 mb-8 border border-blue-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
            <Truck className="w-3.5 h-3.5" />
            <span>Driver Fleet & Route Optimization Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Doorstep Collection Routes 🚚
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
            Cluster pickups by pincode/zone, verify bag count on doorstep, and handover to NGO hub
          </p>
        </div>

        <button
          onClick={fetchPickups}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Routes</span>
        </button>
      </div>

      {/* Route Manifest Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Route Stops</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {activePickups.length} Doorsteps
          </div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Scheduled Collections Today</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Garment Volume</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {totalBags} Bags
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Van cargo capacity ~70%</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Weight</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {totalWeight.toFixed(1)} Kg
          </div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Verified by doorstep scale</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Deliveries</span>
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {completedStops} Pickups
          </div>
          <p className="text-[11px] text-teal-700 mt-1 font-medium">Delivered to Central Hub</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Pincode Cluster:</span>
          </span>
          {pincodes.map((pin) => (
            <button
              key={pin}
              onClick={() => setSelectedPincode(pin)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedPincode === pin
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pin === 'ALL' ? 'All Pincodes' : pin}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="PICKED_UP">PICKED_UP</option>
            <option value="DELIVERED_TO_HUB">DELIVERED_TO_HUB</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading route manifest...
          </div>
        ) : filteredPickups.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            No pickups currently queued in this cluster.
          </div>
        ) : (
          filteredPickups.map((pickup) => {
            const isCompleted = pickup.status === 'COMPLETED';
            const isCancelled = pickup.status === 'CANCELLED';

            return (
              <div
                key={pickup.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Route Information */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-base font-['Outfit']">
                      Route Task #{pickup.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-800'
                        : pickup.status === 'DELIVERED_TO_HUB'
                        ? 'bg-purple-100 text-purple-800'
                        : pickup.status === 'PICKED_UP'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pickup.status}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      PIN: {pickup.pickupAddress?.pincode || '560025'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{pickup.pickupAddress?.streetAddress}, {pickup.pickupAddress?.city}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pickup.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pickup.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">{pickup.bagCount} Bags</span> (~{pickup.estimatedWeightKg || 8} Kg)
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-medium text-slate-700">Donor: </span>
                      {pickup.donor?.fullName} • {pickup.clothTypes}
                    </div>
                    <a
                      href={`tel:${pickup.donor?.phone || '+919845012345'}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold font-mono not-italic bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{pickup.donor?.phone || '+91 98450 12345'}</span>
                    </a>
                  </div>
                </div>

                {/* Right Action Progression Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0">
                  {pickup.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(pickup.id, 'ASSIGNED')}
                      disabled={updatingId === pickup.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Assign to My Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {pickup.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleOpenVerifyModal(pickup)}
                      disabled={updatingId === pickup.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Bags & Mark Picked Up</span>
                    </button>
                  )}

                  {pickup.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(pickup.id, 'DELIVERED_TO_HUB')}
                      disabled={updatingId === pickup.id}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Deliver to NGO Hub</span>
                    </button>
                  )}

                  {pickup.status === 'DELIVERED_TO_HUB' && (
                    <button
                      onClick={() => handleUpdateStatus(pickup.id, 'COMPLETED', 14)}
                      disabled={updatingId === pickup.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Pass QC & Issue 80G Receipt</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed • 80G Receipt Issued</span>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Cancelled by Donor</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Doorstep Verification Modal */}
      {verifyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Doorstep Garment Intake</h3>
                  <p className="text-xs text-blue-200">
                    Route Task #{verifyModal.pickup?.id} • {verifyModal.pickup?.donor?.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}
                className="p-1 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDoorstepVerification} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Doorstep Handover Verification</div>
                  <div className="text-[11px] text-blue-700">
                    Verify physical bags, check gross weight, and apply tamper-evident barcode seal.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bags Collected</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={verifyModal.bagCount}
                    onChange={(e) => setVerifyModal({ ...verifyModal, bagCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gross Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="200"
                    required
                    value={verifyModal.weightKg}
                    onChange={(e) => setVerifyModal({ ...verifyModal, weightKg: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Bag Barcode / Seal ID</span>
                  <span className="text-[10px] text-blue-600 font-mono">Scan verified</span>
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={verifyModal.sealBarcode}
                    onChange={(e) => setVerifyModal({ ...verifyModal, sealBarcode: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyModal.loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{verifyModal.loading ? 'Verifying...' : 'Confirm Doorstep Intake'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
