import React, { useState } from 'react';
import { X, Star, CheckCircle2, ArrowRight, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booth, ExitSurvey, Participant } from '../../types';
import { StorageService } from '../../services/storageService';
import { ACTIONABLE_NEXT_STEPS_OPTIONS } from '../../registrationOptions';

interface ExitSurveyModalProps {
  participant: Participant;
  booths: Booth[];
  onClose: () => void;
  onSuccess: (survey: ExitSurvey) => void;
}

const MultiChoiceButtons: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  maxSelections?: number;
}> = ({ value, onChange, options, maxSelections }) => {
  const toggle = (o: string) => {
    if (value.includes(o)) {
      onChange(value.filter(v => v !== o));
      return;
    }
    if (maxSelections !== undefined && value.length >= maxSelections) return;
    onChange([...value, o]);
  };

  const atCap = maxSelections !== undefined && value.length >= maxSelections;

  return (
    <div className="grid gap-2 pt-1">
      {options.map(o => {
        const selected = value.includes(o);
        const disabled = !selected && atCap;
        return (
          <button
            type="button"
            key={o}
            onClick={() => toggle(o)}
            disabled={disabled}
            aria-pressed={selected}
            className={`w-full min-h-12 px-4 py-2.5 rounded-full text-sm font-bold border transition active:scale-95 ${
              selected
                ? 'bg-orange/20 border-orange text-orange'
                : disabled
                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
};

export const ExitSurveyModal: React.FC<ExitSurveyModalProps> = ({
  participant,
  booths,
  onClose,
  onSuccess,
}) => {
  const [overallRating, setOverallRating] = useState<number | undefined>(undefined);
  const [confidenceRating, setConfidenceRating] = useState<number | undefined>(undefined);
  const [careerAwareness, setCareerAwareness] = useState<number | undefined>(undefined);
  const [mostUsefulBoothId, setMostUsefulBoothId] = useState<string>(booths[0]?.id || '');
  const [speakerEffectiveness, setSpeakerEffectiveness] = useState<number | undefined>(undefined);
  const [careerAdviceActionability, setCareerAdviceActionability] = useState<number | undefined>(undefined);
  const [facilitatorFeedback, setFacilitatorFeedback] = useState('');
  const [actionableNextSteps, setActionableNextSteps] = useState<string[]>([]);
  const [actionableNextStepsOther, setActionableNextStepsOther] = useState('');
  const [improvement, setImprovement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedSurvey, setSavedSurvey] = useState<ExitSurvey | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      overallRating === undefined ||
      confidenceRating === undefined ||
      careerAwareness === undefined ||
      speakerEffectiveness === undefined ||
      careerAdviceActionability === undefined
    ) {
      setValidationError('Please answer every required rating before submitting.');
      return;
    }
    if (actionableNextSteps.includes('Other') && !actionableNextStepsOther.trim()) {
      setValidationError('Please specify your answer for the next-steps question.');
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);

    const survey = StorageService.submitExitSurvey({
      participantId: participant.id,
      overallRating,
      confidenceRating,
      careerAwareness,
      mostUsefulBoothId,
      speakerEffectiveness,
      careerAdviceActionability,
      facilitatorFeedback: facilitatorFeedback.trim(),
      actionableNextSteps,
      actionableNextStepsOther: actionableNextStepsOther.trim(),
      improvement: improvement.trim() || "Great event overall!"
    });

    setSavedSurvey(survey);
    setIsSubmitting(false);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-100 rounded-lg w-full max-w-lg overflow-hidden shadow-lifted flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange/20 text-orange flex items-center justify-center">
              <Star className="w-4 h-4 fill-orange" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-navy">
                Career Fair Exit Survey
              </h2>
              <p className="text-[11px] text-slate-500">
                Help the M&E team evaluate today's impact
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-navy hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-teal mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy">Thank You for Your Feedback! 🎉</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your responses have been recorded in the central M&E dataset. Have a wonderful rest of the day!
                </p>
              </div>
              <button
                onClick={() => {
                  if (savedSurvey) {
                    onSuccess(savedSurvey);
                  }
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-full bg-teal hover:bg-teal/90 text-white font-bold text-sm transition"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Question 1: Overall Experience */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  1. How useful was the career fair overall? <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        overallRating !== undefined && overallRating >= star
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${overallRating !== undefined && overallRating >= star ? 'fill-orange text-orange' : ''}`} />
                      <span className="text-[10px] font-bold">{star}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Not Useful</span>
                  <span>5 - Extremely Useful</span>
                </div>
              </div>

              {/* Question 2: Career Transition Confidence */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  2. How confident do you feel about navigating your career transition from training to professional employment? <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setConfidenceRating(level)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        confidenceRating !== undefined && confidenceRating >= level
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${confidenceRating !== undefined && confidenceRating >= level ? 'text-orange' : ''}`} />
                      <span className="text-[10px] font-bold">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Not Confident at all</span>
                  <span>5 - Extremely Confident</span>
                </div>
              </div>

              {/* Question 3: Career Awareness */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  3. How would you rate your current awareness of non-traditional (pharmacovigilance, supply chain) and emerging career pathways for pharmacists? <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setCareerAwareness(level)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        careerAwareness !== undefined && careerAwareness >= level
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Very Low / Unaware</span>
                  <span>5 - Very High / Well-Informed</span>
                </div>
              </div>

              {/* Question 4: Most Valuable Session */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  4. Which specific non-traditional session or track did you attend and find most valuable? <span className="text-error">*</span>
                </label>
                <select
                  value={mostUsefulBoothId}
                  onChange={(e) => setMostUsefulBoothId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-navy focus:outline-none focus:border-orange"
                >
                  {booths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question 5: Speaker Effectiveness */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  5. Rate how well the speaker communicated the realities and entry requirements of the specific non-traditional path. <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setSpeakerEffectiveness(level)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        speakerEffectiveness !== undefined && speakerEffectiveness >= level
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Poor</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              {/* Question 6: Career Advice Actionability */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  6. Rate how actionable the career advice and pathway insights were for your current career stage. <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setCareerAdviceActionability(level)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        careerAdviceActionability !== undefined && careerAdviceActionability >= level
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Not Actionable</span>
                  <span>5 - Highly Actionable</span>
                </div>
              </div>

              {/* Question 7: Facilitator Feedback */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  7. Any specific comments or feedback for the session facilitators?
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional — share any feedback for the facilitators"
                  value={facilitatorFeedback}
                  onChange={(e) => setFacilitatorFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange resize-none"
                />
              </div>

              {/* Question 8: Actionable Next Steps */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  8. What immediate action do you plan to take after today's event? (Select up to 2)
                </label>
                <MultiChoiceButtons
                  value={actionableNextSteps}
                  onChange={setActionableNextSteps}
                  options={ACTIONABLE_NEXT_STEPS_OPTIONS}
                  maxSelections={2}
                />
                {actionableNextSteps.includes('Other') && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={actionableNextStepsOther}
                    onChange={(e) => setActionableNextStepsOther(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange"
                  />
                )}
              </div>

              {/* Question 9: Improvement Feedback */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  9. What could we improve for future career fairs?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Longer Q&A time at tech booths, additional company stands..."
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange resize-none"
                />
              </div>

              {validationError && (
                <p className="text-xs text-error font-semibold text-center">{validationError}</p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-full bg-orange hover:bg-orange/90 text-navy hover:text-white font-bold text-base transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></span>
                    Submitting Survey...
                  </span>
                ) : (
                  <>
                    <span>Submit Exit Survey</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
