export type RegistrationType = 'pre_registration' | 'walk_in';

export interface Participant {
  id: string;
  code: string; // e.g. NEXUS-7F42K9
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
  psghRegistrationNumber?: string; // numeric; "0000" allowed for students
  yearOfCompletion?: string;
  highestEducation?: string; // BPharm | PharmD | Master's | PhD | Student
  currentJobTitle?: string;

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
  skillsLabResumeAssistance?: string; // Yes | No | Other
  skillsLabResumeAssistanceOther?: string;
  resumeQuality?: number; // 1 (Very Poor) - 5 (Very Good)
  cvUploaded?: boolean;
  cvFileName?: string;
  interviewConfidence?: number; // 1 (Not Confident) - 5 (Very Confident)
  mockInterview?: string; // Yes | No

  // Additional Questions
  heardAboutCareerFair?: string; // Twitter/X | WhatsApp | PSGH Communications | Through a friend/colleague | Other
  heardAboutCareerFairOther?: string;
  attendedLastYear?: string; // Yes | No
  facilitatorQuestions?: string;

  // @deprecated legacy fields from the pre-rebrand registration form (seeded demo data)
  institution?: string;
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
  'id' | 'code' | 'registeredAt' | 'registrationType' | 'registeredBeforeEvent' | 'checkedIn' | 'checkedInAt' | 'eventDate'
>;

// Data submitted by the short event-day walk-in form
export type WalkInRegistrationData = Pick<Participant, 'fullName' | 'email' | 'phone' | 'psghRegistrationNumber'>;

export interface AttendanceRecord {
  id: string;
  participantId: string;
  participantName: string;
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
  participantId: string;
  participantName: string;
  overallRating: number; // 1 to 5
  confidenceRating: number; // 1 to 5
  mostUsefulBoothId: string;
  mostUsefulBoothName: string;
  keyLearning: string;
  improvement: string;
  submittedAt: string;
}

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
