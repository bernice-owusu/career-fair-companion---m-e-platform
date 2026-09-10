import React from "react";
import {
  Sparkles,
  ArrowRight,
  ScanLine,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  LogOut,
  UserCheck,
} from "lucide-react";
import { CareerFairEvent, Participant, ParticipantSession } from "../../types";

interface WelcomeGateProps {
  event: CareerFairEvent; // the event-day entry (Monday students' or Friday pharmacists' fair)
  session: ParticipantSession | null;
  sessionParticipant: Participant | null;
  onContinueSession: () => void;
  onSignOut: () => void;
  onPreRegistered: () => void;
  onWalkIn: () => void;
  onMondayRegister: () => void;
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({
  event,
  session,
  sessionParticipant,
  onContinueSession,
  onSignOut,
  onPreRegistered,
  onWalkIn,
  onMondayRegister,
}) => {
  const activeSession = !!session && !!sessionParticipant;

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-lg mx-auto animate-fadeIn">
      {/* Event Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange/15 border border-orange/25 text-navy text-xs font-semibold mb-5">
        <Sparkles className="w-3.5 h-3.5 text-orange" />
        <span>Official Event Digital Companion</span>
      </div>

      {/* Main Title & Description */}
      <div className="text-center space-y-3 mb-7">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight leading-tight">
          Welcome to <br />
          <span className="text-orange">
            {event.name}
          </span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          Your interactive digital passport for today's career fair.
          {event.features.boothTracking
            ? " Check in, verify booth sessions, submit reflections, and earn your completion certificate."
            : " Check in, explore the agenda, and share your feedback."}
        </p>
      </div>

      {/* Event Details Card */}
      <div className="w-full bg-white border border-slate-100 rounded-lg p-4 sm:p-5 mb-7 shadow-card space-y-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Calendar className="w-4 h-4 text-orange shrink-0" />
          <span>
            {new Date(`${event.date}T00:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <Clock className="w-4 h-4 text-orange shrink-0" />
          <span>{event.time || "TBC"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
      </div>

      {activeSession && sessionParticipant ? (
        /* ---- Saved session: Welcome Back. Login options are deliberately HIDDEN. ---- */
        <div className="w-full space-y-4">
          <div className="bg-orange/10 border border-orange/40 rounded-lg p-4 shadow-card w-full">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Welcome Back
              </span>
              <span className="text-xs font-mono font-bold bg-orange/20 px-2 py-0.5 rounded-full text-navy border border-orange/40">
                {sessionParticipant.code}
              </span>
            </div>
            <p className="text-lg font-bold text-navy">
              {sessionParticipant.fullName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {event.name} — your session is still active.
            </p>
          </div>

          <button
            onClick={onContinueSession}
            className="w-full py-4 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue to Career Fair</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onSignOut}
            className="w-full py-3.5 px-6 rounded-full border border-slate-300 hover:border-error/60 text-slate-500 hover:text-error font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch Participant</span>
          </button>
        </div>
      ) : (
        /* ---- No session: login & registration options ---- */
        <div className="w-full space-y-3 mb-6">
          <h2 className="text-center text-lg font-bold text-navy tracking-tight">
            Have you pre-registered?
          </h2>

          <button
            onClick={onPreRegistered}
            className="w-full py-5 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors group flex items-center justify-center gap-3"
          >
            <ScanLine className="w-6 h-6" />
            <span>I Pre-Registered</span>
            <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-slate-500 -mt-1">
            Enter the code you received by email to check in.
          </p>

          <button
            onClick={onWalkIn}
            className="w-full py-5 px-6 rounded-full bg-white border-2 border-teal/60 text-navy font-bold text-base transition-colors group flex items-center justify-center gap-3 hover:bg-teal/10"
          >
            <UserPlus className="w-6 h-6" />
            <span>I Did Not Pre-Register</span>
            <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-slate-500 -mt-1">
            Register in person in less than a minute.
          </p>

          {/* Monday Students' fair — separate event entry */}
          {/* <button
            onClick={onMondayRegister}
            className="w-full py-4 px-6 rounded-2xl bg-navy/80 border border-mist/20 text-mist/80 text-sm font-semibold transition-colors hover:border-blue/60 hover:text-white flex items-center justify-center gap-3"
          >
            <Star className="w-5 h-5 text-blue" />
            <span>Monday · Students' Career Fair — student registration</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <p className="text-center text-[11px] text-mist/50 -mt-1">
            Students' fair on Monday 21 Sep · Public Health Auditorium
          </p> */}
        </div>
      )}

      {/* Feature Highlights Grid */}
      {/* <div className="grid grid-cols-3 gap-2 w-full pt-6 border-t border-mist/15 text-center">
        <div className="p-2.5 rounded-xl bg-navy/40 border border-mist/15">
          <ShieldCheck className="w-5 h-5 text-orange mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-mist">100% Digital</p>
          <p className="text-[10px] text-mist/60">Zero paper forms</p>
        </div>
        <div className="p-2.5 rounded-xl bg-navy/40 border border-mist/15">
          <ScanLine className="w-5 h-5 text-mist mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-mist">Verified Codes</p>
          <p className="text-[10px] text-mist/60">Booth facilitators</p>
        </div>
        <div className="p-2.5 rounded-xl bg-navy/40 border border-mist/15">
          <Star className="w-5 h-5 text-blue mx-auto mb-1" />
          <p className="text-[11px] font-semibold text-mist">Two Events</p>
          <p className="text-[10px] text-mist/60">
            Students · Qualified Pharmacists
          </p>
        </div>
      </div> */}
    </div>
  );
};
