import React, { useRef, useState } from 'react';
import { X, Star, CheckCircle2, ArrowRight, ArrowLeft, Send, Pencil } from 'lucide-react';
import { Participant, PostEventSurvey } from '../../types';
import { StorageService } from '../../services/storageService';
import { ACTIONABLE_NEXT_STEPS_OPTIONS } from '../../registrationOptions';

interface MondaySurveyModalProps {
  participant: Participant;
  onClose: () => void;
  onSuccess: (survey: PostEventSurvey) => void;
}

const QUESTION_COUNT = 10;
const STEP_QUESTION_IDS = ['sessionValue', 'organisation', 'facilitatorsConnected', 'connectWithCompanies', 'returnLikelihood', 'careerAwareness', 'careerTransitionConfidence', 'actionableNextSteps', 'themes', 'improvements'] as const;
const STEP_TITLES = [
  'Today\u2019s session',
  'Event organisation',
  'Facilitators connected',
  'Connect with companies?',
  'Attend again?',
  'Career awareness',
  'Career confidence',
  'Next steps',
  'Future themes',
  'Improvements',
];
const RATING_STEPS = [0, 1, 4, 5, 6];
const ACTIONABLE_STEP = 7;

const FACILITATOR_OPTIONS = [
  'Pharm. Eunice Baiden Laryea',
  'Dr. (Pharm.) Darius Obeng Essah',
  'Pharm. Alexis Banie',
];
const NONE_OPTION = 'None';

