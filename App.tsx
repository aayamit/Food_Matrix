
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FoodForm from './components/FoodForm';
import ResultCard from './components/ResultCard';
import AuthModal from './components/AuthModal';
import DonationMap from './components/DonationMap';
import DonorDashboard from './components/DonorDashboard';
import NGODashboard from './components/NGODashboard';
import LoadingScreen from './components/LoadingScreen';
import { FoodInputData, FoodAnalysisResult, User, DonationItem, Notification } from './types';
import { checkFoodSpoilage } from './services/mlService';
import { AlertCircle, Scan, Map as MapIcon, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  // --- App Loading State ---
  const [isAppLoading, setIsAppLoading] = useState(true);

  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- View State ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'map'>('dashboard');

  // --- Global Data State ---
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- Analysis State (For Guest View) ---
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2800); 

    return () => clearTimeout(timer);
  }, []);

  // --- Notification Helpers ---
  const addNotification = (targetId: string, message: string, type: 'INFO' | 'SUCCESS' | 'ALERT' = 'INFO') => {
    const newNote: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      targetUserId: targetId,
      message,
      isRead: false,
      timestamp: Date.now(),
      type
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // --- Actions ---

  const handlePostDonation = (item: DonationItem) => {
    setDonations(prev => [item, ...prev]);
    // Broadcast notification to ALL NGOs
    addNotification('ALL_NGOS', `New Donation: ${item.foodName} available at ${item.pickupAddress}`, 'INFO');
    alert("Donation Posted! NGOs have been notified.");
  };

  const handleClaimDonation = (donationId: string, eta: string) => {
    if (!user) return;

    // Update the donation item
    setDonations(prev => prev.map(item => {
      if (item.id === donationId) {
        // Notify the Donor
        addNotification(
          item.donorId, 
          `Your ${item.foodName} has been claimed by ${user.displayName || 'an NGO'}. Pickup ETA: ${eta}`, 
          'SUCCESS'
        );
        return { ...item, claimedBy: user.uid, pickupEta: eta, claimedAt: Date.now() };
      }
      return item;
    }));

    // Notify the NGO (Self)
    addNotification(user.uid, `You claimed ${donationId}. Proceed to pickup.`, 'SUCCESS');
  };

  const handleFoodSubmitGuest = async (data: FoodInputData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await checkFoodSpoilage(data);
      setResult(analysis);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze food. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    // 1. Map View
    if (currentView === 'map') {
      return (
        <div className="animate-fade-in space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Nearby Donation Centers</h2>
            <p className="text-slate-500">Find verified NGOs that accept food donations.</p>
          </div>
          {user ? (
             <DonationMap />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Login Required</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                To view live NGO locations and coordinate donations, you need to be signed in.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Login or Sign Up
              </button>
            </div>
          )}
        </div>
      );
    }

    // 2. Logged In View
    if (user) {
      if (user.role === 'DONOR') {
        return (
          <div className="animate-fade-in">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Donor Dashboard</h2>
               <p className="text-slate-500">Analyze food safety and list items for NGOs.</p>
             </div>
             <DonorDashboard 
                user={user} 
                onPostDonation={handlePostDonation} 
                myDonations={donations.filter(d => d.donorId === user.uid)}
             />
          </div>
        );
      } else {
        return (
          <div className="animate-fade-in">
             <NGODashboard 
               user={user} 
               donations={donations} 
               onClaim={handleClaimDonation}
             />
          </div>
        );
      }
    }

    // 3. Guest View
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Check Food Safety</h2>
          <p className="text-slate-500 text-lg">
            Powered by our custom Decision Tree ML Model trained on food safety data.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-24">
             <FoodForm isLoading={isLoading} onSubmit={handleFoodSubmitGuest} />
          </div>

          <div ref={resultRef} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {result ? (
              <ResultCard result={result} />
            ) : (
              <div className="hidden lg:block bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🥗</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">No Analysis Yet</h3>
                <p className="mt-2">Enter food details to see ML risk prediction.</p>
              </div>
            )}

            {!result && (
              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors group"
              >
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-900">Are you an NGO?</h4>
                    <LayoutDashboard className="text-emerald-600 group-hover:scale-110 transition-transform" size={20} />
                 </div>
                 <p className="text-sm text-emerald-800 opacity-80">Login to view live donation feeds and pickup requests.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        user={user} 
        notifications={notifications}
        onAuthClick={() => setIsAuthModalOpen(true)} 
        onLogout={() => setUser(null)}
        onMarkRead={markNotificationRead}
      />

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex-1 py-4 text-center font-medium text-sm sm:text-base flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              currentView === 'dashboard' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {user?.role === 'NGO' ? <LayoutDashboard size={18} /> : <Scan size={18} />}
            <span>{user ? (user.role === 'NGO' ? 'NGO Feed' : 'My Dashboard') : 'Safety Check'}</span>
          </button>
          <button
            onClick={() => setCurrentView('map')}
            className={`flex-1 py-4 text-center font-medium text-sm sm:text-base flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              currentView === 'map' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapIcon size={18} />
            <span>Find NGOs</span>
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(u) => setUser(u)}
      />
    </div>
  );
};

export default App;
