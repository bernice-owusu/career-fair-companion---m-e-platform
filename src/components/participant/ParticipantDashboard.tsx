import React from 'react';
import { Sparkles, CheckCircle2, Award, Compass, MessageSquarePlus, Clock, ArrowRight, UserCheck, ShieldCheck, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, BoothVisit, EventConfig, Booth } from '../../types';

interface ParticipantDashboardProps {
  participant: Participant;
  visits: BoothVisit[];
  booths: Booth[];
  config: EventConfig;
  hasCheckedIn: boolean;
  hasCompletedSurvey: boolean;
  onRecordVisit: (boothId?: string) => void;
  onOpenDirectory: () => void;
  onOpenSurvey: () => void;
  onOpenProgress: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  participant,
  visits,
  booths,
  config,
  hasCheckedIn,
  hasCompletedSurvey,
  onRecordVisit,
  onOpenDirectory,
  onOpenSurvey,
  onOpenProgress,
}) => {
  const verifiedVisits = visits.filter(v => v.verificationStatus === 'verified');
  const completedCount = verifiedVisits.length;
  const minRequired = config.minBoothsRequired || 4;
  const progressPercent = Math.min(100, Math.round((completedCount / minRequired) * 100));
  const isRequirementMet = completedCount >= minRequired;
  const remainingNeeded = Math.max(0, minRequired - completedCount);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Welcome Greeting */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome, {participant.fullName.split(' ')[0]}</span>
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-xs text-slate-400">
            {config.eventName}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pass</span>
          <span className="text-xs font-mono font-bold text-indigo-400">{participant.code}</span>
        </div>
      </div>

      {/* Main Progress Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Your Booth Progress
          </span>
          <span className="text-lg sm:text-xl font-black text-white font-mono">
            {completedCount} <span className="text-xs text-slate-400 font-sans font-medium">/ {minRequired} Booths</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isRequirementMet
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-indigo-500 to-sky-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Status Text & Celebration */}
        {isRequirementMet ? (
          <div className="flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-semibold bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>🎉 Requirement Complete! You've attended {completedCount} booths.</span>
          </div>
        ) : (
          <p className="text-xs text-slate-300">
            You need <span className="font-bold text-indigo-300">{remainingNeeded} more booth{remainingNeeded > 1 ? 's' : ''}</span> to complete the minimum requirement.
          </p>
        )}
      </div>

      {/* Primary CTA: Record Booth Visit */}
      <button
        onClick={() => onRecordVisit()}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-colors flex items-center justify-center gap-2.5"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span>Record Booth Visit</span>
      </button>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Event Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400" /> Event Status
          </span>
          <p className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
            ✓ Checked In
          </p>
        </div>

        {/* Card 2: Booth Progress */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-indigo-400" /> Booths
          </span>
          <p className="text-xs sm:text-sm font-bold text-white font-mono">
            {completedCount} / {minRequired}
          </p>
        </div>

        {/* Card 3: Exit Survey */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> Exit Survey
          </span>
          <p className={`text-xs sm:text-sm font-bold ${hasCompletedSurvey ? 'text-emerald-400' : 'text-slate-400'}`}>
            {hasCompletedSurvey ? '✓ Completed' : 'Pending'}
          </p>
        </div>

        {/* Card 4: Participant Code */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sky-400" /> Your Code
          </span>
          <p className="text-xs sm:text-sm font-mono font-bold text-indigo-300 truncate">
            {participant.code}
          </p>
        </div>
      </div>

      {/* Exit Survey Callout if Ready */}
      {isRequirementMet && !hasCompletedSurvey && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-800/60 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg">
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Ready for Exit Survey!</span>
            </h3>
            <p className="text-xs text-slate-300">
              Share your feedback & rate your experience in 1 minute.
            </p>
          </div>
          <button
            onClick={onOpenSurvey}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition"
          >
            Take Survey
          </button>
        </div>
      )}

      {/* Completed Booths Timeline Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Your Attended Sessions ({completedCount})</span>
          </h2>
          <button
            onClick={onOpenProgress}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {verifiedVisits.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-300">No booths attended yet</p>
              <p className="text-[11px] text-slate-500">
                Explore the booth directory, participate in a session, and ask the facilitator for their code.
              </p>
            </div>
            <button
              onClick={onOpenDirectory}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              Browse Booth Directory →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {verifiedVisits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{visit.boothName}</h4>
                    <p className="text-xs text-slate-400">Facilitator: <span className="text-slate-200">{visit.facilitator}</span></p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 shrink-0">
                    ✓ Verified
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/70 text-xs text-slate-300 italic">
                  "{visit.reflection}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Link to Explore Booths */}
      <div className="pt-2">
        <button
          onClick={onOpenDirectory}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Explore All {booths.length} Available Booths</span>
        </button>
      </div>
    </div>
  );
};
