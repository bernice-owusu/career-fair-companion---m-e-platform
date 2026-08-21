import React from 'react';
import { Sparkles, Shield, User, QrCode } from 'lucide-react';
import { EventConfig } from '../../types';

interface HeaderProps {
  config: EventConfig;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenEntranceQR: () => void;
  currentParticipantName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isAdmin,
  onToggleAdmin,
  onOpenEntranceQR,
  currentParticipantName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate tracking-tight">
              {config.eventName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isAdmin ? 'M&E Monitoring Center' : (currentParticipantName ? `Participant: ${currentParticipantName}` : 'Digital Companion & PWA')}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Entrance QR Generator / Poster */}
          <button
            onClick={onOpenEntranceQR}
            title="Show Entrance QR Code"
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Entrance QR</span>
          </button>

          {/* Role Switcher */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm ${
              isAdmin
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isAdmin ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>M&E Admin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

