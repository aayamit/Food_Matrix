import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NGO, FoodType } from '../types';
import { Filter, Navigation, Phone, MapPin } from 'lucide-react';

// --- Icons Setup ---
// Leaflet icons don't play nice with bundlers/ESM without config. 
// We construct simple DivIcons for custom styling.
const createIcon = (color: string) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const userIcon = L.divIcon({
  className: 'user-icon',
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const ngoIcon = createIcon('#059669'); // Emerald 600

// --- Dummy Data ---
// In a real app, fetch from Firebase Firestore
const MOCK_NGOS: NGO[] = [
  { id: '1', name: 'City Harvest', lat: 37.7749, lng: -122.4194, address: '123 Mission St, SF', acceptedTypes: ['COOKED', 'PACKAGED'], phone: '555-0101' },
  { id: '2', name: 'Food For All', lat: 37.7849, lng: -122.4094, address: '456 Market St, SF', acceptedTypes: ['RAW', 'PACKAGED'], phone: '555-0102' },
  { id: '3', name: 'Community Fridge', lat: 37.7649, lng: -122.4294, address: '789 Valencia St, SF', acceptedTypes: ['COOKED', 'RAW', 'DAIRY'], phone: '555-0103' },
  { id: '4', name: 'Shelter Kitchen', lat: 37.7549, lng: -122.4394, address: '321 Castro St, SF', acceptedTypes: ['COOKED'], phone: '555-0104' },
];

// Helper to recenter map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const DonationMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filterCooked, setFilterCooked] = useState(false);
  const [filterRaw, setFilterRaw] = useState(false);

  useEffect(() => {
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to SF if permission denied
          setUserLocation([37.7749, -122.4194]);
        }
      );
    } else {
      setUserLocation([37.7749, -122.4194]);
    }
  }, []);

  const filteredNGOs = MOCK_NGOS.filter(ngo => {
    if (!filterCooked && !filterRaw) return true; // No filter, show all
    let matches = false;
    if (filterCooked && ngo.acceptedTypes.includes('COOKED')) matches = true;
    if (filterRaw && ngo.acceptedTypes.includes('RAW')) matches = true;
    return matches;
  });

  if (!userLocation) return <div className="h-96 flex items-center justify-center bg-slate-100 rounded-2xl">Loading Map...</div>;

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center text-slate-700 font-medium mr-2">
          <Filter size={20} className="mr-2 text-emerald-600" />
          Filters:
        </div>
        
        <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border hover:bg-slate-100 transition">
          <input type="checkbox" checked={filterCooked} onChange={e => setFilterCooked(e.target.checked)} className="accent-emerald-600 rounded" />
          <span className="text-sm">Accepts Cooked</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border hover:bg-slate-100 transition">
          <input type="checkbox" checked={filterRaw} onChange={e => setFilterRaw(e.target.checked)} className="accent-emerald-600 rounded" />
          <span className="text-sm">Accepts Raw/Fresh</span>
        </label>

        <div className="flex-grow"></div>
        <div className="text-xs text-slate-400">Showing {filteredNGOs.length} locations</div>
      </div>

      {/* Map */}
      <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 relative z-0">
        <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={userLocation[0]} lng={userLocation[1]} />

          {/* User Marker */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="font-semibold text-center">You are here</div>
            </Popup>
          </Marker>

          {/* NGO Markers */}
          {filteredNGOs.map(ngo => (
            <Marker key={ngo.id} position={[ngo.lat, ngo.lng]} icon={ngoIcon}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-lg text-emerald-800 mb-1">{ngo.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    {ngo.address}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ngo.acceptedTypes.map(type => (
                      <span key={type} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                        {type.toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                    <Navigation size={14} />
                    Start Navigation
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DonationMap;
