import React, { useState } from 'react';
import { FoodInputData } from '../types';
import { Thermometer, Clock, ChefHat, Utensils } from 'lucide-react';

interface FoodFormProps {
  isLoading: boolean;
  onSubmit: (data: FoodInputData) => void;
}

const FoodForm: React.FC<FoodFormProps> = ({ isLoading, onSubmit }) => {
  const [name, setName] = useState('');
  const [isCooked, setIsCooked] = useState(true);
  const [hours, setHours] = useState(2);
  const [temp, setTemp] = useState(22);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name,
      isCooked,
      hoursSincePrep: hours,
      storageTemp: temp,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Utensils className="mr-2 text-emerald-600" size={20} />
          Food Details
        </h2>
        
        <div className="space-y-6">
          {/* Food Name */}
          <div>
            <label htmlFor="foodName" className="block text-sm font-medium text-slate-700 mb-2">
              What is the food item?
            </label>
            <input
              type="text"
              id="foodName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Curry, Cooked Rice, Salad"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Cooked Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-3">
              <ChefHat className={`w-6 h-6 ${isCooked ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <span className="block font-medium text-slate-700">Food State</span>
                <span className="text-sm text-slate-500">{isCooked ? 'Cooked / Prepared' : 'Raw / Uncooked'}</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isCooked}
                onChange={(e) => setIsCooked(e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Hours Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="hours" className="flex items-center text-sm font-medium text-slate-700">
                <Clock className="w-4 h-4 mr-1.5 text-slate-500" />
                Time since Prep/Harvest
              </label>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                {hours} hours
              </span>
            </div>
            <input
              type="range"
              id="hours"
              min="0"
              max="48"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Fresh (0h)</span>
              <span>24h</span>
              <span>48h+</span>
            </div>
          </div>

          {/* Temp Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="temp" className="flex items-center text-sm font-medium text-slate-700">
                <Thermometer className="w-4 h-4 mr-1.5 text-slate-500" />
                Storage Temperature
              </label>
              <span className={`text-sm font-bold px-2 py-1 rounded ${temp > 20 ? 'text-red-700 bg-red-50' : 'text-blue-700 bg-blue-50'}`}>
                {temp}°C
              </span>
            </div>
            <input
              type="range"
              id="temp"
              min="-10"
              max="40"
              step="1"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Frozen (-10°C)</span>
              <span>Fridge (4°C)</span>
              <span>Room (20°C+)</span>
              <span>Hot (40°C)</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg shadow-md transition-all transform active:scale-[0.98] 
          ${isLoading || !name.trim() 
            ? 'bg-slate-300 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Safety...
          </span>
        ) : (
          "Check Spoilage Risk"
        )}
      </button>
    </form>
  );
};

export default FoodForm;
