import React from 'react';
import { ArrowLeft, Ticket, Calendar, Clock, MapPin, User, Download, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Participant, EventConfig } from '../../types';
import { SaveTicketButton } from '../common/SaveTicketButton';
import { eventConfigFor } from '../../events';

interface TicketViewProps {
  participant: Participant;
  onBack: () => void;
  config?: EventConfig;
}

export const TicketView: React.FC<TicketViewProps> = ({ participant, onBack, config }) => {
  const cfg = config || eventConfigFor({
    id: participant.eventId,
    name: participant.eventId === 'monday-students-2026' ? "Nexus 2026 Students' Career Fair" : "Nexus 2026 Professionals' Career Fair",
    date: participant.eventDate || '',
    venue: '',
    time: '',
    audienceType: participant.eventId === 'monday-students-2026' ? 'students' : 'professionals',
    status: 'published',
    features: {
      preRegistration: false, registrationCode: false, walkInRegistration: false, boothTracking: false,
      questions: false, skillsLab: false, ticket: true, postEventSurvey: false,
    },
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-1">Your Event Ticket</h1>
      <p className="text-xs text-slate-500 mb-5">
        Present this at the entrance on event day. Show your code or let the desk scan the QR code.
      </p>

      {/* Ticket card */}
      <div className="bg-white border-2 border-orange/40 rounded-lg overflow-hidden shadow-card mb-5">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-navy">
              <Ticket className="w-4 h-4 text-orange" />
              <span>ADMIT ONE</span>
            </div>
            <span className="text-[11px] text-slate-500">{cfg.eventName}</span>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-md inline-flex self-center mx-auto">
            <QRCodeSVG value={`CAREERFAIR:${participant.code}:${participant.fullName}`} size={160} level="M" />
          </div>

          <div className="text-center">
            <p className="text-2xl font-mono font-black text-navy tracking-wider">{participant.code}</p>
            <p className="text-sm font-bold text-navy mt-2">{participant.fullName}</p>
            <p className="text-[11px] text-slate-500">{participant.email}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-orange/40 p-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange shrink-0" />
            <span>{cfg.eventDate || 'Event day'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange shrink-0" />
            <span>{participant.eventId === 'monday-students-2026' ? '9:00 AM' : '1:00 PM GMT'}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{cfg.eventLocation || 'Venue TBC'}</span>
          </div>
        </div>

        <div className="bg-cream p-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-4 h-4 shrink-0 text-blue" />
          <span>Keep this ticket safe — you'll verify your booth visits with the same code.</span>
        </div>
      </div>

      <div className="space-y-3">
        <SaveTicketButton participant={participant} config={cfg} />

        <button
          onClick={onBack}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-navy border border-slate-100 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};