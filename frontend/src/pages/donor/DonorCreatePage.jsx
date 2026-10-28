import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { pickupApi, aiApi } from '../../services/api';
import { compressImage } from '../../utils/imageCompressor';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Scissors, 
  RefreshCw, 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Droplet,
  Globe2,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Outerwear & Jackets',
  'Tops & Shirts',
  'Denims & Bottoms',
  'Knitwear & Sweaters',
  'Ethnic & Traditional',
  'Winter Blankets & Bedding',
  'Kids & Childrens Wear',
  'Activewear & Sports',
  'Mixed Clothing Lot'
];

export const DonorCreatePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('bags');
  const [conditionDescription, setConditionDescription] = useState('Gently used, clean condition');
  const [imageUrl, setImageUrl] = useState('');
  const [pickupOrDropoff, setPickupOrDropoff] = useState('PICKUP');

  // Address
  const [streetAddress, setStreetAddress] = useState(user?.address || 'Room 304, Ganga Hostel, Campus');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560025');

  // Schedule
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // AI Quality Inspection State
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [qualityScore, setQualityScore] = useState(85);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1024, 0.8);
        setImageUrl(compressedBase64);
        setAiResult(null);
        showToast('Garment image processed! Click "Run AI Quality Inspection" to analyze.', 'info');
      } catch (err) {
        // Fallback to standard reader
        const reader = new FileReader();
        reader.onload = () => {
          setImageUrl(reader.result);
          setAiResult(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRunAi = async () => {
    if (!imageUrl) {
      showToast('Please upload or snap a photo first.', 'warning');
      return;
    }

    setIsScanning(true);
    setAiResult(null);

    try {
      const payload = {
        title: title || 'Donated Clothing Item',
        category: category,
        fabricComposition: 'Cotton Blend',
        hasTears: false,
        hasPermanentStains: false,
        hasMissingButtonsOrZippers: false,
        hasSevereFading: false,
        isSanitized: true,
        photoUrl: imageUrl,
        campusHostelLocation: streetAddress
      };

      const res = await aiApi.assessGarment(payload);
      setAiResult(res.data);
      if (res.data.qualityScore) {
        setQualityScore(res.data.qualityScore);
      }
      showToast(`Cloud Vision analysis complete! Score: ${res.data.qualityScore || 85}/100`, 'success');
    } catch (err) {
      console.error('AI Inspection error', err);
      showToast('Could not complete AI Vision inspection. You can still submit.', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a name or title for this donation.');
      return;
    }
    if (!streetAddress.trim() || !city.trim() || !pincode.trim()) {
      setError('Please complete the pickup / drop-off location address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        category,
        quantity: parseInt(quantity) || 1,
        unit,
        conditionDescription: aiResult ? `${aiResult.decisionRationale} (Score: ${qualityScore}/100)` : conditionDescription,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
        qualityScore,
        pickupOrDropoff,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        scheduledDate,
        timeSlot,
        bagCount: unit === 'bags' ? (parseInt(quantity) || 1) : 1,
        clothTypes: `${title} (${category}, ${quantity} ${unit})`,
        estimatedWeightKg: (parseInt(quantity) || 1) * 3.5,
        additionalInstructions: additionalInstructions.trim()
      };

      await pickupApi.schedulePickup(payload);
      showToast('🎉 Donation submitted successfully! It is now shared with partner NGOs.', 'success');
      navigate('/donor/donations');
    } catch (err) {
      console.error('Failed to create donation', err);
      let errorMsg = 'Failed to submit donation. Please try again.';

      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMsg = 'Your session has expired or your account is unauthenticated. Please log in again to continue.';
      } else if (err.response?.data?.fieldErrors && typeof err.response.data.fieldErrors === 'object') {
        const fields = Object.entries(err.response.data.fieldErrors)
          .map(([k, v]) => `${v}`)
          .join(', ');
        errorMsg = `Validation error: ${fields}`;
      } else if (typeof err.response?.data?.message === 'string') {
        errorMsg = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMsg = err.response.data;
      }

      setError(errorMsg);
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-700/40">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Item Identification & AI Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
          Create a New Clothing Donation
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Provide details about the garments or textiles you are donating. Cloud Vision AI inspects wear and defects: items scoring ≥ 50 are shared directly with partner NGOs for community distribution.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          {error.includes('log in') && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all flex-shrink-0"
            >
              Log In Now
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Item Identification & Photo */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Garment Information & Image</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Winter Jackets, Cotton Shirts, Denim Lot"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="bags">Bags</option>
                    <option value="items">Individual Garments</option>
                    <option value="kg">Estimated Kg</option>
                    <option value="boxes">Carton Boxes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condition Notes
                </label>
                <input
                  type="text"
                  value={conditionDescription}
                  onChange={(e) => setConditionDescription(e.target.value)}
                  placeholder="e.g. Clean, gently worn, no missing buttons"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Right: Camera / Photo Preview & AI Button */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Photo & Cloud Vision Inspection
              </label>

              <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50 aspect-4/3 flex flex-col items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Garment Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700 block">Snap Photo or Upload</span>
                    <span className="text-[11px] text-slate-400">Clear lighting enables defect detection</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFile}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleImageFile}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Click Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRunAi}
                  disabled={isScanning}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Inspecting Wear with Cloud Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Run AI Quality Inspection</span>
                    </>
                  )}
                </button>
              )}

              {/* AI Badge if scanned */}
              {aiResult && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>Quality Score: {qualityScore}/100</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      {qualityScore >= 50 ? 'Approved for NGO' : 'Recycle Downgrade'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {aiResult.decisionRationale}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 2: Collection Schedule & Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Collection Location & Preferred Slot</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup / Drop-off Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPickupOrDropoff('PICKUP')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    pickupOrDropoff === 'PICKUP'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Doorstep / Hostel Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setPickupOrDropoff('DROPOFF')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    pickupOrDropoff === 'DROPOFF'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Campus Smart Drop-Box
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address / Hostel & Room *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. Room 304, Ganga Hostel"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Collection Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Slot *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                  <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Instructions for Volunteer or Driver
            </label>
            <textarea
              rows={2}
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. Call upon arriving at hostel gate, leave with security guard if not in room..."
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/donor/dashboard')}
            className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Submitting to NGO Network...</span>
              </>
            ) : (
              <>
                <span>Submit Donation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

