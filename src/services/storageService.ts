import { Participant, PreRegistrationData, WalkInRegistrationData, MondayRegistrationData, AttendanceRecord, Booth, BoothVisit, ExitSurvey, PostEventSurvey, EventConfig, MneMetrics, CareerFairEvent, NexusQuestion, ParticipantSession } from '../types';
import { CODE_ALPHABET, CODE_DIGITS } from '../registrationOptions';
import { EVENTS, getEventById, DEFAULT_EVENT_ID, EVENT_FRIDAY, EVENT_MONDAY } from '../events';

export const CODE_PREFIX = 'NEXUS-';

const STORAGE_KEYS = {
  PARTICIPANTS: 'kcf_participants_v1',
  ATTENDANCE: 'kcf_attendance_v1',
  BOOTHS: 'kcf_booths_v1',
  BOOTH_VISITS: 'kcf_booth_visits_v1',
  SURVEYS: 'kcf_surveys_v1',
  MONDAY_SURVEYS: 'kcf_monday_surveys_v1',
  QUESTIONS: 'kcf_questions_v1',
  EVENTS: 'kcf_events_v1',
  SESSION: 'nexus_session',
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
      "Entrance University College",
      "Central University"
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

const BOOTH_SEED_VERSION = 2;
export const INITIAL_BOOTH_SEED_VERSION = BOOTH_SEED_VERSION;

const FRI_EVENT = EVENT_FRIDAY.id;
const MON_EVENT = EVENT_MONDAY.id;

export class StorageService {
  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  static getEvents(): CareerFairEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) return EVENTS;
    try {
      return JSON.parse(raw) as CareerFairEvent[];
    } catch {
      return EVENTS;
    }
  }

  static saveEvents(events: CareerFairEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  static getEvent(eventId: string): CareerFairEvent {
    return getEventById(eventId);
  }

  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Participants
  // -------------------------------------------------------------------------
  static getParticipants(eventId?: string): Participant[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    let participants: Participant[];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify([]));
      participants = [];
    } else {
      try {
        participants = JSON.parse(raw) as Participant[];
      } catch {
        participants = [];
      }
    }
    const normalized = participants.map(p => this.normalizeParticipant(p));
    return eventId ? normalized.filter(p => p.eventId === eventId) : normalized;
  }

  static saveParticipants(participants: Participant[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }

  // Backfills new-model fields (eventId, etc.) on any legacy / externally-created record
  static normalizeParticipant(p: Participant): Participant {
    const legacy = p.registrationType === undefined;
    const attendance = this.getAttendanceRaw();
    const att = attendance.find(a => a.participantId === p.id && a.status === "Checked In");
    const preRegistered = p.registrationType === 'pre_registration' || (legacy && !!p.code && !p.code.startsWith(CODE_PREFIX));
    return {
      ...p,
      eventId: p.eventId || DEFAULT_EVENT_ID,
      fullName: (p.fullName || '').trim(),
      registrationType: p.registrationType || 'pre_registration',
      registeredBeforeEvent: p.registeredBeforeEvent ?? true,
      checkedIn: p.checkedIn || !!att,
      checkedInAt: p.checkedInAt || att?.checkInTime,
      eventDate: p.eventDate || this.getConfig().eventDate
    };
  }

  static getParticipantById(participantId: string): Participant | null {
    return this.getParticipants().find(p => p.id === participantId) || null;
  }

  // -------------------------------------------------------------------------
  // Booths, Attendance, Visits, Surveys (event scoped where relevant)
  // -------------------------------------------------------------------------
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

  private static getAttendanceRaw(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw) as AttendanceRecord[];
    } catch {
      return [];
    }
  }

  static getAttendance(eventId?: string): AttendanceRecord[] {
    const attendance = this.getAttendanceRaw().map(a => {
      if (a.eventId) return a;
      const participant = this.getParticipants().find(p => p.id === a.participantId);
      return { ...a, eventId: participant?.eventId || DEFAULT_EVENT_ID };
    });
    return eventId ? attendance.filter(a => a.eventId === eventId) : attendance;
  }

  static getBoothVisits(eventId?: string): BoothVisit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOTH_VISITS);
    let visits: BoothVisit[];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify([]));
      visits = [];
    } else {
      try {
        visits = JSON.parse(raw) as BoothVisit[];
      } catch {
        visits = [];
      }
    }
    const normalized = visits.map(v => {
      if (v.eventId) return v;
      const participant = this.getParticipants().find(p => p.id === v.participantId);
      return { ...v, eventId: participant?.eventId || DEFAULT_EVENT_ID };
    });
    return eventId ? normalized.filter(v => v.eventId === eventId) : normalized;
  }

  static getSurveys(eventId?: string): ExitSurvey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    let surveys: ExitSurvey[];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
      surveys = [];
    } else {
      try {
        surveys = JSON.parse(raw) as ExitSurvey[];
      } catch {
        surveys = [];
      }
    }
    const normalized = surveys.map(s => {
      if (s.eventId) return s;
      const participant = this.getParticipants().find(p => p.id === s.participantId);
      return { ...s, eventId: participant?.eventId || DEFAULT_EVENT_ID };
    });
    return eventId ? normalized.filter(s => s.eventId === eventId) : normalized;
  }

  // Monday (students) post-event surveys
  static getMondaySurveys(): PostEventSurvey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MONDAY_SURVEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MONDAY_SURVEYS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw) as PostEventSurvey[];
    } catch {
      return [];
    }
  }

  static submitMondaySurvey(data: {
    participantId: string;
    responses: Record<string, unknown>;
  }): PostEventSurvey {
    const participant = this.getParticipants().find(p => p.id === data.participantId);
    const survey: PostEventSurvey = {
      id: `msurv-${Date.now()}`,
      eventId: MON_EVENT,
      participantId: data.participantId,
      participantName: participant?.fullName || "Participant",
      submittedAt: new Date().toISOString(),
      responses: data.responses
    };
    const surveys = this.getMondaySurveys();
    const filtered = surveys.filter(s => s.participantId !== data.participantId);
    localStorage.setItem(STORAGE_KEYS.MONDAY_SURVEYS, JSON.stringify([survey, ...filtered]));
    return survey;
  }

  static hasCompletedMondaySurvey(participantId: string): boolean {
    return this.getMondaySurveys().some(s => s.participantId === participantId);
  }

  // -------------------------------------------------------------------------
  // Questions
  // -------------------------------------------------------------------------
  static getQuestions(eventId?: string): NexusQuestion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let questions: NexusQuestion[];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([]));
      questions = [];
    } else {
      try {
        questions = JSON.parse(raw) as NexusQuestion[];
      } catch {
        questions = [];
      }
    }
    return eventId ? questions.filter(q => q.eventId === eventId) : questions;
  }

  static submitQuestion(data: {
    eventId: string;
    participantId: string;
    participantName: string;
    question: string;
  }): NexusQuestion {
    const question: NexusQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: data.eventId,
      participantId: data.participantId,
      participantName: data.participantName,
      question: data.question.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    const questions = this.getQuestions();
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([question, ...questions]));
    return question;
  }

  static updateQuestionStatus(questionId: string, status: NexusQuestion['status'], answer?: string): void {
    const questions = this.getQuestions().map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        status,
        answer: answer !== undefined ? answer.trim() : q.answer,
      };
    });
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  // -------------------------------------------------------------------------
  // Sessions (saved-session recognition under the nexus_session key)
  // -------------------------------------------------------------------------
  static getSession(): ParticipantSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ParticipantSession;
    } catch {
      return null;
    }
  }

  static saveSession(session: ParticipantSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  static clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Returns the active session only if it is still valid (participant exists,
  // event is a defined one). Invalid/expired sessions are cleared.
  static getValidSession(): ParticipantSession | null {
    const session = this.getSession();
    if (!session) return null;
    const participantExists = !!this.getParticipants().find(p => p.id === session.participantId);
    const eventExists = !!getEventById(session.eventId);
    if (!participantExists || !eventExists) {
      this.clearSession();
      return null;
    }
    return { ...session, lastActiveAt: new Date().toISOString() };
  }

  // Creates + persists a new active session for a device.
  static startSession(eventId: string, participantId: string): ParticipantSession {
    const session: ParticipantSession = {
      eventId,
      participantId,
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    this.saveSession(session);
    this.setCurrentParticipantId(participantId);
    return session;
  }

  // Legacy single-user session helpers (kept for compatibility)
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

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------
  private static newParticipantId(): string {
    return `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private static sanitize(data: Record<string, unknown>): void {
    if (typeof data.fullName === 'string') data.fullName = data.fullName.trim();
    if (typeof data.email === 'string') data.email = data.email.trim().toLowerCase();
    if (typeof data.phone === 'string') data.phone = data.phone.trim();
    if (typeof data.psghRegistrationNumber === 'string') {
      data.psghRegistrationNumber = data.psghRegistrationNumber.trim();
    }
    if (typeof data.cvLink === 'string') data.cvLink = data.cvLink.trim();
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
  static findParticipantByCode(code: string, eventId?: string): Participant | null {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
    const bare = normalized.replace(new RegExp(`^${CODE_PREFIX}`), '');
    const participants = this.getParticipants(eventId);
    return participants.find(p => {
      const pBare = p.code.replace(new RegExp(`^${CODE_PREFIX}`), '');
      return p.code === normalized || p.code === bare || pBare === bare;
    }) || null;
  }

  // Full pre-registration questionnaire (Friday professionals) -> registered but
  // NOT checked in and NOT signed in (standalone registration, no auto-login).
  static registerPreRegistration(data: PreRegistrationData): Participant {
    const sanitized: Record<string, unknown> = { ...data };
    this.sanitize(sanitized);

    const raw: PreRegistrationData = sanitized as unknown as PreRegistrationData;

    const newParticipant: Participant = {
      ...raw,
      id: this.newParticipantId(),
      code: this.generateRegistrationCode(),
      eventId: FRI_EVENT,
      registeredAt: new Date().toISOString(),
      registrationType: 'pre_registration',
      registeredBeforeEvent: true,
      checkedIn: false,
      eventDate: EVENT_FRIDAY.date
    };

    this.saveParticipants([newParticipant, ...this.getParticipants()]);

    return newParticipant;
  }

  // Short event-day registration (Name, Email, Phone, Registration Number) -> checked in immediately
  static registerWalkIn(data: WalkInRegistrationData, eventId: string = FRI_EVENT): Participant {
    const sanitized: Record<string, unknown> = { ...data };
    this.sanitize(sanitized);

    const raw: WalkInRegistrationData = sanitized as unknown as WalkInRegistrationData;
    const event = getEventById(eventId);

    const newParticipant: Participant = {
      ...raw,
      id: this.newParticipantId(),
      code: this.generateRegistrationCode(),
      eventId,
      registeredAt: new Date().toISOString(),
      registrationType: 'walk_in',
      registeredBeforeEvent: false,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      eventDate: event.date
    };

    this.saveParticipants([newParticipant, ...this.getParticipants()]);

    // Log attendance as well so the attendance sheet stays consistent
    this.checkInParticipantFlow(newParticipant.id);

    return newParticipant;
  }

  // Monday Students' Career Fair registration (FirstName, Surname, Email, Institution, Year of Study)
  // -> checked in immediately.
  static registerMonday(data: MondayRegistrationData): Participant {
    const sanitized: Record<string, unknown> = { ...data };
    this.sanitize(sanitized);

    const fullName = `${sanitized.firstName || ''} ${sanitized.surname || ''}`.trim();

    const newParticipant: Participant = {
      id: this.newParticipantId(),
      code: this.generateRegistrationCode(),
      eventId: MON_EVENT,
      fullName,
      firstName: sanitized.firstName as string,
      surname: sanitized.surname as string,
      institution: sanitized.institution as string,
      yearOfStudy: sanitized.yearOfStudy as string,
      phone: '',
      email: (sanitized.email as string).trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
      registrationType: 'walk_in',
      registeredBeforeEvent: false,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      eventDate: EVENT_MONDAY.date,
      currentJobTitle: 'Student',
      highestEducation: 'Student'
    };

    this.saveParticipants([newParticipant, ...this.getParticipants()]);

    // Log attendance for the Monday event
    this.checkInParticipantFlow(newParticipant.id);

    return newParticipant;
  }

  // -------------------------------------------------------------------------
  // Check-In
  // -------------------------------------------------------------------------
  private static checkInParticipantFlow(participantId: string): AttendanceRecord {
    const participants = this.getParticipants();
    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    const attendance = this.getAttendanceRaw();
    const existing = attendance.find(a => a.participantId === participantId && a.status === "Checked In");
    if (existing) {
      return existing;
    }

    const event = getEventById(participant.eventId);
    const checkInTime = new Date().toISOString();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      participantId,
      participantName: participant.fullName,
      eventId: participant.eventId,
      eventName: event.name,
      checkInTime,
      status: "Checked In"
    };

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([record, ...attendance]));
    return record;
  }

  static checkInParticipant(participantId: string): AttendanceRecord {
    const participants = this.getParticipants();
    const participant = participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    const attendance = this.getAttendanceRaw();
    const existing = attendance.find(a => a.participantId === participantId && a.status === "Checked In");
    if (existing) {
      // Ensure participant record reflects the external check-in state
      if (!participant.checkedIn) {
        this.saveParticipants(participants.map(p => p.id === participantId
          ? { ...p, checkedIn: true, checkedInAt: existing.checkInTime, eventDate: getEventById(participant.eventId).date }
          : p));
      }
      return existing;
    }

    const event = getEventById(participant.eventId);
    const checkInTime = new Date().toISOString();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      participantId,
      participantName: participant.fullName,
      eventId: participant.eventId,
      eventName: event.name,
      checkInTime,
      status: "Checked In"
    };

    this.saveParticipants(participants.map(p => p.id === participantId
      ? { ...p, checkedIn: true, checkedInAt: checkInTime, eventDate: event.date }
      : p));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([record, ...attendance]));
    return record;
  }

  static isParticipantCheckedIn(participantId: string): boolean {
    const participant = this.getParticipants().find(p => p.id === participantId);
    if (participant?.checkedIn) return true;
    const attendance = this.getAttendanceRaw();
    return attendance.some(a => a.participantId === participantId && a.status === "Checked In");
  }

  // -------------------------------------------------------------------------
  // Verification & Booth Visits
  // -------------------------------------------------------------------------
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
      return { success: false, error: "Invalid booth code. Please check the code displayed at the booth." };
    }

    // Check facilitator validity
    if (!booth.facilitators.includes(selectedFacilitator)) {
      return { success: false, error: "Selected facilitator does not match this booth's official facilitators." };
    }

    // Prevent duplicate booth visits
    const visits = this.getBoothVisits(participant.eventId);
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
      eventId: participant.eventId,
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

  // -------------------------------------------------------------------------
  // Surveys (Friday professionals' exit survey)
  // -------------------------------------------------------------------------
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
      eventId: participant?.eventId || FRI_EVENT,
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

  static hasCompletedSurvey(participantId: string, eventId?: string): boolean {
    const surveys = this.getSurveys(eventId);
    return surveys.some(s => s.participantId === participantId);
  }

  // -------------------------------------------------------------------------
  // M&E Metrics (computed dynamically per event)
  // -------------------------------------------------------------------------
  static getMetrics(eventId?: string): MneMetrics {
    const participants = this.getParticipants(eventId);
    const attendance = this.getAttendance(eventId);
    const visits = this.getBoothVisits(eventId);
    const surveys = this.getSurveys(eventId);
    const config = this.getConfig();
    const event = eventId ? getEventById(eventId) : undefined;

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

    const minBooths = event?.minBoothsRequired ?? config.minBoothsRequired;
    let completedMinBoothsCount = 0;
    Object.values(participantVisitsMap).forEach(boothSet => {
      if (boothSet.size >= minBooths) {
        completedMinBoothsCount++;
      }
    });

    const completionRate = totalAttended > 0 ? (completedMinBoothsCount / totalAttended) * 100 : 0;
    const avgBoothsPerAttendee = totalAttended > 0 ? totalBoothVisits / totalAttended : 0;
    const exitSurveysCount = surveys.length;

    return {
      eventId,
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

  // -------------------------------------------------------------------------
  // Reset Helpers
  // -------------------------------------------------------------------------
  static clearAllData(): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BOOTH_VISITS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MONDAY_SURVEYS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([]));
    this.clearSession();
    this.setCurrentParticipantId(null);
  }
}
