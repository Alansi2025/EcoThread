import React, { useState } from 'react';
import { invoiceApi } from '../services/api';
import { 
  X, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Droplet, 
  Globe2, 
  Calendar,
  Building,
  Key
} from 'lucide-react';

export const CertificateVerificationModal = ({ isOpen, onClose, initialInvoiceNumber = '' }) => {
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoiceNumber || 'ECO-80G-2026-0042');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!invoiceNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await invoiceApi.verifyCertificate(invoiceNumber.trim());
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Certificate reference not found. Please verify the invoice number format (e.g. ECO-80G-2026-0042).');
      } else {
        setError(err.response?.data?.message || 'Verification service temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSample = (sampleNum) => {
    setInvoiceNumber(sampleNum);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Outfit']">Public 80G Certificate Verification</h3>
              <p className="text-xs text-emerald-200/80">Income Tax Act Section 80G Authenticity Registry</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Search Form */}
          <form onSubmit={handleVerify} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Enter 80G Tax Exemption Receipt Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ECO-80G-2026-0042"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Receipt'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Try sample reference:</span>
              <button
                type="button"
                onClick={() => handleQuickSample('ECO-80G-2026-0042')}
                className="font-mono text-emerald-700 underline font-semibold hover:text-emerald-800"
              >
                ECO-80G-2026-0042
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verification Failed: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Verification Result Card */}
          {result && result.valid && (
            <div className="bg-emerald-50/80 rounded-2xl border-2 border-emerald-500/60 p-5 space-y-4 animate-fadeIn">
              
              {/* Authenticity Badge */}
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm font-['Outfit']">Official Tax Certificate Valid</h4>
                    <p className="text-[11px] text-emerald-700">Digital Seal Verified in EcoThread Registry</p>
                  </div>
                </div>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Verified 80G
                </span>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Receipt No.</div>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{result.invoiceNumber}</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Donor Contributor</div>
                  <div className="font-semibold text-slate-900 text-xs mt-0.5">{result.maskedDonorName}</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Tax Exemption ID</div>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{result.taxExemptionId}</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Verified Garments</div>
                  <div className="font-bold text-emerald-800 text-xs mt-0.5">{result.totalItemsVerified} Cleaned Items</div>
                </div>
              </div>

              {/* Verified Impact */}
              <div className="flex items-center justify-around bg-white/80 p-3 rounded-xl border border-emerald-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">Water Saved</div>
                  <div className="text-sm font-bold text-blue-700 flex items-center justify-center gap-1 mt-0.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    <span>{result.waterSavedLiters?.toLocaleString()} L</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">CO₂ Prevented</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{result.co2SavedKg?.toFixed(1)} Kg</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">Exemption Status</div>
                  <div className="text-sm font-bold text-purple-700 mt-0.5">50% Deduction</div>
                </div>
              </div>

              {/* Cryptographic Seal Token */}
              <div className="p-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Digital Seal:</span>
                  <span className="text-emerald-400 font-bold">{result.digitalSealToken}</span>
                </div>
                <span className="text-slate-400">Reg: {result.organizationRegNumber}</span>
              </div>

              {/* Download original PDF */}
              <a
                href={`/api/invoices/download/${result.invoiceNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Section 80G Receipt (PDF)</span>
              </a>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
