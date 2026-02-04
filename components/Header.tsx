
import React, { useState } from 'react';
import { LayoutGrid, User as UserIcon, LogOut, Bell, Check } from 'lucide-react';
import { User, Notification } from '../types';

interface HeaderProps {
  user: User | null;
  notifications: Notification[];
  onAuthClick: () => void;
  onLogout: () => void;
  onMarkRead: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, onAuthClick, onLogout, onMarkRead }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter notifications for the current user
  const myNotifications = notifications.filter(n => {
    if (!user) return false;
    if (n.targetUserId === 'ALL_NGOS' && user.role === 'NGO') return true;
    return n.targetUserId === user.uid;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-slate-900 text-white shadow-lg relative z-50 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
            <LayoutGrid size={24} className="text-white md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Food Matrix</h1>
            <p className="text-slate-400 text-xs md:text-sm hidden sm:block">Intelligent Redistribution System</p>
          </div>
        </div>

        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors relative border border-slate-700"
                >
                  <Bell size={20} className="text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20 text-slate-900 animate-fade-in-up">
                      <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-sm flex justify-between">
                        <span>Notifications</span>
                        <span className="text-slate-400 text-xs">{myNotifications.length} Total</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {myNotifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                        ) : (
                          myNotifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => onMarkRead(n.id)}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-emerald-50/50' : ''}`}
                            >
                              {!n.isRead && <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-emerald-500"></div>}
                              <p className="text-sm text-slate-800 mb-1 ml-3">{n.message}</p>
                              <span className="text-xs text-slate-400 ml-3">{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user.displayName || user.email}</div>
                <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">{user.role}</div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors flex items-center border border-slate-700"
                title="Log Out"
              >
                <LogOut size={20} className="text-slate-300" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <UserIcon size={18} />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
