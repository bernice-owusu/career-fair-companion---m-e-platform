import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { WelcomeScreen } from './components/participant/WelcomeScreen';
import { RegistrationForm } from './components/participant/RegistrationForm';
import { RegistrationSuccess } from './components/participant/RegistrationSuccess';
import { CheckInScreen } from './components/participant/CheckInScreen';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { BoothDirectory } from './components/participant/BoothDirectory';
import { ProgressView } from './components/participant/ProgressView';
import { ParticipantProfile } from './components/participant/ParticipantProfile';
import { BottomNav, ParticipantTab } from './components/participant/BottomNav';
import { RecordBoothVisitModal } from './components/participant/RecordBoothVisitModal';
import { ExitSurveyModal } from './components/participant/ExitSurveyModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EntranceQRPresenter } from './components/admin/EntranceQRPresenter';

import { StorageService } from './services/storageService';
import { GoogleSheetsService } from './services/googleSheetsService';
import { Participant, EventConfig, Booth, BoothVisit, ExitSurvey } from './types';

type ParticipantFlowScreen = 'welcome' | 'register' | 'registered_success' | 'checkin' | 'main';

export default function App() {
  // Global event config & data
  const [config, setConfig] = useState<EventConfig>(StorageService.getConfig());
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(
    StorageService.getCurrentParticipant()
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(StorageService.isAdminLoggedIn());
  
  // Participant flow states
  const [flowScreen, setFlowScreen] = useState<ParticipantFlowScreen>(() => {
    const current = StorageService.getCurrentParticipant();
    if (!current) return 'welcome';
    const isCheckedIn = StorageService.isParticipantCheckedIn(current.id);
    return isCheckedIn ? 'main' : 'checkin';
  });

  const [activeTab, setActiveTab] = useState<ParticipantTab>('home');
  const [visits, setVisits] = useState<BoothVisit[]>(StorageService.getBoothVisits());
  const [booths, setBooths] = useState<Booth[]>(StorageService.getBooths());
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(false);
  const [sheetsRegisteredCount, setSheetsRegisteredCount] = useState<number | null>(null);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalBoothId, setRecordModalBoothId] = useState<string | undefined>(undefined);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEntranceQROpen, setIsEntranceQROpen] = useState(false);

  // Fetch live count from Google Sheets Web App on mount and periodically
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      const summary = await GoogleSheetsService.fetchSheetSummary();
      if (isMounted && summary && typeof summary.totalRegistered === 'number') {
        setSheetsRegisteredCount(summary.totalRegistered);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.appsScriptWebhookUrl]);

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

  // Handle participant registration
  const handleRegisterParticipant = async (data: Omit<Participant, 'id' | 'code' | 'registeredAt'>) => {
    const newParticipant = StorageService.registerParticipant(data);
    setCurrentParticipant(newParticipant);
    setFlowScreen('registered_success');

    // Async sync automatically to Google Sheets
    GoogleSheetsService.sendWebhook('register', newParticipant);
  };

  // Handle event check-in
  const handleCheckIn = () => {
    if (!currentParticipant) return;
    const record = StorageService.checkInParticipant(currentParticipant.id);
    setFlowScreen('main');

    // Async sync automatically to Google Sheets
    GoogleSheetsService.sendWebhook('checkIn', record);
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
    setFlowScreen('welcome');
    setActiveTab('home');
  };

  // Admin login toggle
  const handleToggleAdmin = () => {
    if (isAdmin) {
      StorageService.setAdminLoggedIn(false);
      setIsAdmin(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    StorageService.setAdminLoggedIn(true);
    setIsAdmin(true);
  };

  const verifiedVisitsCount = visits.filter(v => v.verificationStatus === 'verified').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        config={config}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        onOpenEntranceQR={() => setIsEntranceQROpen(true)}
        currentParticipantName={currentParticipant?.fullName}
      />

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
            }}
          />
        ) : (
          /* Participant Journey */
          <>
            {flowScreen === 'welcome' && (
              <WelcomeScreen
                config={config}
                onStartRegistration={() => setFlowScreen('register')}
                totalRegistered={sheetsRegisteredCount !== null ? sheetsRegisteredCount : StorageService.getParticipants().length}
                isFromSheets={sheetsRegisteredCount !== null}
                lastParticipant={StorageService.getCurrentParticipant()}
                onResumeSession={() => {
                  const saved = StorageService.getCurrentParticipant();
                  if (saved) {
                    setCurrentParticipant(saved);
                    const isCheckedIn = StorageService.isParticipantCheckedIn(saved.id);
                    setFlowScreen(isCheckedIn ? 'main' : 'checkin');
                  }
                }}
              />
            )}

            {flowScreen === 'register' && (
              <RegistrationForm
                config={config}
                onSubmit={handleRegisterParticipant}
                onCancel={() => setFlowScreen('welcome')}
              />
            )}

            {flowScreen === 'registered_success' && currentParticipant && (
              <RegistrationSuccess
                participant={currentParticipant}
                config={config}
                onProceedToCheckIn={() => setFlowScreen('checkin')}
              />
            )}

            {flowScreen === 'checkin' && currentParticipant && (
              <CheckInScreen
                participant={currentParticipant}
                config={config}
                onCheckInSuccess={handleCheckIn}
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
                      setFlowScreen('register');
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
      <EntranceQRPresenter
        config={config}
        isOpen={isEntranceQROpen}
        onClose={() => setIsEntranceQROpen(false)}
      />
    </div>
  );
}
