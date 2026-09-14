export type RegistrationType = 'pre_registration' | 'walk_in';

// ---------------------------------------------------------------------------
// Event model — the platform is event-aware. Every record (participant,
// attendance, booth visit, survey, question, ticket, session) is scoped to one
// of the events below. Data is never mixed across events.
// ---------------------------------------------------------------------------

export type AudienceType = 'students' | 'professionals';
export type EventStatus = 'draft' | 'published' | 'completed';

export interface EventFeatures {
  preRegistration: boolean;
  registrationCode: boolean;
  walkInRegistration: boolean;
  boothTracking: boolean;
  questions: boolean;
  skillsLab: boolean;
  ticket: boolean;
  postEventSurvey: boolean;
}

export interface CareerFairEvent {
  id: string;
  name: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string;
  venue: string;
  audienceType: AudienceType;
  status: EventStatus;
  features: EventFeatures;
  minBoothsRequired?: number;
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

export interface Participant {
  id: string;
  code: string; // e.g. NEXUS-7F42K9
  eventId: string;
  fullName: string;
  phone: string;
  email: string;
  registeredAt: string;

  // Registration type + check-in status
  registrationType: RegistrationType;
  registeredBeforeEvent: boolean;
  checkedIn: boolean;
  checkedInAt?: string;
  eventDate?: string;

  // Personal Information
  firstName?: string;
  surname?: string;
  psghRegistrationNumber?: string; // numeric; "0000" allowed for students
  yearOfCompletion?: string;
  highestEducation?: string; // BPharm | PharmD | Master's | PhD | Student
  currentJobTitle?: string;

  // Monday Students' Career Fair fields
  institution?: string;
  yearOfStudy?: string;

  // Current Area of Practice
  currentAreaOfPractice?: string; // Hospitals | Community | Industry | Marketing | Academia & Research | Regulatory | Other
  currentAreaOther?: string;

  // Region of Residence
  regionOfResidence?: string;

  // Career Goals & Interests
  idealCareerPath?: string; // Hospital | Community | Industry | Academia | Marketing | Regulatory | Other
  idealCareerPathOther?: string;

  // Career Fair Expectations (multi-select)
  careerFairExpectations?: string[];
  careerFairExpectationsOther?: string;

  // Career Track Interest (multi-select)
  careerTracks?: string[];

  // Skills Lab
  skillsLabResumeAssistance?: string; // Yes | No
  skillsLabResumeAssistanceOther?: string;
  resumeQuality?: number; // 1 (Very Poor) - 5 (Very Good)
  cvUploaded?: boolean;
  cvFileName?: string;
  cvLink?: string; // optional URL to the participant's CV (link only — no file upload)
  interviewConfidence?: number; // 1 (Not Confident) - 5 (Very Confident)
  mockInterview?: string; // Yes | No

  // Additional Questions
  heardAboutCareerFair?: string; // Twitter/X | WhatsApp | PSGH Communications | Through a friend/colleague | Other
  heardAboutCareerFairOther?: string;
  attendedLastYear?: string; // Yes | No
  facilitatorQuestions?: string;

  // Career Transition (Edition 3) — careerStage/careerChallenges are Friday-only;
  // careerAwareness/careerTransitionConfidence are collected on both Monday and Friday
  careerStage?: string;
  careerAwareness?: number; // 1 (Very Low / Unaware) - 5 (Very High / Well-Informed)
  careerTransitionConfidence?: number; // 1 (Not Confident at all) - 5 (Extremely Confident)
  careerChallenges?: string[];
  careerChallengesOther?: string;

