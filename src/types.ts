export interface Participant {
  id: string;
  code: string; // e.g. KCF-00482
  fullName: string;
  phone: string;
  email: string;
  institution: string;
  educationLevel: string;
  employmentStatus: string;
  careerInterest: string;
  ageRange?: string;
  gender?: string;
  referralSource?: string;
  registeredAt: string;
}

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
}
