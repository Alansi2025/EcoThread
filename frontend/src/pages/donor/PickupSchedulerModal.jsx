import React, { useState } from 'react';
import { pickupApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Calendar, Clock, Package, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM - 12:00 PM (Morning Slot)',
  '12:00 PM - 03:00 PM (Midday Slot)',
  '03:00 PM - 06:00 PM (Evening Slot)',
];

const COMMON_CLOTH_TYPES = [
  'Cotton Shirts & Tops',
  'Denims & Trousers',
  'Winter Jackets & Sweaters',
  'Traditional & Ethnic Wear',
  "Children's School Uniforms",
  'Bed Linen & Towels',
];

export const PickupSchedulerModal = ({ isOpen, onClose, onPickupCreated, prefillData }) => {
  const { showToast } = useToast();
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bagCount, setBagCount] = useState(2);
  const [selectedTypes, setSelectedTypes] = useState(['Cotton Shirts & Tops', 'Winter Jackets & Sweaters']);
  const [streetAddress, setStreetAddress] = useState('42 Richmond Road, Langford Town');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560025');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(8.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (prefillData && isOpen) {
      if (prefillData.bagCount) setBagCount(prefillData.bagCount);
      if (prefillData.estimatedWeightKg) setEstimatedWeightKg(prefillData.estimatedWeightKg);
    }
  }, [prefillData, isOpen]);

  if (!isOpen) return null;

  const toggleClothType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        scheduledDate,
        timeSlot,
        bagCount: parseInt(bagCount, 10),
        clothTypes: selectedTypes.join(', '),
        streetAddress,
        city,
        state,
        pincode,
        estimatedWeightKg: parseFloat(estimatedWeightKg) || bagCount * 4.0,
      };

      await pickupApi.schedulePickup(payload);
      showToast(`Doorstep pickup confirmed for ${scheduledDate} (${timeSlot.split(' ')[0]} slot)!`, 'success');
      if (onPickupCreated) onPickupCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule pickup. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">Schedule Doorstep Pickup</h3>
              <p className="text-xs text-emerald-100">Zero-hassle garment collection with 80G Tax Receipt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pickup Date</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Time Slot</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bag count and weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Bag Count (Standard size)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setBagCount(num);
                      setEstimatedWeightKg(num * 4.0);
                    }}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-all ${
                      bagCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Est. Weight (Kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={estimatedWeightKg}
                onChange={(e) => setEstimatedWeightKg(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Garment categories */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Garment Types Included
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_CLOTH_TYPES.map((type) => {
                const selected = selectedTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleClothType(type)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                      selected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {selected && <CheckCircle className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doorstep Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Doorstep Pickup Address</span>
            </label>
            <input
              type="text"
              required
              placeholder="Flat / Building, Street, Landmark"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                required
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 80G Tax Badge info */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Official Section 80G Tax Exemption:</span> An official tax-exempt donation certificate with environmental impact offset will be automatically generated upon pickup verification.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Confirming with Logistics Dispatch...' : 'Confirm Doorstep Pickup Schedule'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
