import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  ShieldCheck,
  Star,
  Link2,
} from "lucide-react";
import { Participant, PreRegistrationData } from "../../types";
import {
  EDUCATION_OPTIONS,
  AREA_OF_PRACTICE_OPTIONS,
  REGION_OPTIONS,
  CAREER_PATH_OPTIONS,
  CAREER_FAIR_EXPECTATIONS_OPTIONS,
  CAREER_TRACK_OPTIONS,
  HOW_HEARD_OPTIONS,
  RESUME_QUALITY_LABELS,
  INTERVIEW_CONFIDENCE_LABELS,
} from "../../registrationOptions";

interface PreRegistrationFormProps {
  onSubmit: (data: PreRegistrationData) => void;
  onCancel: () => void;
}

const REQUIRED_MSG = "This field is required.";
const OTHER_MSG = "Please specify.";

// Multi-step wizard configuration: each step validates only its own fields
const STEP_TITLES = [
  "Personal Information",
  "Area of Practice & Region",
  "Career Goals & Expectations",
  "Career Track Interest",
  "Skills Lab",
  "Additional Questions",
];

const STEP_FIELDS: string[][] = [
  [
    "fullName",
    "yearOfCompletion",
    "email",
    "phone",
    "psghRegistrationNumber",
    "currentJobTitle",
  ],
  ["currentAreaOfPractice", "currentAreaOther", "regionOfResidence"],
  [
    "idealCareerPath",
    "idealCareerPathOther",
    "careerFairExpectations",
    "careerFairExpectationsOther",
  ],
  ["careerTracks"],
  [
    "skillsLabResumeAssistance",
    "resumeQuality",
    "cvLink",
    "interviewConfidence",
    "mockInterview",
  ],
  ["heardAboutCareerFair", "heardAboutCareerFairOther", "attendedLastYear"],
];

const baseInputClass =
  "w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange transition";

const selectionClass = (selected: boolean) =>
  `flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-left ${
    selected
      ? "bg-orange/15 border-orange text-white"
      : "bg-navy/60 border-mist/15 text-mist/80 hover:border-mist/30"
  }`;

