import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi, invoiceApi, impactApi } from '../../services/api';
import { PickupSchedulerModal } from './PickupSchedulerModal';
import { PickupActionsModal } from './PickupActionsModal';
import { EcoImpactCalculator } from '../../components/EcoImpactCalculator';
import { CertificateVerificationModal } from '../../components/CertificateVerificationModal';
import { 
  HeartHandshake, 
  Droplet, 
  Globe2, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  RefreshCw,
  Sparkles,
  TreePine,
  Trash2,
  CalendarClock,
  ExternalLink,
  Ban,
  Radio
} from 'lucide-react';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED_TO_HUB', 'COMPLETED'];

export const DonorPortal = ({ onOpenScanner, onOpenNgoLocator, onOpenPassport, onOpenLiveMap }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [prefillSchedulerData, setPrefillSchedulerData] = useState(null);
  const [donorImpact, setDonorImpact] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Modal states for actions and verification
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [actionModalMode, setActionModalMode] = useState(null); // 'reschedule' or 'cancel'
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyInvoiceNum, setVerifyInvoiceNum] = useState('');

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const [pickupRes, impactRes, donorImpactRes] = await Promise.all([
        pickupApi.getPickups(),
        impactApi.getStats(),
        impactApi.getDonorImpact().catch(() => ({ data: null })),
      ]);
      setPickups(pickupRes.data || []);
      setPlatformStats(impactRes.data);
      if (donorImpactRes.data) {
        setDonorImpact(donorImpactRes.data);
      }
    } catch (err) {
      console.error('Failed to load pickups or impact metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [user]);

  // Fallbacks if backend donor impact is loading
  const completedCount = pickups.filter((p) => p.status === 'COMPLETED').length;
  const verifiedItemsCount = donorImpact?.totalVerifiedGarments ?? (completedCount > 0 ? completedCount * 14 : 14);
  const waterSavedLiters = donorImpact?.waterSavedLiters ?? (verifiedItemsCount * 2700);
  const co2PreventedKg = donorImpact?.co2SavedKg ?? (verifiedItemsCount * 3.6);
  const treesCount = donorImpact?.treesEquivalent ?? (co2PreventedKg / 21.0);
  const taxExemptionVal = donorImpact?.taxDeductionEligibleAmount ?? (verifiedItemsCount * 250);

  const handleDownloadPdf = async (pickupId) => {
    setDownloadingId(pickupId);
    try {
      await invoiceApi.downloadPdf(pickupId, `EcoThread_80G_Receipt_Pickup_${pickupId}.pdf`);
      showToast('Downloaded official Section 80G Tax Exemption Certificate!', 'success');
    } catch (err) {
      showToast('Opening certificate directly from server...', 'info');
      window.open(`/api/invoices/download/${pickupId}`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenActionModal = (pickup, mode) => {
    setSelectedPickup(pickup);
    setActionModalMode(mode);
    setIsActionModalOpen(true);
  };

  const handleOpenVerify = (invoiceNumber) => {
    setVerifyInvoiceNum(invoiceNumber || 'ECO-80G-2026-0042');
    setIsVerifyModalOpen(true);
  };

  const handleApplyCalculatorItems = (data) => {
    setPrefillSchedulerData(data);
    setIsSchedulerOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Hero Welcome & CTA Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circular Fashion & Doorstep Collection Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 font-['Outfit']">
            Welcome back, {user?.fullName || 'Valued Donor'}! 🌱
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Every garment you donate through EcoThread is cleaned, QC-graded, and redistributed with complete traceability — directly offsetting virgin textile emissions while earning Section 80G tax exemptions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setPrefillSchedulerData(null);
                setIsSchedulerOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Free Doorstep Pickup</span>
            </button>
            <button
              onClick={() => onOpenLiveMap && onOpenLiveMap()}
              className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-400/20 active:scale-95"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Live NGO & Fleet Radar</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-950 text-emerald-300">LIVE</span>
            </button>
            <button
              onClick={onOpenNgoLocator}
              className="flex items-center gap-2 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-teal-400/40"
            >
              <MapPin className="w-4 h-4 text-teal-300" />
              <span>NGO Needs & Routes</span>
            </button>
            <button
              onClick={() => handleOpenVerify('ECO-80G-2026-0042')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/15"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Receipt</span>
            </button>
            <button
              onClick={fetchPickups}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 text-slate-300 font-medium px-3.5 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/10"
              title="Refresh Pickup Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Environmental Impact Offsets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Water Saved Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Water Saved</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {waterSavedLiters.toLocaleString()} L
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Equivalent to ~{Math.round(waterSavedLiters / 150)} showers conserved
          </p>
        </div>

        {/* CO2 Prevented Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CO₂ Prevented</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {co2PreventedKg.toFixed(1)} Kg
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Prevented from textile incineration & landfill
          </p>
        </div>

        {/* Trees Equivalent Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tree Absorption</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {Number(treesCount).toFixed(1)} Trees
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Equivalent annual CO₂ absorption
          </p>
        </div>

        {/* Diverted Garments Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clothes Diverted</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {verifiedItemsCount} Items
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cleaned and routed to verified low-income families
          </p>
        </div>

        {/* 80G Tax Exemption Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">80G Tax Exemption</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            ₹{taxExemptionVal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Section 80G (50% taxable deduction)
          </p>
        </div>
      </div>

      {/* Interactive Live Eco-Impact & Tax Calculator */}
      <EcoImpactCalculator onScheduleWithItems={handleApplyCalculatorItems} />

      {/* Pickup Tracking Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              Your Scheduled Doorstep Pickups & Tax Invoices
            </h2>
            <p className="text-xs text-slate-500">
              Live tracking from doorstep collection to warehouse QC verification and PDF receipt generation
            </p>
          </div>
          <button
            onClick={() => {
              setPrefillSchedulerData(null);
              setIsSchedulerOpen(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Slot</span>
          </button>
        </div>

        {/* List of Pickups */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading your doorstep pickup schedules...
          </div>
        ) : pickups.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">No pickups scheduled yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Schedule your first doorstep garment collection to begin your circular fashion impact and receive an 80G certificate.
            </p>
            <button
              onClick={() => {
                setPrefillSchedulerData(null);
                setIsSchedulerOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
            >
              Schedule Pickup Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pickups.map((pickup) => {
              const currentStepIndex = STATUS_STEPS.indexOf(pickup.status);
              const isCompleted = pickup.status === 'COMPLETED';
              const isCancelled = pickup.status === 'CANCELLED';
              const canModify = pickup.status === 'PENDING' || pickup.status === 'ASSIGNED';

              return (
                <div key={pickup.id} className="p-6 hover:bg-slate-50/50 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    
                    {/* Pickup Metadata */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm font-['Outfit']">
                          Pickup #{pickup.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : pickup.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
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
                      </div>
                    </div>

                    {/* Actions: Reschedule, Cancel, 80G PDF Download */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCancelled && (
                        <button
                          onClick={() => onOpenLiveMap && onOpenLiveMap(pickup.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
                          title="Track live driver vehicle GPS and destination shelter hub"
                        >
                          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>Track Live Van & NGO</span>
                        </button>
                      )}

                      {canModify && (
                        <>
                          <button
                            onClick={() => handleOpenActionModal(pickup, 'reschedule')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
                          >
                            <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reschedule</span>
                          </button>
                          <button
                            onClick={() => handleOpenActionModal(pickup, 'cancel')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-500" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPdf(pickup.id)}
                            disabled={downloadingId === pickup.id}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{downloadingId === pickup.id ? 'Generating...' : 'Download 80G Receipt (PDF)'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenVerify('ECO-80G-2026-0042')}
                            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            title="Verify Digital Seal on official registry"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verify 80G</span>
                          </button>
                        </div>
                      )}

                      {isCancelled && (
                        <span className="text-[11px] text-rose-600 italic bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                          Pickup Cancelled
                        </span>
                      )}

                      {!isCompleted && !isCancelled && !canModify && (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          Collection in progress • 80G unlocks upon warehouse delivery
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Garment details and driver note */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 mb-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 font-medium">Bags: </span>
                      <span className="font-semibold text-slate-800">{pickup.bagCount} bags (~{pickup.estimatedWeightKg || (pickup.bagCount * 4)} Kg)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Contents: </span>
                      <span className="font-semibold text-slate-800">{pickup.clothTypes || 'Assorted clothing'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Driver Notes: </span>
                      <span className="text-slate-700">{pickup.driverNotes || 'Driver assignment in progress'}</span>
                    </div>
                  </div>

                  {/* Stepper Visualizer (only if not cancelled) */}
                  {!isCancelled && (
                    <div className="relative pt-2 pb-1">
                      <div className="hidden sm:grid grid-cols-5 gap-2 text-center text-[10px]">
                        {STATUS_STEPS.map((step, idx) => {
                          const isPassed = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 transition-all ${
                                isPassed 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-200 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}>
                                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                              </div>
                              <span className={`font-semibold capitalize ${isPassed ? 'text-emerald-800' : 'text-slate-400'}`}>
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

      {/* Scheduler Modal */}
      <PickupSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onPickupCreated={fetchPickups}
        prefillData={prefillSchedulerData}
      />

      {/* Reschedule / Cancel Actions Modal */}
      <PickupActionsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        pickup={selectedPickup}
        mode={actionModalMode}
        onActionComplete={fetchPickups}
      />

      {/* 80G Certificate Verification Modal */}
      <CertificateVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialInvoiceNumber={verifyInvoiceNum}
      />

    </div>
  );
};
