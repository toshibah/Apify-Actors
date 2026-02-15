
import React from 'react';
import { MonitoringStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsOverviewProps {
  stats: MonitoringStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const cards = [
    { 
      label: 'Locations', 
      value: stats.totalBusinesses, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    },
    { 
      label: 'Critical', 
      value: stats.activeAlerts, 
      color: 'text-rose-600 dark:text-rose-400', 
      bg: 'bg-rose-50/50 dark:bg-rose-900/20',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    { 
      label: 'Avg Rating', 
      value: stats.avgRating.toFixed(1), 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50/50 dark:bg-amber-900/20',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    },
    { 
      label: 'Feedback', 
      value: stats.reviewsThisMonth, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50/50 dark:bg-blue-900/20',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></span>
        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Network Diagnostics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 md:gap-5">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group overflow-hidden relative">
              <div className="flex flex-col gap-3 relative z-10">
                <div className={`w-9 h-9 flex items-center justify-center rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-105`}>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{card.label}</p>
                  <p className={`text-xl md:text-2xl font-black ${card.color} tracking-tight leading-none`}>{card.value}</p>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.03] dark:opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
            </div>
          ))}
        </div>

        {/* Global Trend Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Aggregate Pulse</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Average sentiment across network (6M)</p>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Active Monitoring</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.history}>
                <defs>
                  <linearGradient id="globalTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={9} 
                  fontWeight="900"
                  stroke="#94a3b8" 
                  dy={10} 
                />
                <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ 
                    fontSize: '10px', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    color: '#f1f5f9' 
                  }}
                  labelStyle={{ 
                    fontSize: '9px', 
                    color: '#64748b', 
                    fontWeight: '900', 
                    marginBottom: '4px',
                    textTransform: 'uppercase'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#globalTrendGrad)" 
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
