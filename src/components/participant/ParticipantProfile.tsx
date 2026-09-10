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
          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Participant Profile & Pass
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your official career fair credentials
          </p>
        </div>
      </div>

      {/* Digital Attendee Pass (Card format) */}
      <div className="bg-white border-2 border-orange/30 rounded-lg p-6 shadow-card text-center relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between text-xs text-navy font-bold uppercase tracking-wider">
          <span>{config.eventName}</span>
          <span className="text-teal">✓ Verified Attendee</span>
        </div>

        {/* QR Code */}
        <div className="bg-white border border-slate-100 p-3.5 rounded-md inline-block mx-auto">
          <QRCodeSVG
            value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
            size={130}
            level="M"
          />
        </div>

        {/* Code & Name */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            Participant ID Code
          </span>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-navy tracking-wider">
              {participant.code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Code"
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-300 text-slate-500 hover:text-navy transition"
            >
              {copied ? <Check className="w-4 h-4 text-navy" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-lg font-bold text-navy mt-1">
            {participant.fullName}
          </h2>
          <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${participant.registrationType === 'walk_in'
              ? 'bg-blue/15 text-blue border-blue/40'
              : 'bg-teal/15 text-teal border-teal/40'
            }`}>
            {participant.registrationType === 'walk_in' ? 'Walk-In Registration' : 'Pre-Registration'}
          </span>
        </div>

        {/* Quick Badge Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-cream p-2 rounded-md border border-slate-100">
            <span className="text-[10px] text-slate-500 block uppercase">Check-In</span>
            <span className="font-bold text-navy">
              {hasCheckedIn ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="bg-cream p-2 rounded-md border border-slate-100">
            <span className="text-[10px] text-slate-500 block uppercase">Booths</span>
            <span className="font-bold text-navy font-mono">
              {boothsCompletedCount} / {config.minBoothsRequired}
            </span>
          </div>
          <div className="bg-cream p-2 rounded-md border border-slate-100">
            <span className="text-[10px] text-slate-500 block uppercase">Survey</span>
            <span className={`font-bold ${hasCompletedSurvey ? 'text-navy' : 'text-slate-500'}`}>
              {hasCompletedSurvey ? '✓ Done' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="bg-white border border-slate-100 rounded-lg p-5 space-y-3.5 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
          Registration Details
        </h3>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Mail className="w-4 h-4 text-orange shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Email</span>
            <span className="text-navy truncate block">{participant.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Phone className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Phone</span>
            <span className="text-navy block">{participant.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <GraduationCap className="w-4 h-4 text-blue shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Highest Education</span>
            <span className="text-navy block">
              {participant.highestEducation || participant.educationLevel || '—'}
              {participant.institution && <span className="text-slate-500"> • {participant.institution}</span>}
              {participant.yearOfCompletion && <span className="text-slate-500"> • {participant.yearOfCompletion}</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Briefcase className="w-4 h-4 text-orange shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Current Job Title</span>
            <span className="text-navy block">
              {participant.currentJobTitle || participant.careerInterest || '—'}
              {participant.currentAreaOfPractice && <span className="text-slate-500"> • {participant.currentAreaOfPractice}</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Compass className="w-4 h-4 text-teal shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block uppercase">Region</span>
            <span className="text-navy block">{participant.regionOfResidence || '—'}</span>
          </div>
        </div>

        {participant.psghRegistrationNumber && (
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block uppercase">PSGH Registration No.</span>
              <span className="text-navy block font-mono">{participant.psghRegistrationNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Account Switcher & Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onRegisterNew}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-navy border border-slate-300 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-orange" />
          <span>Register New / Another Participant</span>
        </button>

        <button
          onClick={onSignOut}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-error/10 text-slate-500 hover:text-error border border-slate-100 hover:border-error/40 text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Participant / Sign Out</span>
        </button>
      </div>
    </div>
  );
};
