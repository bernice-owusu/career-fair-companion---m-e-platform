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
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight flex items-center gap-2">
            <span>Welcome, {participant.fullName.split(' ')[0]}</span>
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-xs text-slate-500">
            {config.eventName}
          </p>
        </div>
        <div className="px-2.5 py-1 bg-white border border-slate-100 rounded-md text-right">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Pass</span>
          <span className="text-xs font-mono font-bold text-navy">{participant.code}</span>
        </div>
      </div>

      {/* Main Progress Hero Card */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-lg p-5 sm:p-6 shadow-card">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Award className="w-4 h-4 text-orange" />
            Your Booth Progress
          </span>
          <span className="text-lg sm:text-xl font-black text-navy font-mono">
            {completedCount} <span className="text-xs text-slate-500 font-sans font-medium">/ {minRequired} Booths</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isRequirementMet
                ? 'bg-teal'
                : 'bg-blue'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Status Text & Celebration */}
        {isRequirementMet ? (
          <div className="flex items-center gap-2 text-navy text-xs sm:text-sm font-semibold bg-teal/15 border border-teal/40 rounded-md px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
            <span>🎉 Requirement Complete! You've attended {completedCount} booths.</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            You need <span className="font-bold text-orange">{remainingNeeded} more booth{remainingNeeded > 1 ? 's' : ''}</span> to complete the minimum requirement.
          </p>
        )}
      </div>

      {/* Primary CTA: Record Booth Visit */}
      <button
        onClick={() => onRecordVisit()}
        className="w-full py-4 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2.5"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span>Record Booth Visit</span>
      </button>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Event Status */}
        <div className="bg-white border border-slate-100 rounded-md p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-500" /> Event Status
          </span>
          <p className="text-xs sm:text-sm font-bold text-navy flex items-center gap-1">
            ✓ Checked In
          </p>
        </div>

        {/* Card 2: Booth Progress */}
        <div className="bg-white border border-slate-100 rounded-md p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Compass className="w-3 h-3 text-orange" /> Booths
          </span>
          <p className="text-xs sm:text-sm font-bold text-navy font-mono">
            {completedCount} / {minRequired}
          </p>
        </div>

        {/* Card 3: Exit Survey */}
        <div className="bg-white border border-slate-100 rounded-md p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Star className="w-3 h-3 text-orange" /> Exit Survey
          </span>
          <p className={`text-xs sm:text-sm font-bold ${hasCompletedSurvey ? 'text-navy' : 'text-slate-500'}`}>
            {hasCompletedSurvey ? '✓ Completed' : 'Pending'}
          </p>
        </div>

        {/* Card 4: Participant Code */}
        <div className="bg-white border border-slate-100 rounded-md p-3.5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue" /> Your Code
          </span>
          <p className="text-xs sm:text-sm font-mono font-bold text-navy truncate">
            {participant.code}
          </p>
        </div>
      </div>

      {/* Exit Survey Callout if not yet submitted */}
      {!hasCompletedSurvey && (
        <div className="bg-orange/10 border border-orange/30 rounded-lg p-4 sm:p-5 flex items-center justify-between gap-3 shadow-card">
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm font-bold text-orange flex items-center gap-1.5">
              <Star className="w-4 h-4 text-orange fill-orange" />
              <span>Ready for Exit Survey!</span>
            </h3>
            <p className="text-xs text-slate-500">
              Share your feedback & rate your experience in 1 minute.
            </p>
          </div>
          <button
            onClick={onOpenSurvey}
            className="px-3.5 py-2 rounded-full bg-orange hover:bg-orange/90 text-navy text-xs font-bold shrink-0 transition"
          >
            Take Survey
          </button>
        </div>
      )}

      {/* Completed Booths Timeline Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange" />
            <span>Your Attended Sessions ({completedCount})</span>
          </h2>
          <button
            onClick={onOpenProgress}
            className="text-xs text-navy hover:text-orange font-semibold flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {verifiedVisits.length === 0 ? (
          <div className="bg-cream border border-dashed border-slate-100 rounded-lg p-6 text-center space-y-3">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">No booths attended yet</p>
              <p className="text-[11px] text-slate-300">
                Explore the booth directory, participate in a session, and ask the facilitator for their code.
              </p>
            </div>
            <button
              onClick={onOpenDirectory}
              className="text-xs font-bold text-navy hover:text-orange transition"
            >
              Browse Booth Directory →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {verifiedVisits.slice(0, 3).map((visit) => (
              <div
                key={visit.id}
                className="bg-white border border-slate-100 rounded-lg p-4 space-y-2 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-navy truncate">{visit.boothName}</h4>
                    <p className="text-xs text-slate-500">Facilitator: <span className="text-navy">{visit.facilitator}</span></p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal/20 text-navy border border-teal/40 shrink-0">
                    ✓ Verified
                  </span>
                </div>
                <div className="bg-cream rounded-md p-2.5 border border-slate-100 text-xs text-slate-500 italic">
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
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-navy border border-slate-100 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4 text-orange" />
          <span>Explore All {booths.length} Available Booths</span>
        </button>
      </div>
    </div>
  );
};
