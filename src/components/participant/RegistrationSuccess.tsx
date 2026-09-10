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
      <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center text-white mb-5">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mb-2">
        Pre-Registration Complete 🎉
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mb-6">
        Welcome, <span className="font-bold text-navy">{participant.fullName}</span>! Here is your official event credential.
      </p>

      {/* Participant Digital Pass Card */}
      <div className="w-full bg-white border-2 border-orange/40 rounded-lg p-6 mb-6 shadow-card relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none"></div>

        <p className="text-xs font-bold uppercase tracking-widest text-navy mb-1">
          Your Registration Code
        </p>

        {/* Large Code with Copy */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-mono font-black text-navy tracking-wider">
            {participant.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy Participant Code"
            className="p-2 rounded-md bg-slate-100 hover:bg-slate-300 text-slate-500 hover:text-navy transition border border-slate-100"
          >
            {copied ? <Check className="w-4 h-4 text-navy" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* QR Code Pass */}
        <div className="bg-white border border-slate-100 p-3.5 rounded-md inline-block mb-4">
          <QRCodeSVG
            value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
            size={140}
            level="M"
          />
        </div>

        <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <p className="font-semibold text-navy">{detailLine}</p>
          <p className="text-[11px] text-slate-500">
            {config.eventName} · {new Date(config.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Email / Delivery Note */}
      {emailStatus === 'sent' && (
        <div className="w-full bg-teal/15 border border-teal/40 rounded-md p-3.5 mb-6 flex items-center gap-3 text-left">
          <MailCheck className="w-5 h-5 text-teal shrink-0" />
          <p className="text-xs text-slate-500">
            Your code was sent to <span className="font-semibold text-navy">{participant.email}</span>.
            Use it at the entrance to check in on event day.
          </p>
        </div>
      )}

      {emailStatus === 'pending' && (
        <div className="w-full bg-cream border border-slate-100 rounded-md p-3.5 mb-6 flex items-center gap-3 text-left">
          <MailCheck className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-xs text-slate-500">
            Sharing your code with <span className="font-semibold text-navy">{participant.email}</span>…
          </p>
        </div>
      )}

      {emailStatus === 'not_configured' && (
        <div className="w-full bg-orange/10 border border-orange/40 rounded-md p-3.5 mb-6 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
          <p className="text-xs text-slate-500">
            Your code was <span className="font-semibold text-navy">not emailed yet</span> — the email
            webhook hasn't been connected. <span className="font-semibold text-navy">Save this code now</span> and
            present it at the entrance to check in.
          </p>
        </div>
      )}

      {emailStatus === 'failed' && (
        <div className="w-full bg-error/10 border border-error/30 rounded-md p-3.5 mb-6 flex items-center gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-error shrink-0" />
          <p className="text-xs text-slate-500">
            The email couldn't be sent right now. <span className="font-semibold text-navy">Keep this code safe</span> —
            you'll need it to check in on event day.
          </p>
        </div>
      )}

      <div className="w-full space-y-3">
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full bg-teal hover:bg-teal/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue to Event Day Home</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={onProceedToCheckIn}
          className="w-full py-3.5 px-6 rounded-full border border-slate-300 hover:border-teal/50 text-slate-500 hover:text-navy font-semibold text-sm transition-colors"
        >
          Check In Now (Optional)
        </button>

        <SaveTicketButton participant={participant} config={config} />

        <p className="text-[11px] text-slate-500">
          Keep this code handy. You can also view it anytime in your Profile tab.
        </p>
      </div>
    </div>
  );
};