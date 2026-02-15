
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_BUSINESSES, MOCK_REVIEWS, INITIAL_STATS } from './constants';
import { BusinessListing } from './types';
import StatsOverview from './components/StatsOverview';
import BusinessList from './components/BusinessList';
import BusinessDetails from './components/BusinessDetails';
import ReviewsSection from './components/ReviewsSection';
import OnboardingOverlay from './components/OnboardingOverlay';
import AddBusinessModal from './components/AddBusinessModal';

type StatusFilter = 'all' | 'synced' | 'changed' | 'alert';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [businesses, setBusinesses] = useState<BusinessListing[]>(MOCK_BUSINESSES);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businesses[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Handle API Key selection flow for resolving 429 quota issues
  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success and refresh state (or context) if needed
      // Note: process.env.API_KEY is automatically updated in this environment
      window.location.reload(); 
    } else {
      alert("API Key selection is only available in the AI Studio execution context. If you are experiencing quota issues locally, ensure you have a valid process.env.API_KEY.");
    }
  };

  // Check for first-time user and onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  // Get user location for distance calculations
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          // Default to SF if blocked
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, []);

  // Update business distances
  useEffect(() => {
    if (userLocation) {
      const updated = businesses.map(b => ({
        ...b,
        distance: calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng)
      }));
      const hasChanged = JSON.stringify(updated.map(b => b.distance)) !== JSON.stringify(businesses.map(b => b.distance));
      if (hasChanged) {
        setBusinesses(updated);
      }
    }
  }, [userLocation, businesses.length]);

  // Handle dark mode persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const selectedBusiness = useMemo(() => 
    businesses.find(b => b.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchQuery, statusFilter]);

  const handleSelectBusiness = (b: BusinessListing) => {
    setSelectedBusinessId(b.id);
    setIsSidebarOpen(false);
  };

  const handleAddBusiness = (newBiz: BusinessListing) => {
    setBusinesses(prev => [...prev, newBiz]);
    setSelectedBusinessId(newBiz.id);
  };

  const handleDeleteBusiness = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
    if (selectedBusinessId === id) {
      const nextBiz = businesses.find(b => b.id !== id);
      setSelectedBusinessId(nextBiz?.id || null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50/30 dark:bg-slate-950/30 transition-colors duration-300">
      {showOnboarding && <OnboardingOverlay onComplete={handleCompleteOnboarding} />}
      {showAddModal && (
        <AddBusinessModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddBusiness} 
          userLocation={userLocation}
          onOpenKeySelector={handleOpenKeySelector}
        />
      )}

      {/* Main Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="w-10 h-10 md:w-11 md:h-11 bg-slate-950 dark:bg-white rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-2xl shadow-slate-200 dark:shadow-indigo-900/20 -rotate-2">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">MapGuard</h1>
            <p className="text-[9px] md:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1 opacity-70">Business Monitor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative w-32 sm:w-48 md:w-80 group">
            <input 
              type="text"
              placeholder="Filter listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent border-2 focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-100 dark:focus:border-indigo-900 focus:ring-0 transition-all text-[11px] md:text-xs font-bold dark:text-white"
            />
            <svg className="absolute left-3 md:left-4 top-2.5 md:top-3.5 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          {/* New API Key Management UI */}
          <button 
            onClick={handleOpenKeySelector}
            className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all border border-amber-100 dark:border-amber-900/50 group"
            title="Update API Key (Resolve 429 Quota)"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            )}
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex bg-slate-950 dark:bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Nav Sidebar */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex-1 min-h-0">
             <BusinessList 
                allBusinesses={businesses}
                displayBusinesses={filteredBusinesses} 
                selectedId={selectedBusinessId} 
                onSelect={handleSelectBusiness} 
                onAddBusiness={handleAddBusiness}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                userLocation={userLocation}
                onOpenKeySelector={handleOpenKeySelector}
              />
          </div>
        </aside>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-20">
            <StatsOverview stats={INITIAL_STATS} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
              <div className="xl:col-span-8">
                {selectedBusiness ? (
                  <BusinessDetails 
                    business={selectedBusiness} 
                    isDarkMode={isDarkMode} 
                    onDelete={handleDeleteBusiness}
                    onOpenKeySelector={handleOpenKeySelector}
                  />
                ) : (
                  <div className="h-64 md:h-[600px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] md:rounded-[48px] p-8 md:p-12 text-center shadow-sm">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-[28px] md:rounded-[40px] flex items-center justify-center mb-6 md:submit-10 border border-slate-100 dark:border-slate-700">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Audit Ready</h3>
                    <p className="text-slate-400 dark:text-slate-500 font-bold max-w-xs mx-auto mt-2 md:mt-4 text-xs md:text-sm leading-relaxed uppercase tracking-tighter">Select a business from the directory to start a deep scan audit.</p>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 h-full">
                {selectedBusiness ? (
                   <ReviewsSection 
                    reviews={MOCK_REVIEWS} 
                    businessName={selectedBusiness.name} 
                    onOpenKeySelector={handleOpenKeySelector}
                  />
                ) : (
                  <div className="h-48 md:h-full bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-[10px] md:text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Review Monitor Standby</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="mt-20 pt-12 pb-6 flex flex-col items-center border-t border-slate-100 dark:border-slate-800">
               <div className="flex flex-col items-center gap-4">
                <a 
                  href="mailto:support@mapguard.ai" 
                  className="group flex flex-col items-center gap-3 transition-all"
                >
                  <div className="w-px h-12 bg-gradient-to-b from-indigo-500 to-transparent group-hover:h-16 transition-all duration-500"></div>
                  <span className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    MapGuard Intelligence
                  </span>
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Floating System Bar */}
      <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl p-2 md:p-2.5 rounded-[28px] md:rounded-[32px] shadow-2xl border border-white/10 dark:border-slate-700/50 flex items-center gap-2 md:gap-3">
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[14px] md:rounded-[18px] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-110 active:scale-95">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[14px] md:rounded-[18px] text-slate-400 dark:text-slate-500 hover:text-white transition-all">
           <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <div className="w-px h-6 bg-white/5 dark:bg-slate-700/50 mx-1"></div>
        <button 
          onClick={handleOpenKeySelector}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[14px] md:rounded-[18px] text-amber-500 hover:bg-amber-500/10 transition-all"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default App;
