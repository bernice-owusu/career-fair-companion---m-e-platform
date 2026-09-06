import React, { useEffect, useState } from 'react';
import { ScanLine, ShieldCheck, CheckCircle2, ArrowRight, Key, AlertCircle, UserPlus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventConfig } from '../../types';
import { RegistrationService } from '../../services/registrationService';

interface CodeCheckInScreenProps {
  config: EventConfig;
  eventId: string;
  initialParticipant?: Participant | null;
  onSuccess: (participant: Participant) => void;
  onBack: () => void;
  onRegisterInPerson: () => void;
}

type Phase = 'entry' | 'verifying' | 'confirm' | 'checking_in' | 'success';

export const CodeCheckInScreen: React.FC<CodeCheckInScreenProps> = ({
  config,
  eventId,
  initialParticipant,
  onSuccess,
  onBack,
  onRegisterInPerson,
}) => {
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>(initialParticipant ? 'confirm' : 'entry');
  const [foundParticipant, setFoundParticipant] = useState<Participant | null>(initialParticipant || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialParticipant) {
      setFoundParticipant(initialParticipant);
      setPhase(initialParticipant.checkedIn ? 'success' : 'confirm');
    }
  }, [initialParticipant]);

  const handleVerify = () => {
    setError('');
    setPhase('verifying');
    const result = RegistrationService.verifyRegistrationCode(code, eventId);
    // Small pause so the "Verifying..." state is visible; verification is real.
    setTimeout(() => {
      if (!result.valid || !result.participant) {
        setPhase('entry');
        setError(result.error || "We couldn't find that registration code.");
        return;
      }
      setFoundParticipant(result.participant);
      setPhase(result.participant.checkedIn ? 'success' : 'confirm');
    }, 450);
  };

  const handleCheckIn = () => {
    if (!foundParticipant) return;
    setError('');
    setPhase('checking_in');
    const result = RegistrationService.checkInParticipant(foundParticipant.id);
    if ('error' in result) {
      setPhase('confirm');
      setError(result.error);
      return;
    }
    setFoundParticipant(result.participant);
    setPhase('success');
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
  };

  if (phase === 'success' && foundParticipant) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-mist mx-auto shadow-xl shadow-teal/10 mb-5">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          You're Checked In! 🎉
        </h1>
        <p className="text-xs sm:text-sm text-mist/80 mb-6">
          Welcome, <span className="font-bold text-white">{foundParticipant.fullName}</span>! Your attendance has been
          recorded in the event system.
        </p>
        <div className="w-full bg-navy/80 border border-mist/15 rounded-2xl p-4 text-xs text-mist/80 space-y-2 mb-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-mist/60">Registration Code</span>
            <span className="font-mono font-bold text-orange">{foundParticipant.code}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-mist/60">Visa Status</span>
            <span className="font-semibold text-mist flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal"></span> Verified Attendee
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-mist/60">Target Goal</span>
            <span className="font-semibold text-white">Minimum {config.minBoothsRequired} Booths</span>
          </div>
        </div>
        <button
          onClick={() => onSuccess(foundParticipant)}
          className="w-full py-4 px-6 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-base shadow-lg shadow-teal/30 transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue to Career Fair</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-fadeIn">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition mb-4"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Back</span>
      </button>

      <div className="w-16 h-16 rounded-3xl bg-orange/20 border border-orange/30 flex items-center justify-center text-orange mx-auto mb-5 shadow-inner">
        {phase === 'confirm' || phase === 'checking_in' ? <ShieldCheck className="w-8 h-8" /> : <ScanLine className="w-8 h-8" />}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
        Event Check-In
      </h1>
      <p className="text-sm font-semibold text-orange mb-6">{config.eventName}</p>

      {(phase === 'confirm' || phase === 'checking_in') && foundParticipant ? (
        <div className="w-full space-y-4">
          <div className="bg-navy/90 border border-mist/15 rounded-2xl p-5 text-left space-y-3.5 shadow-xl">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-mist/60">Participant Name</span>
              <p className="text-base font-bold text-white mt-0.5">{foundParticipant.fullName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mist/15">
              <div>
                <span className="text-[10px] font-bold uppercase text-mist/60">Code</span>
                <p className="text-xs font-mono font-bold text-orange">{foundParticipant.code}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-mist/60">Registration</span>
                <p className="text-xs font-semibold text-mist">
                  {foundParticipant.registrationType === 'pre_registration' ? 'Pre-Registered' : 'Walk-In'}
                </p>
              </div>
            </div>
            {foundParticipant.checkedIn && (
              <div className="flex items-center gap-2 text-xs text-mist/80 border-t border-mist/15 pt-2">
                <Check className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>Already checked in earlier. You're all set!</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCheckIn}
            disabled={phase === 'checking_in'}
            className="w-full py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-base shadow-lg shadow-orange/30 transition-colors disabled:opacity-60"
          >
            {phase === 'checking_in' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Checking in...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Check In Now</span>
              </>
            )}
          </button>
          <button
            onClick={() => { setCode(''); setFoundParticipant(null); setPhase('entry'); setError(''); }}
            className="w-full py-3 px-4 rounded-xl bg-navy/70 hover:bg-navy/80 text-mist/80 border border-mist/15 text-xs font-bold transition"
          >
            Check a different code
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-mist/60 text-left">
            Enter your registration code
          </label>
          <input
            type="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="NEXUS-XXXXXX"
            value={code}
            onChange={e => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
              setError('');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleVerify();
            }}
            className="w-full px-4 py-4 bg-navy border border-mist/25 rounded-2xl text-xl sm:text-2xl font-mono font-black text-center text-white uppercase tracking-widest placeholder-mist/30 placeholder:text-base placeholder:font-normal focus:outline-none focus:border-orange transition"
          />
          <p className="text-[11px] text-mist/60 flex items-center justify-center gap-1 mb-1">
            <Key className="w-3 h-3 shrink-0" />
            Find your code in the confirmation email you received when you pre-registered.
          </p>

          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-200">{error}</strong>
                <span className="text-rose-300/80">Double-check your code, or register in person at the desk.</span>
              </div>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={phase === 'verifying'}
            className="w-full py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-base shadow-lg shadow-orange/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {phase === 'verifying' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              <>
                <ScanLine className="w-5 h-5" />
                <span>Verify & Check In</span>
              </>
            )}
          </button>

          <button
            onClick={onRegisterInPerson}
            className="w-full py-3 px-4 rounded-xl bg-navy/70 hover:bg-navy/80 text-mist/80 hover:text-white border border-mist/15 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-orange" />
            <span>I didn't pre-register — register in person</span>
          </button>
        </div>
      )}
    </div>
  );
};