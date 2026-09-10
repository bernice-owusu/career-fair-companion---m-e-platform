import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, ArrowRight, Copy, Check, Sparkles, MailCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventConfig } from '../../types';
import { SaveTicketButton } from '../common/SaveTicketButton';

interface WalkInSuccessScreenProps {
  participant: Participant;
  config: EventConfig;
  emailStatus?: 'pending' | 'sent' | 'not_configured' | 'failed';
  onContinue: () => void;
}

export const WalkInSuccessScreen: React.FC<WalkInSuccessScreenProps> = ({ participant, config, emailStatus = 'sent', onContinue }) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-teal mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight mb-2">
        Registration Successful! 🎉
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mb-6">
        Welcome, <span className="font-bold text-navy">{participant.fullName}</span>. Keep this code — you'll use it all day at the career fair.
      </p>

      <div className="w-full bg-white border-2 border-orange/40 rounded-lg p-6 mb-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none"></div>

        <p className="text-xs font-bold uppercase tracking-widest text-navy mb-1">
          Your Registration Code
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl sm:text-4xl font-mono font-black text-navy tracking-wider">
            {participant.code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy Registration Code"
            className="p-2 rounded-md bg-slate-100 hover:bg-slate-300 text-slate-500 hover:text-navy transition border border-slate-100"
          >
            {copied ? <Check className="w-4 h-4 text-navy" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="bg-white border border-slate-100 p-3.5 rounded-md inline-block mb-4">
          <QRCodeSVG
            value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
            size={120}
            level="M"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span className="text-teal">You're checked in!</span>
        </div>
      </div>

      {emailStatus === 'sent' && (
        <p className="text-xs text-slate-500 mb-4">
          We've also sent this code to <span className="font-semibold text-navy">{participant.email}</span>.
        </p>
      )}

      {emailStatus === 'pending' && (
        <p className="text-xs text-slate-500 mb-4 flex items-center justify-center gap-1.5">
          <MailCheck className="w-3.5 h-3.5" />
          Sending your code to <span className="font-semibold text-navy">{participant.email}</span>…
        </p>
      )}

      {emailStatus === 'not_configured' && (
        <div className="w-full bg-orange/10 border border-orange/40 rounded-md p-3.5 mb-4 flex items-center gap-2.5 text-left">
          <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
          <p className="text-xs text-slate-500">
            Your code was <span className="font-semibold text-navy">not emailed yet</span> — the email
            webhook isn't connected. Keep this code safe.
          </p>
        </div>
      )}

      {emailStatus === 'failed' && (
        <div className="w-full bg-error/10 border border-error/30 rounded-md p-3.5 mb-4 flex items-center gap-2.5 text-left">
          <AlertTriangle className="w-5 h-5 text-error shrink-0" />
          <p className="text-xs text-slate-500">
            The email couldn't be sent right now. Keep this code safe.
          </p>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-4 px-6 rounded-full bg-teal hover:bg-teal/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
      >
        <span>Continue to Career Fair</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <div className="w-full mt-3">
        <SaveTicketButton participant={participant} config={config} />
      </div>

      <p className="text-[11px] text-slate-500 mt-3">{config.eventName} · {config.eventLocation}</p>
    </div>
  );
};