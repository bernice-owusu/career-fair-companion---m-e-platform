import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { WelcomeGate } from './components/participant/WelcomeGate';
import { FridayPreRegistrationPage } from './components/participant/FridayPreRegistrationPage';
import { CodeCheckInScreen } from './components/participant/CodeCheckInScreen';
import { WalkInRegistrationForm } from './components/participant/WalkInRegistrationForm';
import { MondayRegistrationPage } from './components/participant/MondayRegistrationPage';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { BoothDirectory } from './components/participant/BoothDirectory';
import { ProgressView } from './components/participant/ProgressView';
import { ParticipantProfile } from './components/participant/ParticipantProfile';
import { BottomNav, ParticipantTab } from './components/participant/BottomNav';
import { RecordBoothVisitModal } from './components/participant/RecordBoothVisitModal';
import { ExitSurveyModal } from './components/participant/ExitSurveyModal';
import { MondayPlatform } from './components/participant/MondayPlatform';
import { MondaySurveyModal } from './components/participant/MondaySurveyModal';
import { QuestionsScreen } from './components/participant/QuestionsScreen';
import { TicketView } from './components/participant/TicketView';
import { MneAdmin } from './components/admin/MneAdmin';

import { StorageService } from './services/storageService';
import { GoogleSheetsService } from './services/googleSheetsService';
import { RegistrationService } from './services/registrationService';
import {
  Booth, BoothVisit, ExitSurvey, PostEventSurvey, EventConfig,
  Participant, ParticipantSession, WalkInRegistrationData, MondayRegistrationData,
} from './types';
import { EVENT_FRIDAY, EVENT_MONDAY, eventConfigFor } from './events';
import {
  usePathname, screenFromPath, platformTargetFromPath, isAdminPath,
} from './router';

const FRIDAY_PLATFORM_PATHS = ['/participant', '/platform', '/questions', '/survey', '/ticket'];

export default function App() {
  // Global config & events
  const [config, setConfig] = useState<EventConfig>(StorageService.getConfig());
  const fridayConfig = eventConfigFor(EVENT_FRIDAY, config);

  const { pathname, navigate } = usePathname();

  // Saved-session recognition (nexus_session key)
  const [session, setSession] = useState<ParticipantSession | null>(() => StorageService.getValidSession());
  const [sessionParticipant, setSessionParticipant] = useState<Participant | null>(() => {
    const s = StorageService.getValidSession();
    return s ? StorageService.getParticipantById(s.participantId) : null;
  });

  // Friday platform state
  const [activeTab, setActiveTab] = useState<ParticipantTab>('home');
  const [visits, setVisits] = useState<BoothVisit[]>([]);
  const [booths] = useState<Booth[]>(StorageService.getBooths());
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalBoothId, setRecordModalBoothId] = useState<string | undefined>(undefined);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isMondaySurveyOpen, setIsMondaySurveyOpen] = useState(false);

  // Background Google Sheets sync lifecycle
  useEffect(() => {
    const cleanup = GoogleSheetsService.initAutoSync();
    return cleanup;
  }, []);

  // Open the Monday survey automatically when landing on /survey
  useEffect(() => {
    if (platformTarget === 'survey' && sessionParticipant?.eventId === EVENT_MONDAY.id) {
      setIsMondaySurveyOpen(true);
    }
  }, [pathname]);

  // Load the active participant's data whenever the session changes
  useEffect(() => {
    if (sessionParticipant && sessionParticipant.eventId === EVENT_FRIDAY.id) {
      setVisits(
        StorageService.getBoothVisits(EVENT_FRIDAY.id)
          .filter(v => v.participantId === sessionParticipant.id)
      );
      setHasCompletedSurvey(StorageService.hasCompletedSurvey(sessionParticipant.id));
    }
  }, [sessionParticipant]);

