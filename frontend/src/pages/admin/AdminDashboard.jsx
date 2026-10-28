import React, { useState, useEffect } from 'react';
import { adminApi, orderApi, impactApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QcGradingModal } from './QcGradingModal';
import { 
  ShieldCheck, 
  Sparkles, 
  Package, 
  Truck, 
  Plus, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Droplet, 
  Globe2,
  Tag,
  Coins,
  FileSpreadsheet,
  Download,
  Users,
  Award,
  TreePine,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';

export const AdminDashboard = ({ onOpenScanner, onOpenPassport }) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('qc'); // 'qc', 'dispatch', 'quotas', 'esg'
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [sustainabilityReport, setSustainabilityReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQcModalOpen, setIsQcModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [adjustingBeneficiaryId, setAdjustingBeneficiaryId] = useState(null);
  const [searchBeneficiary, setSearchBeneficiary] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Custom Quota Adjustment Dialog State
  const [customQuotaModal, setCustomQuotaModal] = useState({
    isOpen: false,
    beneficiary: null,
    amount: 50,
    operation: 'GRANT',
    reason: 'Seasonal Welfare Top-up',
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, orderRes, statsRes, benRes, esgRes] = await Promise.all([
        adminApi.getAllInventory(),
        orderApi.getOrders(),
        adminApi.getInventoryStats(),
        adminApi.getBeneficiaries().catch(() => ({ data: [] })),
        adminApi.getSustainabilityReport().catch(() => ({ data: null })),
      ]);
      setInventory(invRes.data || []);
      setOrders(orderRes.data || []);
      setStats(statsRes.data || {});
      setBeneficiaries(benRes.data || []);
      setSustainabilityReport(esgRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
      showToast('Could not refresh warehouse data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      await fetchData();
    } catch (err) {
      showToast('Failed to update order status: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAdjustCredits = async (beneficiaryId, amount, reason, operation = 'GRANT') => {
    setAdjustingBeneficiaryId(beneficiaryId);
    try {
      await adminApi.adjustCredits(beneficiaryId, { amount, reason, operation });
      showToast(`Successfully ${operation === 'GRANT' ? 'granted' : 'deducted'} ${amount} credits for beneficiary.`, 'success');
      await fetchData();
    } catch (err) {
      showToast('Credit adjustment failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setAdjustingBeneficiaryId(null);
    }
  };

  const handleCustomAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!customQuotaModal.beneficiary) return;
    setCustomQuotaModal((prev) => ({ ...prev, loading: true }));
    try {
      await adminApi.adjustCredits(customQuotaModal.beneficiary.id, {
        amount: parseInt(customQuotaModal.amount, 10),
        reason: customQuotaModal.reason,
        operation: customQuotaModal.operation,
      });
      showToast(`Adjusted ${customQuotaModal.amount} credits for ${customQuotaModal.beneficiary.fullName}`, 'success');
      setCustomQuotaModal({ isOpen: false, beneficiary: null, amount: 50, operation: 'GRANT', reason: '', loading: false });
      await fetchData();
    } catch (err) {
      showToast('Adjustment failed: ' + (err.response?.data?.message || err.message), 'error');
      setCustomQuotaModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDownloadCsv = async () => {
    try {
      await adminApi.downloadSustainabilityCsv();
      showToast('Sustainability CSV report generated and downloaded!', 'success');
    } catch (err) {
      showToast('Failed to download CSV: ' + err.message, 'error');
    }
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => 
    b.fullName?.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchBeneficiary.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 mb-8 border border-purple-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warehouse Management, Beneficiary Quotas & ESG Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Admin Operations & Circular Hub ⚙️
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            Garment intake grading, beneficiary credit quotas, order fulfillment, and ESG platform audit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            title="Scan garment defects, fabric fatigue and wear-and-tear with AI"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>AI Quality Scanner</span>
          </button>
          <button
            onClick={() => setIsQcModalOpen(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Grade Intake Garment</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all border border-white/15"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* QC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        
        {/* Grade A Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade A (Store Catalog)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {stats?.GRADE_A ?? 8}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Pristine • Available for Credit Checkout</p>
        </div>

        {/* Grade B Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade B (Bulk Drives)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {stats?.GRADE_B ?? 2}
          </div>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Disaster Relief & Slum Aid Drives</p>
        </div>

        {/* Downcycle Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Textile Downcycling</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {stats?.RECYCLE_DOWNGRADE ?? 1}
          </div>
          <p className="text-[11px] text-rose-700 mt-1 font-medium">Shredded for Industrial Insulation Yarn</p>
        </div>

        {/* Beneficiaries Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Beneficiaries</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Outfit']">
            {beneficiaries.length || 3} Families
          </div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Allocated Monthly Seasonal Quotas</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('qc')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'qc'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Garment Inventory & QC Grade</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dispatch')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'dispatch'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Order Dispatch Controls ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quotas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'quotas'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Beneficiary Quota Allocations ({beneficiaries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('esg')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'esg'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>ESG Sustainability Audit & Circularity</span>
        </button>
      </div>

      {/* Subtab 1: QC Inventory Table */}
      {activeSubTab === 'qc' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">
              Warehouse Catalog & Graded Textiles ({inventory.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenScanner}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Quality Scanner</span>
              </button>
              <button
                onClick={() => setIsQcModalOpen(true)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Intake New Item</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Garment</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Demographic & Size</th>
                  <th className="px-4 py-3">QC Grade</th>
                  <th className="px-4 py-3">Allowance Cost</th>
                  <th className="px-4 py-3">Redirection Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{item.category}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.targetGender} • Size {item.size}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.conditionGrade === 'GRADE_A'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.conditionGrade === 'GRADE_B'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {item.conditionGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-amber-800">
                      {item.creditCost === 0 ? '0 Credits' : `${item.creditCost} Credits`}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      {item.conditionGrade === 'GRADE_A'
                        ? 'Beneficiary Store Catalog (Online)'
                        : item.conditionGrade === 'GRADE_B'
                        ? 'Bulk NGO Community Relief Storage'
                        : 'Downcycling Fiber Spinning Mill'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Order Dispatch Controls */}
      {activeSubTab === 'dispatch' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">
              Beneficiary Order Fulfillment & Dispatch Controls
            </h3>
            <p className="text-xs text-slate-500">
              Advance dispatch status through packing, out for delivery, and completed delivery
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-4 py-3">Beneficiary</th>
                  <th className="px-4 py-3">Delivery Destination</th>
                  <th className="px-4 py-3">Credits Spent</th>
                  <th className="px-4 py-3">Dispatch Status</th>
                  <th className="px-6 py-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-6 py-3 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-semibold">{order.beneficiary?.fullName || 'Beneficiary'}</div>
                      <div className="text-[10px] text-slate-400">{order.beneficiary?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {order.shippingAddress?.streetAddress || 'Community Distribution Hub'}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-amber-700">
                      {order.totalCreditsSpent} Cr
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'DISPATCHED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <select
                        value={order.orderStatus}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="ORDERED">ORDERED (Packed)</option>
                        <option value="DISPATCHED">DISPATCHED (In Transit)</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED (Handed Over)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Beneficiary Quota Allocations */}
      {activeSubTab === 'quotas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">
                Beneficiary Allowance Quotas & Disaster Aid Management
              </h3>
              <p className="text-xs text-slate-500">
                Grant seasonal quota top-ups (+50 winter allowance, +100 disaster relief) or manage account allocations
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search beneficiaries..."
                value={searchBeneficiary}
                onChange={(e) => setSearchBeneficiary(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Beneficiary Account</th>
                  <th className="px-4 py-3">Phone & Contact</th>
                  <th className="px-4 py-3">Orders Fulfilled</th>
                  <th className="px-4 py-3">Current Allowance</th>
                  <th className="px-4 py-3 text-right">Quick Quota Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-all">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{b.fullName}</div>
                      <div className="text-[11px] text-slate-400">{b.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {b.phone || '+91 98450 67890'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {b.totalOrdersPlaced || 1} orders
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                        <Coins className="w-3 h-3 text-amber-600" />
                        <span>{b.credits} Credits</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleAdjustCredits(b.id, 50, 'Winter Season Allowance Grant', 'GRANT')}
                        disabled={adjustingBeneficiaryId === b.id}
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 rounded-lg text-xs transition-all disabled:opacity-50"
                      >
                        +50 Winter
                      </button>
                      <button
                        onClick={() => handleAdjustCredits(b.id, 100, 'Disaster Emergency Aid Allocation', 'GRANT')}
                        disabled={adjustingBeneficiaryId === b.id}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-300 rounded-lg text-xs transition-all disabled:opacity-50"
                      >
                        +100 Aid
                      </button>
                      <button
                        onClick={() => setCustomQuotaModal({
                          isOpen: true,
                          beneficiary: b,
                          amount: 50,
                          operation: 'GRANT',
                          reason: 'Special Seasonal Allowance Grant',
                          loading: false,
                        })}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-lg text-xs transition-all inline-flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-slate-500" />
                        <span>Custom...</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: ESG Sustainability Audit & Circularity */}
      {activeSubTab === 'esg' && (
        <div className="space-y-6">
          
          {/* ESG Hero Summary Box */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>UN SDG Sustainable Development Goals Compliance</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Platform Circularity Rate: {sustainabilityReport?.circularityRatePercentage || 91.5}% ♻️
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
                91.5% of all intake clothing is refurbished and redistributed into circular reuse (Grade A & B), avoiding municipal landfill incineration.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit CSV Report</span>
            </button>
          </div>

          {/* SDG Alignment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                SDG 12
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">Responsible Consumption</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {(sustainabilityReport?.waterSavedLiters || 40500).toLocaleString()} Liters of fresh water conserved. Zero virgin textile manufacturing emissions.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                SDG 1
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">No Poverty & Dignity</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {sustainabilityReport?.registeredBeneficiariesCount || 3} low-income families supported with zero-cost seasonal clothing allowances and school wear.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                SDG 13
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-['Outfit']">Climate Action</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {(sustainabilityReport?.co2SavedKg || 54.0).toFixed(1)} Kg CO₂ equivalent greenhouse gas emissions avoided from municipal open-air incinerators.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* QC Modal */}
      <QcGradingModal
        isOpen={isQcModalOpen}
        onClose={() => setIsQcModalOpen(false)}
        onGraded={fetchData}
      />

      {/* Custom Quota Adjustment Modal */}
      {customQuotaModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Adjust Beneficiary Quota</h3>
                  <p className="text-xs text-purple-200">
                    {customQuotaModal.beneficiary?.fullName} (Current: {customQuotaModal.beneficiary?.credits} Credits)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomQuotaModal({ ...customQuotaModal, isOpen: false })}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomAdjustmentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Operation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomQuotaModal({ ...customQuotaModal, operation: 'GRANT' })}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                      customQuotaModal.operation === 'GRANT'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Grant Quota Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomQuotaModal({ ...customQuotaModal, operation: 'DEDUCT' })}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                      customQuotaModal.operation === 'DEDUCT'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Deduct / Correct Credits
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Amount</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={customQuotaModal.amount}
                  onChange={(e) => setCustomQuotaModal({ ...customQuotaModal, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Audit Justification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter relief top-up, family size adjustment"
                  value={customQuotaModal.reason}
                  onChange={(e) => setCustomQuotaModal({ ...customQuotaModal, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomQuotaModal({ ...customQuotaModal, isOpen: false })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customQuotaModal.loading}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-700/20 disabled:opacity-50"
                >
                  {customQuotaModal.loading ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
