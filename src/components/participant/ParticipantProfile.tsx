import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Mail, Phone, GraduationCap, Briefcase, Compass, Copy, Check, LogOut, RefreshCw, QrCode, ShieldCheck, UserPlus } from 'lucide-react';
import { Participant, EventConfig } from '../../types';

interface ParticipantProfileProps {
  participant: Participant;
  config: EventConfig;
  hasCheckedIn: boolean;
  hasCompletedSurvey: boolean;
  boothsCompletedCount: number;
  onSignOut: () => void;
  onRegisterNew: () => void;
}

export const ParticipantProfile: React.FC<ParticipantProfileProps> = ({
  participant,
  config,
  hasCheckedIn,
  hasCompletedSurvey,
  boothsCompletedCount,
  onSignOut,
  onRegisterNew,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(participant.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Participant Profile & Pass
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your official career fair credentials
          </p>
        </div>
      </div>

      {/* Digital Attendee Pass (Card format) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
          <span>{config.eventName}</span>
          <span className="text-emerald-400">✓ Verified Attendee</span>
        </div>

        {/* QR Code */}
        <div className="bg-white p-3.5 rounded-2xl inline-block shadow-inner mx-auto">
          <QRCodeSVG
            value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
            size={130}
            level="M"
          />
        </div>

        {/* Code & Name */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Participant ID Code
          </span>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
              {participant.code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Code"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            {participant.fullName}
          </h2>
        </div>

        {/* Quick Badge Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Check-In</span>
            <span className="font-bold text-emerald-400">
              {hasCheckedIn ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Booths</span>
            <span className="font-bold text-indigo-400 font-mono">
              {boothsCompletedCount} / {config.minBoothsRequired}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Survey</span>
            <span className={`font-bold ${hasCompletedSurvey ? 'text-emerald-400' : 'text-slate-400'}`}>
              {hasCompletedSurvey ? '✓ Done' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Registration Details
        </h3>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Email</span>
            <span className="text-slate-200 truncate block">{participant.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Phone</span>
            <span className="text-slate-200 block">{participant.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Institution & Education</span>
            <span className="text-slate-200 block">{participant.institution} • {participant.educationLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Career Interest</span>
            <span className="text-slate-200 block">{participant.careerInterest}</span>
          </div>
        </div>
      </div>

      {/* Account Switcher & Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onRegisterNew}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-indigo-400" />
          <span>Register New / Another Participant</span>
        </button>

        <button
          onClick={onSignOut}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Participant / Sign Out</span>
        </button>
      </div>
    </div>
  );
};
