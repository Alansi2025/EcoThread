import React, { useState } from 'react';
import { 
  Calculator, 
  Droplet, 
  Globe2, 
  TreePine, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Minus, 
  RotateCcw,
  Layers
} from 'lucide-react';

const GARMENT_TYPES = [
  { id: 'shirts', name: 'Cotton Shirts & Tops', water: 2700, co2: 3.6, weight: 0.35, defaultCount: 4 },
  { id: 'denims', name: 'Denim Jeans & Trousers', water: 8000, co2: 11.5, weight: 0.70, defaultCount: 2 },
  { id: 'jackets', name: 'Winter Coats & Jackets', water: 4500, co2: 8.2, weight: 1.10, defaultCount: 1 },
  { id: 'kids', name: "Kids & Infant Wear", water: 1500, co2: 1.8, weight: 0.20, defaultCount: 3 },
  { id: 'linens', name: 'Bed Linens & Blankets', water: 3200, co2: 4.0, weight: 0.85, defaultCount: 1 },
];

export const EcoImpactCalculator = ({ onScheduleWithItems }) => {
  const [counts, setCounts] = useState({
    shirts: 4,
    denims: 2,
    jackets: 1,
    kids: 3,
    linens: 1,
  });

  const updateCount = (id, delta) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(50, (prev[id] || 0) + delta)),
    }));
  };

  const resetCalculator = () => {
    setCounts({ shirts: 4, denims: 2, jackets: 1, kids: 3, linens: 1 });
  };

  // Calculations
  const totalItems = Object.entries(counts).reduce((sum, [, count]) => sum + count, 0);
  
  const totalWater = GARMENT_TYPES.reduce((sum, g) => sum + (counts[g.id] || 0) * g.water, 0);
  const totalCo2 = GARMENT_TYPES.reduce((sum, g) => sum + (counts[g.id] || 0) * g.co2, 0);
  const totalWeightKg = GARMENT_TYPES.reduce((sum, g) => sum + (counts[g.id] || 0) * g.weight, 0);
  
  const treesEquivalent = (totalCo2 / 21.0).toFixed(1); // 1 tree absorbs ~21kg CO2/yr
  const showersSaved = Math.round(totalWater / 150);     // 1 shower = ~150L
  const taxExemptionEst = Math.round(totalItems * 250);  // ~₹250 per garment indicative 80G value
  const estimatedBags = Math.max(1, Math.ceil(totalWeightKg / 4.0));

  const handleApply = () => {
    const includedTypes = GARMENT_TYPES
      .filter((g) => (counts[g.id] || 0) > 0)
      .map((g) => `${counts[g.id]}x ${g.name}`);

    if (onScheduleWithItems) {
      onScheduleWithItems({
        bagCount: estimatedBags,
        estimatedWeightKg: Math.round(totalWeightKg * 10) / 10,
        clothTypes: includedTypes.join(', ') || 'Assorted Clean Garments',
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/50 shadow-2xl relative overflow-hidden mb-8">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-800/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Calculator className="w-3.5 h-3.5" />
              <span>Real-Time Environmental Savings Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit']">
              Live Garment Eco-Impact & Tax Calculator 🌱
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Adjust your wardrobe intake items below to calculate instant drinking water conserved, greenhouse carbon prevented, and 80G tax deductions.
            </p>
          </div>

          <button
            onClick={resetCalculator}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 transition-all bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Counts</span>
          </button>
        </div>

        {/* Content: Left Inputs + Right Live Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* Garment Selector Sliders */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
              <span>Select Garment Types</span>
              <span className="text-slate-400 text-[11px] font-normal">{totalItems} Total Garments (~{totalWeightKg.toFixed(1)} Kg)</span>
            </div>

            <div className="space-y-2.5">
              {GARMENT_TYPES.map((g) => {
                const count = counts[g.id] || 0;
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-emerald-900/60 hover:border-emerald-700/80 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-200">{g.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-blue-300">{g.water.toLocaleString()} L water</span>
                        <span>•</span>
                        <span className="text-emerald-300">{g.co2} kg CO₂</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => updateCount(g.id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all disabled:opacity-30"
                        disabled={count <= 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-sm text-emerald-300">
                        {count}
                      </span>
                      <button
                        onClick={() => updateCount(g.id, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Live Impact Offsets Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-emerald-700/50 shadow-inner space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Calculated Ecological Offsets</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Verified Benchmarks
                </span>
              </div>

              {/* Metric 1: Water */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-950/40 border border-blue-900/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-blue-200 font-['Outfit']">
                    {totalWater.toLocaleString()} Liters
                  </div>
                  <div className="text-[11px] text-blue-300/80">
                    Conserves ~{showersSaved} average showers of fresh drinking water
                  </div>
                </div>
              </div>

              {/* Metric 2: CO2 */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-200 font-['Outfit']">
                    {totalCo2.toFixed(1)} Kg CO₂
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Equivalent to the annual carbon absorption of {treesEquivalent} urban trees
                  </div>
                </div>
              </div>

              {/* Metric 3: Section 80G Value */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-purple-950/40 border border-purple-900/50">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-200 font-['Outfit']">
                    ₹{taxExemptionEst.toLocaleString()} In-Kind
                  </div>
                  <div className="text-[11px] text-purple-300/80">
                    Indicative 80G tax receipt valuation (50% taxable deduction)
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action: Apply directly to pickup */}
            <button
              onClick={handleApply}
              disabled={totalItems === 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Schedule Pickup with These {totalItems} Items ({estimatedBags} Bags)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
