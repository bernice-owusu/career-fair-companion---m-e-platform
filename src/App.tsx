import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { WelcomeScreen } from './components/participant/WelcomeScreen';
import { PreRegistrationForm } from './components/participant/PreRegistrationForm';
import { RegistrationSuccess } from './components/participant/RegistrationSuccess';
import { CodeCheckInScreen } from './components/participant/CodeCheckInScreen';
import { WalkInRegistrationForm } from './components/participant/WalkInRegistrationForm';
import { WalkInSuccessScreen } from './components/participant/WalkInSuccessScreen';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { BoothDirectory } from './components/participant/BoothDirectory';
import { ProgressView } from './components/participant/ProgressView';
import { ParticipantProfile } from './components/participant/ParticipantProfile';
import { BottomNav, ParticipantTab } from './components/participant/BottomNav';
import { RecordBoothVisitModal } from './components/participant/RecordBoothVisitModal';
import { ExitSurveyModal } from './components/participant/ExitSurveyModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
// import { EntranceQRPresenter } from './components/admin/EntranceQRPresenter';

import { StorageService } from './services/storageService';
import { GoogleSheetsService } from './services/googleSheetsService';
import { RegistrationService } from './services/registrationService';
import { Participant, PreRegistrationData, WalkInRegistrationData, EventConfig, Booth, BoothVisit, ExitSurvey } from './types';
import { usePathname, screenFromPath, SCREEN_PATHS, ADMIN_PATH, ParticipantFlowScreen } from './router';

