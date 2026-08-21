import { Participant, AttendanceRecord, Booth, BoothVisit, ExitSurvey, EventConfig, MneMetrics } from '../types';

const STORAGE_KEYS = {
  PARTICIPANTS: 'kcf_participants_v1',
  ATTENDANCE: 'kcf_attendance_v1',
  BOOTHS: 'kcf_booths_v1',
  BOOTH_VISITS: 'kcf_booth_visits_v1',
  SURVEYS: 'kcf_surveys_v1',
  EVENT_CONFIG: 'kcf_event_config_v1',
  CURRENT_USER_ID: 'kcf_current_participant_id_v1',
  ADMIN_SESSION: 'kcf_admin_logged_in_v1',
  GOOGLE_ACCESS_TOKEN: 'kcf_google_access_token_v1',
};

export const DEFAULT_CONFIG: EventConfig = {
  eventName: "Nexus Career Fair 2026",
  eventDate: "2026-08-22",
  eventLocation: "Grand Exhibition Center, Main Auditorium",
  minBoothsRequired: 4,
  adminPasscode: "mne2026",
  googleSpreadsheetId: "",
  googleSpreadsheetUrl: "",
  appsScriptWebhookUrl: "",
  allowPublicRegistration: true,
  registrationFields: {
    collectAge: true,
    collectGender: true,
    collectReferral: true,
    institutionsList: [
      "University of Ghana (UG)",
      "KNUST",
      "University of Cape Coast (UCC)",
      "Ashesi University",
      "Ghana Communication Technology University (GCTU)",
      "UPSA",
      "Technical University",
      "Other / Self-Taught"
    ],
    careerInterestsList: [
      "Software Engineering & AI",
      "Product Management & Design",
      "Data & Analytics",
      "Finance, Banking & Fintech",
      "Marketing, Media & PR",
      "Health, Biotech & Pharma",
      "Renewable Energy & ESG",
      "Entrepreneurship & Startups"
    ]
  }
};

export const INITIAL_BOOTHS: Booth[] = [
  {
    id: "booth-cv",
    name: "CV & Cover Letter Masterclass",
    description: "Learn how to format ATS-friendly resumes, highlight measurable achievements, and tailor compelling cover letters.",
    location: "Hall A — Booth 1",
    facilitators: ["Ama Mensah", "Kwame Asare"],
    boothCode: "CV4827",
    isActive: true,
    category: "Job Readiness"
  },
  {
    id: "booth-interview",
    name: "Interview Skills & Mock Sessions",
    description: "Master the STAR behavioral framework, tackle tough questions, and practice live mock interview scenarios.",
    location: "Hall A — Booth 2",
    facilitators: ["Efua Mensah", "David Osei"],
    boothCode: "IS7284",
    isActive: true,
    category: "Job Readiness"
  },
  {
    id: "booth-advancement",
    name: "Career Advancement & Corporate Ladder",
    description: "Strategies for negotiating offers, mentorship cultivation, workplace navigation, and rapid career promotion.",
    location: "Hall B — Booth 3",
    facilitators: ["Kofi Boateng", "Grace Addo"],
    boothCode: "CA3910",
    isActive: true,
    category: "Growth"
  },
  {
    id: "booth-branding",
    name: "Personal Branding & LinkedIn Optimization",
    description: "Transform your LinkedIn profile, build thought leadership, expand network connections, and attract recruiters.",
    location: "Hall B — Booth 4",
    facilitators: ["Nana Yeboah", "Abena Sarpong"],
    boothCode: "PB6145",
    isActive: true,
    category: "Networking"
  },
  {
    id: "booth-entrepreneurship",
    name: "Entrepreneurship & Venture Launch",
    description: "From idea validation to pitch decks, fundraising options, and building sustainable early-stage startups.",
    location: "Hall C — Booth 5",
    facilitators: ["Samuel Quaye", "Dr. Linda Kwarteng"],
    boothCode: "EV9031",
    isActive: true,
    category: "Business"
  },
  {
    id: "booth-tech",
    name: "Tech Careers & AI Frontier",
    description: "Navigating tech roles, building open-source portfolios, and leveraging modern AI tools in your daily workflow.",
    location: "Hall C — Booth 6",
    facilitators: ["Emmanuel Darko", "Akosua Mensah"],
    boothCode: "TC5520",
    isActive: true,
    category: "Technology"
  }
];

