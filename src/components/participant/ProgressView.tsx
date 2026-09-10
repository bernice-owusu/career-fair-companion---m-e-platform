import React from 'react';
import { Award, CheckCircle2, Star, Clock, User, Compass, MessageSquare, ArrowRight } from 'lucide-react';
import { Participant, BoothVisit, EventConfig, Booth } from '../../types';

interface ProgressViewProps {
  participant: Participant;
  visits: BoothVisit[];
  booths: Booth[];
  config: EventConfig;
  hasCompletedSurvey: boolean;
  onOpenSurvey: () => void;
  onRecordVisit: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  participant,
  visits,
  booths,
  config,
  hasCompletedSurvey,
  onOpenSurvey,
  onRecordVisit,
}) => {
  const verifiedVisits = visits.filter(v => v.verificationStatus === 'verified');
  const count = verifiedVisits.length;
  const minRequired = config.minBoothsRequired || 4;
  const isCompleted = count >= minRequired;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-orange" />
          <span>Your Career Fair Progress</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Visit at least {minRequired} booths to reach full event completion.
          The exit survey is available anytime.
        </p>
      </div>

      {/* Requirement Tracker Banner */}
      <div className={`p-5 rounded-lg border ${
        isCompleted
          ? 'bg-teal/10 border-teal/40'
          : 'bg-white border-slate-100'
      } shadow-card space-y-4`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Requirement Status
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isCompleted
              ? 'bg-teal text-navy font-black'
              : 'bg-orange/15 text-navy border border-orange/30'
          }`}>
            {isCompleted ? '🎉 Goal Achieved!' : `${count} of ${minRequired} Completed`}
          </span>
        </div>

        {/* Milestone Steps indicator */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {Array.from({ length: Math.max(minRequired, count) }).map((_, idx) => {
            const isDone = idx < count;
            return (
              <div
                key={idx}
                className={`py-2 px-1 rounded-md text-center border transition ${
                  isDone
                    ? 'bg-teal/20 border-teal text-navy font-bold'
                    : 'bg-white border-slate-100 text-slate-300'
                }`}
              >
                <span className="text-xs block">Booth {idx + 1}</span>
                <span className="text-[10px]">{isDone ? '✓ Done' : 'Pending'}</span>
              </div>
            );
          })}
        </div>

        {!hasCompletedSurvey && (
          <div className="pt-2 border-t border-teal/40 flex items-center justify-between gap-3">
            <span className="text-xs text-navy">
              Share your feedback on the exit survey!
            </span>
            <button
              onClick={onOpenSurvey}
              className="px-3.5 py-1.5 rounded-full bg-orange hover:bg-orange/90 text-navy text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Complete Survey</span>
            </button>
          </div>
        )}
      </div>

      {/* Chronological Booth Journey */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange" />
            <span>Completed Learning Timeline ({verifiedVisits.length})</span>
          </h2>
          <button
            onClick={onRecordVisit}
            className="text-xs text-navy hover:text-orange font-bold"
          >
            + Record Visit
          </button>
        </div>

        {verifiedVisits.length === 0 ? (
          <div className="bg-cream border border-slate-100 rounded-lg p-8 text-center space-y-3">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              No booth sessions recorded yet. Start exploring the booths!
            </p>
            <button
              onClick={onRecordVisit}
              className="px-4 py-2 bg-orange hover:bg-orange/90 text-white text-xs font-bold rounded-full transition"
            >
              Record First Booth
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedVisits.map((visit, index) => (
              <div
                key={visit.id}
                className="bg-white border border-slate-100 rounded-lg p-4 sm:p-5 space-y-3 shadow-card relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange/15 text-orange border border-orange/30 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-navy">
                        {visit.boothName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Facilitator: <strong className="text-navy">{visit.facilitator}</strong></span>
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-100 shrink-0">
                    {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reflection Quote */}
                <div className="bg-cream rounded-md p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy block">
                    Learning Reflection:
                  </span>
                  <p className="italic leading-relaxed text-navy">
                    "{visit.reflection}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
