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
        <h1 className="text-2xl font-bold text-navy tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-orange" />
          <span>Explore Booths</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Attend sessions, interact with facilitators, and find their booth code displayed at the booth to verify your visit.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booths, topics, facilitators, hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'all'
                ? 'bg-orange text-white'
                : 'bg-white text-slate-500 hover:text-navy border border-slate-100'
            }`}
          >
            All Booths ({booths.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'pending'
                ? 'bg-orange text-white'
                : 'bg-white text-slate-500 hover:text-navy border border-slate-100'
            }`}
          >
            Not Completed ({booths.length - completedBoothIds.size})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'completed'
                ? 'bg-teal text-white'
                : 'bg-white text-slate-500 hover:text-navy border border-slate-100'
            }`}
          >
            Completed ({completedBoothIds.size})
          </button>
        </div>
      </div>

      {/* Booths List */}
      {filteredBooths.length === 0 ? (
        <div className="bg-cream border border-dashed border-slate-100 rounded-lg p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-500">No matching booths found</p>
          <p className="text-xs text-slate-300">Try adjusting your search terms or filter.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBooths.map((booth) => {
            const isCompleted = completedBoothIds.has(booth.id);
            const visitRecord = visits.find(v => v.boothId === booth.id && v.verificationStatus === 'verified');

            return (
              <div
                key={booth.id}
                className={`bg-white border rounded-lg p-4 sm:p-5 space-y-3 transition shadow-card ${
                  isCompleted ? 'border-teal/40 bg-teal/10' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-navy tracking-tight">
                        {booth.name}
                      </h3>
                      {booth.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange/15 text-navy border border-orange/30">
                          {booth.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {booth.description}
                    </p>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-orange shrink-0" />
                    <span>Facilitators: <strong className="text-navy">{booth.facilitators.join(', ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Location: <strong className="text-navy">{booth.location}</strong></span>
                  </div>
                </div>

                {/* Completed Reflection Snippet if completed */}
                {isCompleted && visitRecord && (
                  <div className="bg-cream rounded-md p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-navy font-semibold">
                      <span>✓ Completed at {new Date(visitRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Facilitator: {visitRecord.facilitator}</span>
                    </div>
                    <p className="italic text-slate-500">"{visitRecord.reflection}"</p>
                  </div>
                )}

                {/* Bottom Action */}
                <div className="pt-1 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-navy bg-teal/20 px-3 py-1.5 rounded-full border border-teal/40">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed ✓</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium">
                      Status: Not Completed
                    </span>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => onRecordVisit(booth.id)}
                      className="px-4 py-2 rounded-full bg-orange hover:bg-orange/90 text-white text-xs font-bold transition flex items-center gap-1.5"
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
