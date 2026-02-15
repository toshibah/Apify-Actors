
import React, { useState, useMemo, useEffect } from 'react';
import { Review } from '../types';
import { generateReviewResponse, getSentimentAnalysis } from '../services/geminiService';

interface ReviewsSectionProps {
  reviews: Review[];
  businessName: string;
  onOpenKeySelector?: () => void;
}

const SkeletonLine = ({ className }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full ${className}`} />
);

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, businessName, onOpenKeySelector }) => {
  const [activeResponses, setActiveResponses] = useState<Record<string, { text: string; loading: boolean; error?: string }>>({});
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<{
    overallSentiment: string;
    keyPainPoints: string[];
    positiveHighlights: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const performDeepAnalysis = async () => {
      if (reviews.length === 0) {
        setAggregatedAnalysis(null);
        return;
      }
      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        const result = await getSentimentAnalysis(reviews);
        setAggregatedAnalysis(result);
      } catch (e: any) {
        if (e.message === "QUOTA_EXCEEDED") {
          setAnalysisError("QUOTA");
        } else {
          setAnalysisError("GENERIC");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    performDeepAnalysis();
  }, [reviews]);

  const handleGenerateResponse = async (review: Review) => {
    setActiveResponses(prev => ({ ...prev, [review.id]: { text: '', loading: true } }));
    try {
      const response = await generateReviewResponse(review, businessName);
      setActiveResponses(prev => ({ ...prev, [review.id]: { text: response || '', loading: false } }));
    } catch (e: any) {
      setActiveResponses(prev => ({ 
        ...prev, 
        [review.id]: { 
          text: '', 
          loading: false, 
          error: e.message === "QUOTA_EXCEEDED" ? "QUOTA" : "GENERIC" 
        } 
      }));
    }
  };

  const sentimentStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { positivePercent: 0, criticalPercent: 0 };
    const positive = reviews.filter(r => r.rating >= 4).length;
    const critical = reviews.filter(r => r.rating <= 2).length;
    return {
      positivePercent: Math.round((positive / total) * 100),
      criticalPercent: Math.round((critical / total) * 100)
    };
  }, [reviews]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-6 duration-700">
      {/* Sentiment Overview & Deep Intelligence Card */}
      <div className="mb-8 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-5 text-center">Sentiment Profile</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl text-center border border-emerald-100/50 dark:border-emerald-900/20">
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 block mb-1 uppercase tracking-widest">Positive</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tighter">{sentimentStats.positivePercent}%</span>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl text-center border border-rose-100/50 dark:border-rose-900/20">
              <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 block mb-1 uppercase tracking-widest">Negative</span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-300 tracking-tighter">{sentimentStats.criticalPercent}%</span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l-.707.707M12 18a6 6 0 100-12 6 6 0 000 12z"/></svg>
              <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Deep Intelligence</h4>
            </div>

            {isAnalyzing ? (
              <div className="space-y-3">
                <SkeletonLine className="h-3 w-full" />
                <div className="flex flex-wrap gap-2">
                  <SkeletonLine className="h-4 w-16" />
                  <SkeletonLine className="h-4 w-24" />
                  <SkeletonLine className="h-4 w-20" />
                </div>
              </div>
            ) : analysisError === 'QUOTA' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-center">
                <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2">Analysis Throttled</p>
                <button 
                  onClick={onOpenKeySelector}
                  className="text-[8px] font-black text-amber-600 underline uppercase tracking-tighter"
                >
                  Configure Custom API Key
                </button>
              </div>
            ) : aggregatedAnalysis ? (
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  Overall Sentiment: <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[9px] font-black ml-1">{aggregatedAnalysis.overallSentiment}</span>
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Positive Highlights</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aggregatedAnalysis.positiveHighlights.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Key Pain Points</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aggregatedAnalysis.keyPainPoints.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest italic text-center py-2">No deep analysis data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Feed Header */}
      <div className="flex items-center justify-between mb-5 px-2">
        <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Latest Feedback</h3>
        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
          <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter">Live Sync</span>
        </div>
      </div>
      
      {/* Scrollable Feed */}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-32">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all group border-transparent hover:border-indigo-100/50 dark:hover:border-indigo-900/50">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[18px] bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-slate-200 dark:shadow-none transition-colors">
                  {review.author[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-[11px] truncate uppercase tracking-tight mb-1">{review.author}</h4>
                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase leading-none">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-xl shrink-0 border border-amber-100/50 dark:border-amber-900/20">
                <svg className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="ml-1 text-[10px] font-black text-amber-700 dark:text-amber-500">{review.rating}</span>
              </div>
            </div>

            <div className="relative">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6 italic line-clamp-2 group-hover:line-clamp-none transition-all">"{review.text}"</p>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
              {!activeResponses[review.id] ? (
                <button 
                  onClick={() => handleGenerateResponse(review)}
                  className="w-full py-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all uppercase tracking-widest"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Suggest Reply
                </button>
              ) : activeResponses[review.id].error === 'QUOTA' ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 text-center">Reply Generation Throttled</p>
                  <button 
                    onClick={onOpenKeySelector}
                    className="w-full py-2 bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg shadow-amber-500/10"
                  >
                    Set Paid API Key
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 dark:bg-slate-800 p-6 rounded-[28px] shadow-2xl relative overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-900/20 animate-in zoom-in-95 duration-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-[0.2em]">Smart Draft</span>
                    {!activeResponses[review.id].loading && (
                      <button 
                        onClick={() => setActiveResponses(prev => {
                          const next = {...prev};
                          delete next[review.id];
                          return next;
                        })}
                        className="text-slate-600 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                  {activeResponses[review.id].loading ? (
                    <div className="space-y-3 pb-2">
                      <div className="space-y-2">
                        <div className="h-2 bg-white/10 dark:bg-white/5 animate-pulse rounded-full w-full" />
                        <div className="h-2 bg-white/10 dark:bg-white/5 animate-pulse rounded-full w-[90%]" />
                        <div className="h-2 bg-white/10 dark:bg-white/5 animate-pulse rounded-full w-[80%]" />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <div className="flex-1 h-8 bg-white/5 animate-pulse rounded-xl" />
                        <div className="flex-1 h-8 bg-indigo-500/20 animate-pulse rounded-xl" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-white dark:text-slate-200 font-bold leading-relaxed mb-6 italic">"{activeResponses[review.id].text}"</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(activeResponses[review.id].text);
                            alert("Response copied to clipboard!");
                          }}
                          className="flex-1 bg-white/10 dark:bg-white/5 text-white py-2.5 rounded-xl text-[9px] font-black hover:bg-white/20 dark:hover:bg-white/10 transition-all uppercase tracking-widest"
                        >
                          Copy
                        </button>
                        <button className="flex-1 bg-indigo-500 text-white py-2.5 rounded-xl text-[9px] font-black hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                          Approve
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
