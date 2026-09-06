import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, User, MessageSquare, Key, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booth, BoothVisit, Participant } from '../../types';
import { StorageService } from '../../services/storageService';

interface RecordBoothVisitModalProps {
  participant: Participant;
  booths: Booth[];
  initialBoothId?: string;
  onClose: () => void;
  onSuccess: (visit: BoothVisit) => void;
}

export const RecordBoothVisitModal: React.FC<RecordBoothVisitModalProps> = ({
  participant,
  booths,
  initialBoothId,
  onClose,
  onSuccess,
}) => {
  // Step state: 1: Select Booth, 2: Code, 3: Facilitator, 4: Reflection, 5: Confirmation, 6: Success
  const [selectedBoothId, setSelectedBoothId] = useState<string>(initialBoothId || booths[0]?.id || '');
  const [boothCode, setBoothCode] = useState('');
  const [selectedFacilitator, setSelectedFacilitator] = useState<string>('');
  const [reflection, setReflection] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedVisit, setVerifiedVisit] = useState<BoothVisit | null>(null);

  // Derive current booth
  const currentBooth = booths.find(b => b.id === selectedBoothId) || booths[0];

  // When selected booth changes, update default facilitator
  React.useEffect(() => {
    if (currentBooth && currentBooth.facilitators.length > 0) {
      setSelectedFacilitator(currentBooth.facilitators[0]);
    }
  }, [selectedBoothId, currentBooth]);

  // Handle final submission & verification
  const handleSubmit = () => {
    setErrorMsg('');
    setIsSubmitting(true);

    // Call storage service validation
    const result = StorageService.recordBoothVisit({
      participantId: participant.id,
      boothId: selectedBoothId,
      enteredCode: boothCode,
      selectedFacilitator: selectedFacilitator,
      reflection: reflection
    });

    setIsSubmitting(false);

    if (!result.success || !result.visit) {
      setErrorMsg(result.error || 'Verification failed. Please check the booth code and facilitator.');
      return;
    }

    setVerifiedVisit(result.visit);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mist/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange/20 text-orange flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Record Booth Visit
              </h2>
              <p className="text-[11px] text-mist/60">
                Verify session with facilitator code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {verifiedVisit ? (
            /* Success Verified Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-mist mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">✓ Booth Completed!</h3>
                <p className="text-xs text-mist/80">
                  Your visit to <strong className="text-white">{verifiedVisit.boothName}</strong> has been officially verified.
                </p>
              </div>

              <div className="bg-navy rounded-2xl p-4 border border-mist/15 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-mist/60">Facilitator</span>
                  <span className="font-semibold text-mist">{verifiedVisit.facilitator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist/60">Verified Code</span>
                  <span className="font-mono font-bold text-orange">{verifiedVisit.boothCode}</span>
                </div>
                <div className="pt-2 border-t border-mist/15">
                  <span className="text-mist/60 block mb-1">Your Learning Reflection:</span>
                  <p className="text-mist/80 italic">"{verifiedVisit.reflection}"</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSuccess(verifiedVisit);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-sm shadow-lg shadow-teal/30 transition"
              >
                Explore More Booths
              </button>
            </div>
          ) : (
            /* Form Steps */
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-200">Validation Error:</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Step 1: Select Booth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
                  1. Which booth did you attend? <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedBoothId}
                  onChange={(e) => {
                    setSelectedBoothId(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white focus:outline-none focus:border-orange"
                >
                  {booths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
                {currentBooth && (
                  <p className="text-[11px] text-mist/60 mt-1">
                    {currentBooth.description}
                  </p>
                )}
              </div>

              {/* Step 2: Booth Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>2. Enter Booth Code</span> <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CV4827 (Ask the facilitator)"
                  value={boothCode}
                  onChange={(e) => {
                    setBoothCode(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white font-mono uppercase tracking-wider placeholder-mist/40 focus:outline-none focus:border-orange"
                />
                <p className="text-[11px] text-mist/60 mt-1">
                  Ask the facilitator at the booth for the official verification code.
                </p>
              </div>

              {/* Step 3: Facilitator Selection (Prevents typos!) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>3. Who facilitated this session?</span> <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {currentBooth?.facilitators.map((fac) => (
                    <label
                      key={fac}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                        selectedFacilitator === fac
                          ? 'bg-orange/15 border-orange text-white'
                          : 'bg-navy/60 border-mist/15 text-mist/80 hover:border-mist/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="facilitator"
                        value={fac}
                        checked={selectedFacilitator === fac}
                        onChange={() => {
                          setSelectedFacilitator(fac);
                          setErrorMsg('');
                        }}
                        className="text-orange focus:ring-orange"
                      />
                      <span className="text-xs sm:text-sm font-semibold">{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 4: Learning Reflection */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>4. What did you learn from this booth?</span> <span className="text-rose-400">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${reflection.length > 280 ? 'text-orange' : 'text-mist/60'}`}>
                    {reflection.length}/300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Share one key takeaway or insight you gained from this session..."
                  value={reflection}
                  onChange={(e) => {
                    setReflection(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-3.5 py-2 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange resize-none"
                />
              </div>

              {/* Confirmation Preview */}
              <div className="bg-navy/70 border border-mist/15 rounded-2xl p-3.5 space-y-1.5 text-xs text-mist/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 block mb-1">
                  Summary to Submit:
                </span>
                <p><strong>Booth:</strong> {currentBooth?.name}</p>
                <p><strong>Facilitator:</strong> {selectedFacilitator || 'None selected'}</p>
                <p><strong>Booth Code:</strong> <span className="font-mono">{boothCode || '—'}</span></p>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !boothCode.trim() || !reflection.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-sm shadow-lg shadow-orange/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Verifying Booth Code...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Booth Visit</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
