import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, ArrowRight, Copy, Check, MailCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventConfig } from '../../types';
import { SaveTicketButton } from '../common/SaveTicketButton';

interface RegistrationSuccessProps {
  participant: Participant;
  config: EventConfig;
  emailStatus?: 'pending' | 'sent' | 'not_configured' | 'failed';
  onContinue: () => void;
  onProceedToCheckIn: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  participant,
  config,
  emailStatus = 'sent',
  onContinue,
  onProceedToCheckIn,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(participant.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detailLine = participant.currentJobTitle
    ? `${participant.currentJobTitle}${participant.highestEducation ? ` · ${participant.highestEducation}` : ''}`
    : participant.institution || participant.regionOfResidence || config.eventName;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-fadeIn">
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-teal flex items-center justify-center text-white shadow-xl shadow-teal/20 mb-5">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Pre-Registration Complete 🎉
      </h1>
      <p className="text-xs sm:text-sm text-mist/80 mb-6">
        Welcome, <span className="font-bold text-white">{participant.fullName}</span>! Here is your official event credential.
      </p>

      {/* Participant Digital Pass Card */}
      <div className="w-full bg-navy border-2 border-orange/40 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none"></div>

        <p className="text-xs font-bold uppercase tracking-widest text-orange mb-1">
          Your Registration Code
        </p>

        {/* Large Code with Copy */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
            {participant.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy Participant Code"
            className="p-2 rounded-lg bg-navy/70 hover:bg-navy/80 text-mist hover:text-white transition border border-mist/25"
          >
            {copied ? <Check className="w-4 h-4 text-mist" /> : <Copy className="w-4 h-4" />}
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

        <div className="space-y-1 text-xs text-mist/60 border-t border-mist/15 pt-3">
          <p className="font-semibold text-mist">{detailLine}</p>
          <p className="text-[11px] text-mist/60">
            {config.eventName} · {new Date(config.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Email / Delivery Note */}
      {emailStatus === 'sent' && (
        <div className="w-full bg-teal/15 border border-teal/40 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
          <MailCheck className="w-5 h-5 text-teal shrink-0" />
          <p className="text-xs text-mist/80">
            Your code was sent to <span className="font-semibold text-white">{participant.email}</span>.
            Use it at the entrance to check in on event day.
          </p>
        </div>
      )}

      {emailStatus === 'pending' && (
        <div className="w-full bg-navy/70 border border-mist/15 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
          <MailCheck className="w-5 h-5 text-mist shrink-0" />
          <p className="text-xs text-mist/80">
            Sharing your code with <span className="font-semibold text-white">{participant.email}</span>…
          </p>
        </div>
      )}

      {emailStatus === 'not_configured' && (
        <div className="w-full bg-orange/10 border border-orange/40 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
          <p className="text-xs text-mist/80">
            Your code was <span className="font-semibold text-white">not emailed yet</span> — the email
            webhook hasn't been connected. <span className="font-semibold text-white">Save this code now</span> and
            present it at the entrance to check in.
          </p>
        </div>
      )}

      {emailStatus === 'failed' && (
        <div className="w-full bg-rose-950/80 border border-rose-800 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs text-mist/80">
            The email couldn't be sent right now. <span className="font-semibold text-white">Keep this code safe</span> —
            you'll need it to check in on event day.
          </p>
        </div>
      )}

      <div className="w-full space-y-3">
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-base shadow-lg shadow-teal/30 transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue to Event Day Home</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={onProceedToCheckIn}
          className="w-full py-3.5 px-6 rounded-xl border border-mist/25 hover:border-teal/50 text-mist/80 hover:text-white font-semibold text-sm transition-colors"
        >
          Check In Now (Optional)
        </button>

        <SaveTicketButton participant={participant} config={config} />

        <p className="text-[11px] text-mist/60">
          Keep this code handy. You can also view it anytime in your Profile tab.
        </p>
      </div>
    </div>
  );
};