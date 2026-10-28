import React from 'react';
import { LogisticsDashboard } from '../logistics/LogisticsDashboard';

export const NgoCollectionsPage = ({ onOpenNgoLocator = null }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
          Collection Fleet & Route Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live GPS radar tracking of collection vans, campus drop-box pickups, and route optimization
        </p>
      </div>

      <LogisticsDashboard onOpenNgoLocator={onOpenNgoLocator} />
    </div>
  );
};

