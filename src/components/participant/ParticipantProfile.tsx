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
          <p className="text-xs text-mist/60 mt-0.5">
            Your official career fair credentials
          </p>
        </div>
      </div>

      {/* Digital Attendee Pass (Card format) */}
      <div className="bg-navy border-2 border-orange/30 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between text-xs text-orange font-bold uppercase tracking-wider">
          <span>{config.eventName}</span>
          <span className="text-mist">✓ Verified Attendee</span>
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
          <span className="text-[10px] font-bold text-mist/60 uppercase tracking-widest block">
            Participant ID Code
          </span>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
              {participant.code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Code"
              className="p-1.5 rounded-lg bg-navy/70 hover:bg-navy/80 text-mist/80 transition"
            >
              {copied ? <Check className="w-4 h-4 text-mist" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-lg font-bold text-mist mt-1">
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
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-mist/15 text-xs">
          <div className="bg-navy/60 p-2 rounded-xl border border-mist/15">
            <span className="text-[10px] text-mist/60 block uppercase">Check-In</span>
            <span className="font-bold text-mist">
              {hasCheckedIn ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="bg-navy/60 p-2 rounded-xl border border-mist/15">
            <span className="text-[10px] text-mist/60 block uppercase">Booths</span>
            <span className="font-bold text-orange font-mono">
              {boothsCompletedCount} / {config.minBoothsRequired}
            </span>
          </div>
          <div className="bg-navy/60 p-2 rounded-xl border border-mist/15">
            <span className="text-[10px] text-mist/60 block uppercase">Survey</span>
            <span className={`font-bold ${hasCompletedSurvey ? 'text-mist' : 'text-mist/60'}`}>
              {hasCompletedSurvey ? '✓ Done' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 space-y-3.5 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-mist/60 border-b border-mist/15 pb-2">
          Registration Details
        </h3>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Mail className="w-4 h-4 text-orange shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-mist/40 block uppercase">Email</span>
            <span className="text-mist truncate block">{participant.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Phone className="w-4 h-4 text-mist shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-mist/40 block uppercase">Phone</span>
            <span className="text-mist block">{participant.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <GraduationCap className="w-4 h-4 text-blue shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-mist/40 block uppercase">Highest Education</span>
            <span className="text-mist block">
              {participant.highestEducation || participant.educationLevel || '—'}
              {participant.institution && <span className="text-mist/60"> • {participant.institution}</span>}
              {participant.yearOfCompletion && <span className="text-mist/60"> • {participant.yearOfCompletion}</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Briefcase className="w-4 h-4 text-orange shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-mist/40 block uppercase">Current Job Title</span>
            <span className="text-mist block">
              {participant.currentJobTitle || participant.careerInterest || '—'}
              {participant.currentAreaOfPractice && <span className="text-mist/60"> • {participant.currentAreaOfPractice}</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Compass className="w-4 h-4 text-teal shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-mist/40 block uppercase">Region</span>
            <span className="text-mist block">{participant.regionOfResidence || '—'}</span>
          </div>
        </div>

        {participant.psghRegistrationNumber && (
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-mist/40 block uppercase">PSGH Registration No.</span>
              <span className="text-mist block font-mono">{participant.psghRegistrationNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Account Switcher & Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onRegisterNew}
          className="w-full py-3 px-4 rounded-xl bg-navy/70 hover:bg-navy/80 text-mist hover:text-white border border-mist/25 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-orange" />
          <span>Register New / Another Participant</span>
        </button>

        <button
          onClick={onSignOut}
          className="w-full py-3 px-4 rounded-xl bg-navy hover:bg-rose-950/40 text-mist/60 hover:text-rose-400 border border-mist/15 hover:border-rose-900 text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Participant / Sign Out</span>
        </button>
      </div>
    </div>
  );
};
