import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  ArrowRight,
  Star,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  MailCheck,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CareerFairEvent, Participant, PreRegistrationData } from "../../types";
import { RegistrationService } from "../../services/registrationService";
import { eventConfigFor } from "../../events";
import { PreRegistrationForm } from "./PreRegistrationForm";
import { SaveTicketButton } from "../common/SaveTicketButton";

interface FridayPreRegistrationPageProps {
  event: CareerFairEvent;
  onContinue: () => void;
}

type Stage = "landing" | "form" | "done";

export const FridayPreRegistrationPage: React.FC<
  FridayPreRegistrationPageProps
> = ({ event, onContinue }) => {
  const [stage, setStage] = useState<Stage>("landing");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "pending" | "sent" | "not_configured" | "failed"
  >("pending");
  const [copied, setCopied] = useState(false);

  const config = eventConfigFor(event);

  const handleSubmit = async (data: PreRegistrationData) => {
    const created = RegistrationService.createPreRegistration(data);
    setParticipant(created);
    setStage("done");
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    } catch {
      // safe fallback
    }

    // Async: update Google Sheets + email the registration code (never signs the
    // participant in — pre-registration is standalone by design).
    const res = await RegistrationService.syncRegistration(created);
    if (res.success && res.configured === false)
      setEmailStatus("not_configured");
    else if (res.success) setEmailStatus("sent");
    else setEmailStatus("failed");
  };

  const handleCopyCode = () => {
    if (!participant) return;
    navigator.clipboard.writeText(participant.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stage === "form") {
    return (
      <PreRegistrationForm
        onSubmit={handleSubmit}
        onCancel={() => setStage("landing")}
      />
    );
  }

  if (stage === "done" && participant) {
    const detailLine = participant.currentJobTitle
      ? `${participant.currentJobTitle}${participant.highestEducation ? ` · ${participant.highestEducation}` : ""}`
      : participant.regionOfResidence || participant.institution || event.name;

    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-teal flex items-center justify-center text-white shadow-xl shadow-teal/20 mb-5">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Pre-Registration Complete 🎉
        </h1>
        <p className="text-xs sm:text-sm text-mist/80 mb-6">
          Welcome,{" "}
          <span className="font-bold text-white">{participant.fullName}</span>!
          Here is your official event credential.
        </p>

        {/* Code + QR card */}
        <div className="w-full bg-navy border-2 border-orange/40 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 rounded-full blur-2xl pointer-events-none"></div>

          <p className="text-xs font-bold uppercase tracking-widest text-orange mb-1">
            Your Registration Code
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
              {participant.code}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Participant Code"
              className="p-2 rounded-lg bg-navy/70 hover:bg-navy/80 text-mist hover:text-white transition border border-mist/25"
            >
              {copied ? (
                <Check className="w-4 h-4 text-mist" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-2xl inline-block shadow-inner mb-4">
            <QRCodeSVG
              value={`CAREERFAIR:${participant.code}:${participant.fullName}`}
              size={140}
              level="M"
            />
          </div>

          <div className="space-y-1 text-xs text-mist/60 border-t border-mist/15 pt-3">
            <p className="font-semibold text-mist">{detailLine}</p>
            <p className="text-[11px] text-mist/60">
              {event.name} · {event.time} · {event.venue}
            </p>
          </div>
        </div>

        <div className="w-full mb-1.5">
          <SaveTicketButton participant={participant} config={config} />
        </div>

        {/* Email / delivery note */}
        {emailStatus === "sent" && (
          <div className="w-full bg-teal/15 border border-teal/40 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
            <MailCheck className="w-5 h-5 text-teal shrink-0" />
            <p className="text-xs text-mist/80">
              Your code was sent to{" "}
              <span className="font-semibold text-white">
                {participant.email}
              </span>
              . Use it at the entrance to check in on event day.
            </p>
          </div>
        )}
        {emailStatus === "pending" && (
          <div className="w-full bg-navy/70 border border-mist/15 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
            <MailCheck className="w-5 h-5 text-mist shrink-0" />
            <p className="text-xs text-mist/80">
              Sharing your code with{" "}
              <span className="font-semibold text-white">
                {participant.email}
              </span>
              …
            </p>
          </div>
        )}
        {(emailStatus === "not_configured" || emailStatus === "failed") && (
          <div className="w-full bg-orange/10 border border-orange/40 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
            <p className="text-xs text-mist/80">
              Your code is{" "}
              <span className="font-semibold text-white">
                saved on this screen
              </span>{" "}
              — keep it safe and present it at the entrance.
            </p>
          </div>
        )}

        <div className="w-full space-y-3">
          {/* <button
            onClick={onContinue}
            className="w-full py-4 px-6 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-base shadow-lg shadow-teal/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue to Event Day Home</span>
            <ArrowRight className="w-5 h-5" />
          </button> */}

          <p className="text-[11px] text-mist/60 leading-relaxed">
            Pre-registration does not sign you in. On{" "}
            <span className="font-bold text-mist">
              Friday, September 25 at 1:00 PM GMT
            </span>
            , open the welcome screen from the entrance QR code, enter your code
            and check in to start your session.
          </p>
        </div>
      </div>
    );
  }

  // ---- Landing (standalone intro copy) ----
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 border border-orange/30 bg-orange/10 text-orange text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          <Star className="w-3.5 h-3.5" />
          Professionals' Career Fair · 2026
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          NEXUS CAREER FAIR
          <span className="block text-orange mt-1">PRE-REGISTRATION 2026</span>
        </h1>

        <p className="text-base sm:text-lg text-mist/90 font-semibold mt-6 max-w-xl mx-auto leading-relaxed">
          Are you a pharmacist or pharmacy professional seeking to explore
          unconventional career paths while networking with industry leaders?
        </p>
      </div>

      <div className="mt-10 bg-navy/90 border border-mist/15 rounded-3xl p-6 sm:p-8 shadow-xl w-full">
        <p className="text-sm sm:text-base text-mist/85 leading-relaxed">
          Join us for the third edition of the Nexus Career Fair on{" "}
          <span className="font-bold text-white">
            Friday, September 25 at 1:00 PM GMT
          </span>{" "}
          at the{" "}
          <span className="font-bold text-white">
            GCB Auditorium, University of Ghana campus in Accra
          </span>
          .
        </p>
        <p className="text-sm sm:text-base text-mist/85 leading-relaxed mt-4">
          Discover exciting opportunities, explore the 12 career-track booths,
          get Skills Lab support for your résumé and interviews, and gain
          valuable insights. Don&apos;t miss this chance to connect with leading
          experts. <span className="font-bold text-orange">Register now!</span>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal" /> Monday · Students /
            Friday · Professionals
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-teal" /> 1:00 PM GMT
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mist/80 border border-mist/20 rounded-full px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal" /> University of Ghana ·
            Accra
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
          Pre-register to receive your personal registration code — it takes
          about 3 minutes.
        </p>

        {/* <button
          onClick={onContinue}
          className="w-full py-2.5 text-xs font-bold text-mist/60 hover:text-white transition"
        >
          ← Back to Event Day Home
        </button> */}
      </div>
    </div>
  );
};
