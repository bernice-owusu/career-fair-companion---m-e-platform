import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Check, Loader2, Share2, Smartphone } from 'lucide-react';
import { Participant, EventConfig } from '../../types';
import { buildTicketPngBlob, saveOrShareTicket, ticketFilename } from '../../utils/ticketImage';

interface SaveTicketButtonProps {
  participant: Participant;
  config: EventConfig;
}

export const SaveTicketButton: React.FC<SaveTicketButtonProps> = ({ participant, config }) => {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const shareable = typeof navigator.share === 'function';

  const handleSave = async () => {
    setState('saving');
    try {
      const qr = hiddenRef.current?.querySelector('canvas') || null;
      const blob = await buildTicketPngBlob(participant, config, qr);
      if (!blob) {
        setState('error');
        return;
      }
      const result = await saveOrShareTicket(blob, ticketFilename(participant.code), `Your ${config.eventName} Registration Ticket`);
      setState(result === 'cancelled' ? 'idle' : 'done');
      setTimeout(() => setState((s) => (s === 'done' ? 'idle' : s)), 3000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <>
      <div ref={hiddenRef} style={{ position: 'absolute', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden>
        <QRCodeCanvas
          value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
          size={280}
          level="M"
          includeMargin
        />
      </div>

      <button
        onClick={handleSave}
        disabled={state === 'saving'}
        className={`w-full py-3.5 px-6 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
          state === 'done'
            ? 'border-teal/60 text-teal bg-teal/10'
            : state === 'error'
              ? 'border-rose-800 text-rose-400 bg-rose-950/60'
              : 'border-teal/40 text-teal hover:bg-teal/10 hover:text-teal'
        } ${state === 'saving' ? 'opacity-60 cursor-wait' : ''}`}
      >
        {state === 'saving' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating your ticket…</span>
          </>
        ) : state === 'done' ? (
          <>
            <Check className="w-4 h-4" />
            <span>Ticket saved</span>
          </>
        ) : state === 'error' ? (
          <>
            <Download className="w-4 h-4" />
            <span>Couldn't save — try again</span>
          </>
        ) : shareable ? (
          <>
            <Share2 className="w-4 h-4" />
            <span>Save ticket to this device</span>
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4" />
            <span>Save ticket to this device</span>
          </>
        )}
      </button>
    </>
  );
};