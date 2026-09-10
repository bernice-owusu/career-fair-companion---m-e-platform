import React from 'react';
import { Sparkles, GraduationCap, Calendar, Clock, MapPin, MessageSquare, Star, CheckCircle2 } from 'lucide-react';
import { CareerFairEvent, Participant } from '../../types';

interface MondayPlatformProps {
  event: CareerFairEvent;
  participant: Participant;
  hasCompletedSurvey: boolean;
  onAskQuestion: () => void;
  onOpenSurvey: () => void;
}

export const MondayPlatform: React.FC<MondayPlatformProps> = ({
  event,
  participant,
  hasCompletedSurvey,
  onAskQuestion,
  onOpenSurvey,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 animate-fadeIn">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight flex items-center gap-2">
          <span>Welcome, {participant.firstName || participant.fullName.split(' ')[0]}</span>
          <span className="text-lg">🎓</span>
        </h1>
        <p className="text-xs text-slate-500">{event.name}</p>
      </div>

      {/* Attendee card */}
      <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-card space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Your Student Profile
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-teal font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{participant.institution}</span>
          <span className="font-semibold text-navy">{participant.yearOfStudy}</span>
        </div>
      </div>

      {/* Event info */}
      <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-card space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Event Information
        </span>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Calendar className="w-4 h-4 text-orange shrink-0" />
          <span>Monday, September 21, 2026</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Clock className="w-4 h-4 text-orange shrink-0" />
          <span>{event.time} · Students' Career Fair</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <span>{event.venue}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onAskQuestion}
          className="w-full py-4 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2.5"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Ask a Question</span>
        </button>

        <button
          onClick={onOpenSurvey}
          disabled={hasCompletedSurvey}
          className="w-full py-4 px-6 rounded-full bg-white border-2 border-teal/60 text-navy font-bold text-base transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 hover:bg-teal/10"
        >
          <Star className="w-5 h-5" />
          <span>{hasCompletedSurvey ? 'Survey Completed ✓' : 'Complete Post-Event Survey'}</span>
        </button>
      </div>
    </div>
  );
};