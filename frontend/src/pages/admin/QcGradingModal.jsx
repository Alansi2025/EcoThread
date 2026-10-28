import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles, CheckCircle, AlertCircle, Shirt, Tag, DollarSign, Layers } from 'lucide-react';

const CATEGORIES = [
  'Outerwear',
  'Shirts & Blouses',
  'Denims & Bottoms',
  'Ethnic & Traditional',
  'Kids Wear',
  'Tops & Knitwear',
  'Bedding & Linens',
];

const PRESETS = [
  {
    label: '🧥 Heavy Winter Coat',
    title: 'Heavy Wool Blend Winter Coat',
    category: 'Outerwear',
    targetGender: 'Unisex',
    size: 'L',
    season: 'Winter',
    conditionGrade: 'GRADE_A',
    creditCost: 25,
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80',
    qcNotes: 'Heavy thermal insulation, zipper tested, dry cleaned and sanitised.',
  },
  {
    label: '👔 Oxford Shirt',
    title: 'Classic Pique Cotton Oxford Shirt',
    category: 'Shirts & Blouses',
    targetGender: 'Men',
    size: 'M',
    season: 'All Season',
    conditionGrade: 'GRADE_A',
    creditCost: 15,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    qcNotes: 'All buttons intact, crisp collar, UV sterilized.',
  },
  {
    label: '👖 Denim Jeans',
    title: 'Raw Indigo Straight Fit Selvedge Denim',
    category: 'Denims & Bottoms',
    targetGender: 'Men',
    size: 'M',
    season: 'All Season',
    conditionGrade: 'GRADE_A',
    creditCost: 18,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    qcNotes: 'Pocket lining intact, fabric tension verified, high durability score.',
  },
  {
    label: '🥻 Cotton Kurti',
    title: 'Embroidered Handloom Cotton Kurti',
    category: 'Ethnic & Traditional',
    targetGender: 'Women',
    size: 'L',
    season: 'Summer',
    conditionGrade: 'GRADE_A',
    creditCost: 15,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    qcNotes: 'Pure breathable cotton, embroidery pristine, steam sanitized.',
  },
  {
    label: '📦 Disaster Relief (Grade B)',
    title: 'Fleece Thermal Blankets (Bulk Pack)',
    category: 'Bedding & Linens',
    targetGender: 'Unisex',
    size: 'Free Size',
    season: 'Winter',
    conditionGrade: 'GRADE_B',
    creditCost: 0,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    qcNotes: 'Minor cosmetic pill, fully functional warmth. Tagged for flood relief aid drive.',
  },
];

export const QcGradingModal = ({ isOpen, onClose, onGraded }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetGender, setTargetGender] = useState('Men');
  const [size, setSize] = useState('M');
  const [season, setSeason] = useState('All Season');
  const [conditionGrade, setConditionGrade] = useState('GRADE_A');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80');
  const [creditCost, setCreditCost] = useState(15);
  const [qcNotes, setQcNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setTargetGender(preset.targetGender);
    setSize(preset.size);
    setSeason(preset.season);
    setConditionGrade(preset.conditionGrade);
    setCreditCost(preset.creditCost);
    setImageUrl(preset.imageUrl);
    setQcNotes(preset.qcNotes);
    showToast(`Loaded "${preset.title}" preset template`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        description: description || `Verified ${conditionGrade} garment sanitized and checked by EcoThread QC.`,
        category,
        targetGender,
        size,
        season,
        conditionGrade,
        imageUrl,
        creditCost: conditionGrade === 'GRADE_A' ? parseInt(creditCost, 10) : 0,
        qcNotes,
      };

      await adminApi.gradeItem(payload);
      showToast(`Garment "${title}" successfully graded as ${conditionGrade}!`, 'success');
      if (onGraded) onGraded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit QC grade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-300" />
            <div>
              <h3 className="font-bold text-base font-['Outfit']">Garment QC Grading Workstation</h3>
              <p className="text-xs text-purple-200">Scientific intake categorization & redirect routing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Sample Intake Presets */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Quick Garment Presets (1-Click Fill)</span>
              <span className="text-[10px] text-purple-600 font-semibold">Testing Accelerator</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Grade Tier Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">Assign Quality Grade</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setConditionGrade('GRADE_A'); setCreditCost(15); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  conditionGrade === 'GRADE_A'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-emerald-700">Grade A</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pristine • Routes to Beneficiary Store</div>
              </button>

              <button
                type="button"
                onClick={() => { setConditionGrade('GRADE_B'); setCreditCost(0); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  conditionGrade === 'GRADE_B'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-blue-700">Grade B</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Good • Bulk NGO Disaster Drives</div>
              </button>

              <button
                type="button"
                onClick={() => { setConditionGrade('RECYCLE_DOWNGRADE'); setCreditCost(0); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  conditionGrade === 'RECYCLE_DOWNGRADE'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-rose-700">Recycle</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Worn • Downcycled to Yarn/Fibers</div>
              </button>
            </div>
          </div>

          {/* Garment Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Item Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Classic Pique Cotton Polo Shirt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category & Demographic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Demographic</label>
              <select
                value={targetGender}
                onChange={(e) => setTargetGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          {/* Size & Season */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Free Size">Free Size</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="All Season">All Season</option>
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
                <option value="Monsoon">Monsoon</option>
              </select>
            </div>
          </div>

          {/* Image URL & Credit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credit Cost (For Grade A)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={creditCost}
                onChange={(e) => setCreditCost(e.target.value)}
                disabled={conditionGrade !== 'GRADE_A'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* QC Inspection Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">QC Inspector Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. UV sterilized, fabric tension normal, zipper operational."
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-700/20 disabled:opacity-50"
          >
            {loading ? 'Submitting QC Verdict...' : 'Submit QC Verdict & Publish Listing'}
          </button>
        </form>

      </div>
    </div>
  );
};
