import React, { useState } from 'react';
import { Search, MapPin, User, CheckCircle2, MessageSquarePlus, Compass, Filter } from 'lucide-react';
import { Booth, BoothVisit } from '../../types';

interface BoothDirectoryProps {
  booths: Booth[];
  visits: BoothVisit[];
  onRecordVisit: (boothId: string) => void;
}

export const BoothDirectory: React.FC<BoothDirectoryProps> = ({
  booths,
  visits,
  onRecordVisit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const completedBoothIds = new Set(
    visits.filter(v => v.verificationStatus === 'verified').map(v => v.boothId)
  );

  const filteredBooths = booths.filter((booth) => {
    const isCompleted = completedBoothIds.has(booth.id);
    const matchesSearch =
      booth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booth.facilitators.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'completed') return isCompleted;
    if (filterStatus === 'pending') return !isCompleted;
    return true;
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-400" />
          <span>Explore Booths</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Attend sessions, interact with facilitators, and ask for their booth code to verify your visit.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booths, topics, facilitators, hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Booths ({booths.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Not Completed ({booths.length - completedBoothIds.size})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Completed ({completedBoothIds.size})
          </button>
        </div>
      </div>

      {/* Booths List */}
      {filteredBooths.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No matching booths found</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or filter.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBooths.map((booth) => {
            const isCompleted = completedBoothIds.has(booth.id);
            const visitRecord = visits.find(v => v.boothId === booth.id && v.verificationStatus === 'verified');

            return (
              <div
                key={booth.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 space-y-3 transition shadow-md ${
                  isCompleted ? 'border-emerald-800/60 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {booth.name}
                      </h3>
                      {booth.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-900">
                          {booth.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {booth.description}
                    </p>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/70">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Facilitators: <strong className="text-slate-200">{booth.facilitators.join(', ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Location: <strong className="text-slate-200">{booth.location}</strong></span>
                  </div>
                </div>

                {/* Completed Reflection Snippet if completed */}
                {isCompleted && visitRecord && (
                  <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold">
                      <span>✓ Completed at {new Date(visitRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Facilitator: {visitRecord.facilitator}</span>
                    </div>
                    <p className="italic text-slate-400">"{visitRecord.reflection}"</p>
                  </div>
                )}

                {/* Bottom Action */}
                <div className="pt-1 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/80">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed ✓</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">
                      Status: Not Completed
                    </span>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => onRecordVisit(booth.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Record Visit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
