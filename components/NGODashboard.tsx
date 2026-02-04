
import React, { useState } from 'react';
import { DonationItem, User } from '../types';
import CountdownTimer from './CountdownTimer';
import { MapPin, Package, AlertTriangle, Truck, Clock, CheckCircle } from 'lucide-react';

interface NGODashboardProps {
  user: User;
  donations: DonationItem[];
  onClaim: (donationId: string, eta: string) => void;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ user, donations, onClaim }) => {
  // Filter out expired items for the main view, or keep them but grayed out
  // Only show unclaimed items or items claimed by THIS NGO
  const activeDonations = donations
    .filter(d => !d.claimedBy || d.claimedBy === user.uid)
    .sort((a, b) => a.expiresAt - b.expiresAt);

  // State for Claim Modal
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);
  const [eta, setEta] = useState('');

  const handleClaimClick = (id: string) => {
    setSelectedDonation(id);
    setEta('30 mins'); // Default
  };

  const submitClaim = () => {
    if (selectedDonation && eta) {
      onClaim(selectedDonation, eta);
      setSelectedDonation(null);
      setEta('');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Available Food Stream</h2>
           <p className="text-slate-500">Real-time view of safe donations in your area.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full">
            {activeDonations.length} items available
          </span>
        </div>
      </div>

      {activeDonations.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Package className="mx-auto w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No donations available right now</h3>
          <p className="text-slate-400">Check back later or expand your search area.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDonations.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all hover:shadow-md ${item.claimedBy === user.uid ? 'border-purple-200 ring-1 ring-purple-300' : 'border-slate-200'}`}>
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                   <h3 className="font-bold text-xl text-slate-900">{item.foodName}</h3>
                   <span className={`text-xs font-bold px-2 py-1 rounded border ${
                     item.riskScore < 30 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                   }`}>
                     Risk: {item.riskScore}%
                   </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Spoilage Timer</span>
                    <CountdownTimer expiresAt={item.expiresAt} />
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full w-2/3 opacity-50"></div> 
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-2">{item.pickupAddress}</span>
                  </div>
                  <div className="flex items-center">
                    <Package size={16} className="mr-2 text-slate-400" />
                    Donor: {item.donorName}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-start">
                   <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                   {item.handlingInstructions}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                 {item.claimedBy === user.uid ? (
                    <div className="w-full py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold flex items-center justify-center space-x-2 border border-purple-200">
                      <CheckCircle size={16} />
                      <span>Claimed (ETA: {item.pickupEta})</span>
                    </div>
                 ) : (
                    <button 
                      onClick={() => handleClaimClick(item.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Truck size={16} />
                        <span>Claim & Pickup</span>
                    </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLAIM MODAL */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Pickup</h3>
            <p className="text-sm text-slate-500 mb-4">Provide an ETA so the donor knows when to expect you.</p>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Arrival Time</label>
            <div className="relative mb-6">
              <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="e.g. 15 mins, 2:30 PM"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedDonation(null)}
                className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={submitClaim}
                disabled={!eta}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