// Pre-seeded participants for initial rich M&E analytics baseline
const SEED_PARTICIPANTS: Participant[] = [
  {
    id: "p-1",
    code: "KCF-00482",
    fullName: "Bernice Owusu",
    phone: "+233 24 555 0101",
    email: "bernyx.owusu@gmail.com",
    institution: "University of Ghana (UG)",
    educationLevel: "Bachelor's Degree",
    employmentStatus: "Recent Graduate / Job Seeker",
    careerInterest: "Data & Analytics",
    ageRange: "21-24",
    gender: "Female",
    referralSource: "Social Media / LinkedIn",
    registeredAt: "2026-08-22T08:15:00Z"
  },
  {
    id: "p-2",
    code: "KCF-00109",
    fullName: "John Mensah",
    phone: "+233 20 555 0102",
    email: "john.mensah@example.com",
    institution: "KNUST",
    educationLevel: "Undergraduate (Final Year)",
    employmentStatus: "Student",
    careerInterest: "Software Engineering & AI",
    ageRange: "21-24",
    gender: "Male",
    referralSource: "University Notice Board",
    registeredAt: "2026-08-22T08:22:00Z"
  },
  {
    id: "p-3",
    code: "KCF-00215",
    fullName: "Ama Boateng",
    phone: "+233 55 555 0103",
    email: "ama.boateng@example.com",
    institution: "University of Cape Coast (UCC)",
    educationLevel: "Master's Degree",
    employmentStatus: "Employed (Looking to Switch)",
    careerInterest: "Product Management & Design",
    ageRange: "25-29",
    gender: "Female",
    referralSource: "Friend / Word of Mouth",
    registeredAt: "2026-08-22T08:30:00Z"
  },
  {
    id: "p-4",
    code: "KCF-00340",
    fullName: "Kwesi Appiah",
    phone: "+233 27 555 0104",
    email: "kwesi.appiah@example.com",
    institution: "Ashesi University",
    educationLevel: "Undergraduate",
    employmentStatus: "Student",
    careerInterest: "Finance, Banking & Fintech",
    ageRange: "18-20",
    gender: "Male",
    referralSource: "Email Newsletter",
    registeredAt: "2026-08-22T08:45:00Z"
  },
  {
    id: "p-5",
    code: "KCF-00412",
    fullName: "Eunice Aryee",
    phone: "+233 24 555 0105",
    email: "eunice.a@example.com",
    institution: "UPSA",
    educationLevel: "Bachelor's Degree",
    employmentStatus: "Recent Graduate / Job Seeker",
    careerInterest: "Marketing, Media & PR",
    ageRange: "21-24",
    gender: "Female",
    referralSource: "Social Media / LinkedIn",
    registeredAt: "2026-08-22T08:50:00Z"
  },
  {
    id: "p-6",
    code: "KCF-00518",
    fullName: "David Frimpong",
    phone: "+233 50 555 0106",
    email: "david.f@example.com",
    institution: "Ghana Communication Technology University (GCTU)",
    educationLevel: "Diploma / HND",
    employmentStatus: "Employed",
    careerInterest: "Software Engineering & AI",
    ageRange: "25-29",
    gender: "Male",
    referralSource: "Lecturer / Advisor",
    registeredAt: "2026-08-22T09:05:00Z"
  }
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: "att-1", participantId: "p-1", participantName: "Bernice Owusu", eventName: "Nexus Youth Career Fair 2026", checkInTime: "2026-08-22T08:30:00Z", status: "Checked In" },
  { id: "att-2", participantId: "p-2", participantName: "John Mensah", eventName: "Nexus Youth Career Fair 2026", checkInTime: "2026-08-22T08:40:00Z", status: "Checked In" },
  { id: "att-3", participantId: "p-3", participantName: "Ama Boateng", eventName: "Nexus Youth Career Fair 2026", checkInTime: "2026-08-22T08:45:00Z", status: "Checked In" },
  { id: "att-4", participantId: "p-4", participantName: "Kwesi Appiah", eventName: "Nexus Youth Career Fair 2026", checkInTime: "2026-08-22T09:00:00Z", status: "Checked In" },
  { id: "att-5", participantId: "p-5", participantName: "Eunice Aryee", eventName: "Nexus Youth Career Fair 2026", checkInTime: "2026-08-22T09:10:00Z", status: "Checked In" }
];

