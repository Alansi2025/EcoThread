import React, { useState, useRef } from 'react';
import { 
  X, Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  RotateCcw, ShieldCheck, QrCode, ArrowRight, Zap, RefreshCw,
  Scissors, HeartHandshake, Layers, HelpCircle, FileCheck, Send, Check
} from 'lucide-react';
import { aiApi, catalogApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PRESET_SAMPLE_GARMENTS = [
  {
    name: "Heavyweight Denim Sherpa Jacket",
    category: "Outerwear",
    fabric: "100% Cotton Denim",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=800&q=80",
    hasTears: false,
    hasStains: false,
    hasHardwareIssue: false,
    hasFading: false,
    sanitized: true,
    wearDuration: "6-12 Months"
  },
  {
    name: "Hand-Knitted Wool Cardigan (Missing Button)",
    category: "Knitwear",
    fabric: "Wool / Cashmere Blend",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
    hasTears: false,
    hasStains: false,
    hasHardwareIssue: true,
    hasFading: false,
    sanitized: true,
    wearDuration: "1-2 Years"
  },
  {
    name: "Faded Flannel Cotton Shirt",
    category: "Tops & Shirts",
    fabric: "100% Brushed Cotton",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    hasTears: false,
    hasStains: false,
    hasHardwareIssue: false,
    hasFading: true,
    sanitized: true,
    wearDuration: "> 2 Years"
  },
  {
    name: "Torn Polyester Athletic Training Jersey",
    category: "Activewear",
    fabric: "Micro-Polyester Mesh",
    image: "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80",
    hasTears: true,
    hasStains: true,
    hasHardwareIssue: false,
    hasFading: true,
    sanitized: true,
    wearDuration: "> 2 Years"
  }
];

export const AiGarmentScannerModal = ({ isOpen, onClose, onOpenPassport, onOpenNgoLocator }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [customImage, setCustomImage] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSample, setSelectedSample] = useState(PRESET_SAMPLE_GARMENTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isSubmittingToNgo, setIsSubmittingToNgo] = useState(false);
  const [isSubmittedToNgo, setIsSubmittedToNgo] = useState(false);

  // Manual defect toggles
  const [hasTears, setHasTears] = useState(false);
  const [hasStains, setHasStains] = useState(false);
  const [hasMissingButtons, setHasMissingButtons] = useState(false);
  const [hasFading, setHasFading] = useState(false);
  const [category, setCategory] = useState("Outerwear");
  const [fabric, setFabric] = useState("100% Cotton Denim");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result);
        setSelectedSample({
          name: customTitle || file.name.replace(/\.[^/.]+$/, ""),
          category: category,
          fabric: fabric,
          image: reader.result,
          hasTears: false,
          hasStains: false,
          hasHardwareIssue: false,
          hasFading: false,
          sanitized: true,
          wearDuration: "6-12 Months"
        });
        setAssessmentResult(null);
        setIsSubmittedToNgo(false);
        addToast("Custom garment image loaded! Ready for AI Scan.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample) => {
    setCustomImage(null);
    setSelectedSample(sample);
    setCategory(sample.category);
    setFabric(sample.fabric);
    setHasTears(sample.hasTears);
    setHasStains(sample.hasStains);
    setHasMissingButtons(sample.hasHardwareIssue);
    setHasFading(sample.hasFading);
    setAssessmentResult(null);
    setIsSubmittedToNgo(false);
  };

  const runAiAssessment = async () => {
    setIsScanning(true);
    setAssessmentResult(null);
    setIsSubmittedToNgo(false);

    try {
      const payload = {
        title: customTitle || selectedSample.name,
        category: category,
        fabricComposition: fabric,
        hasTears: hasTears,
        hasPermanentStains: hasStains,
        hasMissingButtonsOrZippers: hasMissingButtons,
        hasSevereFading: hasFading,
        isSanitized: true,
        photoUrl: customImage || selectedSample.image,
        campusHostelLocation: "Campus SAC Hub"
      };

      const res = await aiApi.assessGarment(payload);
      setAssessmentResult(res.data);
      addToast('AI Garment Defect & Circularity Assessment Complete!', 'success');
    } catch (err) {
      console.error('AI Assessment failed:', err);
      addToast('Error running AI Assessment', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmitFinalToNgo = async () => {
    if (!assessmentResult) return;
    setIsSubmittingToNgo(true);
    try {
      const payload = {
        title: customTitle || selectedSample.name,
        description: `Verified condition: ${assessmentResult.conditionGrade} (${assessmentResult.qualityScore || 85}/100 Quality). ${assessmentResult.decisionRationale}`,
        category: category,
        targetGender: "Unisex",
        size: "Free Size",
        season: "All Season",
        imageUrl: customImage || selectedSample.image,
        qualityScore: assessmentResult.qualityScore || 85,
        qcNotes: `Decision: ${assessmentResult.actionVerdict || 'SELL_DONATE'}. Score: ${assessmentResult.qualityScore || 85}/100.`
      };

      await catalogApi.submitDonorItem(payload);
      setIsSubmittedToNgo(true);
      addToast(`🎉 Garment successfully submitted & published to NGO store!`, 'success');
    } catch (err) {
      console.error('Failed to submit item to NGO:', err);
      addToast('Error submitting to NGO network', 'error');
    } finally {
      setIsSubmittingToNgo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  EcoGrade AI v2.4
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  Defect & Recovery Vision Engine
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1">AI Garment Defect & Circularity Scanner</h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Analyze clothing photos for physical wear, tears, stains, and quantify optimal circular recovery paths.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Garment Photo & AI Scanner Camera HUD (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 aspect-[4/3] bg-slate-900 group shadow-inner">
              <img 
                src={selectedSample.image} 
                alt={selectedSample.name} 
                className="w-full h-full object-cover"
              />

              {/* Live Scanner Camera Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl animate-pulse"></div>
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/50 text-center shadow-xl">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-white block">Evaluating Weave & Seams...</span>
                    <span className="text-[10px] text-emerald-300">Scanning for tears, pilling & stains</span>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" /> Photo Analysis Active
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Subject:</span>
                <span className="text-xs font-bold line-clamp-1">{selectedSample.name}</span>
                <span className="text-[10px] text-emerald-300 block">{category} • {fabric}</span>
              </div>
            </div>

            {/* Upload or Camera Click Input Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                📸 Upload / Click Photo of Your Garment:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Blue Silk Kurta)..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Snap</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>
            </div>

            {/* Quick Sample Selector */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Or Test with Demo Garment Specimens:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLE_GARMENTS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(s)}
                    className={`p-2 text-left rounded-xl border text-xs transition-all flex items-center space-x-2 ${
                      selectedSample.name === s.name 
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img src={s.image} alt={s.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <span className="line-clamp-2 leading-tight text-[11px]">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Button */}
            <button
              onClick={runAiAssessment}
              disabled={isScanning}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              {isScanning ? 'Analyzing Garment Physics...' : 'Execute AI Quality Assessment'}
            </button>
          </div>

          {/* Right Column: Defect Parameters & AI Circularity Analysis (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Defect Toggles & Physical Criteria Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                Physical Wear & Defect Checklist:
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                
                {/* Tears */}
                <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input 
                    type="checkbox" 
                    checked={hasTears} 
                    onChange={(e) => setHasTears(e.target.checked)} 
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className={hasTears ? "font-bold text-rose-700" : "text-slate-700"}>
                    Structural Tears / Rips
                  </span>
                </label>

                {/* Stains */}
                <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input 
                    type="checkbox" 
                    checked={hasStains} 
                    onChange={(e) => setHasStains(e.target.checked)} 
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className={hasStains ? "font-bold text-rose-700" : "text-slate-700"}>
                    Insoluble Stains / Spots
                  </span>
                </label>

                {/* Hardware */}
                <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input 
                    type="checkbox" 
                    checked={hasMissingButtons} 
                    onChange={(e) => setHasMissingButtons(e.target.checked)} 
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className={hasMissingButtons ? "font-bold text-amber-700" : "text-slate-700"}>
                    Missing Buttons / Zipper Jam
                  </span>
                </label>

                {/* Fading */}
                <label className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input 
                    type="checkbox" 
                    checked={hasFading} 
                    onChange={(e) => setHasFading(e.target.checked)} 
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className={hasFading ? "font-bold text-amber-700" : "text-slate-700"}>
                    Wash Fade / Aesthetic Age
                  </span>
                </label>
              </div>
            </div>

            {/* AI Assessment Results Card */}
            {assessmentResult ? (
              <div className="bg-white rounded-xl border-2 border-emerald-500/40 shadow-sm p-5 space-y-4 animate-fade-in">
                
                {/* Result Header & Circularity Scale Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      Verified Circular Route
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                      {assessmentResult.recommendedRoute === 'REUSE_BENEFICIARY_STORE' && '🟢 Pristine Reusable (Grade A)'}
                      {assessmentResult.recommendedRoute === 'REPAIR_AND_UPCYCLE' && '🟡 Upcyclable & Repairable (Grade A/B)'}
                      {assessmentResult.recommendedRoute === 'COMMUNITY_SHELTER_BULK' && '🟠 Community Shelter Aid (Grade B)'}
                      {assessmentResult.recommendedRoute === 'INDUSTRIAL_TEXTILE_RECYCLE' && '🟣 Industrial Fiber Shredding (Grade C)'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">
                      {assessmentResult.confidenceScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold">AI Confidence</span>
                  </div>
                </div>

                {/* Circularity Scale Visualizer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Circularity Scale:</span>
                    <span className="text-emerald-700 font-bold">{assessmentResult.confidenceLevel}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 h-2.5 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200">
                    <div className={`rounded-full transition-all ${assessmentResult.recommendedRoute === 'REUSE_BENEFICIARY_STORE' ? 'bg-emerald-500 shadow-sm' : 'bg-slate-200'}`} title="1. Reusable Store"></div>
                    <div className={`rounded-full transition-all ${assessmentResult.recommendedRoute === 'REPAIR_AND_UPCYCLE' ? 'bg-yellow-400 shadow-sm' : 'bg-slate-200'}`} title="2. Upcycle & Repair"></div>
                    <div className={`rounded-full transition-all ${assessmentResult.recommendedRoute === 'COMMUNITY_SHELTER_BULK' ? 'bg-amber-500 shadow-sm' : 'bg-slate-200'}`} title="3. Community Aid"></div>
                    <div className={`rounded-full transition-all ${assessmentResult.recommendedRoute === 'INDUSTRIAL_TEXTILE_RECYCLE' ? 'bg-purple-500 shadow-sm' : 'bg-slate-200'}`} title="4. Mechanical Recycling"></div>
                    <div className={`rounded-full transition-all ${assessmentResult.conditionGrade === 'GRADE_C' ? 'bg-indigo-500 shadow-sm' : 'bg-slate-200'}`} title="5. Non-Landfill Waste Alternative"></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
                    <span>Reusable</span>
                    <span>Repair</span>
                    <span>Community</span>
                    <span>Recycled</span>
                    <span>Zero Waste</span>
                  </div>
                </div>

                {/* AI Rationale */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Google Cloud Vision & AI Rationale:</span>
                  <p className="leading-relaxed">{assessmentResult.decisionRationale}</p>
                  {assessmentResult.detectedFactors && assessmentResult.detectedFactors.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {assessmentResult.detectedFactors.map((factor, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Destination & Environmental LCA Saving */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Assigned Destination:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{assessmentResult.recommendedDestination}</span>
                  </div>
                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">LCA Diverted Impact:</span>
                    <span className="font-bold text-teal-950 mt-0.5 block">
                      💧 {assessmentResult.estimatedWaterSavedLiters} L Water | 🌿 {assessmentResult.estimatedCo2SavedKg} kg CO₂
                    </span>
                  </div>
                </div>

                {/* Dynamic Quality Score & NGO Route Banner (<50 Recycle, >=50 Sell/Donate) */}
                <div className={`p-4 rounded-xl border-2 flex items-center justify-between gap-3 ${
                  (assessmentResult.qualityScore ?? 85) >= 50
                    ? 'bg-emerald-50 border-emerald-500/50 text-emerald-950'
                    : 'bg-rose-50 border-rose-500/50 text-rose-950'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        (assessmentResult.qualityScore ?? 85) >= 50
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}>
                        {(assessmentResult.qualityScore ?? 85) >= 50 ? 'Approved to Sell / Donate' : 'Designated for Recycling'}
                      </span>
                      <span className="text-xs font-bold font-mono">
                        Score: {assessmentResult.qualityScore ?? 85}/100
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-slate-700 font-medium">
                      {(assessmentResult.qualityScore ?? 85) >= 50
                        ? '✅ Quality is ≥ 50: Fabric weave & integrity verified. Safe for direct community beneficiary store & NGO redistribution.'
                        : '⚠️ Quality is < 50: Structural rips, stains, or critical defects detected. Routing to textile fiber shredding for zero landfill.'}
                    </p>
                  </div>
                </div>

                {/* Final Submit to NGO Network Button */}
                <div className="p-3 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold block text-emerald-400">Final Step: Push Item to NGO Partner Network</span>
                    <span className="text-slate-300 text-[11px]">Publishes image, AI score ({assessmentResult.qualityScore ?? 85}/100), and defects to NGO inventory.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitFinalToNgo}
                    disabled={isSubmittingToNgo || isSubmittedToNgo}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-md ${
                      isSubmittedToNgo
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {isSubmittedToNgo ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submitted to NGO Website</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isSubmittingToNgo ? 'Publishing...' : 'Submit Final Item to NGO'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Next Steps List */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Workflow Steps:</span>
                  {assessmentResult.suggestedNextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenPassport) onOpenPassport(assessmentResult.generatedPassportId);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    Issue Digital Passport ({assessmentResult.generatedPassportId})
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenNgoLocator) onOpenNgoLocator(assessmentResult);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Match to Nearby NGO
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-3">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Ready for Vision Inference</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Select a garment specimen or configure defects on the left, then click "Execute AI Quality Assessment".
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="italic">
            Standards compliance: WRAP Textile LCA Benchmark • ISO 14040 Life-cycle Assessment Standards.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
