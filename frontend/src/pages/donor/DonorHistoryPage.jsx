import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi, invoiceApi } from '../../services/api';
import { 
  History, 
  CheckCircle2, 
  Download, 
  Calendar, 
  MapPin, 
  Building2, 
  Droplet, 
  Globe2, 
  ShieldCheck,
  Package
} from 'lucide-react';

export const DonorHistoryPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await pickupApi.getPickups();
        const completed = (res.data || []).filter(p => p.status === 'COMPLETED');
        setHistory(completed);
      } catch (err) {
        console.error('Failed to load completed history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
          Completed Donation History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Archived records of verified clothing distributions with verified 80G tax deductions
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading completed donation records...
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm mb-1">No completed donations yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your scheduled collections are verified at the warehouse hub, they will appear here with downloadable 80G tax receipts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm font-['Outfit']">
                      Donation #{item.id}: {item.title || item.clothTypes || 'Completed Clothing Batch'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      COMPLETED & VERIFIED
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.scheduledDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.pickupAddress?.city || 'Bengaluru'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.bagCount} bags (~{item.estimatedWeightKg || 5} kg)</span>
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleDownloadPdf(item.id)}
                    disabled={downloadingId === item.id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === item.id ? 'Generating...' : 'Download 80G Receipt (PDF)'}</span>
                  </button>
                </div>
              </div>

              {/* Offset impact */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>~27,000 L Water Saved</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>~36 kg CO₂ Diverted</span>
                </span>
                <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Section 80G Tax Deductible</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

