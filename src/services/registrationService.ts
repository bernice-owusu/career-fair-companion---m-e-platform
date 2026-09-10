import { StorageService } from './storageService';
import { GoogleSheetsService } from './googleSheetsService';
import { Participant, PreRegistrationData, WalkInRegistrationData, MondayRegistrationData, AttendanceRecord } from '../types';
import { EVENT_FRIDAY, getEventById } from '../events';

// Central registration layer used by the participant flow and admin tooling.
// All uniqueness, code generation, check-in status and email dispatch flows through here.

export type CheckInResult =
  | { success: true; participant: Participant; record: AttendanceRecord }
  | { success: false; error: string };

export const RegistrationService = {
  generateRegistrationCode(): string {
    return StorageService.generateRegistrationCode();
  },

  getParticipantByCode(code: string, eventId?: string): Participant | null {
    return StorageService.findParticipantByCode(code, eventId);
  },

  // Normalizes + validates a NEXUS code before lookup (case-insensitive, whitespace-trimmed).
  // When eventId is supplied the lookup is restricted to that event's registrations.
  verifyRegistrationCode(code: string, eventId?: string): { valid: boolean; participant: Participant | null; error?: string } {
    const normalized = (code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized) {
      return { valid: false, participant: null, error: 'Please enter your registration code.' };
    }
    if (!/^NEXUS-[A-Z0-9]{6}$/.test(normalized)) {
      return { valid: false, participant: null, error: 'That code format does not look right. It should look like NEXUS-7F42K9.' };
    }
    const participant = this.getParticipantByCode(normalized, eventId);
    if (!participant && eventId) {
      // Be helpful: if the code exists but belongs to another event, explain.
      const otherEvent = StorageService.findParticipantByCode(normalized);
      if (otherEvent) {
        const other = getEventById(otherEvent.eventId);
        return { valid: false, participant: null, error: `That code belongs to the ${other.name} — this one is for the ${getEventById(eventId).name}.` };
      }
    }
    return { valid: !!participant, participant, error: participant ? undefined : "We couldn't find that registration code." };
  },

  createPreRegistration(data: PreRegistrationData): Participant {
    return StorageService.registerPreRegistration(data);
  },

  registerWalkIn(data: WalkInRegistrationData, eventId?: string): Participant {
    return StorageService.registerWalkIn(data, eventId || EVENT_FRIDAY.id);
  },

  registerMonday(data: MondayRegistrationData): Participant {
    return StorageService.registerMonday(data);
  },

  // Marks a participant as checked in (timestamp + event date) and returns the result.
  checkInParticipant(participantId: string): CheckInResult {
    try {
      const participant = StorageService.getParticipants().find(p => p.id === participantId);
      if (!participant) {
        return { success: false, error: "We couldn't find that registration record." };
      }
      if (participant.checkedIn) {
        return { success: true, participant, record: StorageService.getAttendance(participant.eventId).find(a => a.participantId === participantId)! };
      }
      const record = StorageService.checkInParticipant(participantId);
      const updated = StorageService.getParticipants().find(p => p.id === participantId)!;
      return { success: true, participant: updated, record };
    } catch (err: any) {
      return { success: false, error: err.message || 'Check-in failed. Please try again.' };
    }
  },

  // Emails the participant their registration code via the Apps Script webhook
  async sendCodeEmail(participant: Participant): Promise<{ success: boolean; message?: string; error?: string }> {
    return GoogleSheetsService.sendWebhook('resendCode', {
      eventId: participant.eventId,
      eventName: getEventById(participant.eventId).name,
      participantId: participant.id,
      code: participant.code,
      fullName: participant.fullName,
      email: participant.email
    });
  },

  // Fires the registration payload to Google Sheets (also triggers the code email in Apps Script)
  async syncRegistration(participant: Participant): Promise<{ success: boolean; message?: string; error?: string; configured?: boolean }> {
    return GoogleSheetsService.sendWebhook('register', {
      ...participant,
      eventId: participant.eventId,
      eventName: getEventById(participant.eventId).name
    });
  }
};