import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Globe2, ShieldCheck, HeartHandshake, Building2, TreePine, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fadeIn text-slate-800">
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
          Our Mission & Circular Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-['Outfit'] text-slate-900">
          Reinventing Textile Recovery on Indian University Campuses
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Every semester, thousands of kilograms of wearable clothing are discarded during hostel move-outs. EcoThread transforms this waste into life-changing aid for community shelters and certified raw materials for zero-landfill acoustic panels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Zero-Waste Campuses</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminating municipal textile disposal from university dormitories through smart sensor-monitored bins and scheduled room pickups.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Digital Product Passports</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every garment lot is certified via RFID and QR digital seals, providing 100% audited lifecycle provenance and 80G tax deductions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-['Outfit']">Community Dignity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Partnering with registered NGOs and homeless shelters to provide cleaned, Grade-A apparel packages with zero financial barrier.
          </p>
        </div>
      </div>

    </div>
  );
};

