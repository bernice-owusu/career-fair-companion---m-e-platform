import { StorageService } from './storageService';
import { Participant, AttendanceRecord, Booth, BoothVisit, ExitSurvey } from '../types';

const PARTICIPANT_HEADERS = [
  "Participant ID", "Registration Code", "Registration Type", "Registered Before Event", "Registered At",
  "Checked In", "Checked In At", "Name", "Email", "Phone", "PSGH Registration Number", "Year of Completion",
  "Highest Education", "Current Job Title", "Current Area of Practice", "Current Area Other", "Region",
  "Ideal Career Path", "Ideal Career Path Other", "Career Fair Expectations", "Career Fair Expectations Other",
  "Career Tracks", "Skills Lab Resume Assistance", "Skills Lab Resume Assistance Other", "Resume Quality (1-5)",
  "CV Uploaded", "Interview Confidence (1-5)", "Mock Interview", "How Heard About Career Fair", "How Heard Other",
  "Attended Last Year", "Facilitator Questions"
];

const participantRow = (p: Participant): string[] => [
  p.id, p.code, p.registrationType || "", p.registeredBeforeEvent ? "Yes" : "No", p.registeredAt || "",
  p.checkedIn ? "Yes" : "No", p.checkedInAt || "", p.fullName, p.email, p.phone,
  p.psghRegistrationNumber || "", p.yearOfCompletion || "", p.highestEducation || "", p.currentJobTitle || "",
  p.currentAreaOfPractice || "", p.currentAreaOther || "", p.regionOfResidence || "",
  p.idealCareerPath || "", p.idealCareerPathOther || "",
  (p.careerFairExpectations || []).join(", "), p.careerFairExpectationsOther || "",
  (p.careerTracks || []).join(", "), p.skillsLabResumeAssistance || "", p.skillsLabResumeAssistanceOther || "",
  p.resumeQuality ? String(p.resumeQuality) : "", p.cvUploaded ? "Yes" : "No", p.interviewConfidence ? String(p.interviewConfidence) : "",
  p.mockInterview || "", p.heardAboutCareerFair || "", p.heardAboutCareerFairOther || "",
  p.attendedLastYear || "", p.facilitatorQuestions || ""
];

