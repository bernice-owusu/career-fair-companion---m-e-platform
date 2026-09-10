import React from "react";
import { Globe } from "lucide-react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  eventName: string;
  participantName?: string;
  onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  eventName,
  participantName,
  onHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 text-navy px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Branding */}
        <button
          onClick={onHome}
          className="flex items-center gap-3 min-w-0 text-left"
        >
          <img
            src={logo}
            alt={`${eventName} logo`}
            className="w-9 h-9 rounded-md object-contain bg-navy border border-slate-100 shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-sm sm:text-base font-bold text-navy truncate tracking-tight">
              Nexus Career Fair
            </span>
            <span className="block text-[11px] sm:text-xs text-slate-500 truncate">
              {participantName
                ? `Participant: ${participantName}`
                : "Nexus 2026 · Digital Companion"}
            </span>
          </span>
        </button>

        {/* Right Mark */}
        {/* <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500">
          <Globe className="w-3.5 h-3.5 text-orange" />
          <span className="hidden sm:inline">2026</span>
        </div> */}
      </div>
    </header>
  );
};
