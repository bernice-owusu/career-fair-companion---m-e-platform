import React, { useMemo, useState } from 'react';
import {
  MessageSquare, RefreshCw, Check, CheckCircle2, XCircle, Search, Mail
} from 'lucide-react';
import { NexusQuestion, QuestionStatus } from '../../types';
import { StorageService } from '../../services/storageService';
import { getEventById } from '../../events';

interface QuestionsAdminProps {
  eventId: string;
}

const STATUS_META: Record<QuestionStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue/15 border border-blue/40 text-blue' },
  reviewed: { label: 'Reviewed', className: 'bg-orange/15 border border-orange/40 text-orange' },
  answered: { label: 'Answered', className: 'bg-teal/15 border border-teal/40 text-teal' },
  archived: { label: 'Archived', className: 'bg-mist/10 border border-mist/30 text-mist/60' },
};

const ANSWER_PLACEHOLDERS = [
  'Thank you for your question! Please reach out to the respective booth facilitator for a detailed answer, or check the resources desk.',
  'Thanks — good question. Our facilitators will be happy to discuss this at the relevant booth.',
];

const STATUS_ORDER: QuestionStatus[] = ['new', 'reviewed', 'answered', 'archived'];

export const QuestionsAdmin: React.FC<QuestionsAdminProps> = ({ eventId }) => {
  const [questions, setQuestions] = useState<NexusQuestion[]>(() => StorageService.getQuestions(eventId));
  const [filter, setFilter] = useState<QuestionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});

  const event = getEventById(eventId);

  const visible = useMemo(() => {
    return questions
      .filter(q => filter === 'all' || q.status === filter)
      .filter(q => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return q.question.toLowerCase().includes(s) || q.participantName.toLowerCase().includes(s);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [questions, filter, search]);

  const counts = useMemo(() => {
    const c: Record<QuestionStatus, number> = { new: 0, reviewed: 0, answered: 0, archived: 0 };
    questions.forEach(q => { c[q.status] = (c[q.status] || 0) + 1; });
    return c;
  }, [questions]);

  const setStatus = (id: string, status: QuestionStatus) => {
    StorageService.updateQuestionStatus(id, status);
    setQuestions(StorageService.getQuestions(eventId));
  };

  const submitAnswer = (id: string) => {
    const answer = (answerDraft[id] || '').trim() || ANSWER_PLACEHOLDERS[0];
    StorageService.updateQuestionStatus(id, 'answered', answer);
    setAnswerDraft(prev => ({ ...prev, [id]: '' }));
    setQuestions(StorageService.getQuestions(eventId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Participant Questions</h2>
            <p className="text-[11px] text-mist/60">{event.name} · {questions.length} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', ...STATUS_ORDER] as (QuestionStatus | 'all')[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition ${
                filter === f ? 'bg-orange text-white shadow' : 'bg-navy/70 text-mist/60 hover:text-white border border-mist/15'
              }`}
            >
              {f === 'all' ? `All (${questions.length})` : `${f[0].toUpperCase() + f.slice(1)} (${counts[f as QuestionStatus] || 0})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-navy/90 border border-mist/15 rounded-2xl p-3 shadow-md">
        <Search className="w-4 h-4 text-mist/60 shrink-0" />
        <input
          type="text"
          placeholder="Search questions or participants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs text-white placeholder-mist/40 focus:outline-none"
        />
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12 bg-navy/60 border border-mist/15 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-mist/30 mx-auto mb-2" />
          <p className="text-xs text-mist/60">No questions found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(q => {
            const meta = STATUS_META[q.status];
            return (
              <div key={q.id} className="bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-navy/70 border border-mist/15 flex items-center justify-center text-mist/60 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{q.question}</p>
                      <p className="text-[10px] text-mist/50 mt-1">
                        {q.participantName} · {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                        {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                {q.status === 'answered' && q.answer && (
                  <div className="mt-3 bg-teal/10 border border-teal/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal mb-1">Published Answer</p>
                    <p className="text-xs text-mist/90 leading-relaxed">{q.answer}</p>
                  </div>
                )}

                {/* Status actions */}
                <div className="mt-3 pt-3 border-t border-mist/15 flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.filter(s => s !== q.status).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(q.id, s)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        s === 'reviewed'
                          ? 'bg-orange/10 border border-orange/40 text-orange hover:bg-orange/20'
                          : s === 'answered'
                            ? 'bg-teal/10 border border-teal/40 text-teal hover:bg-teal/20'
                            : 'bg-navy/70 border border-mist/20 text-mist/60 hover:text-white'
                      }`}
                    >
                      {s === 'reviewed' ? <RefreshCw className="w-3 h-3" />
                        : s === 'answered' ? <CheckCircle2 className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />}
                      Mark {s}
                    </button>
                  ))}
                </div>

                {/* Answer composer */}
                {q.status !== 'answered' && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Type a response to publish to the participant..."
                      value={answerDraft[q.id] || ''}
                      onChange={e => setAnswerDraft(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-navy border border-mist/20 rounded-xl text-xs text-white placeholder-mist/40 focus:outline-none focus:border-teal resize-none"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => submitAnswer(q.id)}
                        className="flex-1 min-w-[160px] py-2 rounded-xl bg-teal/15 border border-teal/50 text-teal text-[11px] font-bold hover:bg-teal/25 transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Publish Answer
                      </button>
                      {ANSWER_PLACEHOLDERS.map((ph, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswerDraft(prev => ({ ...prev, [q.id]: ph }))}
                          className="px-2 py-1.5 rounded-lg bg-navy/70 border border-mist/15 text-[10px] text-mist/60 hover:text-white transition"
                        >
                          Use template {i + 1}
                        </button>
                      ))}
                    </div>
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