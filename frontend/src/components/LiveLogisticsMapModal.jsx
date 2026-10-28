import React, { useState, useEffect, useRef } from 'react';
import {
  X, MapPin, Truck, Building2, Navigation, Compass, Phone,
  Clock, ShieldCheck, Zap, BatteryCharging, Radio, Filter,
  RefreshCw, CheckCircle2, ArrowRight, AlertTriangle, Eye,
  Maximize2, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { trackingApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const SIMULATED_DONOR_LOCATIONS = [
  { label: 'Campus SAC - IIT Delhi (Default)', lat: 28.5458, lng: 77.1926 },
  { label: 'Hauz Khas Enclave / Green Park', lat: 28.5494, lng: 77.2001 },
  { label: 'Sarita Vihar & South Delhi Hub', lat: 28.5324, lng: 77.2912 },
  { label: 'Okhla Industrial Area Phase-III', lat: 28.5355, lng: 77.2731 },
];

export const LiveLogisticsMapModal = ({ isOpen, onClose, selectedPickupId, onSchedulePickup }) => {
  const { addToast } = useToast();
  const [donorLocation, setDonorLocation] = useState(SIMULATED_DONOR_LOCATIONS[0]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'FLEET', 'NGOS', 'ROUTE'
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'FLEET' | 'NGO', data: ... }
  const [lastPingTime, setLastPingTime] = useState(new Date().toLocaleTimeString());
  const timerRef = useRef(null);

  const fetchTelemetry = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await trackingApi.getLiveTelemetry({
        lat: donorLocation.lat,
        lng: donorLocation.lng,
        pickupId: selectedPickupId || undefined,
      });
      setTelemetry(res.data);
      setLastPingTime(new Date().toLocaleTimeString());

      // Default select the primary assigned driver if not already set
      if (!selectedEntity && res.data?.logisticsFleet?.length > 0) {
        setSelectedEntity({ type: 'FLEET', data: res.data.logisticsFleet[0] });
      } else if (selectedEntity?.type === 'FLEET') {
        // Update selected fleet vehicle telemetry dynamically
        const updated = res.data.logisticsFleet.find(v => v.id === selectedEntity.data.id);
        if (updated) setSelectedEntity({ type: 'FLEET', data: updated });
      }
    } catch (err) {
      console.error('Failed to fetch live telemetry:', err);
      if (!isSilent) addToast('Error connecting to live logistics telemetry', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, donorLocation, selectedPickupId]);

  // Auto-refresh telemetry every 3.5 seconds
  useEffect(() => {
    if (isOpen && autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchTelemetry(true);
      }, 3500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, autoRefresh, donorLocation, selectedPickupId]);

  if (!isOpen) return null;

  // Coordinate normalizer for 2D visual projection on canvas map
  // Delhi NCR bounds ~ Lat [28.52 to 28.58], Lng [77.18 to 77.30]
  const minLat = 28.525, maxLat = 28.575;
  const minLng = 77.180, maxLng = 77.305;

  const projectToMap = (lat, lng) => {
    const x = Math.min(94, Math.max(6, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.min(94, Math.max(6, (1.0 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { left: `${x}%`, top: `${y}%` };
  };

  const donorPos = projectToMap(
    telemetry?.donorLocation?.lat || donorLocation.lat,
    telemetry?.donorLocation?.lng || donorLocation.lng
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 text-slate-100">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white font-['Outfit']">
                  Live NGO & Logistics Fleet Radar
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time spatial tracking of verified shelter hubs and zero-emission delivery partner vehicles.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto refresh pill */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                autoRefresh
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Live GPS Telemetry Polling"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span className="hidden sm:inline">{autoRefresh ? 'Live Pings Active' : 'Paused'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Location Selector & Marker Filters */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Your Donor Location:
            </span>
            <select
              value={donorLocation.label}
              onChange={(e) => {
                const found = SIMULATED_DONOR_LOCATIONS.find(l => l.label === e.target.value);
                if (found) setDonorLocation(found);
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {SIMULATED_DONOR_LOCATIONS.map(l => (
                <option key={l.label} value={l.label}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Show:
            </span>
            {[
              { id: 'ALL', label: `All Entities (${(telemetry?.ngos?.length || 0) + (telemetry?.logisticsFleet?.length || 0)})` },
              { id: 'FLEET', label: `🚚 Logistics Fleet (${telemetry?.logisticsFleet?.length || 0})` },
              { id: 'NGOS', label: `🏢 Partner NGOs (${telemetry?.ngos?.length || 0})` },
              { id: 'ROUTE', label: '🎯 Active Pickup Route' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  filterMode === f.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body: Interactive Map Canvas + Telemetry Side Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Spatial Vector Map Canvas */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none min-h-[350px]">
            
            {/* Visual Radar Grid & Street Arterials */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
            
            {/* Simulated Road Arteries */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {/* Outer Ring Road arterial */}
              <path d="M 50 150 Q 300 280 800 240" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <path d="M 50 150 Q 300 280 800 240" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
              
              {/* Aurobindo Marg */}
              <path d="M 220 30 Q 350 350 480 650" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
              
              {/* Mathura Road */}
              <path d="M 680 80 Q 720 380 760 700" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

              {/* Active Route Polylines from Logistics Fleet */}
              {telemetry?.logisticsFleet?.map((fleetItem) => {
                if (filterMode === 'NGOS') return null;
                const isSelected = selectedEntity?.type === 'FLEET' && selectedEntity.data.id === fleetItem.id;
                
                // Get target NGO position
                const targetNgo = telemetry?.ngos?.find(n => n.id === fleetItem.targetNgoId);
                const startPos = projectToMap(donorLocation.lat, donorLocation.lng);
                const vanPos = projectToMap(fleetItem.currentLat, fleetItem.currentLng);
                const endPos = targetNgo ? projectToMap(targetNgo.latitude, targetNgo.longitude) : { left: '85%', top: '65%' };

                return (
                  <g key={`route-${fleetItem.id}`} className="transition-all duration-1000">
                    {/* Route Line */}
                    <line
                      x1={startPos.left}
                      y1={startPos.top}
                      x2={vanPos.left}
                      y2={vanPos.top}
                      stroke={isSelected ? '#10b981' : '#38bdf8'}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      strokeDasharray="6 4"
                      className="animate-pulse"
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                    />
                    <line
                      x1={vanPos.left}
                      y1={vanPos.top}
                      x2={endPos.left}
                      y2={endPos.top}
                      stroke={isSelected ? '#f59e0b' : '#64748b'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      strokeDasharray="5 5"
                      strokeOpacity={isSelected ? 0.8 : 0.3}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Compass / Scale Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 shadow-lg">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>South Delhi Redistribution Sector (Radius: 12 km)</span>
              <span className="text-emerald-400 font-bold">• GPS Synced</span>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-xl">
              <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-1">Radar Legend</div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
                <span>Your Doorstep Location</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900"></span>
                <span>Active Logistics Fleet (EV)</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 border border-slate-900"></span>
                <span>Partner NGO / Shelter Hub</span>
              </div>
            </div>

            {/* 1. DONOR LOCATION PIN */}
            {(filterMode === 'ALL' || filterMode === 'ROUTE' || filterMode === 'FLEET') && (
              <div
                style={donorPos}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                onClick={() => {
                  setSelectedEntity({
                    type: 'DONOR',
                    data: {
                      name: telemetry?.donorLocation?.label || donorLocation.label,
                      address: telemetry?.donorLocation?.address || 'Hauz Khas Enclave, New Delhi',
                      lat: donorLocation.lat,
                      lng: donorLocation.lng
                    }
                  });
                }}
              >
                {/* Sonar Pulse Wave */}
                <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></span>
                <div className="relative w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/40 flex items-center justify-center text-slate-950 font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                  You (Donor)
                </div>
              </div>
            )}

            {/* 2. PARTNER NGOS PINS */}
            {(filterMode === 'ALL' || filterMode === 'NGOS' || filterMode === 'ROUTE') &&
              telemetry?.ngos?.map((ngo) => {
                const pos = projectToMap(ngo.latitude, ngo.longitude);
                const isSelected = selectedEntity?.type === 'NGO' && selectedEntity.data.id === ngo.id;

                return (
                  <div
                    key={`ngo-${ngo.id}`}
                    style={pos}
                    onClick={() => setSelectedEntity({ type: 'NGO', data: ngo })}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-transform ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    <div className={`relative p-1.5 rounded-xl border shadow-lg flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 border-white text-white shadow-indigo-500/50' 
                        : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-300 hover:border-indigo-400'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    {/* Tooltip Label */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-[10px] font-medium text-slate-200 px-2 py-0.5 rounded-md shadow-md whitespace-nowrap pointer-events-none group-hover:block transition-all">
                      <span className="font-bold text-indigo-300">{ngo.name.split(' ')[0]}</span> ({ngo.distanceKm} km)
                    </div>
                  </div>
                );
              })}

            {/* 3. LOGISTICS FLEET MOVING PINS */}
            {(filterMode === 'ALL' || filterMode === 'FLEET' || filterMode === 'ROUTE') &&
              telemetry?.logisticsFleet?.map((vehicle) => {
                const pos = projectToMap(vehicle.currentLat, vehicle.currentLng);
                const isSelected = selectedEntity?.type === 'FLEET' && selectedEntity.data.id === vehicle.id;

                return (
                  <div
                    key={`fleet-${vehicle.id}`}
                    style={pos}
                    onClick={() => setSelectedEntity({ type: 'FLEET', data: vehicle })}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group transition-all duration-1000 ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    {/* Pulse beacon */}
                    <span className="absolute -inset-2 rounded-full bg-amber-400/20 animate-pulse"></span>
                    <div className={`relative p-2 rounded-2xl border shadow-xl flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-amber-500 border-white text-slate-950 shadow-amber-500/60' 
                        : 'bg-amber-950/90 border-amber-500/60 text-amber-300 hover:border-amber-400'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    {/* Live Vehicle Badge */}
                    <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-amber-500/40 text-[9px] font-bold text-amber-200 px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
                      <span>{vehicle.driverName.split(' ')[0]}</span>
                      <span className="text-emerald-400">• {vehicle.etaMinutes}m ETA</span>
                    </div>
                  </div>
                );
              })}

          </div>

          {/* Right Side: Telemetry Inspector & Feed */}
          <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between overflow-y-auto p-5 text-slate-200">
            
            {/* Top Inspector Card */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Live Inspector Telemetry
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Ping: {lastPingTime}
                </span>
              </div>

              {selectedEntity?.type === 'FLEET' && (
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-4 animate-fadeIn">
                  {/* Driver Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedEntity.data.driverPhoto}
                      alt={selectedEntity.data.driverName}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400/50"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{selectedEntity.data.driverName}</span>
                      </div>
                      <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Assigned Logistics Partner
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Vehicle Model</span>
                      <span className="font-bold text-slate-200">{selectedEntity.data.vehicleModel.split('(')[0]}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">{selectedEntity.data.vehicleId}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Live Speed & EV Charge</span>
                      <div className="flex items-center justify-between font-bold text-slate-200 mt-0.5">
                        <span>{Math.round(selectedEntity.data.speedKmh)} km/h</span>
                        <span className="text-emerald-400 flex items-center gap-0.5 text-[11px]">
                          <BatteryCharging className="w-3.5 h-3.5" /> {selectedEntity.data.batteryPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Current Telemetry Action
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {selectedEntity.data.statusText}
                    </p>
                  </div>

                  {/* Destination NGO connection */}
                  <div className="p-3 bg-slate-900/70 border border-slate-700 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Target Partner NGO:</span>
                      <span className="font-bold text-indigo-300">{selectedEntity.data.targetNgoName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Doorstep Arrival ETA:</span>
                      <span className="font-bold text-emerald-400 text-sm">{selectedEntity.data.etaMinutes} mins away</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Distance to Doorstep:</span>
                      <span className="font-bold text-slate-300">{selectedEntity.data.distanceToDonorKm} km</span>
                    </div>
                  </div>

                  {/* Call Driver Button */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedEntity.data.driverPhone}`}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Driver ({selectedEntity.data.driverPhone})</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedEntity?.type === 'NGO' && (
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3.5 animate-fadeIn">
                  <div className="h-32 rounded-xl overflow-hidden relative border border-slate-700">
                    <img
                      src={selectedEntity.data.imageUrl}
                      alt={selectedEntity.data.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-indigo-900/80 backdrop-blur-md text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> Verified Partner NGO
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedEntity.data.distanceKm} km away
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded">
                      {selectedEntity.data.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{selectedEntity.data.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {selectedEntity.data.streetAddress}, {selectedEntity.data.city}
                    </p>
                  </div>

                  {/* Urgent Needs Alert */}
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent Garment Needs
                    </span>
                    <p className="text-xs font-semibold text-amber-200">
                      {selectedEntity.data.urgentNeeds}
                    </p>
                  </div>

                  {/* Operating & Contact details */}
                  <div className="p-3 bg-slate-900/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Hours:</span>
                      <span className="font-medium">{selectedEntity.data.operatingHours}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-medium">{selectedEntity.data.contactPerson} ({selectedEntity.data.contactPhone})</span>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      if (onSchedulePickup) onSchedulePickup(selectedEntity.data);
                    }}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20"
                  >
                    <span>Schedule Free Doorstep Pickup for this NGO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedEntity?.type === 'DONOR' && (
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedEntity.data.name}</h4>
                      <p className="text-xs text-slate-400">{selectedEntity.data.address}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl text-xs space-y-1 text-slate-300">
                    <p>• Doorstep coordinates: {selectedEntity.data.lat.toFixed(4)}, {selectedEntity.data.lng.toFixed(4)}</p>
                    <p>• Active logistics partner van is currently en route for collection.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Fleet Carousel List at bottom of drawer */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Active Logistics Fleet ({telemetry?.logisticsFleet?.length || 0} Vehicles)
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {telemetry?.logisticsFleet?.map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedEntity({ type: 'FLEET', data: v })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      selectedEntity?.type === 'FLEET' && selectedEntity.data.id === v.id
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-200">{v.driverName.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400">{v.vehicleModel.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400 text-[11px]">{v.etaMinutes}m ETA</span>
                      <span className="text-[10px] text-slate-400 block">{v.speedKmh.toFixed(0)} km/h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
