import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ShoppingCart, 
  Tag, 
  Heart, 
  ThermometerSnowflake, 
  Sun, 
  Shirt,
  Info
} from 'lucide-react';

export const ProductDetailModal = ({ isOpen, onClose, item }) => {
  const { cart, addToCart } = useAuth();
  const { showToast } = useToast();

  if (!isOpen || !item) return null;

  const isInCart = cart.some((i) => i.id === item.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Column: Image with Badges */}
        <div className="relative md:w-1/2 bg-slate-100 flex items-center justify-center overflow-hidden">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'}
            alt={item.title}
            className="w-full h-full object-cover min-h-[280px] md:min-h-full"
          />

          {/* Condition Grade Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Grade A • Prime</span>
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {item.season || 'All Season'}
            </span>
          </div>

          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-extrabold px-3 py-1 rounded-xl shadow-md border border-slate-200">
            Size {item.size}
          </div>
        </div>

        {/* Right Column: Garment Details & Hygiene Certificate */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto space-y-4">
          
          <div>
            {/* Close button & Category */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                {item.category} • {item.targetGender}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit'] mt-3 leading-snug">
              {item.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {item.description || 'Pristine, pre-loved garment inspected and prepared for everyday dignity and warmth.'}
            </p>

            {/* Sanitization & Hygiene Inspection Details */}
            <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200/80 mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3-Step Hospital-Grade QC Passed</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-1 list-disc list-inside">
                <li>Industrial steam sanitized at 135°C to eliminate 99.9% microbes</li>
                <li>Hospital-grade UV-C chamber irradiation completed</li>
                <li>Zippers, buttons, and high-stress seam integrity checked</li>
              </ul>
            </div>

            {/* Fabric Care Tips */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Fabric Care Guidance</span>
              </div>
              <p>Machine wash cold with mild detergent. Line dry in shade to preserve textile fibers.</p>
            </div>
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NGO Seasonal Quota</span>
                <div className="text-lg font-black text-amber-700">
                  {item.creditCost === 0 ? 'FREE (0 Credits)' : `${item.creditCost} Credits`}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                In Stock & Verified
              </span>
            </div>

            <button
              onClick={() => {
                addToCart(item);
                showToast(`Added "${item.title}" to your seasonal package!`, 'success');
              }}
              disabled={isInCart}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                isInCart
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-98'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Item Already In Your Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to My Seasonal Package</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