  // @deprecated legacy fields from the pre-rebrand registration form (seeded demo data)
  educationLevel?: string;
  employmentStatus?: string;
  careerInterest?: string;
  ageRange?: string;
  gender?: string;
  referralSource?: string;
}

// Data submitted by the full pre-registration questionnaire
export type PreRegistrationData = Omit<
  Participant,
  'id' | 'code' | 'eventId' | 'registeredAt' | 'registrationType' | 'registeredBeforeEvent' | 'checkedIn' | 'checkedInAt' | 'eventDate'
>;

// Data submitted by the short event-day walk-in form
export type WalkInRegistrationData = Pick<Participant, 'fullName' | 'email' | 'phone' | 'psghRegistrationNumber'>;

// Minimum data submitted by the Monday Students' Career Fair registration form
export interface MondayRegistrationData {
  firstName: string;
  surname: string;
  email: string;
  institution: string;
  yearOfStudy: string;
  careerAwareness?: number; // 1 (Very Low / Unaware) - 5 (Very High / Well-Informed)
  careerTransitionConfidence?: number; // 1 (Not Confident at all) - 5 (Extremely Confident)
}

// ---------------------------------------------------------------------------
// Attendance, Booths, Visits, Surveys
// ---------------------------------------------------------------------------

export interface AttendanceRecord {
  id: string;
  participantId: string;
  participantName: string;
  eventId: string;
  eventName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Checked In' | 'Checked Out' | 'Not Checked In';
}

export interface Booth {
  id: string;
  name: string;
  description: string;
  location: string;
  facilitators: string[];
  boothCode: string;
  isActive: boolean;
  category?: string;
}

export interface BoothVisit {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  boothId: string;
  boothName: string;
  facilitator: string;
  boothCode: string;
  reflection: string;
  timestamp: string;
  verificationStatus: 'verified' | 'rejected';
}

export interface ExitSurvey {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  overallRating: number; // 1 to 5
  confidenceRating: number; // 1 to 5 — career transition confidence
  careerAwareness: number; // 1 (Very Low / Unaware) - 5 (Very High / Well-Informed)
  mostUsefulBoothId: string;
  mostUsefulBoothName: string; // most valuable non-traditional session/track
  speakerEffectiveness: number; // 1 (Poor) - 5 (Excellent)
  careerAdviceActionability: number; // 1 (Not Actionable) - 5 (Highly Actionable)
  facilitatorFeedback: string;
  actionableNextSteps: string[]; // max 2 selections
  actionableNextStepsOther: string;
  improvement: string;
  submittedAt: string;
}

// Generic post-event survey (used for the Monday Students' Career Fair).
// Responses are a flat map so each event can define its own questions.
export interface PostEventSurvey {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  submittedAt: string;
  responses: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type QuestionStatus = 'new' | 'reviewed' | 'answered' | 'archived';

export interface NexusQuestion {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  question: string;
  answer?: string; // filled in when a facilitator/admin marks the question as answered
  createdAt: string;
  status: QuestionStatus;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

// One active session per device. Stored under the `nexus_session` key so a
// returning participant is recognised on /welcome without re-logging in.
export interface ParticipantSession {
  eventId: string;
  participantId: string;
  sessionId: string;
  createdAt: string;
  lastActiveAt: string;
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export interface TicketRecord {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  code: string;
  issuedAt: string;
}

// ---------------------------------------------------------------------------
// Event config (legacy single-event settings) + M&E metrics
// ---------------------------------------------------------------------------

export interface EventConfig {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  minBoothsRequired: number;
  adminPasscode: string;
  googleSpreadsheetId?: string;
  googleSpreadsheetUrl?: string;
  appsScriptWebhookUrl?: string;
  allowPublicRegistration: boolean;
  registrationFields: {
    collectAge: boolean;
    collectGender: boolean;
    collectReferral: boolean;
    institutionsList: string[];
    careerInterestsList: string[];
  };
}

export interface MneMetrics {
  eventId?: string;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  totalBoothVisits: number;
  completedMinBoothsCount: number;
  completionRate: number;
  exitSurveysCount: number;
  avgBoothsPerAttendee: number;

  // Registration funnel metrics
  preRegisteredCount: number;
  walkedInCount: number;
  checkedInCount: number;
  preRegisteredCheckedIn: number;
  preRegistrationAttendanceRate: number;
}