// Guard: platform routes require an active session
  useEffect(() => {
    const screen = screenFromPath(pathname);
    if (screen === 'main' && !sessionParticipant) {
      navigate('/welcome');
    }
  }, [pathname, sessionParticipant, navigate]);

  // Session-aware /monday: students who already hold a Monday session on this
  // device skip the registration page and resume their portal instead.
  useEffect(() => {
    if (screenFromPath(pathname) === 'monday_register' && session?.eventId === EVENT_MONDAY.id) {
      navigate('/participant');
    }
  }, [pathname, session?.eventId, navigate]);

  const goTo = useCallback((path: string) => navigate(path), [navigate]);

  // Helper to create a new active session for a participant (check-in or registration)
  const startSessionFor = (participant: Participant) => {
    const s = StorageService.startSession(participant.eventId, participant.id);
    setSession(s);
    setSessionParticipant(StorageService.getParticipantById(participant.id));
  };

  // ---- Event-day check-in (Friday, via registration code) ----
  const handleCheckInSuccess = (participant: Participant) => {
    startSessionFor(participant);
    goTo('/participant');

    // Async sync attendance to Google Sheets
    const record = StorageService.getAttendance(participant.eventId)
      .find(a => a.participantId === participant.id && a.status === "Checked In");
    if (record) {
      GoogleSheetsService.sendWebhook('checkIn', record);
    }
  };

  // ---- Friday walk-in registration (Name, Email, Phone, Registration Number) ----
  const handleWalkInRegistration = async (data: WalkInRegistrationData) => {
    const newParticipant = RegistrationService.registerWalkIn(data, EVENT_FRIDAY.id);
    startSessionFor(newParticipant);
    goTo('/participant');

    RegistrationService.syncRegistration(newParticipant);
  };

// ---- Monday students' fair registration (FirstName, Surname, Email, Institution, Year) ----
  const handleMondayRegistration = async (data: MondayRegistrationData) => {
    const newParticipant = RegistrationService.registerMonday(data);
    startSessionFor(newParticipant);
    goTo('/participant');

    RegistrationService.syncRegistration(newParticipant);
  };

  // ---- Resume an existing Monday registration by email (cross-device rescue) ----
  const handleMondayResume = (email: string): boolean => {
    const match = StorageService.getParticipants(EVENT_MONDAY.id)
      .find(p => p.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!match) return false;
    startSessionFor(match);
    goTo('/participant');
    return true;
  };

  // ---- Sign out / switch participant ----
  const handleSignOut = () => {
    StorageService.clearSession();
    StorageService.setCurrentParticipantId(null);
    setSession(null);
    setSessionParticipant(null);
    setActiveTab('home');
    goTo('/welcome');
  };

  const handleContinueSession = () => {
    if (sessionParticipant) {
      goTo('/participant');
    }
  };

  // ---- Friday booth visit ----
  const handleBoothVisitSuccess = (newVisit: BoothVisit) => {
    if (sessionParticipant) {
      setVisits(
        StorageService.getBoothVisits(EVENT_FRIDAY.id)
          .filter(v => v.participantId === sessionParticipant.id)
      );
    }
    GoogleSheetsService.sendWebhook('boothVisit', newVisit);
  };

  // ---- Friday exit survey ----
  const handleSurveySuccess = (survey: ExitSurvey) => {
    setHasCompletedSurvey(true);
    GoogleSheetsService.sendWebhook('survey', survey);
  };

  // ---- Monday survey ----
  const handleMondaySurveySuccess = (survey: PostEventSurvey) => {
    GoogleSheetsService.sendWebhook('survey', survey);
    goTo('/participant');
  };

  const handleOpenRecordVisit = (boothId?: string) => {
    setRecordModalBoothId(boothId);
    setIsRecordModalOpen(true);
  };

  const verifiedVisitsCount = visits.filter(v => v.verificationStatus === 'verified').length;
  const platformTarget = platformTargetFromPath(pathname);
  const welcomeEvent = sessionParticipant?.eventId === EVENT_MONDAY.id ? EVENT_MONDAY : EVENT_FRIDAY;

  // ---- Render M&E Admin at /mneadmin (and legacy /admin) ----
  if (isAdminPath(pathname)) {
    return <MneAdmin onExit={() => goTo('/welcome')} />;
  }

