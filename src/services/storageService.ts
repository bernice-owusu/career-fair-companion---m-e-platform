import { Participant, PreRegistrationData, WalkInRegistrationData, AttendanceRecord, Booth, BoothVisit, ExitSurvey, EventConfig, MneMetrics } from '../types';
import { CODE_ALPHABET, CODE_DIGITS } from '../registrationOptions';

export const CODE_PREFIX = 'NEXUS-';

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
  BOOTH_SEED_VERSION: 'kcf_booths_seed_version_v1',
};

export const DEFAULT_CONFIG: EventConfig = {
  eventName: "Nexus Career Fair 2026",
  eventDate: "2026-09-25",
  eventLocation: "University of Ghana Campus, Accra",
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
    id: "booth-international-development",
    name: "International Development",
    description: "Explore global health initiatives, NGO and multilateral careers, and how pharmacists shape international development programmes.",
    location: "Exhibition Hall A",
    facilitators: ["Aristotle John Nikoi"],
    boothCode: "INT827",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-pharmacovigilance",
    name: "Pharmacovigilance & Patient Safety",
    description: "Learn about drug safety monitoring, adverse-event reporting, and the regulatory careers protecting patients worldwide.",
    location: "Exhibition Hall B",
    facilitators: ["Michelle Akua Amoatin"],
    boothCode: "PVS310",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-insurance",
    name: "Insurance & Payer Services",
    description: "Discover how pharmacists lead in health insurance, claims management, and payer service operations.",
    location: "Exhibition Hall C",
    facilitators: ["Doreen Efua Amoatin"],
    boothCode: "INS612",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-business-commerce",
    name: "Business & Commerce",
    description: "From commercial strategy to business development — explore how pharmacists drive value in the healthcare market.",
    location: "Exhibition Hall D",
    facilitators: ["Jonathan Ahumah-Sackey"],
    boothCode: "BCM748",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-supply-chain",
    name: "Supply Chain Management",
    description: "Follow the medicine journey — procurement, distribution, cold-chain logistics, and inventory optimisation.",
    location: "Exhibition Hall E",
    facilitators: ["Priscilla Mante"],
    boothCode: "SCM295",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-law",
    name: "Law",
    description: "The intersection of pharmacy and law — intellectual property, regulation, compliance, and health policy.",
    location: "Exhibition Hall F",
    facilitators: ["Bietrix Fredcy Awuah"],
    boothCode: "LAW861",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-media-acting",
    name: "Media & Acting",
    description: "Shine on screen and stage — media production, health communication, and acting careers for pharmacists.",
    location: "Exhibition Hall G",
    facilitators: ["Pharm Philip Torgboh Mensah"],
    boothCode: "MDA437",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-clinical-trials",
    name: "Clinical Trials & Research",
    description: "Designing and running clinical studies — from protocol development to data integrity and ethical oversight.",
    location: "Exhibition Hall H",
    facilitators: ["Mark Ekow N.B.E Bismarck"],
    boothCode: "CTR524",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-product-development",
    name: "Product Development & Management",
    description: "Bring pharmaceutical and digital health products to life — innovation, portfolio strategy, and product leadership.",
    location: "Exhibition Hall I",
    facilitators: ["Joel Anaman"],
    boothCode: "PDM690",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-schools-scholarships",
    name: "School & Scholarships",
    description: "Find graduate programmes, funding opportunities, and scholarship pathways to advance your pharmacy education.",
    location: "Exhibition Hall J",
    facilitators: ["Nana Ofori Adomako", "Nana Kusi Boadum"],
    boothCode: "SSS356",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-software-engineering",
    name: "Software Engineering",
    description: "Build the future of healthcare technology — software development, health informatics, and digital product engineering.",
    location: "Exhibition Hall K",
    facilitators: ["Andrews Boateng"],
    boothCode: "SEG412",
    isActive: true,
    category: "Career Track"
  },
  {
    id: "booth-market-intelligence",
    name: "Market Intelligence",
    description: "Turn data into decisions — market research, competitive analysis, and insight-driven pharmaceutical strategy.",
    location: "Exhibition Hall L",
    facilitators: ["Joseph Nelson Addy"],
    boothCode: "MKI908",
    isActive: true,
    category: "Career Track"
  }
];

// Bump this when confirmed event data (booths/facilitators) changes so
// existing installations pick up the new seed set instead of stale local data.
const BOOTH_SEED_VERSION = 2;
export const INITIAL_BOOTH_SEED_VERSION = BOOTH_SEED_VERSION;