const StarRating: React.FC<{
  value: number | undefined;
  onChange: (n: number) => void;
  startLabel: string;
  endLabel: string;
}> = ({ value, onChange, startLabel, endLabel }) => (
  <div>
    <div className="grid grid-cols-5 gap-2 pt-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`flex-1 min-h-14 rounded-md flex flex-col items-center justify-center gap-1 border transition active:scale-95 ${
            value !== undefined && value >= n
              ? 'bg-orange/20 border-orange text-orange'
              : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
          }`}
        >
          <Star className={`w-5 h-5 ${value !== undefined && value >= n ? 'fill-orange text-orange' : ''}`} />
          <span className="text-[10px] font-bold">{n}</span>
        </button>
      ))}
    </div>
    <div className="flex justify-between text-[10px] text-slate-300 px-1 mt-1.5">
      <span>{startLabel}</span>
      <span>{endLabel}</span>
    </div>
  </div>
);

const ChoiceButtons: React.FC<{
  value: string;
  onChange: (o: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => (
  <div className="grid gap-2 pt-1">
    {options.map(o => (
      <button
        type="button"
        key={o}
        onClick={() => onChange(o)}
        aria-pressed={value === o}
        className={`w-full min-h-12 px-4 py-2.5 rounded-full text-sm font-bold border transition active:scale-95 ${
          value === o
            ? 'bg-orange/20 border-orange text-orange'
            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const MultiChoiceButtons: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  noneOption?: string;
  maxSelections?: number;
}> = ({ value, onChange, options, noneOption, maxSelections }) => {
  const withoutNone = (v: string[]) => (noneOption ? v.filter(x => x !== noneOption) : v);

  const toggle = (o: string) => {
    if (noneOption && o === noneOption) {
      onChange(value.includes(noneOption) ? [] : [noneOption]);
      return;
    }
    const rest = withoutNone(value);
    if (rest.includes(o)) {
      onChange(rest.filter(v => v !== o));
      return;
    }
    if (maxSelections !== undefined && rest.length >= maxSelections) return;
    onChange([...rest, o]);
  };

  const allOptions = noneOption ? [...options, noneOption] : options;
  const atCap = maxSelections !== undefined && withoutNone(value).length >= maxSelections;

  return (
    <div className="grid gap-2 pt-1">
      {allOptions.map(o => {
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

const TextQuestion: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <textarea
    rows={4}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange resize-none transition min-h-24"
  />
);

export const MondaySurveyModal: React.FC<MondaySurveyModalProps> = ({ participant, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [sessionValue, setSessionValue] = useState<number | undefined>(undefined);
  const [organisation, setOrganisation] = useState<number | undefined>(undefined);
  const [facilitatorsConnected, setFacilitatorsConnected] = useState<string[]>([]);
  const [connectWithCompanies, setConnectWithCompanies] = useState('');
  const [returnLikelihood, setReturnLikelihood] = useState<number | undefined>(undefined);
  const [careerAwareness, setCareerAwareness] = useState<number | undefined>(undefined);
  const [careerTransitionConfidence, setCareerTransitionConfidence] = useState<number | undefined>(undefined);
  const [actionableNextSteps, setActionableNextSteps] = useState<string[]>([]);
  const [actionableNextStepsOther, setActionableNextStepsOther] = useState('');
  const [themes, setThemes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedSurvey, setSavedSurvey] = useState<PostEventSurvey | null>(null);
  const [blockedStep, setBlockedStep] = useState<number | null>(null);

  const isReviewStep = step === QUESTION_COUNT;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isMoving, setIsMoving] = useState(false);
  const advanceTimer = useRef<number | undefined>(undefined);

  const scrollTop = () => bodyRef.current?.scrollTo({ top: 0 });

  const ratingValueForStep = (s: number): number | undefined => {
    if (s === 0) return sessionValue;
    if (s === 1) return organisation;
    if (s === 4) return returnLikelihood;
    if (s === 5) return careerAwareness;
    if (s === 6) return careerTransitionConfidence;
    return undefined;
  };

  const blockedMessage = (s: number): string | null => {
    if (RATING_STEPS.includes(s) && ratingValueForStep(s) === undefined) {
      return 'Please select a rating to continue.';
    }
    if (s === ACTIONABLE_STEP && actionableNextSteps.includes('Other') && !actionableNextStepsOther.trim()) {
      return 'Please specify your answer.';
    }
    return null;
  };

  const goNext = () => {
    if (isMoving || isReviewStep) return;
    if (blockedMessage(step)) {
      setBlockedStep(step);
      return;
    }
    setIsMoving(true);
    window.clearTimeout(advanceTimer.current);
    setStep(s => Math.min(s + 1, QUESTION_COUNT));
    scrollTop();
    window.setTimeout(() => setIsMoving(false), 300);
  };

  const goBack = () => {
    window.clearTimeout(advanceTimer.current);
    setIsMoving(false);
    setStep(s => Math.max(s - 1, 0));
    scrollTop();
  };

  const selectAndAdvance = (apply: () => void) => {
    apply();
    setIsMoving(true);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goNext(), 280);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const survey = StorageService.submitMondaySurvey({
      participantId: participant.id,
      responses: {
        sessionValue,
        eventOrganisation: organisation,
        facilitatorsConnected,
        connectWithCompanies,
        returnLikelihood,
        careerAwareness,
        careerTransitionConfidence,
        actionableNextSteps,
        actionableNextStepsOther,
        suggestedThemes: themes.trim(),
        improvements: improvements.trim(),
      },
    });
    setSavedSurvey(survey);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const progress = Math.round(((step) / QUESTION_COUNT) * 100);

  const reviewItems: { label: string; value: string }[] = [
    { label: STEP_TITLES[0], value: sessionValue !== undefined ? `${sessionValue} / 5` : 'Not answered' },
    { label: STEP_TITLES[1], value: organisation !== undefined ? `${organisation} / 5` : 'Not answered' },
    { label: STEP_TITLES[2], value: facilitatorsConnected.length ? facilitatorsConnected.join(', ') : 'Not answered' },
    { label: STEP_TITLES[3], value: connectWithCompanies || 'Not answered' },
    { label: STEP_TITLES[4], value: returnLikelihood !== undefined ? `${returnLikelihood} / 5` : 'Not answered' },
    { label: STEP_TITLES[5], value: careerAwareness !== undefined ? `${careerAwareness} / 5` : 'Not answered' },
    { label: STEP_TITLES[6], value: careerTransitionConfidence !== undefined ? `${careerTransitionConfidence} / 5` : 'Not answered' },
    { label: STEP_TITLES[7], value: actionableNextSteps.length ? actionableNextSteps.join(', ') : 'Not answered' },
    { label: STEP_TITLES[8], value: themes.trim() || '—' },
    { label: STEP_TITLES[9], value: improvements.trim() || '—' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-100 rounded-lg w-full max-w-xl overflow-hidden shadow-lifted flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-orange/20 text-orange flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-orange" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-navy truncate">
                Students' Fair — Post-Event Survey
              </h2>
              <p className="text-[11px] text-slate-500">
                Help the M&E team evaluate today's impact
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:text-navy hover:bg-slate-100 transition shrink-0"
            aria-label="Close survey"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-teal mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your responses have been recorded in the central M&E dataset.
                </p>
              </div>
              <button
                onClick={() => {
                  if (savedSurvey) onSuccess(savedSurvey);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-full bg-teal hover:bg-teal/90 text-white font-bold text-sm transition active:scale-[0.98]"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy">
                    {isReviewStep ? 'Review & Submit' : `Question ${step + 1} of ${QUESTION_COUNT}`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-orange rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={i >= step}
                      onClick={() => { window.clearTimeout(advanceTimer.current); setStep(i); }}
                      aria-label={`Go to question ${i + 1}`}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        i < step
                          ? 'bg-orange/60 hover:bg-orange'
                          : i === step
                            ? 'bg-orange'
                            : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question / Review */}
              {!isReviewStep ? (
                <div key={step} className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2 animate-fadeIn">
                  <label className="block text-sm font-bold text-navy">
                    {step + 1}. {STEP_TITLES[step]}
                    {step < 7 && <span className="text-error"> *</span>}
                  </label>
                  <p className="text-[11px] text-slate-500 -mt-1">
                    {step === 0 && 'Rate today\u2019s session overall.'}
                    {step === 1 && 'How well organised did the event feel?'}
                    {step === 2 && 'Which facilitators were you able to connect with after the event?'}
                    {step === 3 && 'Would you connect with the companies/organisations present after today?'}
                    {step === 4 && 'How likely are you to attend the career fair again in the future?'}
                    {step === 5 && 'How would you rate your current awareness of non-traditional and emerging career pathways for pharmacists?'}
                    {step === 6 && 'How confident do you feel about navigating your career transition from training to professional employment?'}
                    {step === 7 && 'What immediate action do you plan to take after today\u2019s event? (Select up to 2)'}
                    {step === 8 && 'What themes would you like to see at future career fairs?'}
                    {step === 9 && 'What improvements would you recommend for future events?'}
                  </p>

                  {step === 0 && (
                    <StarRating
                      value={sessionValue}
                      onChange={n => selectAndAdvance(() => setSessionValue(n))}
                      startLabel="1 - Poor"
                      endLabel="5 - Excellent"
                    />
                  )}
                  {step === 1 && (
                    <StarRating
                      value={organisation}
                      onChange={n => selectAndAdvance(() => setOrganisation(n))}
                      startLabel="1 - Disorganised"
                      endLabel="5 - Very Organised"
                    />
                  )}
                  {step === 2 && (
                    <MultiChoiceButtons
                      value={facilitatorsConnected}
                      onChange={setFacilitatorsConnected}
                      options={FACILITATOR_OPTIONS}
                      noneOption={NONE_OPTION}
                    />
                  )}
                  {step === 3 && (
                    <ChoiceButtons
                      value={connectWithCompanies}
                      onChange={o => selectAndAdvance(() => setConnectWithCompanies(o))}
                      options={['Yes', 'No', 'Partially']}
                    />
                  )}
                  {step === 4 && (
                    <StarRating
                      value={returnLikelihood}
                      onChange={n => selectAndAdvance(() => setReturnLikelihood(n))}
                      startLabel="1 - Unlikely"
                      endLabel="5 - Very Likely"
                    />
                  )}
                  {step === 5 && (
                    <StarRating
                      value={careerAwareness}
                      onChange={n => selectAndAdvance(() => setCareerAwareness(n))}
                      startLabel="1 - Very Low / Unaware"
                      endLabel="5 - Very High / Well-Informed"
                    />
                  )}
                  {step === 6 && (
                    <StarRating
                      value={careerTransitionConfidence}
                      onChange={n => selectAndAdvance(() => setCareerTransitionConfidence(n))}
                      startLabel="1 - Not Confident at all"
                      endLabel="5 - Extremely Confident"
                    />
                  )}
                  {step === 7 && (
                    <>
                      <MultiChoiceButtons
                        value={actionableNextSteps}
                        onChange={setActionableNextSteps}
                        options={ACTIONABLE_NEXT_STEPS_OPTIONS}
                        maxSelections={2}
                      />
                      {actionableNextSteps.includes('Other') && (
                        <div className="pt-2">
                          <TextQuestion
                            value={actionableNextStepsOther}
                            onChange={setActionableNextStepsOther}
                            placeholder="Please specify..."
                          />
                        </div>
                      )}
                    </>
                  )}
                  {step === 8 && (
                    <TextQuestion
                      value={themes}
                      onChange={setThemes}
                      placeholder="e.g. More hands-on skills workshops, internships spotlights..."
                    />
                  )}
                  {step === 9 && (
                    <TextQuestion
                      value={improvements}
                      onChange={setImprovements}
                      placeholder="e.g. Longer breaks between talks..."
                    />
                  )}
                  {blockedStep === step && blockedMessage(step) && (
                    <p className="text-[11px] text-error font-semibold pt-1">{blockedMessage(step)}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <div className="bg-cream border border-slate-100 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3">
                      Review your answers
                    </h3>
                    <div className="space-y-2.5">
                      {reviewItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-3 border-b border-slate-100 last:border-0 pb-2.5 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-500">{i + 1}. {item.label}</p>
                            <p className="text-sm font-semibold text-navy">{item.value}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setStep(i); scrollTop(); }}
                            className="p-1.5 rounded-md text-slate-500 hover:text-navy hover:bg-slate-100 transition shrink-0"
                            aria-label={`Edit answer for question ${i + 1}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    You can go back to edit any answer before submitting.
                  </p>
                </div>
              )}

              {/* Nav */}
              <div className="flex items-center gap-2.5 pt-1">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-4 min-h-13 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-500 text-sm font-bold border border-slate-300 transition flex items-center gap-1.5 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                {step < QUESTION_COUNT ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isMoving}
                    className="flex-1 min-h-13 py-3 px-4 rounded-full bg-orange hover:bg-orange/90 text-white text-sm font-bold transition active:scale-[0.98] disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 min-h-13 py-3 px-4 rounded-full bg-teal hover:bg-teal/90 text-white text-sm font-bold transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Survey
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};