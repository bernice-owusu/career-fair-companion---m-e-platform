import React, { useMemo, useState } from 'react';
import {
  GraduationCap, Users, UserCheck, Star, MessageSquare, Calendar, MapPin, ChevronLeft,
  CheckCircle2, Clock, Search
} from 'lucide-react';
import { CareerFairEvent, NexusQuestion, PostEventSurvey } from '../../types';
import { StorageService } from '../../services/storageService';
import { getEventById } from '../../events';

interface MondayAnalyticsProps {
  event: CareerFairEvent;
  onBack: () => void;
}

const STATUS_META: Record<NexusQuestion['status'], { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue/15 border border-blue/40 text-blue' },
  reviewed: { label: 'Reviewed', className: 'bg-orange/15 border border-orange/40 text-orange' },
  answered: { label: 'Answered', className: 'bg-teal/15 border border-teal/40 text-teal' },
  archived: { label: 'Archived', className: 'bg-mist/10 border border-mist/30 text-mist/60' },
};

export const MondayAnalytics: React.FC<MondayAnalyticsProps> = ({ event, onBack }) => {
  const eventId = event.id;
  const participants = useMemo(() => StorageService.getParticipants(eventId), [eventId]);
  const attendance = useMemo(() => StorageService.getAttendance(eventId), [eventId]);
  const surveys = useMemo(() => StorageService.getMondaySurveys().filter(s => s.eventId === eventId), [eventId]);
  const questions = useMemo(() => StorageService.getQuestions(eventId), [eventId]);
  const [selectedSurvey, setSelectedSurvey] = useState<PostEventSurvey | null>(null);
  const [search, setSearch] = useState("");

  const surveyParticipantIds = useMemo(
    () => new Set(surveys.map(s => s.participantId)),
    [surveys]
  );

  const filteredParticipants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(p =>
      `${p.fullName} ${p.email} ${p.institution || ''} ${p.yearOfStudy || ''}`.toLowerCase().includes(q)
    );
  }, [participants, search]);

  const attended = new Set(attendance.filter(a => a.status === 'Checked In').map(a => a.participantId)).size;
  const attendanceRate = participants.length > 0 ? Math.round((attended / participants.length) * 1000) / 10 : 0;

  const institutionBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    participants.forEach(p => {
      const key = p.institution || 'Unspecified';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [participants]);

  const avgRating = (field: string) => {
    if (surveys.length === 0) return 0;
    const vals = surveys
      .map(s => Number(s.responses[field]))
      .filter(v => typeof v === 'number' && !Number.isNaN(v));
    if (vals.length === 0) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const connectedWithFacilitatorCount = surveys.filter(s => {
    const v = s.responses.facilitatorsConnected;
    return Array.isArray(v) && v.length > 0 && !(v.length === 1 && v[0] === 'None');
  }).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Admin</span>
      </button>

      {/* Header */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">{event.name}</h1>
            <p className="text-[11px] text-mist/60 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
            </p>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-navy/70 border border-mist/15 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 flex items-center gap-1">
              <Users className="w-3 h-3" /> Registered
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">{participants.length}</p>
          </div>
          <div className="bg-navy/70 border border-mist/15 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Attended
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">{attended}</p>
            <p className="text-[10px] text-mist/60">{attendanceRate}% rate</p>
          </div>
          <div className="bg-navy/70 border border-mist/15 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 flex items-center gap-1">
              <Star className="w-3 h-3" /> Surveys
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">{surveys.length}</p>
            <p className="text-[10px] text-mist/60">post-event</p>
          </div>
          <div className="bg-navy/70 border border-mist/15 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Questions
            </span>
            <p className="text-xl font-black text-white font-mono mt-1">{questions.length}</p>
            <p className="text-[10px] text-mist/60">
              {questions.filter(q => q.status === 'answered').length} answered
            </p>
          </div>
        </div>
      </div>

      {/* Institution breakdown */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <h2 className="text-sm font-bold text-white tracking-tight mb-3">Registrations by Institution</h2>
        <div className="space-y-2">
          {institutionBreakdown.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs text-mist/80 w-1/3 truncate">{name}</span>
              <div className="flex-1 h-2.5 bg-navy/70 rounded-full overflow-hidden border border-mist/15">
                <div
                  className="h-full bg-gradient-to-r from-orange to-teal rounded-full"
                  style={{ width: `${(count / (participants.length || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white font-mono w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registered students roster */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Registered Students ({participants.length})
          </h2>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-mist/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or institution..."
            className="w-full pl-9 pr-3 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange"
          />
        </div>
        {filteredParticipants.length === 0 ? (
          <p className="text-xs text-mist/60 mt-3">No registrations found.</p>
        ) : (
          <div className="space-y-2 mt-3 max-h-[28rem] overflow-y-auto">
            {filteredParticipants.map(p => (
              <div
                key={p.id}
                className="bg-navy/70 border border-mist/15 rounded-xl p-3.5 space-y-1.5 hover:border-orange/40 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.fullName}</p>
                    <p className="text-[11px] text-mist/60 truncate">{p.email}</p>
                  </div>
                  {surveyParticipantIds.has(p.id) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal/15 border border-teal/40 text-teal shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Survey
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mist/60">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-orange" />
                    {p.institution || 'Institution not stated'}
                  </span>
                  {p.yearOfStudy && <span>{p.yearOfStudy}</span>}
                  <span className="ml-auto">
                    {new Date(p.registeredAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Survey insights */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <h2 className="text-sm font-bold text-white tracking-tight mb-3">Survey Insights</h2>
        {surveys.length === 0 ? (
          <p className="text-xs text-mist/60">No surveys submitted yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-navy/70 border border-mist/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-orange">{avgRating('sessionValue')}</p>
              <p className="text-[10px] text-mist/60 mt-0.5">Avg Session (1-5)</p>
            </div>
            <div className="bg-navy/70 border border-mist/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-orange">{avgRating('eventOrganisation')}</p>
              <p className="text-[10px] text-mist/60 mt-0.5">Avg Organisation (1-5)</p>
            </div>
            <div className="bg-navy/70 border border-mist/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-orange">{avgRating('returnLikelihood')}</p>
              <p className="text-[10px] text-mist/60 mt-0.5">Avg Return (1-5)</p>
            </div>
            <div className="bg-navy/70 border border-mist/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-teal">{connectedWithFacilitatorCount}</p>
              <p className="text-[10px] text-mist/60 mt-0.5">Connected With a Facilitator</p>
            </div>
          </div>
        )}
      </div>

      {/* Surveys list */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <h2 className="text-sm font-bold text-white tracking-tight mb-3">Individual Surveys ({surveys.length})</h2>
        {surveys.length === 0 ? (
          <p className="text-xs text-mist/60">No survey responses recorded.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {surveys.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSurvey(s)}
                className="w-full text-left bg-navy/70 border border-mist/15 rounded-xl p-3 hover:border-orange/40 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{s.participantName}</span>
                  <span className="text-[10px] text-mist/60">
                    {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className={`w-3 h-3 ${n <= Number(s.responses.sessionValue) ? 'text-orange fill-orange' : 'text-mist/25'}`}
                    />
                  ))}
                  <span className="text-[10px] text-mist/60 ml-1">
                    session · {String(s.responses.eventOrganisation ?? '')}/5 org
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 shadow-md">
        <h2 className="text-sm font-bold text-white tracking-tight mb-3">
          Participant Questions ({questions.length})
        </h2>
        {questions.length === 0 ? (
          <p className="text-xs text-mist/60">No questions asked.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {questions.map(q => {
              const meta = STATUS_META[q.status];
              return (
                <div key={q.id} className="bg-navy/70 border border-mist/15 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-mist/90">{q.question}</p>
                      <p className="text-[10px] text-mist/50 mt-1">
                        {q.participantName} · {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>
                  {q.answer && (
                    <p className="text-[11px] text-mist/80 mt-2 bg-teal/10 border border-teal/30 rounded-lg p-2">
                      <span className="font-bold text-teal">Answer: </span>{q.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Survey detail modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{selectedSurvey.participantName}</h3>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/60 transition text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${n <= Number(selectedSurvey.responses.sessionValue) ? 'text-orange fill-orange' : 'text-mist/25'}`}
                />
              ))}
              <span className="text-xs text-mist/70 ml-2">Session rating</span>
            </div>
            <div className="space-y-3 text-xs text-mist/85">
              {[
                ['Session rating', String(selectedSurvey.responses.sessionValue ?? '')],
                ['Organisation', String(selectedSurvey.responses.eventOrganisation ?? '')],
                ['Facilitators connected', Array.isArray(selectedSurvey.responses.facilitatorsConnected) ? selectedSurvey.responses.facilitatorsConnected.join(', ') : ''],
                ['Connect with companies', String(selectedSurvey.responses.connectWithCompanies ?? '')],
                ['Return likelihood', String(selectedSurvey.responses.returnLikelihood ?? '')],
                ['Future themes', String(selectedSurvey.responses.suggestedThemes ?? '')],
                ['Improvements', String(selectedSurvey.responses.improvements ?? '')],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex gap-3 border-t border-mist/15 pt-2">
                  <span className="w-36 shrink-0 text-mist/60">{label}</span>
                  <span className="font-semibold text-white">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};