// Pre-seeded participants for initial rich M&E analytics baseline
const SEED_PARTICIPANTS: Participant[] = [
  {
    id: "p-1",
    code: "NEXUS-4XK9M2",
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
    registeredAt: "2026-08-08T10:15:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: true,
    checkedInAt: "2026-08-22T08:30:00Z",
    eventDate: "2026-08-22",
    psghRegistrationNumber: "PSGH-20981",
    yearOfCompletion: "2023",
    highestEducation: "BPharm",
    currentJobTitle: "Regulatory Affairs Officer",
    currentAreaOfPractice: "Regulatory",
    regionOfResidence: "Greater Accra",
    idealCareerPath: "Regulatory",
    careerFairExpectations: [
      "To gather unbiased information on different career pathways available",
      "To network with industry professionals"
    ],
    careerTracks: ["Pharmacovigilance & Patient Safety", "Business & Commerce"],
    resumeQuality: 4,
    interviewConfidence: 3,
    heardAboutCareerFair: "Through a friend/colleague",
    attendedLastYear: "Yes"
  },
  {
    id: "p-2",
    code: "NEXUS-096FT4",
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
    registeredAt: "2026-08-12T13:10:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: true,
    checkedInAt: "2026-08-22T08:40:00Z",
    eventDate: "2026-08-22",
    psghRegistrationNumber: "PSGH-11024",
    yearOfCompletion: "2024",
    highestEducation: "PharmD",
    currentJobTitle: "Pharmacy Intern",
    currentAreaOfPractice: "Hospitals",
    regionOfResidence: "Ashanti",
    idealCareerPath: "Hospital",
    careerTracks: ["Clinical Trials & Research"],
    attendedLastYear: "No"
  },
  {
    id: "p-3",
    code: "NEXUS-7F42K9",
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
    registeredAt: "2026-08-02T09:00:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: true,
    checkedInAt: "2026-08-22T08:45:00Z",
    eventDate: "2026-08-22",
    psghRegistrationNumber: "PSGH-33258",
    yearOfCompletion: "2018",
    highestEducation: "Master's",
    currentJobTitle: "Community Pharmacist",
    currentAreaOfPractice: "Community",
    regionOfResidence: "Central",
    idealCareerPath: "Community",
    careerFairExpectations: ["To secure a new job", "To network with industry professionals"],
    careerTracks: ["Product Development & Management", "Market Intelligence"],
    skillsLabResumeAssistance: "Yes",
    resumeQuality: 3,
    cvUploaded: true,
    cvFileName: "ama_boateng_cv.pdf",
    interviewConfidence: 4,
    mockInterview: "Yes",
    heardAboutCareerFair: "Twitter/X",
    attendedLastYear: "Yes",
    facilitatorQuestions: "How do I transition from community practice into product management in pharma?"
  },
  {
    id: "p-4",
    code: "NEXUS-3PD8V5",
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
    registeredAt: "2026-08-05T14:30:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: true,
    checkedInAt: "2026-08-22T09:00:00Z",
    eventDate: "2026-08-22",
    psghRegistrationNumber: "0000",
    yearOfCompletion: "2026",
    highestEducation: "Student",
    currentJobTitle: "Student",
    currentAreaOfPractice: "Community",
    regionOfResidence: "Eastern",
    idealCareerPath: "Marketing",
    careerTracks: ["Software Engineering", "Product Development & Management"],
    heardAboutCareerFair: "WhatsApp"
  },
  {
    id: "p-5",
    code: "NEXUS-6RTQ1C",
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
    registeredAt: "2026-08-10T11:45:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: true,
    checkedInAt: "2026-08-22T09:10:00Z",
    eventDate: "2026-08-22",
    psghRegistrationNumber: "PSGH-77102",
    yearOfCompletion: "2023",
    highestEducation: "BPharm",
    currentJobTitle: "Medical Sales Representative",
    currentAreaOfPractice: "Marketing",
    regionOfResidence: "Greater Accra",
    idealCareerPath: "Marketing",
    careerFairExpectations: ["To gather unbiased information on different career pathways available"],
    careerTracks: ["Insurance & Payer Services", "International Development"],
    resumeQuality: 4,
    interviewConfidence: 2,
    mockInterview: "Yes",
    heardAboutCareerFair: "PSGH Communications"
  },
  {
    id: "p-6",
    code: "NEXUS-2KBW7E",
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
    registeredAt: "2026-08-12T16:20:00Z",
    registrationType: "pre_registration",
    registeredBeforeEvent: true,
    checkedIn: false,
    eventDate: "2026-08-22",
    psghRegistrationNumber: "PSGH-88503",
    yearOfCompletion: "2020",
    highestEducation: "PhD",
    currentJobTitle: "Research Scientist",
    currentAreaOfPractice: "Academia & Research",
    regionOfResidence: "Western",
    idealCareerPath: "Academia",
    careerTracks: ["Clinical Trials & Research", "School & Scholarships"],
    skillsLabResumeAssistance: "Other",
    skillsLabResumeAssistanceOther: "Cover letter review",
    resumeQuality: 5,
    interviewConfidence: 5,
    attendedLastYear: "Yes"
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
    boothId: "booth-pharmacovigilance",
    boothName: "Pharmacovigilance & Patient Safety",
    facilitator: "Michelle Akua Amoatin",
    boothCode: "PVS310",
    reflection: "Learned how drug safety data is gathered in real-world settings and what a typical PV associate actually does day to day.",
    timestamp: "2026-08-22T09:30:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-2",
    participantId: "p-1",
    participantName: "Bernice Owusu",
    boothId: "booth-business-commerce",
    boothName: "Business & Commerce",
    facilitator: "Jonathan Ahumah-Sackey",
    boothCode: "BCM748",
    reflection: "Practiced positioning my regulatory background for commercial roles and how to answer 'Tell me about yourself' in under 90s.",
    timestamp: "2026-08-22T10:15:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-3",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-product-development",
    boothName: "Product Development & Management",
    facilitator: "Joel Anaman",
    boothCode: "PDM690",
    reflection: "Got a clear picture of the product lifecycle in pharma and wrote a tighter personal positioning statement.",
    timestamp: "2026-08-22T09:45:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-4",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-market-intelligence",
    boothName: "Market Intelligence",
    facilitator: "Joseph Nelson Addy",
    boothCode: "MKI908",
    reflection: "Learned how competitive analysis and primary research feed product roadmaps.",
    timestamp: "2026-08-22T10:30:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-5",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-international-development",
    boothName: "International Development",
    facilitator: "Aristotle John Nikoi",
    boothCode: "INT827",
    reflection: "Explored how health-system and NGO roles can be a bridge from community pharmacy into broader public health impact.",
    timestamp: "2026-08-22T11:15:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-6",
    participantId: "p-3",
    participantName: "Ama Boateng",
    boothId: "booth-insurance",
    boothName: "Insurance & Payer Services",
    facilitator: "Doreen Efua Amoatin",
    boothCode: "INS612",
    reflection: "Understood how private health insurance and payer structures shape which pharma products reach patients.",
    timestamp: "2026-08-22T12:00:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-7",
    participantId: "p-4",
    participantName: "Kwesi Appiah",
    boothId: "booth-software-engineering",
    boothName: "Software Engineering",
    facilitator: "Andrews Boateng",
    boothCode: "SEG412",
    reflection: "Discovered the customer discovery framework and how early-stage teams test assumptions before building.",
    timestamp: "2026-08-22T09:50:00Z",
    verificationStatus: "verified"
  },
  {
    id: "v-8",
    participantId: "p-2",
    participantName: "John Mensah",
    boothId: "booth-clinical-trials",
    boothName: "Clinical Trials & Research",
    facilitator: "Mark Ekow N.B.E Bismarck",
    boothCode: "CTR524",
    reflection: "Got practical guidance on ICH-GCP, real-world evidence work, and positioning a hospital pharmacy background for research roles.",
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
    mostUsefulBoothId: "booth-product-development",
    mostUsefulBoothName: "Product Development & Management",
    keyLearning: "Understanding how user research feeds product roadmaps gave me a clear path from community pharmacy into pharma product management.",
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
      const parsed = JSON.parse(raw) as Participant[];
      return parsed.map(p => this.normalizeParticipant(p));
    } catch {
      return SEED_PARTICIPANTS;
    }
  }

  static saveParticipants(participants: Participant[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }

  // Backfills new-model fields on any legacy / externally-created participant record
  static normalizeParticipant(p: Participant): Participant {
    const legacy = p.registrationType === undefined;
    const attendance = this.getAttendance();
    const att = attendance.find(a => a.participantId === p.id && a.status === "Checked In");
    const preRegistered = p.registrationType === 'pre_registration' || (legacy && !!p.code && !p.code.startsWith(CODE_PREFIX));
    return {
      ...p,
      fullName: p.fullName.trim(),
      registrationType: p.registrationType || 'pre_registration',
      registeredBeforeEvent: p.registeredBeforeEvent ?? true,
      checkedIn: p.checkedIn || !!att,
      checkedInAt: p.checkedInAt || att?.checkInTime,
      eventDate: p.eventDate || this.getConfig().eventDate
    };
  }

  static getBooths(): Booth[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOTHS);
    const seededVersion = localStorage.getItem(STORAGE_KEYS.BOOTH_SEED_VERSION);
    if (!raw || seededVersion !== String(BOOTH_SEED_VERSION)) {
      localStorage.setItem(STORAGE_KEYS.BOOTHS, JSON.stringify(INITIAL_BOOTHS));
      localStorage.setItem(STORAGE_KEYS.BOOTH_SEED_VERSION, String(BOOTH_SEED_VERSION));
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
  private static newParticipantId(): string {
    return `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  // Sanitizes free-text inputs before persistence
  private static sanitize(data: Record<string, unknown>): void {
    if (typeof data.fullName === 'string') data.fullName = data.fullName.trim();
    if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase();
    if (typeof data.phone === 'string') data.phone = data.phone.trim();
    if (typeof data.psghRegistrationNumber === 'string') {
      data.psghRegistrationNumber = data.psghRegistrationNumber.trim();
    }
  }

  // Generates a unique NEXUS-XXXXXX registration code (no ambiguous O/0, I/1, S/5)
  static generateRegistrationCode(): string {
    const existingCodes = new Set(this.getParticipants().map(p => p.code));
    let code = '';
    do {
      let suffix = '';
      for (let i = 0; i < CODE_DIGITS; i++) {
        suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
      code = `${CODE_PREFIX}${suffix}`;
    } while (existingCodes.has(code));
    return code;
  }

  // Case-insensitive lookup by registration code (accepts with/without NEXUS- prefix)
  static findParticipantByCode(code: string): Participant | null {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
    const bare = normalized.replace(new RegExp(`^${CODE_PREFIX}`), '');
    const participants = this.getParticipants();
    return participants.find(p => {
      const pBare = p.code.replace(new RegExp(`^${CODE_PREFIX}`), '');
      return p.code === normalized || p.code === bare || pBare === bare;
    }) || null;
  }

  // Full pre-registration questionnaire -> registered but NOT yet checked in
  static registerPreRegistration(data: PreRegistrationData): Participant {
    const sanitized: Record<string, unknown> = { ...data };
    this.sanitize(sanitized);

    const raw: PreRegistrationData = sanitized as unknown as PreRegistrationData;

    const newParticipant: Participant = {
      ...raw,
      id: this.newParticipantId(),
      code: this.generateRegistrationCode(),
      registeredAt: new Date().toISOString(),
      registrationType: 'pre_registration',
      registeredBeforeEvent: true,
      checkedIn: false
    };

    this.saveParticipants([newParticipant, ...this.getParticipants()]);
    this.setCurrentParticipantId(newParticipant.id);

    return newParticipant;
  }

  // Short event-day registration (Name, Email, Phone, Registration Number) -> checked in immediately
  static registerWalkIn(data: WalkInRegistrationData): Participant {
    const sanitized: Record<string, unknown> = { ...data };
    this.sanitize(sanitized);

    const raw: WalkInRegistrationData = sanitized as unknown as WalkInRegistrationData;

    const newParticipant: Participant = {
      ...raw,
      id: this.newParticipantId(),
      code: this.generateRegistrationCode(),
      registeredAt: new Date().toISOString(),
      registrationType: 'walk_in',
      registeredBeforeEvent: false,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      eventDate: this.getConfig().eventDate
    };

    this.saveParticipants([newParticipant, ...this.getParticipants()]);
    this.setCurrentParticipantId(newParticipant.id);

    // Log attendance as well so the attendance sheet stays consistent
    this.checkInParticipant(newParticipant.id);

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
    const existing = attendance.find(a => a.participantId === participantId && a.status === "Checked In");
    if (existing) {
      // Ensure participant record reflects the external check-in state
      if (!participant.checkedIn) {
        this.saveParticipants(participants.map(p => p.id === participantId
          ? { ...p, checkedIn: true, checkedInAt: existing.checkInTime, eventDate: this.getConfig().eventDate }
          : p));
      }
      return existing;
    }

    const config = this.getConfig();
    const checkInTime = new Date().toISOString();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      participantId,
      participantName: participant.fullName,
      eventName: config.eventName,
      checkInTime,
      status: "Checked In"
    };

    this.saveParticipants(participants.map(p => p.id === participantId
      ? { ...p, checkedIn: true, checkedInAt: checkInTime, eventDate: config.eventDate }
      : p));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([record, ...attendance]));
    return record;
  }

  static isParticipantCheckedIn(participantId: string): boolean {
    const participant = this.getParticipants().find(p => p.id === participantId);
    if (participant?.checkedIn) return true;
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

    // Registration funnel metrics
    const preRegistered = participants.filter(p => p.registrationType === 'pre_registration');
    const walkedIn = participants.filter(p => p.registrationType === 'walk_in');
    const checkedInCount = participants.filter(p => p.checkedIn).length;
    const preRegisteredCheckedIn = preRegistered.filter(p => p.checkedIn).length;
    const preRegistrationAttendanceRate = preRegistered.length > 0
      ? (preRegisteredCheckedIn / preRegistered.length) * 100
      : 0;

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
      avgBoothsPerAttendee: Math.round(avgBoothsPerAttendee * 100) / 100,
      preRegisteredCount: preRegistered.length,
      walkedInCount: walkedIn.length,
      checkedInCount,
      preRegisteredCheckedIn,
      preRegistrationAttendanceRate: Math.round(preRegistrationAttendanceRate * 10) / 10
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
