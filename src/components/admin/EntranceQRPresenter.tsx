import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Sparkles, Copy, Check, Printer, ExternalLink } from 'lucide-react';
import { EventConfig } from '../../types';

interface EntranceQRPresenterProps {
  config: EventConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const EntranceQRPresenter: React.FC<EntranceQRPresenterProps> = ({
  config,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 relative text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/15 text-orange text-xs font-semibold border border-orange/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Entrance Poster Mode</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scan to Register & Check In
          </h2>
          <p className="text-xs sm:text-sm text-mist/80 font-medium">
            {config.eventName}
          </p>
        </div>

        {/* Big Crisp QR Code Container */}
        <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl mx-auto border-4 border-orange/20">
          <QRCodeSVG
            value={appUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
          <p className="text-[11px] font-bold text-navy mt-2 font-mono tracking-tight">
            100% Digital • No Paper Forms
          </p>
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          <p className="text-xs text-mist/80">
            Point your smartphone camera at the QR code above to open your personal career fair passport.
          </p>
          <div className="flex items-center justify-center gap-2 bg-navy px-3 py-2 rounded-xl border border-mist/15 text-xs font-mono text-mist/60">
            <span className="truncate">{appUrl}</span>
            <button
              onClick={handleCopyLink}
              title="Copy URL"
              className="text-orange hover:text-orange/80 shrink-0 font-bold"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-navy/70 hover:bg-navy/80 text-mist text-xs font-bold transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Entrance Sign</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-bold transition shadow-lg shadow-orange/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
