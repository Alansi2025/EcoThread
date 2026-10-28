import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  RotateCcw, ShieldCheck, QrCode, ArrowRight, Zap, RefreshCw,
  Scissors, HeartHandshake, Layers, HelpCircle, FileCheck, Send, Check,
  Droplet, Globe2, AlertCircle
} from 'lucide-react';
import { aiApi, catalogApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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
    name: "Pure Cotton Casual Button-Down Shirt",
    category: "Tops & Shirts",
    fabric: "100% Organic Cotton",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    hasTears: false,
    hasStains: false,
    hasHardwareIssue: false,
    hasFading: false,
    sanitized: true,
    wearDuration: "3-6 Months"
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

export const DonorAiIntakeSection = ({ onOpenPassport, onOpenNgoLocator }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
  const [size, setSize] = useState("M");

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
          hasTears: hasTears,
          hasStains: hasStains,
          hasHardwareIssue: hasMissingButtons,
          hasFading: hasFading,
          sanitized: true,
          wearDuration: "Custom Upload"
        });
        setAssessmentResult(null);
        setIsSubmittedToNgo(false);
        showToast("Garment photo loaded! Click 'Analyze Quality & Status' to inspect.", "info");
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
      showToast('AI Quality & Wear Assessment Complete!', 'success');
    } catch (err) {
      console.error('AI Assessment failed:', err);
      showToast('Error running AI Assessment. Please try again.', 'error');
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
        size: size,
        season: "All Season",
        imageUrl: customImage || selectedSample.image,
        qualityScore: assessmentResult.qualityScore || 85,
        qcNotes: `Verdict: ${assessmentResult.actionVerdict || 'SELL_DONATE'}. Score: ${assessmentResult.qualityScore || 85}/100. Defect flags: ${hasTears ? 'Tears ' : ''}${hasStains ? 'Stains ' : ''}${!hasTears && !hasStains ? 'No major defects' : ''}`
      };

      await catalogApi.submitDonorItem(payload);
      setIsSubmittedToNgo(true);
      showToast(`🎉 Item submitted! It is now shared and visible in the NGO store portal.`, 'success');
    } catch (err) {
      console.error('Failed to submit item to NGO:', err);
      showToast('Failed to publish item to NGO store', 'error');
    } finally {
      setIsSubmittingToNgo(false);
    }
  };

  const activeImage = customImage || selectedSample.image;
  const isApproved = assessmentResult && (assessmentResult.qualityScore >= 50 || assessmentResult.actionVerdict === 'SELL_DONATE');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Google Cloud Vision AI • Garment Quality & Defect Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit']">
              Add Clothes & Verify with AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Take a camera photo or upload an image of your dress or clothing. Cloud Vision inspects wear & tear, tears, and defects: items scoring <strong>≥ 50</strong> are approved for NGO store donation, while items <strong>&lt; 50</strong> are routed for industrial textile recycling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 text-emerald-200 border border-white/15">
              Automated NGO Sync
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Capture & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Live Camera Snapshot & File Upload Actions */}
            <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50 aspect-4/3 flex flex-col items-center justify-center shadow-inner">
              {activeImage ? (
                <>
                  <img 
                    src={activeImage} 
                    alt="Garment Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Click a Camera Picture or Upload</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                    Capture clear lighting of garment fabric, collars, and seams for defect detection.
                  </p>
                </div>
              )}

              {/* Hidden file & camera inputs */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
            </div>

            {/* Camera / Upload buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Click Camera Photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload From Device</span>
              </button>
            </div>

            {/* Quick Demo Garments */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or Select Preset Test Garment:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SAMPLE_GARMENTS.map((s, idx) => {
                  const isSelected = selectedSample.name === s.name && !customImage;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(s)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 line-clamp-1">{s.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                        <span>{s.category}</span>
                        {s.hasTears ? (
                          <span className="text-rose-600 font-bold">Has Tears</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Clean</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Garment Details & AI Inspection Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Title / Name</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={selectedSample.name}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Apparel Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Outerwear">Outerwear & Jackets</option>
                  <option value="Tops & Shirts">Tops & Shirts</option>
                  <option value="Denims & Bottoms">Denims & Bottoms</option>
                  <option value="Ethnic & Traditional">Ethnic & Traditional</option>
                  <option value="Knitwear">Knitwear & Sweaters</option>
                  <option value="Activewear">Activewear & Sports</option>
                  <option value="Dresses">Dresses & Frocks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="S">S - Small</option>
                  <option value="M">M - Medium</option>
                  <option value="L">L - Large</option>
                  <option value="XL">XL - Extra Large</option>
                  <option value="Free Size">Free Size</option>
                </select>
              </div>
            </div>

            {/* Wear & Defect Checkboxes */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Physical Wear & Tear Checklist (Vision AI Cross-Check)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTears}
                    onChange={(e) => setHasTears(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ripped / Torn</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStains}
                    onChange={(e) => setHasStains(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Stains / Marks</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMissingButtons}
                    onChange={(e) => setHasMissingButtons(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Missing Buttons</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFading}
                    onChange={(e) => setHasFading(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Color Faded</span>
                </label>
              </div>
            </div>

            {/* Run AI Assessment Button */}
            <div>
              <button
                onClick={runAiAssessment}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Google Cloud Vision AI is Inspecting Garment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Quality & Status Assessment</span>
                  </>
                )}
              </button>
            </div>

            {/* Assessment Result Panel */}
            {assessmentResult && (
              <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-white shadow-sm space-y-4 animate-fadeIn">
                
                {/* Score & Verdict Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      AI Quality Score (0–100)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black font-['Outfit'] ${
                        isApproved ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {assessmentResult.qualityScore || 85}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ 100</span>
                    </div>
                  </div>

                  {/* Verdict Badge (< 50 Recycle vs >= 50 Sell/Donate) */}
                  <div>
                    {isApproved ? (
                      <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <div>
                          <div className="leading-tight">APPROVED: SELL / DONATE</div>
                          <div className="text-[10px] text-emerald-100 font-medium">Ready for NGO Community Store (≥ 50)</div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                        <Scissors className="w-4 h-4 text-rose-200" />
                        <div>
                          <div className="leading-tight">DOWNGRADE: RECYCLE</div>
                          <div className="text-[10px] text-rose-100 font-medium">Textile Shredding & Acoustic Fiber (&lt; 50)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        isApproved ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-rose-600'
                      }`}
                      style={{ width: `${assessmentResult.qualityScore || 85}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <span>0 (Unusable / Shred)</span>
                    <span className="font-bold text-slate-700">50 (Threshold)</span>
                    <span>100 (Pristine Grade A)</span>
                  </div>
                </div>

                {/* AI Rationale & Wear Details */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800">Defect & Rationale Analysis:</div>
                  <p className="text-slate-600 leading-relaxed">
                    {assessmentResult.decisionRationale}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      Grade: <strong>{assessmentResult.conditionGrade}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium flex items-center gap-1">
                      <Droplet className="w-3 h-3" />
                      {assessmentResult.waterSavedLiters || 2700} L Water Saved
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {assessmentResult.co2SavedKg || 3.6} kg CO₂ Prevented
                    </span>
                  </div>
                </div>

                {/* Submit Final Item to NGO Button */}
                <div className="pt-2">
                  {isSubmittedToNgo ? (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Submitted & Published to NGO Store Inventory!</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-mono">
                        SYNCED TO NGO
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmitFinalToNgo}
                      disabled={isSubmittingToNgo}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-slate-900/20 active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isSubmittingToNgo ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Publishing to NGO Store Database...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-emerald-400" />
                          <span>Submit Final Item & Share AI Data with NGO</span>
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Clicking submit publishes the garment photo, quality score, and condition directly to the NGO Received Items hub.
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};

