import React, { useState } from 'react';
import { pickupApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM - 12:00 PM (Morning Slot)',
  '12:00 PM - 03:00 PM (Midday Slot)',
  '03:00 PM - 06:00 PM (Evening Slot)',
];

export const PickupActionsModal = ({ isOpen, onClose, pickup, mode, onActionComplete }) => {
  const { showToast } = useToast();
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('Change of schedule / Donating locally');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !pickup) return null;

  const isCancelMode = mode === 'cancel';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isCancelMode) {
        await pickupApi.cancelPickup(pickup.id, cancelReason);
        showToast(`Pickup #${pickup.id} has been cancelled`, 'info');
      } else {
        await pickupApi.reschedulePickup(pickup.id, {
          newScheduledDate: newDate,
          newTimeSlot: newSlot,
          notes,
        });
        showToast(`Pickup #${pickup.id} rescheduled to ${newDate} (${newSlot})!`, 'success');
      }
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isCancelMode ? 'bg-rose-700' : 'bg-emerald-700'
        }`}>
          <div className="flex items-center gap-2">
            {isCancelMode ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <h3 className="font-bold text-base font-['Outfit']">
              {isCancelMode ? `Cancel Pickup #${pickup.id}` : `Reschedule Pickup #${pickup.id}`}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isCancelMode ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to cancel this doorstep collection? Our logistics driver will be notified immediately.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Change of travel plans">Change of travel plans</option>
                  <option value="Donating directly to local community drive">Donating directly to local community drive</option>
                  <option value="Need more time to sort wardrobe items">Need more time to sort wardrobe items</option>
                  <option value="Other / Duplicate request">Other / Duplicate request</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select New Pickup Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Preferred Time Slot</span>
                </label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note for Driver (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security desk if unavailable"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? 'Rescheduling...' : 'Update Schedule'}
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