interface SectionProps {
  num: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// Module-scope helper components — must NOT be defined inside the render body,
// otherwise a fresh component identity each render makes React remount the
// subtree on every keystroke and the inputs lose focus (type one-by-one bug).
const Section: React.FC<SectionProps> = ({
  num,
  title,
  subtitle,
  children,
}) => (
  <section className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-md">
    <div className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center text-xs font-black shrink-0">
        {num}
      </span>
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-mist/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Label: React.FC<{ req?: boolean; children: React.ReactNode }> = ({
  req,
  children,
}) => (
  <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
    {children} {req && <span className="text-rose-400">*</span>}
  </label>
);

export const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<PreRegistrationData>({
    fullName: "",
    yearOfCompletion: "",
    email: "",
    phone: "",
    psghRegistrationNumber: "",
    highestEducation: "",
    currentJobTitle: "",
    currentAreaOfPractice: "",
    currentAreaOther: "",
    regionOfResidence: "",
    idealCareerPath: "",
    idealCareerPathOther: "",
    careerFairExpectations: [],
    careerFairExpectationsOther: "",
    careerTracks: [],
    skillsLabResumeAssistance: "",
    skillsLabResumeAssistanceOther: "",
    resumeQuality: undefined,
    interviewConfidence: undefined,
    mockInterview: "",
    heardAboutCareerFair: "",
    heardAboutCareerFairOther: "",
    attendedLastYear: "",
    facilitatorQuestions: "",
    cvUploaded: false,
    cvFileName: "",
    cvLink: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const update = (field: keyof PreRegistrationData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleMulti = (
    field: "careerFairExpectations" | "careerTracks",
    value: string,
  ) => {
    const current = form[field] || [];
    update(
      field,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };

  const handleCvLink = (value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cvLink;
      return next;
    });
    update("cvLink", value);
  };

  const computeErrors = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) nextErrors.fullName = REQUIRED_MSG;
    if (!form.yearOfCompletion?.trim())
      nextErrors.yearOfCompletion = REQUIRED_MSG;
    if (!form.email.trim()) {
      nextErrors.email = REQUIRED_MSG;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = REQUIRED_MSG;
    } else if (form.phone.replace(/[^0-9+]/g, "").length < 8) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (!form.psghRegistrationNumber?.trim()) {
      nextErrors.psghRegistrationNumber = REQUIRED_MSG;
    } else if (!/^\d+$/.test((form.psghRegistrationNumber || "").trim())) {
      nextErrors.psghRegistrationNumber =
        "Registration numbers should contain numbers only.";
    }
    if (!form.currentJobTitle?.trim())
      nextErrors.currentJobTitle = REQUIRED_MSG;

    if (
      form.currentAreaOfPractice === "Other" &&
      !form.currentAreaOther?.trim()
    ) {
      nextErrors.currentAreaOther = OTHER_MSG;
    }
    if (
      form.idealCareerPath === "Other" &&
      !form.idealCareerPathOther?.trim()
    ) {
      nextErrors.idealCareerPathOther = OTHER_MSG;
    }
    if (
      (form.careerFairExpectations || []).includes("Other") &&
      !form.careerFairExpectationsOther?.trim()
    ) {
      nextErrors.careerFairExpectationsOther = OTHER_MSG;
    }
    if (
      form.heardAboutCareerFair === "Other" &&
      !form.heardAboutCareerFairOther?.trim()
    ) {
      nextErrors.heardAboutCareerFairOther = OTHER_MSG;
    }
    if (form.cvLink && !/^https?:\/\/\S+$/i.test(form.cvLink.trim())) {
      nextErrors.cvLink =
        "Please enter a valid link starting with http:// or https://";
    }

    return nextErrors;
  };

  // Validates only the fields belonging to the current step so users can move forward incrementally
  const validateStep = (currentStep: number): boolean => {
    const all = computeErrors();
    const scoped: Record<string, string> = {};
    STEP_FIELDS[currentStep].forEach((f) => {
      if (all[f]) scoped[f] = all[f];
    });
    setErrors(scoped);
    return Object.keys(scoped).length === 0;
  };

  const scrollToFirstError = () => {
    const firstError = document.querySelector(
      "[data-field-error]",
    ) as HTMLElement | null;
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const goBack = () => {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => s - 1);
    scrollToTop();
  };

  const goNext = () => {
    if (!validateStep(step)) {
      scrollToFirstError();
      return;
    }
    setStep((s) => s + 1);
    scrollToTop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = computeErrors();
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      scrollToFirstError();
      return;
    }
    setIsSubmitting(true);
    const payload: PreRegistrationData = {
      ...form,
      fullName: form.fullName.trim(),
      yearOfCompletion: (form.yearOfCompletion || "").trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      psghRegistrationNumber: (form.psghRegistrationNumber || "").trim(),
      currentJobTitle: (form.currentJobTitle || "").trim(),
      facilitatorQuestions: (form.facilitatorQuestions || "").trim(),
    };
    onSubmit(payload);
  };

