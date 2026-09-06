import React from "react";
import { Shield, User, QrCode } from "lucide-react";
import { EventConfig } from "../../types";
import logo from "@/assets/logo.png";

interface HeaderProps {
  config: EventConfig;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenEntranceQR: () => void;
  currentParticipantName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isAdmin,
  onToggleAdmin,
  onOpenEntranceQR,
  currentParticipantName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-mist/15 text-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logo}
            alt={`${config.eventName} logo`}
            className="w-9 h-9 rounded-lg object-contain bg-navy shadow-md shadow-orange/20 border border-mist/15 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-mist truncate tracking-tight">
              {config.eventName}
            </h1>
            <p className="text-[11px] sm:text-xs text-mist/60 flex items-center gap-1.5 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
              {isAdmin
                ? "M&E Monitoring Center"
                : currentParticipantName
                  ? `Participant: ${currentParticipantName}`
                  : "Digital Companion & PWA"}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Entrance QR Generator / Poster */}
          {/* <button
            onClick={onOpenEntranceQR}
            title="Show Entrance QR Code"
            className="flex items-center gap-1.5 text-xs font-medium bg-navy/70 hover:bg-navy/80 text-mist px-2.5 py-1.5 rounded-lg border border-mist/25 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-orange" />
            <span className="hidden sm:inline">Entrance QR</span>
          </button> */}

          {/* Role Switcher */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm ${
              isAdmin
                ? "bg-orange text-white hover:bg-orange/90 shadow-orange/30"
                : "bg-navy/70 hover:bg-navy/80 text-mist border border-mist/25"
            }`}
          >
            {isAdmin ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-orange" />
                <span>M&E Admin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
