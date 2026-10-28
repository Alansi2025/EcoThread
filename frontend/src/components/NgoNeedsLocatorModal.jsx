import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Navigation, Compass, AlertCircle, Phone, 
  Clock, ShieldCheck, Car, Bus, Bike, Zap, Leaf, CheckCircle2,
  ExternalLink, Filter, Search, ArrowRight
} from 'lucide-react';
import { ngoApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const SIMULATED_USER_LOCATIONS = [
  { label: 'Campus SAC - IIT Delhi (Default)', lat: 28.5458, lng: 77.1926 },
  { label: 'Hauz Khas Village & Metro', lat: 28.5494, lng: 77.2001 },
  { label: 'Sarita Vihar & South Delhi Hub', lat: 28.5324, lng: 77.2912 },
  { label: 'Okhla Industrial Area Phase-III', lat: 28.5355, lng: 77.2731 },
];

export const NgoNeedsLocatorModal = ({ isOpen, onClose, onSchedulePickup }) => {
  const { addToast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState(SIMULATED_USER_LOCATIONS[0]);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchNgos();
    }
  }, [isOpen, selectedLocation, selectedFilter]);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const res = await ngoApi.getNearbyNgos(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedFilter === 'ALL' ? '' : selectedFilter
      );
      setNgos(res.data);
    } catch (err) {
      console.error('Failed to load NGO partners:', err);
      addToast('Error loading nearby NGO partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredNgos = ngos.filter(ngo => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ngo.name.toLowerCase().includes(q) ||
      ngo.urgentNeeds.toLowerCase().includes(q) ||
      ngo.category.toLowerCase().includes(q) ||
      ngo.streetAddress.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Compass className="w-6 h-6 text-emerald-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Geo-Smart Redistribution
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> Zero-Waste Routing
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1">NGO Needs & Eco-Route Locator</h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Discover verified shelters & NGOs matching your clothes with real-time distance and travel CO₂ comparison.
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

        {/* Location & Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          {/* User Location Selector */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Location:</span>
            <select
              value={selectedLocation.label}
              onChange={(e) => {
                const found = SIMULATED_USER_LOCATIONS.find(l => l.label === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SIMULATED_USER_LOCATIONS.map(loc => (
                <option key={loc.label} value={loc.label}>{loc.label}</option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search need (e.g. Blankets, Sweaters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Garment Need Category Filter Tabs */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Urgent Need:
          </span>
          {[
            { id: 'ALL', label: 'All Urgent Needs' },
            { id: 'WINTER_WEAR', label: '❄️ Winter Warmth & Sweaters' },
            { id: 'KIDS_WEAR', label: '🧒 Children & Schoolwear' },
            { id: 'DAILY_CASUAL', label: '👕 Daily Casuals & Shawls' },
            { id: 'FORMAL_ADULT', label: '👔 Adult & Artisan Fabrics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* NGO List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Compass className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium">Calculating shortest eco-routes and emissions to partner shelters...</p>
            </div>
          ) : filteredNgos.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No verified partner shelters found for this need category.</p>
              <button 
                onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
                className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
              >
                Reset filters to view all partner shelters
              </button>
            </div>
          ) : (
            filteredNgos.map(ngo => (
              <div 
                key={ngo.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col md:flex-row gap-5"
              >
                {/* Photo Thumbnail */}
                <div className="md:w-44 h-36 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-100">
                  <img 
                    src={ngo.imageUrl} 
                    alt={ngo.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-900/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified NGO
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {ngo.distanceKm} km away
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                          {ngo.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-800 mt-1">{ngo.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">{ngo.distanceKm} km</span>
                        <span className="block text-[10px] text-slate-400">from your location</span>
                      </div>
                    </div>

                    {/* Urgent Needs Banner */}
                    <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-center gap-2">
                      <span className="p-1 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                        🚨 Urgent Need
                      </span>
                      <p className="text-xs font-semibold text-amber-900 line-clamp-1">
                        {ngo.urgentNeeds}
                      </p>
                    </div>

                    {/* Address & Hours */}
                    <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {ngo.streetAddress}, {ngo.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {ngo.operatingHours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {ngo.contactPhone} ({ngo.contactPerson})
                      </span>
                    </div>
                  </div>

                  {/* Travel CO2 Emissions Comparison Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-600" /> Travel Footprint & Eco-Choice:
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        Net Benefit: +{ngo.netCo2AvoidedKg} kg CO₂ Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      {/* Walk / Cycle */}
                      <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold">
                          <Bike className="w-3 h-3" /> Walk / Bike
                        </div>
                        <div className="text-xs font-extrabold text-emerald-800 mt-0.5">0.0 kg CO₂</div>
                        <div className="text-[9px] text-emerald-600">{ngo.walkingDurationMin} mins</div>
                      </div>

                      {/* Public Metro / Bus */}
                      <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200">
                        <div className="flex items-center justify-center gap-1 text-teal-700 font-bold">
                          <Bus className="w-3 h-3" /> Metro / Bus
                        </div>
                        <div className="text-xs font-extrabold text-teal-800 mt-0.5">{ngo.publicTransitCo2Kg} kg</div>
                        <div className="text-[9px] text-teal-600">{ngo.publicTransitDurationMin} mins</div>
                      </div>

                      {/* EV */}
                      <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-center gap-1 text-blue-700 font-bold">
                          <Zap className="w-3 h-3" /> EV Cab
                        </div>
                        <div className="text-xs font-extrabold text-blue-800 mt-0.5">{ngo.electricVehicleCo2Kg} kg</div>
                        <div className="text-[9px] text-blue-600">{ngo.drivingDurationMin} mins</div>
                      </div>

                      {/* Petrol Car */}
                      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                        <div className="flex items-center justify-center gap-1 text-slate-600 font-bold">
                          <Car className="w-3 h-3" /> Petrol Car
                        </div>
                        <div className="text-xs font-extrabold text-slate-700 mt-0.5">{ngo.petrolCarCo2Kg} kg</div>
                        <div className="text-[9px] text-slate-500">{ngo.drivingDurationMin} mins</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-slate-500 italic">
                        💡 {ngo.ecoTravelAdvice}
                      </p>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            addToast(`Direct drop-off directions generated for ${ngo.name}!`, 'success');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-slate-500" /> Get Directions
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            if (onSchedulePickup) onSchedulePickup(ngo);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-1"
                        >
                          Schedule Free Pickup <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All partner NGOs are vetted for 100% direct community redistribution with zero landfill diversion.</span>
          </div>
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
