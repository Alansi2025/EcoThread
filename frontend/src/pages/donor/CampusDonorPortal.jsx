import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi, invoiceApi, impactApi, campusApi } from '../../services/api';
import { DonorAiIntakeSection } from './DonorAiIntakeSection';
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
  Radio,
  Camera,
  GraduationCap,
  Trophy,
  Scale,
  Compass
} from 'lucide-react';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED_TO_HUB', 'COMPLETED'];

export const CampusDonorPortal = ({ onOpenNgoLocator, onOpenPassport, onOpenLiveMap }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Donor sub-tab: 'ai-intake', 'pickups', 'campus-impact', 'drop-boxes'
  const [donorSubTab, setDonorSubTab] = useState('ai-intake');
  
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [prefillSchedulerData, setPrefillSchedulerData] = useState(null);
  const [donorImpact, setDonorImpact] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [campusStats, setCampusStats] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Modal states for actions and verification
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [actionModalMode, setActionModalMode] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyInvoiceNum, setVerifyInvoiceNum] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pickupRes, impactRes, donorImpactRes, campusRes] = await Promise.all([
        pickupApi.getPickups(),
        impactApi.getStats(),
        impactApi.getDonorImpact().catch(() => ({ data: null })),
        campusApi.getStats().catch(() => ({ data: null })),
      ]);
      setPickups(pickupRes.data || []);
      setPlatformStats(impactRes.data);
      if (donorImpactRes.data) setDonorImpact(donorImpactRes.data);
      if (campusRes.data) setCampusStats(campusRes.data);
    } catch (err) {
      console.error('Failed to load donor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Derived impact numbers
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Campus Circular Fashion & Student Clothes Donation Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 font-['Outfit']">
            Welcome, {user?.fullName || 'Campus Donor'}! 🌱
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Snap a picture of your clothes to run instant Cloud Vision AI inspection. Items scoring ≥ 50 are shared directly to the NGO store, while items &lt; 50 are directed to zero-landfill textile recycling.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDonorSubTab('ai-intake')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Add Clothes (AI Verification)</span>
            </button>

            <button
              onClick={() => {
                setPrefillSchedulerData(null);
                setIsSchedulerOpen(true);
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Schedule Hostel Pickup</span>
            </button>

            <button
              onClick={onOpenNgoLocator}
              className="flex items-center gap-2 bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-teal-400/40"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>NGO Needs & Routes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Environmental Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water Saved</span>
            <div className="text-xl font-bold text-slate-900 font-['Outfit']">{waterSavedLiters.toLocaleString()} L</div>
            <span className="text-[10px] text-slate-500">~{Math.round(waterSavedLiters / 150)} showers conserved</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ Prevented</span>
            <div className="text-xl font-bold text-slate-900 font-['Outfit']">{co2PreventedKg.toFixed(1)} Kg</div>
            <span className="text-[10px] text-slate-500">Diverted from incineration</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clothes Diverted</span>
            <div className="text-xl font-bold text-slate-900 font-['Outfit']">{verifiedItemsCount} Items</div>
            <span className="text-[10px] text-slate-500">Shared to low-income families</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">80G Tax Exemption</span>
            <div className="text-xl font-bold text-slate-900 font-['Outfit']">₹{taxExemptionVal.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500">50% taxable deduction</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs for Campus Donor */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setDonorSubTab('ai-intake')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            donorSubTab === 'ai-intake'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Add Clothes & AI Verification</span>
        </button>

        <button
          onClick={() => setDonorSubTab('pickups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            donorSubTab === 'pickups'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Scheduled Pickups & 80G Receipts</span>
          {pickups.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {pickups.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setDonorSubTab('campus-impact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            donorSubTab === 'campus-impact'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Hostel Leaderboard & Campus Impact</span>
        </button>

        <button
          onClick={() => setDonorSubTab('drop-boxes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            donorSubTab === 'drop-boxes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Campus Drop-Boxes & NGO Needs</span>
        </button>
      </div>

      {/* Tab 1: AI INTAKE SECTION */}
      {donorSubTab === 'ai-intake' && (
        <div className="space-y-8 animate-fadeIn">
          <DonorAiIntakeSection 
            onOpenPassport={onOpenPassport}
            onOpenNgoLocator={onOpenNgoLocator}
          />

          {/* Impact Calculator Component */}
          <EcoImpactCalculator onScheduleWithItems={(data) => {
            setPrefillSchedulerData(data);
            setIsSchedulerOpen(true);
          }} />
        </div>
      )}

      {/* Tab 2: MY PICKUPS & 80G RECEIPTS */}
      {donorSubTab === 'pickups' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
                Your Scheduled Doorstep & Hostel Pickups
              </h2>
              <p className="text-xs text-slate-500">
                Track status from collection to warehouse grading and download 80G tax certificates.
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
              <span>Book New Pickup</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Loading scheduled pickups...
            </div>
          ) : pickups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">No pickups scheduled yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Schedule your doorstep or hostel room collection. Cleaned garments earn 80G tax deductions.
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {!isCancelled && (
                          <button
                            onClick={() => onOpenLiveMap && onOpenLiveMap(pickup.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
                          >
                            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            <span>Track Collection Van</span>
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
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verify</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
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
      )}

      {/* Tab 3: HOSTEL LEADERBOARD & CAMPUS IMPACT */}
      {donorSubTab === 'campus-impact' && campusStats && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Diverted Mass</span>
              <div className="text-3xl font-black text-emerald-600 font-['Outfit']">{campusStats.totalDivertedWeightKg} Kg</div>
              <p className="text-xs text-slate-500 mt-1">Across all campus student hostels</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Campus Circularity Rate</span>
              <div className="text-3xl font-black text-teal-600 font-['Outfit']">{campusStats.overallCircularityRate}%</div>
              <p className="text-xs text-slate-500 mt-1">Zero municipal landfill waste achieved</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Smart Bins</span>
              <div className="text-3xl font-black text-indigo-600 font-['Outfit']">{campusStats.activeDropBoxesCount || 8} Bins</div>
              <p className="text-xs text-slate-500 mt-1">IoT ultrasonic level monitoring</p>
            </div>
          </div>

          {/* Hostel Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Campus Hostel Circularity Leaderboard</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Rank</th>
                    <th className="pb-3 font-semibold">Hostel / Hall of Residence</th>
                    <th className="pb-3 font-semibold">Diverted Kg</th>
                    <th className="pb-3 font-semibold">Water Saved (L)</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campusStats.hostelLeaderboard?.map((h, i) => (
                    <tr key={h.hostelName} className="hover:bg-slate-50/60">
                      <td className="py-3 font-bold text-slate-700">#{i + 1}</td>
                      <td className="py-3 font-semibold text-slate-900">{h.hostelName}</td>
                      <td className="py-3 font-bold text-emerald-700">{h.weightDivertedKg} kg</td>
                      <td className="py-3 text-slate-600">{h.waterSavedLiters?.toLocaleString()} L</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Collection
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: CAMPUS DROP-BOXES & NGO NEEDS */}
      {donorSubTab === 'drop-boxes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Campus Smart Drop-Boxes & Nearby NGO Needs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Deposit your bagged clothes at any IoT sensor-monitored bin on campus, or view emergency requests from local shelters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">Hostel Block B Smart Bin</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Available (42% Full)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Near Common Room Entry • Sensor Level Active</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[42%]"></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">Student Activity Center (SAC) Drop-Box</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Available (68% Full)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Ground Floor Lobby • Daily Van Pickup</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[68%]"></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">Sports Complex Collection Bin</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Available (15% Full)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">East Gate Entrance • IoT Ultrasonic Verified</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[15%]"></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">Postgraduate Married Scholar Apartments</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Almost Full (85% Full)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Wing C Parking • Collection scheduled for today</p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={onOpenNgoLocator}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Interactive NGO Needs & Routes Map</span>
            </button>
          </div>
        </div>
      )}

      {/* Pickups Scheduler Modal */}
      <PickupSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onPickupCreated={fetchData}
        prefillData={prefillSchedulerData}
      />

      {/* Actions Modal */}
      <PickupActionsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        pickup={selectedPickup}
        mode={actionModalMode}
        onActionComplete={fetchData}
      />

      {/* Verify Receipt Modal */}
      <CertificateVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialInvoiceNumber={verifyInvoiceNum}
      />

    </div>
  );
};

