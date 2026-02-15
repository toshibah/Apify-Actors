
import React, { useState, useMemo } from 'react';
import { BusinessListing } from '../types';
import { discoverNearbyBusinesses } from '../services/geminiService';

type StatusFilter = 'all' | 'synced' | 'changed' | 'alert';
type SortOption = 'name' | 'rating' | 'proximity';

interface BusinessListProps {
  allBusinesses: BusinessListing[];
  displayBusinesses: BusinessListing[];
  onSelect: (business: BusinessListing) => void;
  onAddBusiness: (business: BusinessListing) => void;
  selectedId: string | null;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  userLocation: { lat: number; lng: number } | null;
  onOpenKeySelector?: () => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ 
  allBusinesses, 
  displayBusinesses, 
  onSelect, 
  onAddBusiness,
  selectedId, 
  statusFilter, 
  onStatusFilterChange,
  userLocation,
  onOpenKeySelector
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('proximity');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedResults, setScannedResults] = useState<BusinessListing[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const sortedBusinesses = useMemo(() => {
    return [...displayBusinesses].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'proximity') {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      }
      return 0;
    });
  }, [displayBusinesses, sortBy]);

  const counts = useMemo(() => ({
    all: allBusinesses.length,
    synced: allBusinesses.filter(b => b.status === 'synced').length,
    changed: allBusinesses.filter(b => b.status === 'changed').length,
    alert: allBusinesses.filter(b => b.status === 'alert').length,
  }), [allBusinesses]);

  const handleScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setShowScanner(true);
    try {
      const results = await discoverNearbyBusinesses(userLocation);
      const mapped = results.map((r: any, i: number) => ({
        ...r,
        id: `scanned-${Date.now()}-${i}`,
        changes: [],
        history: [
          { month: 'Sep', rating: r.rating - 0.1, reviews: r.reviewCount - 5 },
          { month: 'Oct', rating: r.rating, reviews: r.reviewCount }
        ],
        lastUpdated: new Date().toISOString()
      }));
      setScannedResults(mapped);
    } catch (e: any) {
      if (e.message === "QUOTA_EXCEEDED") {
        setScanError("QUOTA");
      } else {
        setScanError("GENERIC");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const filterOptions = [
    { 
      id: 'all', 
      label: 'All', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
      activeClass: 'border-slate-900 dark:border-indigo-600 bg-slate-900 dark:bg-indigo-600 text-white shadow-lg shadow-slate-200 dark:shadow-indigo-900/20',
      inactiveClass: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
    },
    { 
      id: 'synced', 
      label: 'Synced', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />,
      activeClass: 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20',
      inactiveClass: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:text-emerald-600 dark:hover:text-emerald-400'
    },
    { 
      id: 'changed', 
      label: 'Updates', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      activeClass: 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-100 dark:shadow-amber-900/20',
      inactiveClass: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-amber-100 dark:hover:border-amber-900/50 hover:text-amber-600 dark:hover:text-amber-400'
    },
    { 
      id: 'alert', 
      label: 'Alerts', 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      activeClass: 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-100 dark:shadow-rose-900/20',
      inactiveClass: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-rose-100 dark:hover:border-rose-900/50 hover:text-rose-600 dark:hover:text-rose-400'
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Status Filter Grid */}
      <div className="mb-6 space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Health Pulse</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {filterOptions.map((opt) => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onStatusFilterChange(opt.id as StatusFilter)}
                className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 group ${
                  isActive ? opt.activeClass : opt.inactiveClass
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {opt.icon}
                  </svg>
                </div>
                <div className="flex flex-col items-start leading-none min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-tight truncate">{opt.label}</span>
                  <span className={`text-[11px] font-black mt-1 ${isActive ? 'text-white/80' : 'text-slate-900 dark:text-white'}`}>
                    {counts[opt.id as keyof typeof counts]}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-white animate-ping"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Area Scanner Trigger */}
      <div className="mb-8 px-1">
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="w-full group relative overflow-hidden bg-slate-900 dark:bg-indigo-600 p-4 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200 dark:shadow-indigo-900/30 disabled:opacity-50"
        >
          <div className={`w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center transition-transform group-hover:rotate-12 ${isScanning ? 'animate-spin' : ''}`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">Local Radar</h4>
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-tight">Scan area for new listings</p>
          </div>
          <div className="ml-auto">
            <svg className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
          {isScanning && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
               <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>)}
               </div>
            </div>
          )}
        </button>
      </div>

      {showScanner && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Scanner Results</h3>
            <button onClick={() => setShowScanner(false)} className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Clear</button>
          </div>
          
          <div className="space-y-3">
            {isScanning ? (
              [1, 2].map(i => (
                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
              ))
            ) : scanError === 'QUOTA' ? (
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-dashed border-amber-300 dark:border-amber-900/50 text-center">
                <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-3">Quota Limit Reached</p>
                <button 
                  onClick={onOpenKeySelector}
                  className="px-4 py-2 bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-amber-500 shadow-md shadow-amber-500/10"
                >
                  Change API Key
                </button>
              </div>
            ) : scannedResults.length > 0 ? (
              scannedResults.map((res) => (
                <div key={res.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-indigo-900 group transition-all hover:border-solid hover:shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate pr-4">{res.name}</h5>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1 py-0.5 rounded-lg">
                       <span className="text-[8px] font-black text-amber-700">{res.rating}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onAddBusiness(res);
                      setScannedResults(prev => prev.filter(r => r.id !== res.id));
                    }}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    Monitor Listing
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-center text-slate-400 font-bold py-4">No new listings detected.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Listings</h3>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">Sort:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-[10px] font-black text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer uppercase tracking-tight"
          >
            <option value="proximity">Proximity</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-20">
        {sortedBusinesses.length > 0 ? (
          sortedBusinesses.map((biz) => {
            const isSelected = selectedId === biz.id;
            return (
              <button
                key={biz.id}
                onClick={() => onSelect(biz)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                  isSelected 
                    ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-50/50 dark:shadow-indigo-900/20 ring-2 ring-indigo-50 dark:ring-indigo-900/30' 
                    : 'bg-white/40 dark:bg-slate-900/40 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black truncate text-sm leading-tight transition-colors ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {biz.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {biz.distance !== undefined && (
                        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black text-indigo-700 dark:text-indigo-400">
                           <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                           {biz.distance.toFixed(1)} km
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg text-[10px] font-black text-amber-700 dark:text-amber-400">
                        <svg className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {biz.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    biz.status === 'alert' ? 'bg-rose-500 shadow-lg shadow-rose-200 animate-pulse' :
                    biz.status === 'changed' ? 'bg-amber-500 shadow-lg shadow-amber-200' :
                    'bg-emerald-500 shadow-lg shadow-emerald-200'
                  }`}></div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessList;