const SEED_VISITS: BoothVisit[] = [
  {
    id: "v-1",
    participantId: "p-1",
    participantName: "Bernice Owusu",
    boothId: "booth-cv",
    boothName: "CV & Cover Letter Masterclass",
    facilitator: "Ama Mensah",
    boothCode: "CV4827",
    reflection: "Learned how to structure achievements using metrics rather than just duties (e.g. boosted pipeline by 30%).",
    timestamp: "2026-08-22T09:30:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-2",
    participantId: "p-1",
    participantName: "Bernice Owusu",
    boothId: "booth-interview",
    boothName: "Interview Skills & Mock Sessions",
    facilitator: "Efua Mensah",
    boothCode: "IS7284",
    reflection: "Practiced the STAR method for behavioral questions and how to answer 'Tell me about yourself' in under 90s.",
    timestamp: "2026-08-22T10:15:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-3",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-branding",
    boothName: "Personal Branding & LinkedIn Optimization",
    facilitator: "Nana Yeboah",
    boothCode: "PB6145",
    reflection: "Optimized my LinkedIn headline with target industry keywords and wrote a concise 'About' bio narrative.",
    timestamp: "2026-08-22T09:45:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-4",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-cv",
    boothName: "CV & Cover Letter Masterclass",
    facilitator: "Ama Mensah",
    boothCode: "CV4827",
    reflection: "Removed outdated high school details and focused on portfolio case studies.",
    timestamp: "2026-08-22T10:30:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-5",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-interview",
    boothName: "Interview Skills & Mock Sessions",
    facilitator: "David Osei",
    boothCode: "IS7284",
    reflection: "Learned effective body language and 3 questions to ask interviewers at the end of every interview.",
    timestamp: "2026-08-22T11:15:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-6",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-advancement",
    boothName: "Career Advancement & Corporate Ladder",
    facilitator: "Grace Addo",
    boothCode: "CA3910",
    reflection: "Understood the value of finding both an internal mentor and an executive sponsor.",
    timestamp: "2026-08-22T12:00:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-7",
    participantId: "p-4",
    participantName: "Kwesi Appiah",
    boothId: "booth-entrepreneurship",
    boothName: "Entrepreneurship & Venture Launch",
    facilitator: "Samuel Quaye",
    boothCode: "EV9031",
    reflection: "Discovered the customer discovery framework and minimum viable prototype testing.",
    timestamp: "2026-08-22T09:50:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-8",
    participantId: "p-2",
    participantName: "John Mensah",
    boothId: "booth-tech",
    boothName: "Tech Careers & AI Frontier",
    facilitator: "Emmanuel Darko",
    boothCode: "TC5520",
    reflection: "Learned about AI coding tools, open source contributions, and modern developer portfolio expectations.",
    timestamp: "2026-08-22T10:00:00Z",
    verificationStatus: "verified"
  }
];

const SEED_SURVEYS: ExitSurvey[] = [
  {
    id: "surv-1",
    participantId: "p-3",
    participantName: "Ama Boateng",
    overallRating: 5,
    confidenceRating: 5,
    mostUsefulBoothId: "booth-interview",
    mostUsefulBoothName: "Interview Skills & Mock Sessions",
    keyLearning: "Using the STAR method completely transformed my confidence during mock interviews.",
    improvement: "Provide more power banks or charging stations in the main exhibition hall.",
    submittedAt: "2026-08-22T12:45:00Z"
  }
];