export class GoogleSheetsService {
  // Generates complete Apps Script code that the user can deploy
  static getAppsScriptCode(): string {
    return `/**
 * Career Fair Digital Registration, Booth Tracking & M&E Analytics
 * Google Apps Script API Layer
 * 
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this complete code replacing anything in Code.gs
 * 3. Click "Deploy" -> "New Deployment" -> Select type "Web app"
 * 4. Set "Execute as: Me" and "Who has access: Anyone"
 * 5. Copy the Web App URL and paste it in M&E Settings in the App!
 */

const REGISTER_HEADERS = [
  "Participant ID", "Registration Code", "Registration Type", "Registered Before Event", "Registered At",
  "Checked In", "Checked In At", "Name", "Email", "Phone", "PSGH Registration Number", "Year of Completion",
  "Highest Education", "Current Job Title", "Current Area of Practice", "Current Area Other", "Region",
  "Ideal Career Path", "Ideal Career Path Other", "Career Fair Expectations", "Career Fair Expectations Other",
  "Career Tracks", "Skills Lab Resume Assistance", "Skills Lab Resume Assistance Other", "Resume Quality (1-5)",
  "CV Uploaded", "Interview Confidence (1-5)", "Mock Interview", "How Heard About Career Fair", "How Heard Other",
  "Attended Last Year", "Facilitator Questions"
];

function participantRow(p) {
  return [
    p.id, p.code, p.registrationType || "", p.registeredBeforeEvent === true ? "Yes" : "No", p.registeredAt || "",
    p.checkedIn === true ? "Yes" : "No", p.checkedInAt || "", p.fullName, p.email, p.phone,
    p.psghRegistrationNumber || "", p.yearOfCompletion || "", p.highestEducation || "", p.currentJobTitle || "",
    p.currentAreaOfPractice || "", p.currentAreaOther || "", p.regionOfResidence || "",
    p.idealCareerPath || "", p.idealCareerPathOther || "",
    (p.careerFairExpectations || []).join(", "), p.careerFairExpectationsOther || "",
    (p.careerTracks || []).join(", "), p.skillsLabResumeAssistance || "", p.skillsLabResumeAssistanceOther || "",
    p.resumeQuality || "", p.cvUploaded === true ? "Yes" : "No", p.interviewConfidence || "",
    p.mockInterview || "", p.heardAboutCareerFair || "", p.heardAboutCareerFairOther || "",
    p.attendedLastYear || "", p.facilitatorQuestions || ""
  ];
}

function sendConfirmationEmail(p) {
  try {
    if (!p || !p.email) {
      Logger.log("Email error: missing email payload for " + (p && p.fullName ? p.fullName : "unknown attendee"));
      return false;
    }
    const eventName = p.eventName || "Nexus Career Fair";
    const fullName = p.fullName || "Attendee";
    const code = p.code || "";
    const subject = "Your " + eventName + " Registration Code";
    const body = "Hello " + fullName + ",\n\n" +
      "Your registration for " + eventName + " is confirmed.\n\n" +
      "Your Registration Code is: " + code + "\n\n" +
      "Keep this code handy. You will need it at the event entrance to check in, and you can use it in the event companion app to verify your booth sessions.\n\n" +
      "We look forward to seeing you at the career fair!\n\n" +
      eventName + " Team";
    MailApp.sendEmail(p.email, subject, body);
    Logger.log("Confirmation email sent to " + p.email);
    return true;
  } catch (err) {
    Logger.log("Email error: " + err);
    return false;
  }
}

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Participants
  let pSheet = ss.getSheetByName("Participants");
  if (!pSheet) {
    pSheet = ss.insertSheet("Participants");
  }
  if (pSheet.getLastRow() === 0) {
    pSheet.appendRow(REGISTER_HEADERS);
    pSheet.getRange(1, 1, 1, REGISTER_HEADERS.length).setBackground("#0a2240").setFontColor("#ffffff").setFontWeight("bold");
    pSheet.setFrozenRows(1);
  }

  // Sheet 2: Attendance
  let aSheet = ss.getSheetByName("Attendance");
  if (!aSheet) {
    aSheet = ss.insertSheet("Attendance");
  }
  if (aSheet.getLastRow() === 0) {
    aSheet.appendRow([
      "Participant ID", "Participant Name", "Event Name", "Check-in Time", "Check-out Time", "Status"
    ]);
    aSheet.getRange(1, 1, 1, 6).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    aSheet.setFrozenRows(1);
  }

  // Sheet 3: Booths
  let bSheet = ss.getSheetByName("Booths");
  if (!bSheet) {
    bSheet = ss.insertSheet("Booths");
  }
  if (bSheet.getLastRow() === 0) {
    bSheet.appendRow([
      "Booth ID", "Booth Name", "Description", "Location", "Facilitators", "Booth Code", "Active"
    ]);
    bSheet.getRange(1, 1, 1, 7).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    bSheet.setFrozenRows(1);
  }

  // Sheet 4: Booth Visits
  let vSheet = ss.getSheetByName("Booth Visits");
  if (!vSheet) {
    vSheet = ss.insertSheet("Booth Visits");
  }
  if (vSheet.getLastRow() === 0) {
    vSheet.appendRow([
      "Visit ID", "Participant ID", "Participant Name", "Booth ID", "Booth Name", 
      "Facilitator", "Booth Code", "Reflection", "Timestamp", "Verification Status"
    ]);
    vSheet.getRange(1, 1, 1, 10).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    vSheet.setFrozenRows(1);
  }

  // Sheet 5: Surveys
  let sSheet = ss.getSheetByName("Surveys");
  if (!sSheet) {
    sSheet = ss.insertSheet("Surveys");
  }
  if (sSheet.getLastRow() === 0) {
    sSheet.appendRow([
      "Response ID", "Participant ID", "Participant Name", "Overall Rating (1-5)", 
      "Confidence Rating (1-5)", "Most Useful Booth", "Key Learning Highlight", 
      "Improvement Suggestions", "Submitted At"
    ]);
    sSheet.getRange(1, 1, 1, 9).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sSheet.setFrozenRows(1);
  }

  // Sheet 6: M&E Summary
  let mSheet = ss.getSheetByName("M&E Summary");
  if (!mSheet) {
    mSheet = ss.insertSheet("M&E Summary");
  }
  if (mSheet.getLastRow() === 0) {
    mSheet.appendRow(["Metric", "Calculated Value", "Notes"]);
    mSheet.appendRow(["Total Registered", '=COUNTA(Participants!A2:A)', "Total participant signups"]);
    mSheet.appendRow(["Total Pre-Registrations", '=COUNTIF(Participants!C2:C, "pre_registration")', "Registrations before the event"]);
    mSheet.appendRow(["Walk-In Registrations", '=COUNTIF(Participants!C2:C, "walk_in")', "Event-day registrations"]);
    mSheet.appendRow(["Checked In", '=COUNTIF(Participants!F2:F, "Yes")', "Participants who checked in"]);
    mSheet.appendRow(["Pre-Reg → Check-In Rate", '=IF(B3>0, TEXT(COUNTIFS(Participants!C2:C, "pre_registration", Participants!F2:F, "Yes")/B3, "0.0%"), "0%")', "Checked-in pre-registrations / pre-registrations"]);
    mSheet.appendRow(["Total Attended", '=COUNTA(Attendance!A2:A)', "Unique checked-in participants"]);
    mSheet.appendRow(["Attendance Rate", '=IF(B2>0, TEXT(B8/B2, "0.0%"), "0%")', "Attendees / Registered"]);
    mSheet.appendRow(["Total Booth Visits", '=COUNTA(\\'Booth Visits\\'!A2:A)', "Verified learning records"]);
    mSheet.appendRow(["Exit Surveys Submitted", '=COUNTA(Surveys!A2:A)', "Completed participant evaluations"]);
    mSheet.getRange(1, 1, 1, 3).setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    setupSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "register") {
      const p = data.payload || {};
      const sheet = ss.getSheetByName("Participants");
      sheet.appendRow(participantRow(p));
      sendConfirmationEmail(p);
      return createJsonResponse({ success: true, message: "Participant registered successfully", code: p.code });
    }

    if (action === "resendCode") {
      const p = data.payload || {};
      const sent = sendConfirmationEmail({
        email: p.email,
        fullName: p.fullName,
        code: p.code,
        eventName: p.eventName
      });
      return createJsonResponse({ success: sent, message: sent ? "Registration code email re-sent" : "Failed to send email (check recipient address)" });
    }

    if (action === "checkIn") {
      const a = data.payload;
      const sheet = ss.getSheetByName("Attendance");
      sheet.appendRow([
        a.participantId, a.participantName, a.eventName, a.checkInTime, a.checkOutTime || "", a.status
      ]);
      return createJsonResponse({ success: true, message: "Attendance logged successfully" });
    }

    if (action === "boothVisit") {
      const v = data.payload;
      const sheet = ss.getSheetByName("Booth Visits");
      sheet.appendRow([
        v.id, v.participantId, v.participantName, v.boothId, v.boothName,
        v.facilitator, v.boothCode, v.reflection, v.timestamp, v.verificationStatus
      ]);
      return createJsonResponse({ success: true, message: "Booth visit recorded and verified" });
    }

    if (action === "survey") {
      const s = data.payload;
      const sheet = ss.getSheetByName("Surveys");
      sheet.appendRow([
        s.id, s.participantId, s.participantName, s.overallRating,
        s.confidenceRating, s.mostUsefulBoothName, s.keyLearning,
        s.improvement, s.submittedAt
      ]);
      return createJsonResponse({ success: true, message: "Survey recorded successfully" });
    }

    if (action === "batchSync") {
      // Overwrite or sync full state from dashboard
      const payload = data.payload;
      if (payload.participants) {
        syncSheet(ss, "Participants", REGISTER_HEADERS, payload.participants.map(participantRow));
      }
      if (payload.attendance) {
        syncSheet(ss, "Attendance", [
          "Participant ID", "Participant Name", "Event Name", "Check-in Time", "Check-out Time", "Status"
        ], payload.attendance.map(a => [a.participantId, a.participantName, a.eventName, a.checkInTime, a.checkOutTime || '', a.status]));
      }
      if (payload.booths) {
        syncSheet(ss, "Booths", [
          "Booth ID", "Booth Name", "Description", "Location", "Facilitators", "Booth Code", "Active"
        ], payload.booths.map(b => [b.id, b.name, b.description, b.location, b.facilitators.join(', '), b.boothCode, b.isActive ? 'YES' : 'NO']));
      }
      if (payload.boothVisits) {
        syncSheet(ss, "Booth Visits", [
          "Visit ID", "Participant ID", "Participant Name", "Booth ID", "Booth Name", "Facilitator", "Booth Code", "Reflection", "Timestamp", "Verification Status"
        ], payload.boothVisits.map(v => [v.id, v.participantId, v.participantName, v.boothId, v.boothName, v.facilitator, v.boothCode, v.reflection, v.timestamp, v.verificationStatus]));
      }
      if (payload.surveys) {
        syncSheet(ss, "Surveys", [
          "Response ID", "Participant ID", "Participant Name", "Overall Rating (1-5)", "Confidence Rating (1-5)", "Most Useful Booth", "Key Learning Highlight", "Improvement Suggestions", "Submitted At"
        ], payload.surveys.map(s => [s.id, s.participantId, s.participantName, s.overallRating, s.confidenceRating, s.mostUsefulBoothName, s.keyLearning, s.improvement, s.submittedAt]));
      }
      return createJsonResponse({ success: true, message: "Batch synchronization completed" });
    }

    return createJsonResponse({ success: false, error: "Unknown action: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function syncSheet(ss, sheetName, headers, rows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();
  sheet.appendRow(headers);
  if (rows && rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.getRange(1, 1, 1, headers.length).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function doGet(e) {
  try {
    setupSpreadsheet();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return createJsonResponse({
      success: true,
      event: ss.getName(),
      summary: {
        totalRegistered: Math.max(0, ss.getSheetByName("Participants").getLastRow() - 1),
        totalAttended: Math.max(0, ss.getSheetByName("Attendance").getLastRow() - 1),
        totalBoothVisits: Math.max(0, ss.getSheetByName("Booth Visits").getLastRow() - 1),
        totalSurveys: Math.max(0, ss.getSheetByName("Surveys").getLastRow() - 1)
      }
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }

  // Fetches live summary statistics from the configured Google Apps Script Web App or Sheet
  static async fetchSheetSummary(): Promise<{ totalRegistered?: number; totalAttended?: number; totalBoothVisits?: number; totalSurveys?: number } | null> {
    const config = StorageService.getConfig();
    if (!config.appsScriptWebhookUrl) {
      return null;
    }

    try {
      const response = await fetch(config.appsScriptWebhookUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.success && data.summary) {
        return data.summary;
      }
      return null;
    } catch (e) {
      // In case CORS or network fails, fall back silently
      return null;
    }
  }

  // Sends asynchronous Webhook payload if URL configured, with offline queue backup
  static async sendWebhook(action: 'register' | 'checkIn' | 'boothVisit' | 'survey' | 'batchSync' | 'resendCode', payload: any): Promise<{ success: boolean; message?: string; error?: string; configured?: boolean }> {
    const config = StorageService.getConfig();
    if (!config.appsScriptWebhookUrl) {
      return { success: true, configured: false, message: "Saved locally (Google Apps Script Webhook not configured)." };
    }

    try {
      // Use no-cors text/plain request suitable for Google Apps Script web apps
      await fetch(config.appsScriptWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload }),
        mode: 'no-cors'
      });

      // If we had queued items and this succeeded, attempt to flush them
      this.flushQueue();

      return { success: true, configured: true, message: "Synced automatically with Google Sheets" };
    } catch (err: any) {
      console.warn("Webhook sync deferred, queued for auto-retry:", err);
      // Queue action for retry when online
      this.enqueueForSync({ action, payload, timestamp: Date.now() });
      return { success: false, error: err.message || "Saved locally, queued for auto-sync" };
    }
  }

  // Queue item in localStorage for automatic retry
  private static enqueueForSync(item: { action: string; payload: any; timestamp: number }) {
    try {
      const queue = JSON.parse(localStorage.getItem('CF_SYNC_QUEUE') || '[]');
      queue.push(item);
      localStorage.setItem('CF_SYNC_QUEUE', JSON.stringify(queue.slice(-50))); // Keep last 50
    } catch (e) {
      console.warn("Error queueing sync item:", e);
    }
  }

  // Flushes queued sync operations
  static async flushQueue(): Promise<void> {
    const config = StorageService.getConfig();
    if (!config.appsScriptWebhookUrl || !navigator.onLine) return;

    try {
      const queueStr = localStorage.getItem('CF_SYNC_QUEUE');
      if (!queueStr) return;
      const queue: Array<{ action: string; payload: any; timestamp: number }> = JSON.parse(queueStr);
      if (queue.length === 0) return;

      // Do a full batch sync to ensure 100% data consistency
      await this.triggerFullAutoSync();
      localStorage.removeItem('CF_SYNC_QUEUE');
    } catch (e) {
      console.warn("Queue flush error:", e);
    }
  }

  // Automatically triggers a full batch synchronization of all current local data with Google Sheets
  static async triggerFullAutoSync(): Promise<{ success: boolean; error?: string }> {
    const config = StorageService.getConfig();
    if (!config.appsScriptWebhookUrl) return { success: true };

    try {
      const p = StorageService.getParticipants();
      const a = StorageService.getAttendance();
      const b = StorageService.getBooths();
      const v = StorageService.getBoothVisits();
      const s = StorageService.getSurveys();

      await fetch(config.appsScriptWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'batchSync',
          payload: {
            participants: p,
            attendance: a,
            booths: b,
            boothVisits: v,
            surveys: s
          }
        }),
        mode: 'no-cors'
      });

      return { success: true };
    } catch (err: any) {
      console.warn("Full auto sync error:", err);
      return { success: false, error: err.message };
    }
  }

  // Initializes background automatic sync listeners and periodic sync timer
  static initAutoSync(): () => void {
    const handleOnline = () => {
      this.flushQueue();
      this.triggerFullAutoSync();
    };

    window.addEventListener('online', handleOnline);

    // Periodic automatic sync every 45 seconds to keep sheet up to date seamlessly
    const interval = setInterval(() => {
      if (navigator.onLine) {
        this.flushQueue();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }


  // Direct sync with Google Sheets API if access token provided
  static async createGoogleSpreadsheet(accessToken: string, eventName: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `${eventName} - M&E Master Sheet`
        },
        sheets: [
          { properties: { title: 'Participants', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Attendance', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Booths', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Booth Visits', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Surveys', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'M&E Summary', gridProperties: { frozenRowCount: 1 } } }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to create Google Spreadsheet");
    }

    const data = await response.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl
    };
  }

  static async syncDataToSpreadsheet(accessToken: string, spreadsheetId: string): Promise<boolean> {
    const participants = StorageService.getParticipants();
    const attendance = StorageService.getAttendance();
    const booths = StorageService.getBooths();
    const visits = StorageService.getBoothVisits();
    const surveys = StorageService.getSurveys();

    const participantRows = [
      PARTICIPANT_HEADERS,
      ...participants.map(p => participantRow(p))
    ];

    const attendanceRows = [
      ["Participant ID", "Participant Name", "Event Name", "Check-in Time", "Check-out Time", "Status"],
      ...attendance.map(a => [a.participantId, a.participantName, a.eventName, a.checkInTime, a.checkOutTime || "", a.status])
    ];

    const boothRows = [
      ["Booth ID", "Booth Name", "Description", "Location", "Facilitator", "Booth Code", "Active"],
      ...booths.map(b => [b.id, b.name, b.description, b.location, b.facilitators.join(", "), b.boothCode, b.isActive ? "YES" : "NO"])
    ];

    const visitRows = [
      ["Visit ID", "Participant ID", "Participant Name", "Booth ID", "Booth Name", "Facilitator", "Booth Code", "Reflection", "Timestamp", "Verification Status"],
      ...visits.map(v => [v.id, v.participantId, v.participantName, v.boothId, v.boothName, v.facilitator, v.boothCode, v.reflection, v.timestamp, v.verificationStatus])
    ];

    const surveyRows = [
      ["Response ID", "Participant ID", "Participant Name", "Overall Rating (1-5)", "Confidence Rating (1-5)", "Most Useful Booth", "Key Learning Highlight", "Improvement Suggestions", "Submitted At"],
      ...surveys.map(s => [s.id, s.participantId, s.participantName, s.overallRating, s.confidenceRating, s.mostUsefulBoothName, s.keyLearning, s.improvement, s.submittedAt])
    ];

    const summaryRows = [
      ["Metric", "Calculated Value", "Notes"],
      ["Total Registered", '=COUNTA(Participants!A2:A)', "Total participant signups"],
      ["Total Pre-Registrations", '=COUNTIF(Participants!C2:C, "pre_registration")', "Registrations before the event"],
      ["Walk-In Registrations", '=COUNTIF(Participants!C2:C, "walk_in")', "Event-day registrations"],
      ["Checked In", '=COUNTIF(Participants!F2:F, "Yes")', "Participants who checked in"],
      ["Pre-Reg → Check-In Rate", '=IF(B3>0, TEXT(COUNTIFS(Participants!C2:C, "pre_registration", Participants!F2:F, "Yes")/B3, "0.0%"), "0%")', "Checked-in pre-registrations / pre-registrations"],
      ["Total Attended", '=COUNTA(Attendance!A2:A)', "Unique checked-in participants"],
      ["Attendance Rate", '=IF(B2>0, TEXT(B8/B2, "0.0%"), "0%")', "Attendees / Registered"],
      ["Total Booth Visits", '=COUNTA(\'Booth Visits\'!A2:A)', "Verified learning records"],
      ["Exit Surveys Submitted", '=COUNTA(Surveys!A2:A)', "Completed participant evaluations"]
    ];

    const body = {
      valueInputOption: "USER_ENTERED",
      data: [
        { range: "Participants!A1:AF", values: participantRows },
        { range: "Attendance!A1:F", values: attendanceRows },
        { range: "Booths!A1:G", values: boothRows },
        { range: "'Booth Visits'!A1:J", values: visitRows },
        { range: "Surveys!A1:I", values: surveyRows },
        { range: "'M&E Summary'!A1:C", values: summaryRows }
      ]
    };

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Failed to update spreadsheet cells");
    }

    return true;
  }

  // Export CSV Helper
  static downloadCSV(filename: string, rows: string[][]): void {
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportAllDatasets(): void {
    const participants = StorageService.getParticipants();
    const attendance = StorageService.getAttendance();
    const visits = StorageService.getBoothVisits();
    const surveys = StorageService.getSurveys();
    const booths = StorageService.getBooths();

    // Export Master CSV
    const rows = [
      ["DATASET: PARTICIPANTS"],
      ["Participant ID", "Registration Code", "Registration Type", "Checked In", "Full Name", "Email", "Phone", "PSGH Registration Number", "Region", "Current Job Title", "Registered At"],
      ...participants.map(p => [p.id, p.code, p.registrationType, p.checkedIn ? "Yes" : "No", p.fullName, p.email, p.phone, p.psghRegistrationNumber || "", p.regionOfResidence || "", p.currentJobTitle || "", p.registeredAt]),
      [],
      ["DATASET: ATTENDANCE"],
      ["Participant ID", "Participant Name", "Event", "Check In Time", "Status"],
      ...attendance.map(a => [a.participantId, a.participantName, a.eventName, a.checkInTime, a.status]),
      [],
      ["DATASET: BOOTH VISITS & REFLECTIONS"],
      ["Visit ID", "Participant ID", "Participant Name", "Booth Name", "Facilitator", "Booth Code", "Reflection", "Timestamp"],
      ...visits.map(v => [v.id, v.participantId, v.participantName, v.boothName, v.facilitator, v.boothCode, v.reflection, v.timestamp]),
      [],
      ["DATASET: EXIT SURVEYS"],
      ["Response ID", "Participant ID", "Overall Rating", "Confidence Rating", "Most Useful Booth", "Key Learning", "Improvement", "Submitted At"],
      ...surveys.map(s => [s.id, s.participantId, s.overallRating.toString(), s.confidenceRating.toString(), s.mostUsefulBoothName, s.keyLearning, s.improvement, s.submittedAt])
    ];

    this.downloadCSV(`CareerFair_ME_Export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
}
