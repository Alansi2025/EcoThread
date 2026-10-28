import React, { useState, useEffect } from 'react';
import { adminApi, orderApi, catalogApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AdminDashboard } from '../admin/AdminDashboard';
import { LogisticsDashboard } from '../logistics/LogisticsDashboard';
import { GarmentPassportModal } from '../../components/GarmentPassportModal';
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
  Sliders,
  ShoppingBag,
  ShoppingCart,
  Scissors,
  Check,
  MapPin,
  QrCode,
  Compass,
  ArrowRight
} from 'lucide-react';

export const NgoHubPortal = ({ onOpenPassport, onOpenLiveMap, onOpenNgoLocator }) => {
  const { user, cart, addToCart, removeFromCart, clearCart, totalCartCredits } = useAuth();
  const { showToast } = useToast();

  // Sub-tabs: 'received-items', 'community-cart', 'warehouse-qc', 'fleet-logistics'
  const [ngoSubTab, setNgoSubTab] = useState('received-items');
  
  // Received items state
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'APPROVED', 'RECYCLE'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Community Cart & Distribution state
  const [orders, setOrders] = useState([]);
  const [shelterName, setShelterName] = useState('Asha Bhavan Community Shelter');
  const [streetAddress, setStreetAddress] = useState('Sector 4, Community Welfare Complex');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560034');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, orderRes] = await Promise.all([
        adminApi.getAllInventory(),
        orderApi.getOrders().catch(() => ({ data: [] }))
      ]);
      setInventory(invRes.data || []);
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error('Failed to load NGO inventory', err);
      showToast('Could not refresh items received in store', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const isApproved = item.isAvailable || item.conditionGrade === 'GRADE_A';
    if (filterType === 'APPROVED' && !isApproved) return false;
    if (filterType === 'RECYCLE' && isApproved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      const matchNotes = item.qcNotes?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchNotes;
    }
    return true;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`Added "${item.title}" to Community Distribution Cart!`, 'success');
  };

  const handleDispatchCommunityOrder = async () => {
    if (cart.length === 0) {
      showToast('Community cart is empty. Add approved items from the store first.', 'warning');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        itemIds: cart.map((i) => i.id),
        streetAddress: `${shelterName}, ${streetAddress}`,
        city,
        state,
        pincode,
      };

      const res = await orderApi.checkout(payload);
      clearCart();
      showToast(`🎉 Community Distribution Order #${res.data.orderNumber} confirmed!`, 'success');
      await fetchInventory();
    } catch (err) {
      console.error('Order dispatch failed', err);
      showToast(err.response?.data?.error || err.message || 'Dispatch failed', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NGO Partner & Shelter Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 font-['Outfit']">
            NGO & Warehouse Operations Hub
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Manage incoming garments verified by donor AI cameras, review quality grades (≥50 approved vs &lt;50 recycled), coordinate community carts for shelter redistribution, and manage logistics fleet dispatching.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setNgoSubTab('received-items')}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Items Received in Store ({inventory.length})</span>
            </button>

            <button
              onClick={() => setNgoSubTab('community-cart')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Community Cart ({cart.length})</span>
            </button>

            <button
              onClick={() => setNgoSubTab('warehouse-qc')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Warehouse QC Station</span>
            </button>

            <button
              onClick={() => setNgoSubTab('fleet-logistics')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all border border-white/20"
            >
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Logistics & Fleet</span>
            </button>

            <button
              onClick={fetchInventory}
              className="p-3 bg-white/5 hover:bg-white/15 text-slate-300 rounded-xl transition-all border border-white/10"
              title="Refresh Store Inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs for NGO Hub */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setNgoSubTab('received-items')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            ngoSubTab === 'received-items'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Received Items in Stores</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {inventory.length}
          </span>
        </button>

        <button
          onClick={() => setNgoSubTab('community-cart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            ngoSubTab === 'community-cart'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Community Cart & Allocations</span>
          {cart.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
              {cart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setNgoSubTab('warehouse-qc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            ngoSubTab === 'warehouse-qc'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Warehouse QC Workstation</span>
        </button>

        <button
          onClick={() => setNgoSubTab('fleet-logistics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            ngoSubTab === 'fleet-logistics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet Logistics & Map</span>
        </button>
      </div>

      {/* TAB 1: RECEIVED ITEMS IN STORES */}
      {ngoSubTab === 'received-items' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search donor items by title, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Received ({inventory.length})
              </button>

              <button
                onClick={() => setFilterType('APPROVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Shelter Approved (≥ 50)
              </button>

              <button
                onClick={() => setFilterType('RECYCLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'RECYCLE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Textile Recycling (&lt; 50)
              </button>
            </div>

          </div>

          {/* Grid of Received Items */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
              Loading store inventory from donor submissions...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">No garments match current filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Items submitted by donors via the Campus Donor Portal will appear here in real-time with their Cloud Vision quality scores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const isApproved = item.isAvailable || item.conditionGrade === 'GRADE_A';
                const isInCart = cart.some((c) => c.id === item.id);
                
                // Extract score from notes if present
                const scoreMatch = item.qcNotes?.match(/(\d+)\/100/);
                const scoreVal = scoreMatch ? parseInt(scoreMatch[1]) : (isApproved ? 85 : 35);

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Item Image & Badges */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />

                      {/* Score Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1 ${
                          isApproved ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          <Sparkles className="w-3 h-3 text-white/90" />
                          <span>{scoreVal}/100</span>
                        </span>
                      </div>

                      {/* Status Verdict Badge */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        {isApproved ? (
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold border border-emerald-500/40 flex items-center justify-between">
                            <span>Approved: Sell / Shelter</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-lg bg-rose-950/80 backdrop-blur-md text-rose-200 text-[10px] font-bold border border-rose-500/40 flex items-center justify-between">
                            <span>Downcycled: Textile Shredding</span>
                            <Scissors className="w-3 h-3 text-rose-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold">{item.category}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-bold">
                            {item.size || 'Free Size'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 font-['Outfit']">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                          {item.qcNotes || item.description || 'Verified via Cloud Vision inspection engine.'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        {isApproved ? (
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isInCart}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isInCart
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Cart</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>In Recycling Batch</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenPassport && onOpenPassport('ECO-TRC-2026-8841')}
                          className="p-2 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="View Digital Product Passport"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COMMUNITY CART & DISTRIBUTION */}
      {ngoSubTab === 'community-cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Cart Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Community Allocation Cart ({cart.length} items)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Garments selected from received donor store for shelter distribution
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">Your community cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Browse the "Received Items in Stores" tab and click "Add to Cart" on approved garments.
                  </p>
                  <button
                    onClick={() => setNgoSubTab('received-items')}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    View Received Store Items
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs font-['Outfit']">{item.title}</h5>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">Grade A Cleaned</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          0 Credits (Grant)
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Placed Orders Tracker */}
            {orders.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-3 font-['Outfit']">
                  Recent Community Distribution Dispatches ({orders.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 3).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Order #{o.orderNumber || o.id}</div>
                        <div className="text-slate-500 text-[11px]">
                          {o.items?.length || 1} items • {o.deliveryAddress?.city || 'Bengaluru'}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {o.status || 'CONFIRMED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout & Destination Shelter Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Destination Shelter / Beneficiary Hub</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Shelter / Community Center</label>
                <input
                  type="text"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Garments:</span>
                  <span className="font-bold text-slate-900">{cart.length} items</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distribution Tier:</span>
                  <span className="font-bold text-emerald-700">100% Subsidized NGO Aid</span>
                </div>
                <div className="pt-2 border-t border-indigo-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Dignity Credits:</span>
                  <span>0 Free Credits</span>
                </div>
              </div>

              <button
                onClick={handleDispatchCommunityOrder}
                disabled={isCheckingOut || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Order...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Confirm Community Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: WAREHOUSE QC WORKSTATION */}
      {ngoSubTab === 'warehouse-qc' && (
        <div className="animate-fadeIn">
          <AdminDashboard 
            onOpenPassport={onOpenPassport}
          />
        </div>
      )}

      {/* TAB 4: FLEET LOGISTICS & ROUTES */}
      {ngoSubTab === 'fleet-logistics' && (
        <div className="animate-fadeIn">
          <LogisticsDashboard 
            onOpenNgoLocator={onOpenNgoLocator}
          />
        </div>
      )}

    </div>
  );
};

