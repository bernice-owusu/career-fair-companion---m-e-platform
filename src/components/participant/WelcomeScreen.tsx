import React from 'react';
import { Sparkles, ArrowRight, ScanLine, UserPlus, ScrollText, Calendar, MapPin, Clock, QrCode, ShieldCheck, Star } from 'lucide-react';
import { EventConfig } from '../../types';

interface WelcomeScreenProps {
  config: EventConfig;
  onPreRegistered: () => void;
  onWalkIn: () => void;
  onPreRegisterOnline: () => void;
  lastParticipant?: { id: string; fullName: string; code: string } | null;
  onResumeSession?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  config,
  onPreRegistered,
  onWalkIn,
  onPreRegisterOnline,
  lastParticipant,
  onResumeSession,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto animate-fadeIn">
      {/* Event Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange/15 border border-orange/25 text-navy text-xs font-semibold mb-5">
        <Sparkles className="w-3.5 h-3.5 text-orange" />
        <span>Official Event Digital Companion</span>
      </div>

      {/* Main Title & Description */}
      <div className="text-center space-y-3 mb-7">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight leading-tight">
          Welcome to <br />
          <span className="text-orange">
            {config.eventName}
          </span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          Your interactive digital passport for today's career fair. Check in, verify booth sessions,
          submit reflections, and earn your completion certificate.
        </p>
      </div>

      {/* Event Details Card */}
      <div className="w-full bg-white border border-slate-100 rounded-lg p-4 sm:p-5 mb-7 shadow-card space-y-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Calendar className="w-4 h-4 text-orange shrink-0" />
          <span>
            {new Date(config.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Clock className="w-4 h-4 text-orange shrink-0" />
          <span>1:00 PM GMT</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">{config.eventLocation}</span>
        </div>
      </div>

      {/* Saved Session */}
      {lastParticipant && onResumeSession && (
        <div className="bg-orange/10 border border-orange/40 rounded-lg p-4 shadow-card mb-4 w-full">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy">
              Saved Session Found
            </span>
            <span className="text-xs font-mono font-bold bg-orange/20 px-2 py-0.5 rounded-full text-navy border border-orange/40">
              {lastParticipant.code}
            </span>
          </div>
          <button
            onClick={onResumeSession}
            className="w-full py-3.5 px-5 rounded-full bg-teal hover:bg-teal/90 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue as {lastParticipant.fullName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pre-Registered? Landing Choice */}
      <div className="w-full space-y-3 mb-6">
        <h2 className="text-center text-lg font-bold text-navy tracking-tight">
          Have you pre-registered?
        </h2>

        <button
          onClick={onPreRegistered}
          className="w-full py-5 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors group flex items-center justify-center gap-3"
        >
          <ScanLine className="w-6 h-6" />
          <span>I Pre-Registered</span>
          <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-[11px] text-slate-500 -mt-1">
          Enter the code you received by email to check in.
        </p>

        <button
          onClick={onWalkIn}
          className="w-full py-5 px-6 rounded-full bg-white border-2 border-teal/60 text-navy font-bold text-base transition-colors group flex items-center justify-center gap-3 hover:bg-teal/10"
        >
          <UserPlus className="w-6 h-6" />
          <span>I Did Not Pre-Register</span>
          <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-[11px] text-slate-500 -mt-1">
          Register in person in less than a minute.
        </p>
      </div>

      {/* Tertiary: pre-register online */}
      <button
        onClick={onPreRegisterOnline}
        className="text-xs text-slate-500 hover:text-orange transition flex items-center gap-1.5 mb-6"
      >
        <ScrollText className="w-3.5 h-3.5" />
        <span>New attendee? Pre-register online before the event</span>
      </button>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-slate-100 text-center">
        <div className="p-2.5 rounded-md bg-white border border-slate-100">
          <QrCode className="w-5 h-5 text-orange mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-navy">100% Digital</p>
          <p className="text-[10px] text-slate-500">Zero paper forms</p>
        </div>
        <div className="p-2.5 rounded-md bg-white border border-slate-100">
          <ShieldCheck className="w-5 h-5 text-slate-500 mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-navy">Verified Codes</p>
          <p className="text-[10px] text-slate-500">Booth facilitators</p>
        </div>
        <div className="p-2.5 rounded-md bg-white border border-slate-100">
          <Star className="w-5 h-5 text-blue mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-navy">4+ Booth Target</p>
          <p className="text-[10px] text-slate-500">Track milestones</p>
        </div>
      </div>
    </div>
  );
};