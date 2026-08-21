import React, { useState } from 'react';
import { Sparkles, CheckCircle, ShieldCheck, MapPin, Calendar, ArrowRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventConfig } from '../../types';

interface CheckInScreenProps {
  participant: Participant;
  config: EventConfig;
  onCheckInSuccess: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  participant,
  config,
  onCheckInSuccess,
}) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckIn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsCheckedIn(true);
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center">
      {!isCheckedIn ? (
        <div className="w-full space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Event Check-In
            </h1>
            <p className="text-sm font-semibold text-indigo-400">
              {config.eventName}
            </p>
          </div>

          {/* Participant Verification Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-3.5 shadow-xl">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Participant Name
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {participant.fullName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Code</span>
                <p className="text-xs font-mono font-bold text-indigo-300">{participant.code}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Institution</span>
                <p className="text-xs font-semibold text-slate-200 truncate">{participant.institution}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{config.eventLocation}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Confirming Check-In...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Check In Now</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-400">
              Recording your attendance for official event verification.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              You're Checked In! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
              Your attendance has been recorded in the event system. You can now visit booths, enter facilitator codes, and record your learning reflections.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified Attendee
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Goal</span>
              <span className="font-semibold text-white">Minimum {config.minBoothsRequired} Booths</span>
            </div>
          </div>

          <button
            onClick={onCheckInSuccess}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
