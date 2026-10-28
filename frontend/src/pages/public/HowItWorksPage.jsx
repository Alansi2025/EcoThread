import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, Building2, Truck, CheckCircle2, Scissors, HeartHandshake, ArrowRight } from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fadeIn text-slate-800">
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
          End-to-End Workflow
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-['Outfit'] text-slate-900">
          How EcoThread Operates
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From donor camera snapshots to AI defect grading, NGO acceptance, and zero-landfill recycling.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Step 1 */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            1
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Donor Photo & AI Quality Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The donor snaps a photo or uploads a picture of their dress or clothing. Google Cloud Vision AI assesses fabric composition, tears, stains, and wear, generating a quality score from 0 to 100.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            2
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Intelligent Routing Threshold (≥ 50 vs &lt; 50)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an item scores <strong>≥ 50</strong>, it is approved for NGO donation and community redistribution. If an item scores <strong>&lt; 50</strong> (heavily torn or stained), it is earmarked for zero-landfill industrial textile shredding into acoustic insulation.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            3
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">NGO Discovery & Mutual Acceptance Lock</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Partner NGOs browse incoming verified items on their dashboard. When an NGO accepts an eligible lot, our backend locks the item to prevent duplicate claims by other shelters.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            4
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Doorstep Collection & 80G Tax Certification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field vans collect the bagged clothes from dorm rooms or homes. Upon warehouse arrival and disinfection, the donor instantly receives a downloadable Section 80G tax exemption certificate with cryptographic digital verification.
            </p>
          </div>
        </div>

      </div>

      <div className="text-center pt-6">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all"
        >
          <span>Get Started with EcoThread</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

