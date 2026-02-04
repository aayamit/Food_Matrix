import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="flex items-center text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm border border-red-200">
        <Clock size={14} className="mr-1.5" />
        Spoiled / Unsafe
      </div>
    );
  }

  // Warning color if less than 1 hour
  const isUrgent = (expiresAt - Date.now()) < 3600000;

  return (
    <div className={`flex items-center font-mono font-semibold px-3 py-1 rounded-full text-sm border ${
      isUrgent ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }`}>
      <Clock size={14} className="mr-1.5" />
      {timeLeft}
    </div>
  );
};

export default CountdownTimer;
