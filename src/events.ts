import { CareerFairEvent, EventConfig } from './types';

// Event catalog. The platform is event-aware: every registration, check-in,
// survey, question and booth visit is scoped to one of these events.

export const EVENT_MONDAY: CareerFairEvent = {
  id: 'monday-students-2026',
  name: "Nexus 2026 Students' Career Fair",
  date: '2026-09-21',
  time: '9:00 AM',
  venue: 'Public Health Auditorium',
  audienceType: 'students',
  status: 'published',
  features: {
    preRegistration: false,
    registrationCode: false,
    walkInRegistration: true,
    boothTracking: false,
    questions: true,
    skillsLab: false,
    ticket: false,
    postEventSurvey: true,
  },
};

export const EVENT_FRIDAY: CareerFairEvent = {
  id: 'friday-professionals-2026',
  name: "Nexus 2026 Professionals' Career Fair",
  date: '2026-09-25',
  time: '1:00 PM GMT',
  venue: 'University of Ghana Campus, Accra',
  audienceType: 'professionals',
  status: 'published',
  features: {
    preRegistration: true,
    registrationCode: true,
    walkInRegistration: true,
    boothTracking: true,
    questions: true,
    skillsLab: true,
    ticket: true,
    postEventSurvey: true,
  },
  minBoothsRequired: 4,
};

export const EVENTS: CareerFairEvent[] = [EVENT_MONDAY, EVENT_FRIDAY];

export const DEFAULT_EVENT_ID = EVENT_FRIDAY.id;

export function getEventById(eventId: string): CareerFairEvent {
  return EVENTS.find(e => e.id === eventId) || EVENT_FRIDAY;
}

// Bridges a CareerFairEvent to the legacy EventConfig shape used by many
// existing components (forms, admin, ticket). Global config (webhook URL,
// passcode, registration settings) is preserved from the saved config.
export function eventConfigFor(event: CareerFairEvent, savedConfig?: EventConfig): EventConfig {
  const base: EventConfig = savedConfig || ({
    eventName: event.name,
    eventDate: event.date,
    eventLocation: event.venue,
    minBoothsRequired: event.minBoothsRequired ?? 4,
    adminPasscode: 'mne2026',
    allowPublicRegistration: true,
    registrationFields: {
      collectAge: true,
      collectGender: true,
      collectReferral: true,
      institutionsList: [
        'University of Ghana (UG)',
        'KNUST',
        'University of Cape Coast (UCC)',
        'Ashesi University',
        'Ghana Communication Technology University (GCTU)',
        'UPSA',
        'Central University',
        "University of Health and Allied Sciences (UHAS)",
        'Other'
      ],
      careerInterestsList: [
        'Software Engineering & AI',
        'Product Management & Design',
        'Data & Analytics',
        'Finance, Banking & Fintech',
        'Marketing, Media & PR',
        'Health, Biotech & Pharma',
        'Renewable Energy & ESG',
        'Entrepreneurship & Startups'
      ]
    }
  });

  return {
    ...base,
    eventName: base.eventName || event.name,
    eventDate: base.eventDate || event.date,
    eventLocation: base.eventLocation || event.venue,
    minBoothsRequired: event.minBoothsRequired ?? base.minBoothsRequired ?? 4,
  };
}