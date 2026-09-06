import React, { useEffect, useState } from "react";
import {
  Shield,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { CareerFairEvent, EventConfig } from "../../types";
import { EVENTS, DEFAULT_EVENT_ID, eventConfigFor } from "../../events";
import { StorageService } from "../../services/storageService";
import { AdminDashboard } from "./AdminDashboard";
import { MondayAnalytics } from "./MondayAnalytics";
import { AdminLogin } from "./AdminLogin";

interface MneAdminProps {
  onExit: () => void;
}

type SelectorView = "selector" | "admin";

export const MneAdmin: React.FC<MneAdminProps> = ({ onExit }) => {
  const [isAuthed, setIsAuthed] = useState<boolean>(() =>
    StorageService.isAdminLoggedIn(),
  );
  const [loginOpen, setLoginOpen] = useState<boolean>(
    () => !StorageService.isAdminLoggedIn(),
  );
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_EVENT_ID);
  const [view, setView] = useState<SelectorView>("selector");
  const [config, setConfig] = useState<EventConfig>(StorageService.getConfig());

  const handleUpdateConfig = (newConf: EventConfig) => {
    setConfig(newConf);
    StorageService.saveConfig(newConf);
  };

  const selectedEvent: CareerFairEvent =
    EVENTS.find((e) => e.id === selectedId) || EVENTS[0];

  const handleLoginSuccess = () => {
    StorageService.setAdminLoggedIn(true);
    setIsAuthed(true);
    setLoginOpen(false);
  };

  const handleSignOut = () => {
    StorageService.setAdminLoggedIn(false);
    setIsAuthed(false);
    setView("selector");
    setLoginOpen(true);
  };

  // On the admin dashboard screen, re-check auth
  useEffect(() => {
    if (view === "admin" && !StorageService.isAdminLoggedIn()) {
      setIsAuthed(false);
      setLoginOpen(true);
      setView("selector");
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-navy text-mist">
      <header className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-mist/15 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange/30 flex items-center justify-center text-orange shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-mist truncate tracking-tight">
                M&E Monitoring Center
              </h1>
              <p className="text-[11px] sm:text-xs text-mist/60">
                Nexus 2026 · Event Analytics & Google Sheets
              </p>
            </div>
          </div>
          {isAuthed && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-navy/70 hover:bg-navy/80 text-mist border border-mist/25 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1">
        {!isAuthed ? (
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-orange/20 border border-orange/30 flex items-center justify-center text-orange mx-auto">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              M&E Admin Access
            </h2>
            <p className="text-xs text-mist/60">
              Sign in with your admin passcode to view live event monitoring and
              analytics.
            </p>
            <button
              onClick={() => setLoginOpen(true)}
              className="w-full py-3.5 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-sm shadow-lg shadow-orange/25 transition"
            >
              Sign In
            </button>
            <button
              onClick={onExit}
              className="w-full py-2.5 text-xs font-bold text-mist/60 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Event Day Home
            </button>
          </div>
        ) : view === "selector" ? (
          /* Event selector screen */
          <div className="max-w-md mx-auto px-4 py-10 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight text-center mb-2">
              Select an Event to Monitor
            </h2>
            <div className="space-y-3">
              {EVENTS.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setSelectedId(ev.id);
                    setView("admin");
                  }}
                  className="w-full text-left bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md hover:border-orange/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ev.audienceType === "students"
                          ? "bg-blue/20 border border-blue/40 text-blue"
                          : "bg-orange/20 border border-orange/40 text-orange"
                      }`}
                    >
                      {ev.audienceType === "students" ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {ev.name}
                      </p>
                      <p className="text-[11px] text-mist/60 truncate">
                        {ev.audienceType === "students"
                          ? "Students"
                          : "Professionals"}{" "}
                        · {ev.date}
                      </p>
                    </div>
                    <span className="text-orange text-lg shrink-0">→</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-mist/15 text-[10px] text-mist/50">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ev.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.time}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {ev.venue}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {/* <button
              onClick={() => setView('selector')}
              className="w-full py-2.5 text-xs font-bold text-mist/60 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Welcome
            </button> */}
          </div>
        ) : selectedId === "monday-students-2026" ? (
          <MondayAnalytics
            event={selectedEvent}
            onBack={() => setView("selector")}
          />
        ) : (
          <div>
            <div className="max-w-7xl mx-auto w-full">
              <div className="px-4 pt-4">
                <button
                  onClick={() => setView("selector")}
                  className="flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Switch Event</span>
                </button>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange">
                    {selectedEvent.name}
                  </span>
                  <span className="text-[10px] text-mist/50">
                    {selectedEvent.date} · {selectedEvent.venue}
                  </span>
                </div>
              </div>
            </div>
            <AdminDashboard
              config={eventConfigFor(selectedEvent, config)}
              eventId={selectedEvent.id}
              onUpdateConfig={handleUpdateConfig}
              onExitAdmin={handleSignOut}
            />
          </div>
        )}
      </main>

      <AdminLogin
        config={config}
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          if (!isAuthed) {
            /* stay on unauthed view */
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
