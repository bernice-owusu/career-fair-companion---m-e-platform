import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, CheckCircle2, RefreshCw, Check, XCircle } from 'lucide-react';
import { CareerFairEvent, NexusQuestion, Participant, QuestionStatus } from '../../types';
import { StorageService } from '../../services/storageService';

interface QuestionsScreenProps {
  event: CareerFairEvent;
  participant: Participant;
  onBack: () => void;
}

const STATUS_META: Record<QuestionStatus, { label: string; className: string; icon: React.ReactNode }> = {
  new: { label: 'New', className: 'bg-blue/15 border border-blue/40 text-blue', icon: <RefreshCw className="w-3 h-3" /> },
  reviewed: { label: 'Reviewed', className: 'bg-orange/15 border border-orange/40 text-orange', icon: <Check className="w-3 h-3" /> },
  answered: { label: 'Answered', className: 'bg-teal/15 border border-teal/40 text-teal', icon: <CheckCircle2 className="w-3 h-3" /> },
  archived: { label: 'Archived', className: 'bg-mist/10 border border-mist/30 text-mist/60', icon: <XCircle className="w-3 h-3" /> },
};

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({ event, participant, onBack }) => {
  const [draft, setDraft] = useState('');
  const [questions, setQuestions] = useState<NexusQuestion[]>(
    StorageService.getQuestions(event.id).filter(q => q.participantId === participant.id)
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (text.length < 5) {
      setError('Please write your question (minimum 5 characters).');
      return;
    }
    setSubmitting(true);
    const created = StorageService.submitQuestion({
      eventId: event.id,
      participantId: participant.id,
      participantName: participant.fullName,
      question: text,
    });
    setQuestions(prev => [created, ...prev]);
    setDraft('');
    setError('');
    setSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Ask a Question</h1>
          <p className="text-xs sm:text-sm text-mist/60 mt-0.5">
            Send your questions to the facilitators at {event.name}. Once answered, the response appears here and in
            the M&E console.
          </p>
        </div>
      </div>

      {/* Ask form */}
      <form onSubmit={handleSubmit} className="bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md space-y-3 mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1">
          Your Question
        </label>
        <textarea
          rows={3}
          placeholder="e.g. How do I apply for the opportunities mentioned today?"
          value={draft}
          onChange={e => { setDraft(e.target.value); setError(''); }}
          className="w-full px-3.5 py-2 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange resize-none"
        />
        {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-5 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-sm shadow-lg shadow-orange/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          <span>Submit Question</span>
        </button>
      </form>

      {/* My questions */}
      <h2 className="text-sm font-bold text-white uppercase tracking-wider text-orange mb-3">
        My Questions ({questions.length})
      </h2>

      {questions.length === 0 ? (
        <div className="text-center py-10 bg-navy/60 border border-mist/15 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-mist/40 mx-auto mb-2" />
          <p className="text-xs text-mist/60">You haven't asked any questions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const meta = STATUS_META[q.status];
            return (
              <div key={q.id} className="bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white font-semibold leading-relaxed">{q.question}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.className}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                </div>
                <p className="text-[11px] text-mist/50 mt-1.5">
                  Asked {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {q.answer && (
                  <div className="mt-3 bg-teal/10 border border-teal/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal mb-1">Response from facilitators</p>
                    <p className="text-xs text-mist/90 leading-relaxed">{q.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};