// ---- Standalone Friday pre-registration page (no app header, no session) ----
  const screen = screenFromPath(pathname);
  if (screen === 'register') {
return (
      <FridayPreRegistrationPage
        event={EVENT_FRIDAY}
        onContinue={() => goTo('/welcome')}
      />
    );
  }

  // ---- Standalone Monday students' registration page (no app header) ----
  if (screen === 'monday_register') {
    return (
      <MondayRegistrationPage
        event={EVENT_MONDAY}
        onSubmit={handleMondayRegistration}
        onCancel={() => goTo('/welcome')}
        onResume={handleMondayResume}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream text-navy flex flex-col selection:bg-orange selection:text-white">
      {/* App header (shown everywhere except the standalone pre-registration page) */}
      <Header
        eventName={sessionParticipant?.eventId === EVENT_MONDAY.id ? EVENT_MONDAY.name : EVENT_FRIDAY.name}
        participantName={sessionParticipant?.fullName}
        onHome={() => goTo('/welcome')}
      />

      <main className="flex-1">
        {/* ---- Friday check-in (code entry) ---- */}
        {screen === 'checkin' && (
          <CodeCheckInScreen
            config={fridayConfig}
            eventId={EVENT_FRIDAY.id}
            onSuccess={handleCheckInSuccess}
            onBack={() => goTo('/welcome')}
            onRegisterInPerson={() => goTo('/walk-in')}
          />
        )}

{/* ---- Friday walk-in registration ---- */}
        {screen === 'walk_in' && (
          <WalkInRegistrationForm
            onSubmit={handleWalkInRegistration}
            onCancel={() => goTo('/welcome')}
          />
        )}

        {/* ---- Event-day platform (requires session) ---- */}
        {screen === 'main' && sessionParticipant && (
          sessionParticipant.eventId === EVENT_MONDAY.id ? (
            /* ============ MONDAY platform ============ */
            platformTarget === 'questions' ? (
              <QuestionsScreen
                event={EVENT_MONDAY}
                participant={sessionParticipant}
                onBack={() => goTo('/participant')}
              />
            ) : (
              <MondayPlatform
                event={EVENT_MONDAY}
                participant={sessionParticipant}
                hasCompletedSurvey={StorageService.hasCompletedMondaySurvey(sessionParticipant.id)}
onAskQuestion={() => goTo('/questions')}
                onOpenSurvey={() => setIsMondaySurveyOpen(true)}
              />
            )
          ) : (
            /* ============ FRIDAY platform ============ */
            <>
              {platformTarget === 'questions' && (
                <QuestionsScreen
                  event={welcomeEvent}
                  participant={sessionParticipant}
                  onBack={() => goTo('/participant')}
                />
              )}

              {platformTarget === 'ticket' && (
                <TicketView
                  participant={sessionParticipant}
                  config={fridayConfig}
                  onBack={() => goTo('/participant')}
                />
              )}

              {platformTarget === 'survey' && (
                <ParticipantDashboard
                  participant={sessionParticipant}
                  visits={visits}
                  booths={booths}
                  config={fridayConfig}
                  hasCheckedIn={true}
                  hasCompletedSurvey={hasCompletedSurvey}
                  onRecordVisit={handleOpenRecordVisit}
                  onOpenDirectory={() => setActiveTab('booths')}
                  onOpenSurvey={() => setIsSurveyModalOpen(true)}
                  onOpenProgress={() => setActiveTab('progress')}
                />
              )}

              {platformTarget === 'home' && (
                <>
                  {/* Quick engagement links */}
                  <div className="max-w-xl mx-auto px-4 pt-4 flex gap-2">
                    <button
                      onClick={() => goTo('/questions')}
                      className="flex-1 py-2.5 rounded-full bg-white border border-slate-100 text-slate-500 text-xs font-bold hover:border-orange/50 hover:text-navy transition"
                    >
                      Ask a Question
                    </button>
                    <button
                      onClick={() => goTo('/ticket')}
                      className="flex-1 py-2.5 rounded-full bg-white border border-slate-100 text-slate-500 text-xs font-bold hover:border-orange/50 hover:text-navy transition"
                    >
                      Event Ticket
                    </button>
                  </div>

                  {activeTab === 'home' && (
                    <ParticipantDashboard
                      participant={sessionParticipant}
                      visits={visits}
                      booths={booths}
                      config={fridayConfig}
                      hasCheckedIn={true}
                      hasCompletedSurvey={hasCompletedSurvey}
                      onRecordVisit={handleOpenRecordVisit}
                      onOpenDirectory={() => setActiveTab('booths')}
                      onOpenSurvey={() => setIsSurveyModalOpen(true)}
                      onOpenProgress={() => setActiveTab('progress')}
                    />
                  )}

                  {activeTab === 'booths' && (
                    <BoothDirectory
                      booths={booths}
                      visits={visits}
                      onRecordVisit={handleOpenRecordVisit}
                    />
                  )}

                  {activeTab === 'progress' && (
                    <ProgressView
                      participant={sessionParticipant}
                      visits={visits}
                      booths={booths}
                      config={fridayConfig}
                      hasCompletedSurvey={hasCompletedSurvey}
                      onOpenSurvey={() => setIsSurveyModalOpen(true)}
                      onRecordVisit={() => handleOpenRecordVisit()}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <div className="pb-16">
                      <ParticipantProfile
                        participant={sessionParticipant}
                        config={fridayConfig}
                        hasCheckedIn={true}
                        hasCompletedSurvey={hasCompletedSurvey}
                        boothsCompletedCount={verifiedVisitsCount}
                        onSignOut={handleSignOut}
                        onRegisterNew={handleSignOut}
                      />
                    </div>
                  )}

                  {/* Bottom Navigation for Mobile */}
                  <BottomNav
                    activeTab={activeTab}
                    onChangeTab={setActiveTab}
                    completedBoothsCount={verifiedVisitsCount}
                    minRequired={fridayConfig.minBoothsRequired || 4}
                  />
                </>
              )}
            </>
          )
        )}

        {/* ---- Welcome / event-day home ---- */}
        {screen === 'welcome' && (
          <WelcomeGate
            event={welcomeEvent}
            session={session}
            sessionParticipant={sessionParticipant}
            onContinueSession={handleContinueSession}
            onSignOut={handleSignOut}
            onPreRegistered={() => goTo('/checkin')}
            onWalkIn={() => goTo('/walk-in')}
            onMondayRegister={() => goTo('/monday')}
          />
        )}

        {/* Fallback to welcome for unknown/legacy paths */}
        {screen === null && !isAdminPath(pathname) && !FRIDAY_PLATFORM_PATHS.includes(pathname) && (
          <WelcomeGate
            event={welcomeEvent}
            session={session}
            sessionParticipant={sessionParticipant}
            onContinueSession={handleContinueSession}
            onSignOut={handleSignOut}
            onPreRegistered={() => goTo('/checkin')}
            onWalkIn={() => goTo('/walk-in')}
            onMondayRegister={() => goTo('/monday')}
          />
        )}
      </main>

      {/* ---- MODALS ---- */}
      {/* Friday: Record Booth Visit */}
      {isRecordModalOpen && sessionParticipant && sessionParticipant.eventId === EVENT_FRIDAY.id && (
        <RecordBoothVisitModal
          participant={sessionParticipant}
          booths={booths}
          initialBoothId={recordModalBoothId}
          onClose={() => {
            setIsRecordModalOpen(false);
            setRecordModalBoothId(undefined);
          }}
          onSuccess={handleBoothVisitSuccess}
        />
      )}

      {/* Friday: Exit Survey */}
      {isSurveyModalOpen && sessionParticipant && sessionParticipant.eventId === EVENT_FRIDAY.id && (
        <ExitSurveyModal
          participant={sessionParticipant}
          booths={booths}
          onClose={() => setIsSurveyModalOpen(false)}
          onSuccess={handleSurveySuccess}
        />
      )}

      {/* Monday: Post-Event Survey */}
      {isMondaySurveyOpen && sessionParticipant && sessionParticipant.eventId === EVENT_MONDAY.id && (
        <MondaySurveyModal
          participant={sessionParticipant}
          onClose={() => setIsMondaySurveyOpen(false)}
          onSuccess={handleMondaySurveySuccess}
        />
      )}
    </div>
  );
}
