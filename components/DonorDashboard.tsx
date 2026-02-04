
import React, { useState, useRef } from 'react';
import FoodForm from './FoodForm';
import ResultCard from './ResultCard';
import { FoodInputData, FoodAnalysisResult, User, DonationItem, SpoilageStatus } from '../types';
import { checkFoodSpoilage } from '../services/mlService';
import { AlertCircle, Plus, ClipboardList, MapPin, Navigation } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface DonorDashboardProps {
  user: User;
  onPostDonation: (item: DonationItem) => void;
  myDonations: DonationItem[];
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, onPostDonation, myDonations }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [lastInput, setLastInput] = useState<FoodInputData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Address State
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleFoodSubmit = async (data: FoodInputData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastInput(data);

    try {
      const analysis = await checkFoodSpoilage(data);
      setResult(analysis);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze food. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // In a real app, use Reverse Geocoding API here to get text address
          setAddress("Current Location (Lat: " + position.coords.latitude.toFixed(4) + ")");
          setGettingLocation(false);
        },
        (error) => {
          alert("Could not fetch location. Please enter manually.");
          setGettingLocation(false);
        }
      );
    } else {
      alert("Geolocation not supported");
      setGettingLocation(false);
    }
  };

  const handlePostDonation = () => {
    if (!result || !lastInput || !address) {
      alert("Please provide a pickup address.");
      return;
    }

    const newItem: DonationItem = {
      id: Math.random().toString(36).substr(2, 9),
      foodName: lastInput.name,
      quantity: lastInput.quantity || '1 unit',
      riskScore: result.risk_score,
      status: result.status as SpoilageStatus,
      postedAt: Date.now(),
      expiresAt: Date.now() + (result.remaining_safe_hours > 0 ? result.remaining_safe_hours : 2) * 3600 * 1000,
      donorId: user.uid,
      donorName: user.displayName || 'Anonymous Donor',
      
      pickupAddress: address,
      pickupLat: coords?.lat,
      pickupLng: coords?.lng,
      handlingInstructions: result.handling_instruction
    };

    onPostDonation(newItem);
    setResult(null); // Clear result after posting
    setAddress(''); // Clear address
    setCoords(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Input Form */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <Plus className="mr-2 text-emerald-600" /> New Donation
        </h3>
        <FoodForm isLoading={isLoading} onSubmit={handleFoodSubmit} />
      </div>

      {/* Right Column: Analysis Result OR My Donations List */}
      <div ref={resultRef} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 1. Show Analysis Result if just analyzed */}
        {result && (
          <div className="space-y-4">
             <ResultCard result={result} />
             
             {result.status === SpoilageStatus.SAFE && (
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in-up">
                 <h4 className="font-semibold text-slate-800 flex items-center">
                   <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                   Pickup Location
                 </h4>
                 
                 <div className="space-y-3">
                   <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Enter full pickup address..." 
                        className="flex-grow px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                     />
                     <button 
                        onClick={getLocation}
                        disabled={gettingLocation}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl flex items-center justify-center transition-colors border border-slate-200"
                        title="Use GPS"
                     >
                       {gettingLocation ? <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"></div> : <Navigation size={20} />}
                     </button>
                   </div>
                   <p className="text-xs text-slate-500">Provide a clear address or use GPS so NGOs can find the item easily.</p>
                 </div>

                 <button 
                  onClick={handlePostDonation}
                  disabled={!address.trim()}
                  className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all text-lg flex items-center justify-center
                    ${!address.trim() 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                 >
                   Confirm & Post Donation
                 </button>
               </div>
             )}
          </div>
        )}

        {/* 2. Show My Active Donations List */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <ClipboardList className="mr-2 text-blue-600" /> My Active Donations
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                {myDonations.length}
              </span>
            </div>
            
            {myDonations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>You haven't posted any donations yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myDonations.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800 text-lg">{item.foodName}</h4>
                      {item.claimedBy ? (
                         <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded border border-purple-200">
                           CLAIMED - Pick up in {item.pickupEta}
                         </span>
                      ) : (
                         <CountdownTimer expiresAt={item.expiresAt} />
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mb-2 space-y-1">
                      <p>Address: <span className="font-medium text-slate-700">{item.pickupAddress}</span></p>
                      <p>Posted: {new Date(item.postedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