export class StorageService {
  // Initialization & Retrieval
  static getConfig(): EventConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENT_CONFIG);
    if (!raw) {
      this.saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  static saveConfig(config: EventConfig): void {
    localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
  }

  static getParticipants(): Participant[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(SEED_PARTICIPANTS));
      return SEED_PARTICIPANTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PARTICIPANTS;
    }
  }

  static getBooths(): Booth[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOTHS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(INITIAL_BOOTHS));
      return INITIAL_BOOTHS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BOOTHS;
    }
  }

  static saveBooths(booths: Booth[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(booths));
  }

  static getAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
      return SEED_ATTENDANCE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_ATTENDANCE;
    }
  }

  static getBoothVisits(): BoothVisit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOTH_VISITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify(SEED_VISITS));
      return SEED_VISITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_VISITS;
    }
  }

  static getSurveys(): ExitSurvey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(SEED_SURVEYS));
      return SEED_SURVEYS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_SURVEYS;
    }
  }

  // Current session management
  static getCurrentParticipantId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  static setCurrentParticipantId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  static getCurrentParticipant(): Participant | null {
    const id = this.getCurrentParticipantId();
    if (!id) return null;
    const participants = this.getParticipants();
    return participants.find(p => p.id === id) || null;
  }

  static isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  }

  static setAdminLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  }

  // Registration
  static registerParticipant(data: Omit<Participant, 'id' | 'code' | 'registeredAt'>): Participant {
    const participants = this.getParticipants();

    // Generate unique code format KCF-XXXXX
    const num = Math.floor(10000 + Math.random() * 90000);
    const code = `KCF-${num}`;
    const id = `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const newParticipant: Participant = {
      ...data,
      id,
      code,
      registeredAt: new Date().toISOString()
    };

    const updated = [newParticipant, ...participants];
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(updated));
    this.setCurrentParticipantId(id);

    return newParticipant;
  }

  // Check-In
  static checkInParticipant(participantId: string): AttendanceRecord {
    const participants = this.getParticipants();
    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    const attendance = this.getAttendance();
    const existing = attendance.find(a => a.participantId === participantId);
    if (existing) {
      return existing;
    }

    const config = this.getConfig();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      participantId,
      participantName: participant.fullName,
      eventName: config.eventName,
      checkInTime: new Date().toISOString(),
      status: "Checked In"
    };

    const updated = [record, ...attendance];
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    return record;
  }

  static isParticipantCheckedIn(participantId: string): boolean {
    const attendance = this.getAttendance();
    return attendance.some(a => a.participantId === participantId && a.status === "Checked In");
  }

  // Verification & Booth Visits
  static recordBoothVisit(params: {
    participantId: string;
    boothId: string;
    enteredCode: string;
    selectedFacilitator: string;
    reflection: string;
  }): { success: boolean; visit?: BoothVisit; error?: string } {
    const { participantId, boothId, enteredCode, selectedFacilitator, reflection } = params;

    // Check participant
    const participant = this.getParticipants().find(p => p.id === participantId);
    if (!participant) {
      return { success: false, error: "Participant record not found. Please register first." };
    }

    // Check check-in status
    if (!this.isParticipantCheckedIn(participantId)) {
      return { success: false, error: "You must check in to the event before recording booth visits." };
    }

    // Check booth existence
    const booth = this.getBooths().find(b => b.id === boothId);
    if (!booth) {
      return { success: false, error: "Selected booth not found in directory." };
    }

    if (!booth.isActive) {
      return { success: false, error: "This booth is currently marked as inactive." };
    }

    // Check booth code matching (case-insensitive & trimmed)
    if (booth.boothCode.trim().toUpperCase() !== enteredCode.trim().toUpperCase()) {
      return { success: false, error: "Invalid booth code. Please check the code with the facilitator." };
    }

    // Check facilitator validity
    if (!booth.facilitators.includes(selectedFacilitator)) {
      return { success: false, error: "Selected facilitator does not match this booth's official facilitators." };
    }

    // Prevent duplicate booth visits
    const visits = this.getBoothVisits();
    const alreadyVisited = visits.find(
      v => v.participantId === participantId && v.boothId === boothId && v.verificationStatus === "verified"
    );

    if (alreadyVisited) {
      const timeStr = new Date(alreadyVisited.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        success: false,
        error: `You've already completed this booth at ${timeStr}. Each booth can only be counted once.`
      };
    }

    // Check reflection presence
    if (!reflection || reflection.trim().length < 5) {
      return { success: false, error: "Please share what you learned from this booth (minimum 5 characters)." };
    }

    const newVisit: BoothVisit = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      participantId,
      participantName: participant.fullName,
      boothId,
      boothName: booth.name,
      facilitator: selectedFacilitator,
      boothCode: enteredCode.trim().toUpperCase(),
      reflection: reflection.trim().slice(0, 300),
      timestamp: new Date().toISOString(),
      verificationStatus: "verified"
    };

    const updated = [newVisit, ...visits];
    localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify(updated));

    return { success: true, visit: newVisit };
  }

  // Surveys
  static submitExitSurvey(data: {
    participantId: string;
    overallRating: number;
    confidenceRating: number;
    mostUsefulBoothId: string;
    keyLearning: string;
    improvement: string;
  }): ExitSurvey {
    const participant = this.getParticipants().find(p => p.id === data.participantId);
    const booth = this.getBooths().find(b => b.id === data.mostUsefulBoothId);

    const survey: ExitSurvey = {
      id: `surv-${Date.now()}`,
      participantId: data.participantId,
      participantName: participant?.fullName || "Participant",
      overallRating: data.overallRating,
      confidenceRating: data.confidenceRating,
      mostUsefulBoothId: data.mostUsefulBoothId,
      mostUsefulBoothName: booth?.name || "General Session",
      keyLearning: data.keyLearning.trim(),
      improvement: data.improvement.trim(),
      submittedAt: new Date().toISOString()
    };

    const surveys = this.getSurveys();
    const filtered = surveys.filter(s => s.participantId !== data.participantId);
    const updated = [survey, ...filtered];
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(updated));

    return survey;
  }

  static hasCompletedSurvey(participantId: string): boolean {
    const surveys = this.getSurveys();
    return surveys.some(s => s.participantId === participantId);
  }

  // Dynamic M&E Calculations (Calculated dynamically, zero hardcoding)
  static getMetrics(): MneMetrics {
    const participants = this.getParticipants();
    const attendance = this.getAttendance();
    const visits = this.getBoothVisits();
    const surveys = this.getSurveys();
    const config = this.getConfig();

    const totalRegistered = participants.length;

    // Count unique checked-in participants
    const checkedInParticipantIds = new Set(
      attendance.filter(a => a.status === 'Checked In').map(a => a.participantId)
    );
    const totalAttended = checkedInParticipantIds.size;

    const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;
    const totalBoothVisits = visits.filter(v => v.verificationStatus === 'verified').length;

    // Calculate unique booths completed per participant
    const participantVisitsMap: Record<string, Set<string>> = {};
    visits.forEach(v => {
      if (v.verificationStatus === 'verified') {
        if (!participantVisitsMap[v.participantId]) {
          participantVisitsMap[v.participantId] = new Set();
        }
        participantVisitsMap[v.participantId].add(v.boothId);
      }
    });

    let completedMinBoothsCount = 0;
    Object.values(participantVisitsMap).forEach(boothSet => {
      if (boothSet.size >= config.minBoothsRequired) {
        completedMinBoothsCount++;
      }
    });

    const completionRate = totalAttended > 0 ? (completedMinBoothsCount / totalAttended) * 100 : 0;
    const avgBoothsPerAttendee = totalAttended > 0 ? totalBoothVisits / totalAttended : 0;
    const exitSurveysCount = surveys.length;

    return {
      totalRegistered,
      totalAttended,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      totalBoothVisits,
      completedMinBoothsCount,
      completionRate: Math.round(completionRate * 10) / 10,
      exitSurveysCount,
      avgBoothsPerAttendee: Math.round(avgBoothsPerAttendee * 100) / 100
    };
  }

  // Reset or Seed Helpers
  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(SEED_PARTICIPANTS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(INITIAL_BOOTHS));
    localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify(SEED_VISITS));
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(SEED_SURVEYS));
    localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    this.setCurrentParticipantId(SEED_PARTICIPANTS[0].id);
  }

  static clearAllData(): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
    this.setCurrentParticipantId(null);
  }
}
