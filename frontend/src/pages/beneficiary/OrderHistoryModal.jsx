import React, { useState, useEffect } from 'react';
import { orderApi } from '../../services/api';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

const ORDER_STEPS = ['ORDERED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const OrderHistoryModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      orderApi.getOrders()
        .then((res) => setOrders(res.data || []))
        .catch((err) => console.error('Failed to load orders', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Your Order History & Tracking</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders placed yet. Choose clothing from our catalog to place your first zero-cost order!
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = ORDER_STEPS.indexOf(order.orderStatus);

              return (
                <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                      <span className="text-xs text-slate-500 ml-2">({order.items?.length || 1} items)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                    {ORDER_STEPS.map((step, idx) => {
                      const isPassed = idx <= currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold mb-1 ${
                            isPassed ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {isPassed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                          </div>
                          <span className={`capitalize ${isPassed ? 'font-bold text-amber-900' : 'text-slate-400'}`}>
                            {step.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping address info */}
                  {order.shippingAddress && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Delivery: {order.shippingAddress.streetAddress}, {order.shippingAddress.city}</span>
                      <span className="font-bold text-amber-800">{order.totalCreditsSpent} Credits Spent</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
