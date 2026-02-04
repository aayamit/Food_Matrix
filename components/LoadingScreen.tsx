import React from 'react';
import { LayoutGrid } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center">
      
      {/* Logo Container with Glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl ring-1 ring-emerald-900/50 transform transition-transform hover:scale-105 duration-500">
           <LayoutGrid size={64} className="text-emerald-500" />
        </div>
      </div>
      
      {/* Text Branding */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Food <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Matrix</span>
        </h1>
        <div className="flex items-center justify-center space-x-3 text-slate-500 text-sm font-mono tracking-wider">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
           <span>INITIALIZING ML MODEL</span>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-800"></div>
        <div className="absolute h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-1/2 rounded-full animate-shimmer"></div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;