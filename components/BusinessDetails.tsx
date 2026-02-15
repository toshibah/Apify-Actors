
import React, { useState, useEffect } from 'react';
import { BusinessListing } from '../types';
import { analyzeBusinessPerformance } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BusinessDetailsProps {
  business: BusinessListing;
  isDarkMode: boolean;
  onDelete?: (id: string) => void;
  onOpenKeySelector?: () => void;
}

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={`bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full ${className}`} />
);

const BusinessDetails: React.FC<BusinessDetailsProps> = ({ business, isDarkMode, onDelete, onOpenKeySelector }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [metricView, setMetricView] = useState<'rating' | 'reviews'>('rating');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeBusinessPerformance(business);
        setAnalysis(result || '');
      } catch (e: any) {
        if (e.message === "QUOTA_EXCEEDED") {
          setError("QUOTA");
        } else {
          setError("GENERIC");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [business.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(business.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const healthScore = business.status === 'synced' ? 98 : business.status === 'changed' ? 75 : 42;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-100/10 dark:shadow-indigo-950/10 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-700 transition-colors">
      {/* Primary Header Section */}
      <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2 md:mb-3">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{business.name}</h2>
            <div className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-sm ${
              business.status === 'alert' ? 'bg-rose-500 text-white' :
              business.status === 'changed' ? 'bg-amber-500 text-white' :
              'bg-emerald-500 text-white'
            }`}>
              {business.status}
            </div>
            {business.distance !== undefined && (
              <div className="px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {business.distance.toFixed(1)} km away
              </div>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(business.id)}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all ml-auto"
                title="Remove listing"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            )}
          </div>
          <button 
            onClick={copyToClipboard}
            className="group flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs md:text-sm font-bold"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span className="truncate">{business.address}</span>
            <span className={`text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {copied ? 'COPIED' : 'COPY'}
            </span>
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 md:p-5 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-700 min-w-[120px] md:min-w-[150px] text-center md:text-right w-full md:w-auto">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">Health Score</p>
          <div className="flex items-end justify-center md:justify-end gap-1.5">
            <span className={`text-3xl md:text-4xl font-black tracking-tighter ${
              healthScore > 80 ? 'text-emerald-500' : healthScore > 50 ? 'text-amber-500' : 'text-rose-500'
            }`}>{healthScore}</span>
            <span className="text-[9px] md:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase mb-1.5 md:mb-2">pts</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 flex-1 overflow-y-auto space-y-8 md:space-y-12 custom-scrollbar">
        {/* Metric Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <section>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-1 h-4 md:h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Listing Accuracy</h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                <span className="text-slate-400 dark:text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Phone</span>
                <span className="font-black text-slate-800 dark:text-slate-200 tracking-tight text-sm md:text-base">{business.phone}</span>
              </div>
              <div className="p-5 md:p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4">Operations</p>
                <div className="space-y-2 md:space-y-3">
                  {Object.entries(business.hours).map(([day, hrs]) => (
                    <div key={day} className="flex justify-between items-center text-[11px] md:text-xs">
                      <span className="capitalize text-slate-500 dark:text-slate-400 font-bold tracking-tight">{day}</span>
                      <span className="text-slate-900 dark:text-slate-200 font-black">{hrs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 md:h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>
                <h3 className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Performance Intelligence</h3>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setMetricView('rating')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${metricView === 'rating' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Rating
                </button>
                <button 
                  onClick={() => setMetricView('reviews')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${metricView === 'reviews' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Volume
                </button>
              </div>
            </div>
            
            <div className="h-56 md:h-64 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-50 dark:border-slate-700 p-4 md:p-6 flex flex-col shadow-inner">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {metricView === 'rating' ? business.rating.toFixed(1) : business.reviewCount}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">
                    {metricView === 'rating' ? 'Avg' : 'Total Reviews'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                  <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                  Trending
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {metricView === 'rating' ? (
                    <AreaChart data={business.history}>
                      <defs>
                        <linearGradient id="primaryChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={9} stroke="#64748b" dy={10} />
                      <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '9px', color: isDarkMode ? '#f1f5f9' : '#0f172a' }} 
                      />
                      <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#primaryChartGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: isDarkMode ? '#1e293b' : '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  ) : (
                    <BarChart data={business.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={9} stroke="#64748b" dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '9px', color: isDarkMode ? '#f1f5f9' : '#0f172a' }} 
                      />
                      <Bar dataKey="reviews" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>

        {/* AI Insight Section */}
        <section className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[32px] md:rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[32px] border border-indigo-100 dark:border-indigo-900/50 p-6 md:p-10 shadow-xl shadow-indigo-100/5 dark:shadow-indigo-950/20 relative overflow-hidden transition-colors">
            {/* Top Badge Overlay */}
            <div className="hidden sm:block absolute top-0 right-0 pt-8 md:pt-10 pr-8 md:pr-10">
               <div className="flex flex-col items-end">
                  <span className="text-[7px] md:text-[8px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-[0.2em] mb-1">Confidence</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 md:w-3 h-1 rounded-full ${i <= 4 ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-950 dark:bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20 rotate-2 transition-transform group-hover:rotate-0">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5 md:mb-2 truncate">Audit Engine</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] md:text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.15em] leading-none truncate">Automated Intelligence</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {loading ? (
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-5 md:p-7 rounded-[20px] md:rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-inner space-y-4">
                  <div className="space-y-2.5">
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-[95%]" />
                    <SkeletonLine className="h-4 w-[85%]" />
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-[70%]" />
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <SkeletonLine className="h-2 w-32" />
                  </div>
                </div>
              ) : error === 'QUOTA' ? (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/50 flex flex-col items-center text-center">
                  <svg className="w-10 h-10 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-2">Quota Exceeded</h4>
                  <p className="text-xs font-bold text-amber-800/70 dark:text-amber-300/60 leading-relaxed mb-4">
                    The shared API quota for automated analysis has been reached. Please select your own API key to continue with full intelligence.
                  </p>
                  <button 
                    onClick={onOpenKeySelector}
                    className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    Configure API Key
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-5 md:p-7 rounded-[20px] md:rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-indigo-100/50 dark:group-hover:border-indigo-900 transition-colors">
                  <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-xs md:text-base selection:bg-indigo-100 dark:selection:bg-indigo-900">
                    {analysis || "Business intelligence gathering in progress..."}
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500"></div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Listing Integrity Confirmed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4">
              <button disabled={loading || error === 'QUOTA'} className={`flex-1 bg-slate-950 dark:bg-indigo-600 text-white px-6 py-3.5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center justify-center gap-2 ${(loading || error === 'QUOTA') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-indigo-900/20'}`}>
                Audit Report
              </button>
              <button disabled={loading} className={`flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-6 py-3.5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                Export Data
              </button>
            </div>
          </div>
        </section>

        {business.changes.length > 0 && (
          <section className="pb-8 md:pb-10">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-1 h-4 md:h-5 bg-rose-500 rounded-full"></div>
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Audit Exceptions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {business.changes.map((change, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-4 p-4 md:p-5 border border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10 rounded-xl md:rounded-2xl">
                  <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-rose-500 shadow-sm shrink-0"></div>
                  <span className="text-[10px] md:text-[11px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-tight">{change}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BusinessDetails;
