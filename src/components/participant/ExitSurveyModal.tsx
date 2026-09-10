import React, { useState } from 'react';
import { X, Star, Sparkles, CheckCircle2, ArrowRight, MessageSquare, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booth, ExitSurvey, Participant } from '../../types';
import { StorageService } from '../../services/storageService';

interface ExitSurveyModalProps {
  participant: Participant;
  booths: Booth[];
  onClose: () => void;
  onSuccess: (survey: ExitSurvey) => void;
}

export const ExitSurveyModal: React.FC<ExitSurveyModalProps> = ({
  participant,
  booths,
  onClose,
  onSuccess,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [confidenceRating, setConfidenceRating] = useState<number>(5);
  const [mostUsefulBoothId, setMostUsefulBoothId] = useState<string>(booths[0]?.id || '');
  const [keyLearning, setKeyLearning] = useState('');
  const [improvement, setImprovement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedSurvey, setSavedSurvey] = useState<ExitSurvey | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const survey = StorageService.submitExitSurvey({
      participantId: participant.id,
      overallRating,
      confidenceRating,
      mostUsefulBoothId,
      keyLearning: keyLearning.trim() || "Attending multiple hands-on booths enhanced my career path clarity.",
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
                        overallRating >= star
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${overallRating >= star ? 'fill-orange text-orange' : ''}`} />
                      <span className="text-[10px] font-bold">{star}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Not Useful</span>
                  <span>5 - Extremely Useful</span>
                </div>
              </div>

              {/* Question 2: Career Readiness Confidence */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  2. How confident do you feel about your career readiness after today's event? <span className="text-error">*</span>
                </label>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setConfidenceRating(level)}
                      className={`flex-1 py-2 rounded-md flex flex-col items-center gap-1 border transition ${
                        confidenceRating >= level
                          ? 'bg-orange/20 border-orange text-orange'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${confidenceRating >= level ? 'text-orange' : ''}`} />
                      <span className="text-[10px] font-bold">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 px-1">
                  <span>1 - Low Confidence</span>
                  <span>5 - Very Confident</span>
                </div>
              </div>

              {/* Question 3: Most Useful Booth */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  3. Which booth did you find MOST useful today? <span className="text-error">*</span>
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

              {/* Question 4: Most Important Thing Learned */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  4. What is the most important thing you learned today?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Using the STAR framework for interview answers..."
                  value={keyLearning}
                  onChange={(e) => setKeyLearning(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange resize-none"
                />
              </div>

              {/* Question 5: Improvement Feedback */}
              <div className="bg-cream border border-slate-100 rounded-lg p-4 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  5. What could we improve for future career fairs?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Longer Q&A time at tech booths, additional company stands..."
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange resize-none"
                />
              </div>

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
