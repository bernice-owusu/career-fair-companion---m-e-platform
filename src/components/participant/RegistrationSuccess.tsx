import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventConfig } from '../../types';

interface RegistrationSuccessProps {
  participant: Participant;
  config: EventConfig;
  onProceedToCheckIn: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  participant,
  config,
  onProceedToCheckIn,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(participant.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center">
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-5">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Registration Complete 🎉
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 mb-6">
        Welcome, <span className="font-bold text-white">{participant.fullName}</span>! Here is your official event credential.
      </p>

      {/* Participant Digital Pass Card */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
          Your Participant Code
        </p>

        {/* Large Code with Copy */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
            {participant.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy Participant Code"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* QR Code Pass */}
        <div className="bg-white p-3.5 rounded-2xl inline-block shadow-inner mb-4">
          <QRCodeSVG
            value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
            size={140}
            level="M"
          />
        </div>

        <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <p className="font-semibold text-slate-200">{participant.institution}</p>
          <p className="text-[11px] text-slate-400">{participant.careerInterest}</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onProceedToCheckIn}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-colors flex items-center justify-center gap-2"
        >
          <span>Check In to Event Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-slate-400">
          Keep this code handy. You can also view it anytime in your Profile tab.
        </p>
      </div>
    </div>
  );
};
