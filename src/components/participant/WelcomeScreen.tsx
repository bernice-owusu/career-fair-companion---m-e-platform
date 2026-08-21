import React from 'react';
import { Sparkles, ArrowRight, QrCode, CheckCircle2, ShieldCheck, MapPin, Calendar, Users } from 'lucide-react';
import { EventConfig } from '../../types';

interface WelcomeScreenProps {
  config: EventConfig;
  onStartRegistration: () => void;
  totalRegistered: number;
  isFromSheets?: boolean;
  lastParticipant?: { id: string; fullName: string; code: string } | null;
  onResumeSession?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  config,
  onStartRegistration,
  totalRegistered,
  isFromSheets,
  lastParticipant,
  onResumeSession,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto">
      {/* Event Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Official Event Digital Companion</span>
      </div>

      {/* Main Title & Description */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Welcome to <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            {config.eventName}
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          Your interactive digital passport for today’s career fair. Register, check in, verify booth sessions, submit reflections, and earn your completion certificate.
        </p>
      </div>

      {/* Event Details Card */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{new Date(config.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{config.eventLocation}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{totalRegistered > 0 ? `${totalRegistered} participants registered today` : 'Open for real-time registration'}</span>
          </div>
          {isFromSheets && (
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sheet
            </span>
          )}
        </div>
      </div>

      {/* Primary Action: Start Registration or Resume */}
      <div className="w-full space-y-3">
        {lastParticipant && onResumeSession && (
          <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 shadow-lg mb-2">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Saved Session Found
              </span>
              <span className="text-xs font-mono font-bold bg-indigo-900/80 px-2 py-0.5 rounded text-indigo-200 border border-indigo-700/50">
                {lastParticipant.code}
              </span>
            </div>
            <button
              onClick={onResumeSession}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue as {lastParticipant.fullName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={onStartRegistration}
          className={`w-full group py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-colors flex items-center justify-center gap-2 ${
            lastParticipant
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40'
          }`}
        >
          <span>{lastParticipant ? 'Register as New Participant' : 'Start Registration'}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-xs text-slate-400">
          Takes less than 2 minutes. Your session stays saved on this device.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-3 gap-2 w-full mt-8 pt-6 border-t border-slate-800/60 text-center">
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <QrCode className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-slate-200">100% Digital</p>
          <p className="text-[10px] text-slate-400">Zero paper forms</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-slate-200">Verified Codes</p>
          <p className="text-[10px] text-slate-400">Booth facilitators</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <CheckCircle2 className="w-5 h-5 text-sky-400 mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-slate-200">4+ Booth Target</p>
          <p className="text-[10px] text-slate-400">Track milestones</p>
        </div>
      </div>
    </div>
  );
};
