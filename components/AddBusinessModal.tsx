
import React, { useState } from 'react';
import { BusinessListing } from '../types';
import { searchBusinessOnMaps } from '../services/geminiService';

interface AddBusinessModalProps {
  onClose: () => void;
  onAdd: (business: BusinessListing) => void;
  userLocation: { lat: number; lng: number } | null;
  onOpenKeySelector?: () => void;
}

const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ onClose, onAdd, userLocation, onOpenKeySelector }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAISearch = async () => {
    if (!formData.name) return;
    setIsSearching(true);
    setError(null);
    try {
      const result = await searchBusinessOnMaps(formData.name);
      if (result && result.name) {
        setFormData({
          name: result.name,
          address: result.address || '',
          phone: result.phone || '',
        });
      } else {
        setError("No direct match found. Please fill details manually.");
      }
    } catch (e: any) {
      if (e.message === "QUOTA_EXCEEDED") {
        setError("QUOTA");
      } else {
        setError("AI search failed. Please try manual entry.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    const newBusiness: BusinessListing = {
      id: `manual-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone || 'No phone provided',
      rating: 4.5,
      reviewCount: 0,
      status: 'synced',
      lastUpdated: new Date().toISOString(),
      changes: [],
      coordinates: {
        lat: userLocation?.lat || 37.7749,
        lng: userLocation?.lng || -122.4194,
      },
      history: [
        { month: 'Oct', rating: 4.5, reviews: 0 }
      ],
      hours: {
        monday: '09:00 - 17:00',
        tuesday: '09:00 - 17:00',
        wednesday: '09:00 - 17:00',
        thursday: '09:00 - 17:00',
        friday: '09:00 - 17:00',
        saturday: 'Closed',
        sunday: 'Closed',
      }
    };

    onAdd(newBusiness);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Add Business</h3>
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-2">New Audit Entry</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Business Name</label>
              <div className="relative">
                <input 
                  required
                  type="text"
                  placeholder="e.g. Blue Bottle Coffee"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none font-bold text-sm dark:text-white pr-14"
                />
                <button
                  type="button"
                  onClick={handleAISearch}
                  disabled={!formData.name || isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                  title="Auto-fill via AI"
                >
                  {isSearching ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  )}
                </button>
              </div>
              {error === 'QUOTA' ? (
                <p className="text-[9px] font-bold text-amber-500 mt-2 px-1">
                  AI Search Limit Reached. <button type="button" onClick={onOpenKeySelector} className="underline uppercase">Change API Key</button>
                </p>
              ) : error && (
                <p className="text-[9px] font-bold text-rose-500 mt-2 px-1 uppercase tracking-tight">{error}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Full Address</label>
              <input 
                required
                type="text"
                placeholder="e.g. 123 Market St, SF"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none font-bold text-sm dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
              <input 
                type="tel"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none font-bold text-sm dark:text-white"
              />
            </div>

            <button 
              type="submit"
              disabled={isSearching}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              Start Monitoring
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessModal;
