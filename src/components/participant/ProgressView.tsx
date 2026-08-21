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
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-400" />
          <span>Your Career Fair Progress</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete at least {minRequired} booths to qualify for event completion.
        </p>
      </div>

      {/* Requirement Tracker Banner */}
      <div className={`p-5 rounded-3xl border ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-800/80 shadow-emerald-950/30'
          : 'bg-slate-900/90 border-slate-800'
      } shadow-xl space-y-4`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Requirement Status
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isCompleted
              ? 'bg-emerald-500 text-slate-950 font-black'
              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
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
                className={`py-2 px-1 rounded-xl text-center border transition ${
                  isDone
                    ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-xs block">Booth {idx + 1}</span>
                <span className="text-[10px]">{isDone ? '✓ Done' : 'Pending'}</span>
              </div>
            );
          })}
        </div>

        {isCompleted && !hasCompletedSurvey && (
          <div className="pt-2 border-t border-emerald-900/50 flex items-center justify-between gap-3">
            <span className="text-xs text-emerald-200">
              You're eligible for the exit survey!
            </span>
            <button
              onClick={onOpenSurvey}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shrink-0"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Completed Learning Timeline ({verifiedVisits.length})</span>
          </h2>
          <button
            onClick={onRecordVisit}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
          >
            + Record Visit
          </button>
        </div>

        {verifiedVisits.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No booth sessions recorded yet. Start exploring the booths!
            </p>
            <button
              onClick={onRecordVisit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              Record First Booth
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedVisits.map((visit, index) => (
              <div
                key={visit.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {visit.boothName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Facilitator: <strong className="text-slate-200">{visit.facilitator}</strong></span>
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 shrink-0">
                    {new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reflection Quote */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Learning Reflection:
                  </span>
                  <p className="italic leading-relaxed text-slate-200">
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
