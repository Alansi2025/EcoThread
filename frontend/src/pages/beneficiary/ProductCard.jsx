import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShoppingCart, Check, Sparkles, Tag, Eye } from 'lucide-react';

export const ProductCard = ({ item, onQuickView }) => {
  const { cart, addToCart } = useAuth();
  const { showToast } = useToast();
  const isInCart = cart.some((i) => i.id === item.id);

  const handleAddToCart = () => {
    addToCart(item);
    showToast(`Added "${item.title}" to your clothing cart!`, 'success');
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Product Image & Badges */}
      <div 
        className="relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onQuickView && onQuickView(item)}
      >
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick View & QC Seal</span>
          </span>
        </div>

        {/* Condition Grade Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Grade A • Pristine</span>
          </span>
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {item.season || 'All Season'}
          </span>
        </div>

        {/* Size Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-slate-200 pointer-events-none">
          Size {item.size}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span>{item.category}</span>
            <span className="uppercase text-slate-400 font-bold">{item.targetGender}</span>
          </div>

          <h3 
            onClick={() => onQuickView && onQuickView(item)}
            className="font-bold text-slate-900 text-sm line-clamp-1 mb-1 font-['Outfit'] cursor-pointer hover:text-amber-700 transition-colors" 
            title={item.title}
          >
            {item.title}
          </h3>

          {/* AI Quality & Inspection Badge */}
          {item.qcNotes && (
            <div className="mb-2 flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>{item.qcNotes}</span>
              </span>
            </div>
          )}

          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
            {item.description || 'Sanitized and inspected garment ready for immediate wearing.'}
          </p>
        </div>

        {/* Pricing and Add to Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Allowance Cost</div>
            <div className="text-sm font-extrabold text-amber-700 flex items-center gap-1">
              <span>{item.creditCost === 0 ? 'FREE (0 Cr)' : `${item.creditCost} Credits`}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
