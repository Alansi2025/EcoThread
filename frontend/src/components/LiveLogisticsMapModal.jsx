import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, MapPin, Truck, Building2, Navigation, Compass, Phone,
  Clock, ShieldCheck, Zap, BatteryCharging, Radio, Filter,
  RefreshCw, CheckCircle2, ArrowRight, AlertTriangle, Eye,
  Maximize2, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { trackingApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const SIMULATED_DONOR_LOCATIONS = [
  { label: 'Campus SAC - IIT Delhi (Default)', lat: 28.5458, lng: 77.1926 },
  { label: 'Hauz Khas Enclave / Green Park', lat: 28.5494, lng: 77.2001 },
  { label: 'Sarita Vihar & South Delhi Hub', lat: 28.5324, lng: 77.2912 },
  { label: 'Okhla Industrial Area Phase-III', lat: 28.5355, lng: 77.2731 },
];

// Dark-themed map style to match the UI
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e3a2f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4ade80' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1220' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

export const LiveLogisticsMapModal = ({ isOpen, onClose, selectedPickupId, onSchedulePickup }) => {
  const { addToast } = useToast();
  const [donorLocation, setDonorLocation] = useState(SIMULATED_DONOR_LOCATIONS[0]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(new Date().toLocaleTimeString());
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const timerRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

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

      if (!selectedEntity && res.data?.logisticsFleet?.length > 0) {
        setSelectedEntity({ type: 'FLEET', data: res.data.logisticsFleet[0] });
      } else if (selectedEntity?.type === 'FLEET') {
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

  // Fit map bounds to all visible markers
  useEffect(() => {
    if (!mapRef.current || !telemetry || !isLoaded) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: donorLocation.lat, lng: donorLocation.lng });

    if (filterMode !== 'NGOS') {
      telemetry?.logisticsFleet?.forEach(v => {
        bounds.extend({ lat: v.currentLat, lng: v.currentLng });
      });
    }
    if (filterMode !== 'FLEET') {
      telemetry?.ngos?.forEach(n => {
        bounds.extend({ lat: n.latitude, lng: n.longitude });
      });
    }
    mapRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
  }, [telemetry, filterMode, donorLocation, isLoaded]);

  if (!isOpen) return null;

  const mapCenter = { lat: donorLocation.lat, lng: donorLocation.lng };

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

        {/* Main Body: Google Map + Telemetry Side Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Google Map Canvas */}
          <div className="flex-1 relative bg-slate-950 overflow-hidden min-h-[350px]">
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm p-8 text-center">
                <p>Failed to load Google Maps. Please check your API key and try again.</p>
              </div>
            )}

            {!isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Compass className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={mapCenter}
                zoom={13}
                onLoad={onMapLoad}
                options={{
                  styles: DARK_MAP_STYLE,
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                  gestureHandling: 'greedy',
                }}
              >
                {/* DONOR LOCATION MARKER */}
                {(filterMode === 'ALL' || filterMode === 'ROUTE' || filterMode === 'FLEET') && (
                  <Marker
                    position={{ lat: donorLocation.lat, lng: donorLocation.lng }}
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
                      setActiveInfoWindow('donor');
                    }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 12,
                      fillColor: '#10b981',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                    }}
                    title="You (Donor)"
                  />
                )}

                {/* NGO MARKERS */}
                {(filterMode === 'ALL' || filterMode === 'NGOS' || filterMode === 'ROUTE') &&
                  telemetry?.ngos?.map((ngo) => (
                    <Marker
                      key={`ngo-${ngo.id}`}
                      position={{ lat: ngo.latitude, lng: ngo.longitude }}
                      onClick={() => {
                        setSelectedEntity({ type: 'NGO', data: ngo });
                        setActiveInfoWindow(`ngo-${ngo.id}`);
                      }}
                      icon={{
                        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                        fillColor: '#6366f1',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                        scale: 1.6,
                        anchor: new window.google.maps.Point(12, 22),
                      }}
                      title={ngo.name}
                    />
                  ))
                }

                {/* FLEET VEHICLE MARKERS */}
                {(filterMode === 'ALL' || filterMode === 'FLEET' || filterMode === 'ROUTE') &&
                  telemetry?.logisticsFleet?.map((vehicle) => (
                    <Marker
                      key={`fleet-${vehicle.id}`}
                      position={{ lat: vehicle.currentLat, lng: vehicle.currentLng }}
                      onClick={() => {
                        setSelectedEntity({ type: 'FLEET', data: vehicle });
                        setActiveInfoWindow(`fleet-${vehicle.id}`);
                      }}
                      icon={{
                        path: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z',
                        fillColor: '#f59e0b',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                        scale: 1.2,
                        anchor: new window.google.maps.Point(12, 12),
                      }}
                      title={`${vehicle.driverName} • ETA: ${vehicle.etaMinutes}m`}
                    />
                  ))
                }

                {/* ROUTE POLYLINES: Donor → Fleet → NGO */}
                {telemetry?.logisticsFleet?.map((fleetItem) => {
                  if (filterMode === 'NGOS') return null;
                  const isSelected = selectedEntity?.type === 'FLEET' && selectedEntity.data.id === fleetItem.id;
                  const targetNgo = telemetry?.ngos?.find(n => n.id === fleetItem.targetNgoId);

                  return (
                    <React.Fragment key={`route-${fleetItem.id}`}>
                      {/* Donor → Fleet Vehicle */}
                      <Polyline
                        path={[
                          { lat: donorLocation.lat, lng: donorLocation.lng },
                          { lat: fleetItem.currentLat, lng: fleetItem.currentLng },
                        ]}
                        options={{
                          strokeColor: isSelected ? '#10b981' : '#38bdf8',
                          strokeOpacity: isSelected ? 0.9 : 0.4,
                          strokeWeight: isSelected ? 4 : 2,
                          geodesic: true,
                          icons: [{
                            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                            offset: '0',
                            repeat: '16px',
                          }],
                        }}
                      />
                      {/* Fleet Vehicle → Target NGO */}
                      {targetNgo && (
                        <Polyline
                          path={[
                            { lat: fleetItem.currentLat, lng: fleetItem.currentLng },
                            { lat: targetNgo.latitude, lng: targetNgo.longitude },
                          ]}
                          options={{
                            strokeColor: isSelected ? '#f59e0b' : '#64748b',
                            strokeOpacity: isSelected ? 0.8 : 0.3,
                            strokeWeight: isSelected ? 3.5 : 1.5,
                            geodesic: true,
                            icons: [{
                              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                              offset: '0',
                              repeat: '14px',
                            }],
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </GoogleMap>
            )}

            {/* Compass / Scale Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 shadow-lg pointer-events-none">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>South Delhi Redistribution Sector (Radius: 12 km)</span>
              <span className="text-emerald-400 font-bold">• GPS Synced</span>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-xl pointer-events-none">
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

                  {/* Google Maps Directions Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${donorLocation.lat},${donorLocation.lng}&destination=${selectedEntity.data.latitude},${selectedEntity.data.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open in Google Maps
                  </a>

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