  const renderFieldError = (key: string) =>
    errors[key] ? (
      <p
        data-field-error
        className="text-[11px] text-rose-400 font-semibold mt-1"
      >
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-32 animate-fadeIn">
      {/* Header */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Professionals' Career Fair — Pre-Registration
          </h1>
          <p className="text-xs sm:text-sm text-mist/60 mt-0.5">
            Complete this form to pre-register for the Nexus 2026 Professionals'
            Career Fair. Your answers help us prepare a more personalised event
            and inform the M&E team.
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="mb-5 bg-navy/90 border border-mist/15 rounded-2xl p-4 shadow-md">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange block">
              Step {step + 1} of {STEP_TITLES.length}
            </span>
            <span className="text-sm font-bold text-white">
              {STEP_TITLES[step]}
            </span>
          </div>
          <span className="text-[11px] text-mist/60 font-mono shrink-0">
            {Math.round(((step + 1) / STEP_TITLES.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-navy/70 rounded-full overflow-hidden border border-mist/15">
          <div
            className="h-full bg-orange rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" key={step}>
        {/* SECTION 1: PERSONAL INFORMATION */}
        {step === 0 && (
          <Section num="1" title="Personal Information">
            <div className="space-y-4">
              <div>
                <Label req>Full Name</Label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className={baseInputClass}
                />
                {renderFieldError("fullName")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label req>Year of Completion</Label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2024, 2025, Still in training"
                    value={form.yearOfCompletion}
                    onChange={(e) => update("yearOfCompletion", e.target.value)}
                    className={baseInputClass}
                  />
                  {renderFieldError("yearOfCompletion")}
                </div>
                <div>
                  <Label>Highest Level of Education</Label>
                  <select
                    value={form.highestEducation}
                    onChange={(e) => update("highestEducation", e.target.value)}
                    className={baseInputClass}
                  >
                    <option value="">Select...</option>
                    {EDUCATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label req>Email</Label>
                <input
                  type="email"
                  placeholder="e.g. you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={baseInputClass}
                />
                {renderFieldError("email")}
                <p className="text-[11px] text-mist/60 mt-1">
                  Your registration code will be sent to this email.
                </p>
              </div>

              <div>
                <Label req>Phone</Label>
                <input
                  type="tel"
                  placeholder="e.g. +233 24 555 0101"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={baseInputClass}
                />
                {renderFieldError("phone")}
              </div>

              <div>
                <Label req>PSGH Registration Number</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 20981"
                  value={form.psghRegistrationNumber}
                  onChange={(e) =>
                    update(
                      "psghRegistrationNumber",
                      e.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                  className={`${baseInputClass} font-mono`}
                />
                <p className="text-[11px] text-mist/60 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  You can enter 0000 if you do not have a PSGH registration
                  number yet.
                </p>
                {renderFieldError("psghRegistrationNumber")}
              </div>

              <div>
                <Label req>Current Job Title</Label>
                <input
                  type="text"
                  placeholder="e.g. Community Pharmacist"
                  value={form.currentJobTitle}
                  onChange={(e) => update("currentJobTitle", e.target.value)}
                  className={baseInputClass}
                />
                {renderFieldError("currentJobTitle")}
              </div>
            </div>
          </Section>
        )}

        {/* SECTION 2: CURRENT AREA OF PRACTICE */}
        {step === 1 && (
          <>
            {/* SECTION 2: CURRENT AREA OF PRACTICE */}
            <Section
              num="2"
              title="Current Area of Practice"
              subtitle="Where do you currently work or practice?"
            >
              <div className="space-y-2">
                {AREA_OF_PRACTICE_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o}
                    onClick={() => update("currentAreaOfPractice", o)}
                    className={`${selectionClass(form.currentAreaOfPractice === o)} w-full`}
                  >
                    <span className="flex-1 text-xs sm:text-sm font-semibold">
                      {o}
                    </span>
                    {form.currentAreaOfPractice === o && (
                      <CheckCircle2 className="w-4 h-4 text-orange" />
                    )}
                  </button>
                ))}
              </div>
              {form.currentAreaOfPractice === "Other" && (
                <div className="bg-navy/70 border border-mist/15 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
                  <Label req>Please specify your area of practice</Label>
                  <input
                    type="text"
                    placeholder="Describe your area of practice"
                    value={form.currentAreaOther}
                    onChange={(e) => update("currentAreaOther", e.target.value)}
                    className={baseInputClass}
                  />
                  {renderFieldError("currentAreaOther")}
                </div>
              )}
            </Section>

            {/* SECTION 3: REGION OF RESIDENCE */}
            <Section num="3" title="Region of Residence">
              <div>
                <select
                  value={form.regionOfResidence}
                  onChange={(e) => update("regionOfResidence", e.target.value)}
                  className={baseInputClass}
                >
                  <option value="">Select your region...</option>
                  {REGION_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </Section>
          </>
        )}

        {/* SECTION 4: CAREER GOALS & INTERESTS */}
        {step === 2 && (
          <>
            <Section num="4" title="Career Goals & Interests">
              <div className="space-y-3">
                <div>
                  <Label>
                    Which area of the pharmaceutical world do you want to build
                    your career in?
                  </Label>
                  <div className="space-y-2">
                    {CAREER_PATH_OPTIONS.map((o) => (
                      <button
                        type="button"
                        key={o}
                        onClick={() => update("idealCareerPath", o)}
                        className={`${selectionClass(form.idealCareerPath === o)} w-full`}
                      >
                        <span className="flex-1 text-xs sm:text-sm font-semibold">
                          {o}
                        </span>
                        {form.idealCareerPath === o && (
                          <CheckCircle2 className="w-4 h-4 text-orange" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {form.idealCareerPath === "Other" && (
                  <div className="bg-navy/70 border border-mist/15 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
                    <Label req>
                      Please specify your ideal career path or industry.
                    </Label>
                    <input
                      type="text"
                      placeholder="Describe your ideal career path"
                      value={form.idealCareerPathOther}
                      onChange={(e) =>
                        update("idealCareerPathOther", e.target.value)
                      }
                      className={baseInputClass}
                    />
                    {renderFieldError("idealCareerPathOther")}
                  </div>
                )}
              </div>
            </Section>

            {/* SECTION 5: CAREER FAIR EXPECTATIONS */}
            <Section
              num="5"
              title="Career Fair Expectations"
              subtitle="What do you hope to gain from the career fair? (Select all that apply)"
            >
              <div className="space-y-2">
                {CAREER_FAIR_EXPECTATIONS_OPTIONS.map((o) => {
                  const selected = (form.careerFairExpectations || []).includes(
                    o,
                  );
                  return (
                    <button
                      type="button"
                      key={o}
                      onClick={() => toggleMulti("careerFairExpectations", o)}
                      className={`${selectionClass(selected)} w-full`}
                    >
                      <span className="flex-1 text-xs sm:text-sm font-semibold">
                        {o}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-orange" />
                      )}
                    </button>
                  );
                })}
              </div>
              {(form.careerFairExpectations || []).includes("Other") && (
                <div className="bg-navy/70 border border-mist/15 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
                  <Label req>Please specify.</Label>
                  <input
                    type="text"
                    placeholder="What else do you hope to gain?"
                    value={form.careerFairExpectationsOther}
                    onChange={(e) =>
                      update("careerFairExpectationsOther", e.target.value)
                    }
                    className={baseInputClass}
                  />
                  {renderFieldError("careerFairExpectationsOther")}
                </div>
              )}
            </Section>
          </>
        )}

        {/* SECTION 6: CAREER TRACK INTEREST */}
        {step === 3 && (
          <Section
            num="6"
            title="Career Track Interest"
            subtitle="Select all the career tracks you are interested in (12 available)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAREER_TRACK_OPTIONS.map((t) => {
                const selected = (form.careerTracks || []).includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleMulti("careerTracks", t)}
                    className={`${selectionClass(selected)} w-full`}
                  >
                    <span className="flex-1 text-xs font-semibold">{t}</span>
                    {selected && (
                      <CheckCircle2 className="w-4 h-4 text-orange shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* SECTION 7: SKILLS LAB */}
        {step === 4 && (
          <Section
            num="7"
            title="Skills Lab"
            subtitle="The Skills Lab is a side event taking place during the career fair."
          >
            <div className="space-y-5">
              <div>
                <Label>
                  Would you like assistance with your résumé/CV or cover letter
                  at the Skills Lab?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["Yes", "No"].map((o) => (
                    <button
                      type="button"
                      key={o}
                      onClick={() => update("skillsLabResumeAssistance", o)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        form.skillsLabResumeAssistance === o
                          ? "bg-orange/20 border-orange text-orange"
                          : "bg-navy/60 border-mist/15 text-mist/70 hover:border-mist/30"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>
                  How would you rate the current quality of your résumé/CV?
                </Label>
                <div className="flex items-center justify-between gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => update("resumeQuality", n)}
                      className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 border transition ${
                        form.resumeQuality === n
                          ? "bg-orange/20 border-orange text-orange"
                          : "bg-navy border-mist/15 text-mist/40 hover:border-mist/30"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${form.resumeQuality !== undefined && form.resumeQuality >= n ? "fill-orange text-orange" : ""}`}
                      />
                      <span className="text-[10px] font-bold">{n}</span>
                    </button>
                  ))}
                </div>
                {form.resumeQuality && (
                  <p className="text-[11px] text-mist/60 mt-1.5 text-center">
                    {RESUME_QUALITY_LABELS[form.resumeQuality]}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Would you like to share a link to your CV for the
                  facilitators? (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-orange shrink-0" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/your-cv-link"
                    value={form.cvLink || ""}
                    onChange={(e) => handleCvLink(e.target.value)}
                    className={baseInputClass}
                  />
                </div>
                <p className="text-[11px] text-mist/60 mt-1.5">
                  Paste a public link (e.g. Google Drive) to your résumé/CV.
                  This link is shared with the Skills Lab facilitators.
                </p>
                {renderFieldError("cvLink")}
              </div>

              <div>
                <Label>How confident are you in your interview skills?</Label>
                <div className="flex items-center justify-between gap-2">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => update("interviewConfidence", n)}
                      className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 border transition ${
                        form.interviewConfidence === n
                          ? "bg-orange/20 border-orange text-orange"
                          : "bg-navy border-mist/15 text-mist/40 hover:border-mist/30"
                      }`}
                    >
                      <span className="text-[10px] font-bold">{n}</span>
                    </button>
                  ))}
                </div>
                {form.interviewConfidence && (
                  <p className="text-[11px] text-mist/60 mt-1.5 text-center">
                    {INTERVIEW_CONFIDENCE_LABELS[form.interviewConfidence]}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Would you like to participate in a mock interview at the
                  Skills Lab?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["Yes", "No"].map((o) => (
                    <button
                      type="button"
                      key={o}
                      onClick={() => update("mockInterview", o)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        form.mockInterview === o
                          ? "bg-orange/20 border-orange text-orange"
                          : "bg-navy/60 border-mist/15 text-mist/70 hover:border-mist/30"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* SECTION 8: ADDITIONAL QUESTIONS */}
        {step === 5 && (
          <Section num="8" title="Additional Questions">
            <div className="space-y-5">
              <div>
                <Label>How did you hear about the career fair?</Label>
                <div className="space-y-2">
                  {HOW_HEARD_OPTIONS.map((o) => (
                    <button
                      type="button"
                      key={o}
                      onClick={() => update("heardAboutCareerFair", o)}
                      className={`${selectionClass(form.heardAboutCareerFair === o)} w-full`}
                    >
                      <span className="flex-1 text-xs sm:text-sm font-semibold">
                        {o}
                      </span>
                      {form.heardAboutCareerFair === o && (
                        <CheckCircle2 className="w-4 h-4 text-orange" />
                      )}
                    </button>
                  ))}
                </div>
                {form.heardAboutCareerFair === "Other" && (
                  <div className="mt-2.5 bg-navy/70 border border-mist/15 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
                    <Label req>Please specify.</Label>
                    <input
                      type="text"
                      placeholder="Where did you hear about the fair?"
                      value={form.heardAboutCareerFairOther}
                      onChange={(e) =>
                        update("heardAboutCareerFairOther", e.target.value)
                      }
                      className={baseInputClass}
                    />
                    {renderFieldError("heardAboutCareerFairOther")}
                  </div>
                )}
              </div>

              <div>
                <Label>Did you attend the career fair last year?</Label>
                <div className="flex flex-wrap gap-2">
                  {["Yes", "No"].map((o) => (
                    <button
                      type="button"
                      key={o}
                      onClick={() => update("attendedLastYear", o)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        form.attendedLastYear === o
                          ? "bg-orange/20 border-orange text-orange"
                          : "bg-navy/60 border-mist/15 text-mist/70 hover:border-mist/30"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>
                  Do you have any questions you would like the facilitators to
                  address?
                </Label>
                <textarea
                  rows={3}
                  placeholder="Optional — write your questions here"
                  value={form.facilitatorQuestions}
                  onChange={(e) =>
                    update("facilitatorQuestions", e.target.value)
                  }
                  className={`${baseInputClass} resize-none`}
                />
              </div>
            </div>
          </Section>
        )}

        {/* STEP NAVIGATION FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy/95 backdrop-blur-lg border-t border-mist/15 pb-safe">
          <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-4 rounded-xl bg-navy/70 border border-mist/25 text-mist text-sm font-bold transition hover:border-mist/50 shrink-0"
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < STEP_TITLES.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-base shadow-lg shadow-orange/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-base shadow-lg shadow-orange/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Registering...
                  </span>
                ) : (
                  <>
                    <span>Submit Pre-Registration</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-center text-[11px] text-mist/60 pb-2">
            {step < STEP_TITLES.length - 1
              ? `Your answers are saved as you go — Step ${step + 1} of ${STEP_TITLES.length}.`
              : "Your code will be sent to your email and shown on the next screen."}
          </p>
        </div>
      </form>
    </div>
  );
};