export default function App() {
  // Global event config & data
  const [config, setConfig] = useState<EventConfig>(StorageService.getConfig());
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(
    StorageService.getCurrentParticipant()
  );
  const { pathname, navigate } = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => pathname === ADMIN_PATH && StorageService.isAdminLoggedIn()
  );

  // Participant flow states — derived from the current URL path
  const [flowScreen, setFlowScreen] = useState<ParticipantFlowScreen>(() => {
    const s = screenFromPath(pathname);
    const current = StorageService.getCurrentParticipant();
    if (!s || (['registered_success', 'walk_in_success', 'main'].includes(s) && !current)) {
      return 'welcome';
    }
    return s;
  });

  const [activeTab, setActiveTab] = useState<ParticipantTab>('home');
  const [visits, setVisits] = useState<BoothVisit[]>(StorageService.getBoothVisits());
  const [booths, setBooths] = useState<Booth[]>(StorageService.getBooths());
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(false);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalBoothId, setRecordModalBoothId] = useState<string | undefined>(undefined);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEntranceQROpen, setIsEntranceQROpen] = useState(false);
  const [registrationEmailStatus, setRegistrationEmailStatus] = useState<'pending' | 'sent' | 'not_configured' | 'failed'>('pending');

  // Initialize automatic background sync lifecycle
  useEffect(() => {
    const cleanup = GoogleSheetsService.initAutoSync();
    return cleanup;
  }, []);

  // Sync survey status
  useEffect(() => {
    if (currentParticipant) {
      setHasCompletedSurvey(StorageService.hasCompletedSurvey(currentParticipant.id));
      const pVisits = StorageService.getBoothVisits().filter(v => v.participantId === currentParticipant.id);
      setVisits(pVisits);
    }
  }, [currentParticipant]);

  // Navigate to a flow screen and keep the URL path in sync
  const goTo = (screen: ParticipantFlowScreen) => {
    setFlowScreen(screen);
    navigate(SCREEN_PATHS[screen]);
  };

  // Keep state in sync when the URL changes (browser back/forward, direct link)
  useEffect(() => {
    if (pathname === ADMIN_PATH) {
      if (StorageService.isAdminLoggedIn()) {
        setIsAdmin(true);
      } else {
        setIsAdminLoginOpen(true);
      }
      return;
    }

    if (isAdmin) setIsAdmin(false);
    const s = screenFromPath(pathname);
    if (s && ['registered_success', 'walk_in_success', 'main'].includes(s) && !StorageService.getCurrentParticipant()) {
      goTo('welcome');
      return;
    }
    setFlowScreen(s ?? 'welcome');
  }, [pathname, isAdmin]);

  // Handle pre-registration (full questionnaire)
  const handleRegisterParticipant = async (data: PreRegistrationData) => {
    const newParticipant = RegistrationService.createPreRegistration(data);
    setCurrentParticipant(newParticipant);
    setRegistrationEmailStatus('pending');
    goTo('registered_success');

    // Async: update Google Sheets + email the registration code
    const res = await RegistrationService.syncRegistration(newParticipant);
    if (res.success && res.configured === false) {
      setRegistrationEmailStatus('not_configured');
    } else if (res.success) {
      setRegistrationEmailStatus('sent');
    } else {
      setRegistrationEmailStatus('failed');
    }
  };

  // Handle event-day walk-in registration (checked in immediately)
  const handleWalkInRegistration = async (data: WalkInRegistrationData) => {
    const newParticipant = RegistrationService.registerWalkIn(data);
    setCurrentParticipant(newParticipant);
    goTo('walk_in_success');

    // Async: update Google Sheets + email the registration code
    RegistrationService.syncRegistration(newParticipant);
  };

  // Handle verified code check-in
  const handleCheckInSuccess = (participant: Participant) => {
    StorageService.setCurrentParticipantId(participant.id);
    setCurrentParticipant(participant);
    goTo('main');

    // Async sync attendance to Google Sheets
    const record = StorageService.getAttendance().find(a => a.participantId === participant.id && a.status === "Checked In");
    if (record) {
      GoogleSheetsService.sendWebhook('checkIn', record);
    }
  };

  // Handle successful booth visit recording
  const handleBoothVisitSuccess = (newVisit: BoothVisit) => {
    if (currentParticipant) {
      const allVisits = StorageService.getBoothVisits().filter(v => v.participantId === currentParticipant.id);
      setVisits(allVisits);
    }
    // Async sync automatically to Google Sheets
    GoogleSheetsService.sendWebhook('boothVisit', newVisit);
  };

  // Handle survey success
  const handleSurveySuccess = (survey: ExitSurvey) => {
    if (currentParticipant) {
      setHasCompletedSurvey(true);
    }
    // Async sync automatically to Google Sheets
    GoogleSheetsService.sendWebhook('survey', survey);
  };

  // Open record booth visit modal
  const handleOpenRecordVisit = (boothId?: string) => {
    setRecordModalBoothId(boothId);
    setIsRecordModalOpen(true);
  };

  // Switch participant or sign out
  const handleSignOut = () => {
    StorageService.setCurrentParticipantId(null);
    setCurrentParticipant(null);
    goTo('welcome');
    setActiveTab('home');
  };

  // Admin login toggle
  const handleToggleAdmin = () => {
    if (isAdmin) {
      StorageService.setAdminLoggedIn(false);
      setIsAdmin(false);
      goTo('welcome');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    StorageService.setAdminLoggedIn(true);
    setIsAdmin(true);
    navigate(ADMIN_PATH);
  };

  const verifiedVisitsCount = visits.filter(v => v.verificationStatus === 'verified').length;

  return (
    <div className="min-h-screen bg-navy text-mist flex flex-col selection:bg-orange selection:text-navy">
      {/* Top Application Header — hidden on the standalone pre-registration page */}
      {flowScreen !== 'register' && (
        <Header
          config={config}
          isAdmin={isAdmin}
          onToggleAdmin={handleToggleAdmin}
          onOpenEntranceQR={() => setIsEntranceQROpen(true)}
          currentParticipantName={currentParticipant?.fullName}
        />
      )}

      {/* Main Content View Container */}
      <main className="flex-1">
        {isAdmin ? (
          /* M&E Admin Dashboard */
          <AdminDashboard
            config={config}
            onUpdateConfig={(newConf) => {
              setConfig(newConf);
              StorageService.saveConfig(newConf);
            }}
            onExitAdmin={() => {
              StorageService.setAdminLoggedIn(false);
              setIsAdmin(false);
              goTo('welcome');
            }}
          />
        ) : (
          /* Participant Journey */
          <>
            {flowScreen === 'welcome' && (
              <WelcomeScreen
                config={config}
                onPreRegistered={() => goTo('checkin')}
                onWalkIn={() => goTo('walk_in')}
                onPreRegisterOnline={() => goTo('register')}
                lastParticipant={StorageService.getCurrentParticipant()}
                onResumeSession={() => {
                  const saved = StorageService.getCurrentParticipant();
                  if (saved) {
                    setCurrentParticipant(saved);
                    const isCheckedIn = StorageService.isParticipantCheckedIn(saved.id);
                    goTo(isCheckedIn ? 'main' : 'checkin');
                  }
                }}
              />
            )}

            {flowScreen === 'register' && (
              <PreRegistrationForm
                onSubmit={handleRegisterParticipant}
                onCancel={() => goTo('welcome')}
              />
            )}

            {flowScreen === 'registered_success' && currentParticipant && (
              <RegistrationSuccess
                participant={currentParticipant}
                config={config}
                emailStatus={registrationEmailStatus}
                onContinue={() => goTo('welcome')}
                onProceedToCheckIn={() => goTo('checkin')}
              />
            )}

            {flowScreen === 'checkin' && (
              <CodeCheckInScreen
                config={config}
                initialParticipant={currentParticipant}
                onSuccess={handleCheckInSuccess}
                onBack={() => goTo('welcome')}
                onRegisterInPerson={() => goTo('walk_in')}
              />
            )}

            {flowScreen === 'walk_in' && (
              <WalkInRegistrationForm
                onSubmit={handleWalkInRegistration}
                onCancel={() => goTo('welcome')}
              />
            )}

            {flowScreen === 'walk_in_success' && currentParticipant && (
              <WalkInSuccessScreen
                participant={currentParticipant}
                config={config}
                emailStatus={registrationEmailStatus}
                onContinue={() => goTo('main')}
              />
            )}

            {flowScreen === 'main' && currentParticipant && (
              <>
                {activeTab === 'home' && (
                  <ParticipantDashboard
                    participant={currentParticipant}
                    visits={visits}
                    booths={booths}
                    config={config}
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
                    participant={currentParticipant}
                    visits={visits}
                    booths={booths}
                    config={config}
                    hasCompletedSurvey={hasCompletedSurvey}
                    onOpenSurvey={() => setIsSurveyModalOpen(true)}
                    onRecordVisit={() => handleOpenRecordVisit()}
                  />
                )}

                {activeTab === 'profile' && (
                  <ParticipantProfile
                    participant={currentParticipant}
                    config={config}
                    hasCheckedIn={true}
                    hasCompletedSurvey={hasCompletedSurvey}
                    boothsCompletedCount={verifiedVisitsCount}
                    onSignOut={handleSignOut}
                    onRegisterNew={() => {
                      StorageService.setCurrentParticipantId(null);
                      setCurrentParticipant(null);
                      goTo('walk_in');
                    }}
                  />
                )}

                {/* Bottom Navigation for Mobile */}
                <BottomNav
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                  completedBoothsCount={verifiedVisitsCount}
                  minRequired={config.minBoothsRequired || 4}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {/* Record Booth Visit Modal */}
      {isRecordModalOpen && currentParticipant && (
        <RecordBoothVisitModal
          participant={currentParticipant}
          booths={booths}
          initialBoothId={recordModalBoothId}
          onClose={() => {
            setIsRecordModalOpen(false);
            setRecordModalBoothId(undefined);
          }}
          onSuccess={handleBoothVisitSuccess}
        />
      )}

      {/* Exit Survey Modal */}
      {isSurveyModalOpen && currentParticipant && (
        <ExitSurveyModal
          participant={currentParticipant}
          booths={booths}
          onClose={() => setIsSurveyModalOpen(false)}
          onSuccess={handleSurveySuccess}
        />
      )}

      {/* Admin Passcode Login Modal */}
      <AdminLogin
        config={config}
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Entrance QR Poster Modal */}
      {/* <EntranceQRPresenter
        config={config}
        isOpen={isEntranceQROpen}
        onClose={() => setIsEntranceQROpen(false)}
      /> */}
    </div>
  );
}
