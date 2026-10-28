import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Trash2, 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  ShoppingBag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const CartDrawer = ({ isOpen, onClose, onOrderPlaced }) => {
  const { user, cart, removeFromCart, clearCart, totalCartCredits, refreshUserData, switchRole } = useAuth();
  const { showToast } = useToast();
  const [streetAddress, setStreetAddress] = useState('Flat 12, Community Housing Colony, Whitefield');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560066');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isOpen) return null;

  const userCredits = user?.credits ?? 0;
  const isBeneficiary = user?.role === 'ROLE_BENEFICIARY';
  const hasSufficientCredits = isBeneficiary && userCredits >= totalCartCredits;

  const handleCheckout = async () => {
    if (!isBeneficiary) {
      setError('Please switch to Beneficiary persona to use seasonal allocation credits.');
      return;
    }
    if (!hasSufficientCredits) {
      setError(`Insufficient credit balance. You have ${userCredits} credits, but order requires ${totalCartCredits}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        itemIds: cart.map((i) => i.id),
        streetAddress,
        city,
        state,
        pincode,
      };

      const res = await orderApi.checkout(payload);
      
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }

      setOrderSuccess(res.data);
      clearCart();
      showToast(`Order #${res.data.orderNumber} confirmed! Seasonal credits redeemed.`, 'success');
      await refreshUserData();
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Your Clothing Cart</h3>
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {orderSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 font-['Outfit']">Order Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your seasonal clothing package has been routed to our packaging hub.
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{orderSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credits Deducted:</span>
                  <span className="font-bold text-amber-700">{orderSuccess.totalCreditsSpent} Credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Status:</span>
                  <span className="font-bold text-emerald-700">{orderSuccess.orderStatus}</span>
                </div>
              </div>

              <button
                onClick={() => { setOrderSuccess(null); onClose(); }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                Continue Browsing Catalog
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs">Your cart is currently empty.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Browse cleaned Grade-A apparel in our Amazon-style catalog and use your monthly NGO credits.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Persona switch alert if not beneficiary */}
              {!isBeneficiary && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <div className="font-bold mb-1">Testing Zero-Cost Checkout?</div>
                  <p className="mb-2">You are currently signed in as {user?.role || 'Guest'}. Switch to Beneficiary to use the 150 seasonal credit quota.</p>
                  <button
                    onClick={() => switchRole('ROLE_BENEFICIARY')}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-all"
                  >
                    Switch to Beneficiary Persona
                  </button>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate font-['Outfit']">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">Size {item.size} • {item.targetGender}</p>
                      <div className="text-xs font-extrabold text-amber-700 mt-0.5">
                        {item.creditCost === 0 ? 'FREE' : `${item.creditCost} Credits`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        showToast(`Removed "${item.title}" from cart`, 'info');
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Address</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street / Community Housing / Hub"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Drawer Footer Checkout Button */}
        {cart.length > 0 && !orderSuccess && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Beneficiary Balance:</span>
              <span className="font-bold text-slate-900">{userCredits} Credits</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Order Total Cost:</span>
              <span className="font-bold text-amber-700 text-sm">{totalCartCredits} Credits</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || (isBeneficiary && !hasSufficientCredits)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Processing Checkout...' : 'Confirm Zero-Cost Credit Checkout'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
