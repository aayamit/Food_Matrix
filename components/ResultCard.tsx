import React from 'react';
import { FoodAnalysisResult, SpoilageStatus } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Info, MapPin } from 'lucide-react';

interface ResultCardProps {
  result: FoodAnalysisResult | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (!result) return null;

  const isSafe = result.status === SpoilageStatus.SAFE;
  const isCaution = result.status === SpoilageStatus.CAUTION;
  const isReject = result.status === SpoilageStatus.REJECT;

  let statusColor = "bg-slate-100 border-slate-200 text-slate-800";
  let icon = <Info className="w-8 h-8" />;
  let title = "Unknown Status";

  if (isSafe) {
    statusColor = "bg-green-50 border-green-200 text-green-800";
    icon = <CheckCircle className="w-10 h-10 text-green-600" />;
    title = "Safe to Donate";
  } else if (isCaution) {
    statusColor = "bg-amber-50 border-amber-200 text-amber-800";
    icon = <AlertTriangle className="w-10 h-10 text-amber-600" />;
    title = "Caution Required";
  } else if (isReject) {
    statusColor = "bg-red-50 border-red-200 text-red-800";
    icon = <XCircle className="w-10 h-10 text-red-600" />;
    title = "Do Not Donate";
  }

  // Calculate percentage for progress bar color
  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className={`p-6 border-b ${statusColor} border-opacity-50 flex items-center space-x-4`}>
        <div className="flex-shrink-0 bg-white p-2 rounded-full shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="opacity-90 font-medium">Status: {result.status}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Risk Score Meter */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Spoilage Risk Score</span>
            <span className={`text-2xl font-bold ${isReject ? 'text-red-600' : isCaution ? 'text-amber-600' : 'text-green-600'}`}>
              {result.risk_score}/100
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${getRiskColor(result.risk_score)}`}
              style={{ width: `${result.risk_score}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">0 = Fresh, 100 = Spoiled</p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2 text-slate-400" />
              Analysis
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {result.reason}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-slate-400" />
              Handling Instructions
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {result.handling_instruction}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {isSafe && (
          <div className="pt-4 border-t border-slate-100">
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Find Nearby Food Bank</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Locating nearest verified distribution centers...
            </p>
          </div>
        )}

        {isReject && (
           <div className="pt-4 border-t border-slate-100">
           <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-medium text-center">
             Item marked for composting/disposal
           </div>
         </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
