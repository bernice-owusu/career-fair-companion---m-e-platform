import React, { useState } from "react";
import { GraduationCap, ArrowRight, Star, Calendar, Clock, MapPin, UserCheck, ChevronDown, AlertTriangle } from "lucide-react";
import { CareerFairEvent, MondayRegistrationData } from "../../types";
import { MondayRegistrationForm } from "./MondayRegistrationForm";

interface MondayRegistrationPageProps {
  event: CareerFairEvent;
  onSubmit: (data: MondayRegistrationData) => void | Promise<void>;
  onCancel: () => void;
  onResume?: (email: string) => boolean;
}

type Stage = "landing" | "form";

export const MondayRegistrationPage: React.FC<MondayRegistrationPageProps> = ({
  event,
  onSubmit,
  onCancel,
  onResume,
}) => {
  const [stage, setStage] = useState<Stage>("landing");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeEmail, setResumeEmail] = useState("");
  const [resumeError, setResumeError] = useState("");

  const handleResume = () => {
    const email = resumeEmail.trim();
    if (!email) {
      setResumeError("Enter the email you registered with.");
      return;
    }
    if (!onResume) return;
    const ok = onResume(email);
    setResumeError(ok ? "" : "We couldn't find a registration with that email. You can register below.");
  };

  if (stage === "form") {
    return (
      <MondayRegistrationForm
        event={event}
        onSubmit={onSubmit}
        onCancel={() => {
          setStage("landing");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  // ---- Standalone landing (intro copy) ----
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 border border-teal/30 bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          <GraduationCap className="w-3.5 h-3.5" />
          Students' Career Fair · 2026
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          NEXUS CAREER FAIR
          <span className="block text-orange mt-1">
            STUDENTS' REGISTRATION 2026
          </span>
        </h1>

        <p className="text-base sm:text-lg text-mist/90 font-semibold mt-6 max-w-xl mx-auto leading-relaxed">
          Are you a pharmacy or health-science student ready to explore your
          future career while learning from industry leaders?
        </p>
      </div>

      <div className="mt-10 bg-navy/90 border border-mist/15 rounded-3xl p-6 sm:p-8 shadow-xl w-full">
        <p className="text-sm sm:text-base text-mist/85 leading-relaxed">
          Join us for the Nexus 2026 Students' Career Fair on{" "}
          <span className="font-bold text-white">
            Monday, September 21 at 9:00 AM GMT
          </span>{" "}
          at the{" "}
          <span className="font-bold text-white">
            Public Health Auditorium, University of Ghana campus in Accra
          </span>
          .
        </p>
        <p className="text-sm sm:text-base text-mist/85 leading-relaxed mt-4">
          Discover exciting opportunities, ask our panel of experts your career
          questions, and gain insights that will shape your professional
          journey. All pharmacy and health-science students are welcome.{" "}
          <span className="font-bold text-orange">Register now!</span>
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal" /> Monday · Students
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-teal" /> 9:00 AM GMT
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal" /> Public Health
            Auditorium · UG Campus
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3 w-full">
        <button
          onClick={() => {
            setStage("form");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-black text-lg tracking-wide shadow-lg shadow-orange/30 transition-colors flex items-center justify-center gap-2"
        >
          <span>Register Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-[11px] text-mist/60">
          Registering takes less than a minute — your entry will be recorded at
          the auditorium.
        </p>

        {/* Already registered? Resume by email */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setResumeOpen(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-teal hover:text-teal transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Already registered? Resume my session</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${resumeOpen ? 'rotate-180' : ''}`} />
          </button>

          {resumeOpen && (
            <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 mt-3 space-y-2.5 animate-fadeIn">
              <p className="text-xs text-mist/80">
                Enter the email you used to register and we'll take you straight
                back to your session.
              </p>
              <input
                type="email"
                value={resumeEmail}
                onChange={e => {
                  setResumeEmail(e.target.value);
                  setResumeError("");
                }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-teal"
              />
              <button
                type="button"
                onClick={handleResume}
                className="w-full py-3 px-4 rounded-xl bg-teal hover:bg-teal/90 text-white text-sm font-bold transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4" />
                Resume My Session
              </button>
              {resumeError && (
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {resumeError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* <button
          onClick={onCancel}
          className="w-full py-2.5 text-xs font-bold text-mist/60 hover:text-white transition"
        >
          ← Back to Event Day Home
        </button> */}
      </div>
    </div>
  );
};
