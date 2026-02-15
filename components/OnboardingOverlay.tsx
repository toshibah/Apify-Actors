
import React, { useState } from 'react';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to MapGuard",
    description: "Your command center for Google Maps reputation management. We monitor listing integrity so you don't have to.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  },
  {
    title: "Network Diagnostics",
    description: "Track aggregate rating momentum and critical alerts across all your managed locations at a glance.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  },
  {
    title: "Local Radar Scanner",
    description: "Use our AI-powered scanner to discover new businesses in your local area and add them to your monitoring list instantly.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  },
  {
    title: "AI Audit Engine",
    description: "Receive deep insights into customer sentiment and generate professional, automated responses to new reviews with one click.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
  }
];

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="p-10 flex flex-col items-center text-center">
          {/* Step Icon */}
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 rotate-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {steps[currentStep].icon}
            </svg>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-indigo-600 dark:bg-indigo-500' : 'w-2 bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 leading-none">
            {steps[currentStep].title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm mb-10">
            {steps[currentStep].description}
          </p>

          <div className="flex gap-3 w-full">
            {currentStep > 0 && (
              <button 
                onClick={prev}
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={next}
              className="flex-[2] px-6 py-4 rounded-2xl bg-slate-950 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
            </button>
          </div>

          <button 
            onClick={onComplete}
            className="mt-6 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
          >
            Skip Intro
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
