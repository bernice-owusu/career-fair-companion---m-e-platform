import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import {
  LayoutDashboard, Users, Compass, Star, FileSpreadsheet, Settings, Download, Search, Filter,
  CheckCircle2, AlertCircle, ArrowUpRight, UserCheck, Award, MessageSquare, Clock, MapPin,
  ExternalLink, Copy, Check, Plus, Edit2, Trash2, RefreshCw, ChevronRight, Eye, ShieldAlert, X, Sparkles, Save, Mail
} from 'lucide-react';
import { Participant, AttendanceRecord, Booth, BoothVisit, ExitSurvey, EventConfig, MneMetrics } from '../../types';
import { StorageService } from '../../services/storageService';
import { RegistrationService } from '../../services/registrationService';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { QuestionsAdmin } from './QuestionsAdmin';
import { RESUME_QUALITY_LABELS, INTERVIEW_CONFIDENCE_LABELS } from '../../registrationOptions';

interface AdminDashboardProps {
  config: EventConfig;
  eventId?: string;
  onUpdateConfig: (newConfig: EventConfig) => void;
  onExitAdmin: () => void;
}

type AdminTab = 'overview' | 'participants' | 'booths' | 'surveys' | 'questions' | 'sheets' | 'settings';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  eventId,
  onUpdateConfig,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [participants, setParticipants] = useState<Participant[]>(StorageService.getParticipants(eventId));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(StorageService.getAttendance(eventId));
  const [booths, setBooths] = useState<Booth[]>(StorageService.getBooths());
  const [visits, setBoothVisits] = useState<BoothVisit[]>(StorageService.getBoothVisits(eventId));
  const [surveys, setSurveys] = useState<ExitSurvey[]>(StorageService.getSurveys(eventId));
  const [metrics, setMetrics] = useState<MneMetrics>(StorageService.getMetrics(eventId));

  // Local Event Configuration Form State
  const [settingsForm, setSettingsForm] = useState<EventConfig>(config);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newInstitutionInput, setNewInstitutionInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');

  // Keep form synced if parent config prop updates (compare by value so an
  // identity-only change from the parent doesn't wipe in-progress edits).
  useEffect(() => {
    setSettingsForm(prev =>
      prev && Object.keys(prev).length > 0 && JSON.stringify(prev) === JSON.stringify(config)
        ? prev
        : config
    );
  }, [config]);

  // Confirmation Modal state (replaces native window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => { },
  });

  // Participant directory filters
  const [searchParticipant, setSearchParticipant] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState<'all' | 'checkedIn' | 'notCheckedIn'>('all');
  const [filterBooths, setFilterBooths] = useState<'all' | '0' | '1-3' | '4+'>('all');
  const [filterSurvey, setFilterSurvey] = useState<'all' | 'done' | 'pending'>('all');
  const [filterInstitution, setFilterInstitution] = useState<string>('all');
  const [selectedParticipantDetail, setSelectedParticipantDetail] = useState<Participant | null>(null);

  // Booth detail drawer
  const [selectedBoothDetail, setSelectedBoothDetail] = useState<Booth | null>(null);
  const [reflectionSearch, setReflectionSearch] = useState('');

  // New / Edit Booth Modal
  const [isEditingBooth, setIsEditingBooth] = useState(false);
  const [editingBoothData, setEditingBoothData] = useState<Partial<Booth>>({
    name: '',
    description: '',
    location: '',
    facilitators: [''],
    boothCode: '',
    isActive: true,
    category: 'Job Readiness'
  });

  // Google Sheets sync state
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Refresh latest data helper
  const reloadData = () => {
    setParticipants(StorageService.getParticipants(eventId));
    setAttendance(StorageService.getAttendance(eventId));
    setBooths(StorageService.getBooths());
    setBoothVisits(StorageService.getBoothVisits(eventId));
    setSurveys(StorageService.getSurveys(eventId));
    setMetrics(StorageService.getMetrics(eventId));
  };

  // Checked in participants lookup set
  const checkedInIds = useMemo(() => {
    return new Set(attendance.filter(a => a.status === 'Checked In').map(a => a.participantId));
  }, [attendance]);

  // Visits per participant mapping
  const participantVisitsMap = useMemo(() => {
    const map: Record<string, BoothVisit[]> = {};
    visits.forEach(v => {
      if (v.verificationStatus === 'verified') {
        if (!map[v.participantId]) map[v.participantId] = [];
        map[v.participantId].push(v);
      }
    });
    return map;
  }, [visits]);

  // Survey lookup set
  const surveyParticipantIds = useMemo(() => {
    return new Set(surveys.map(s => s.participantId));
  }, [surveys]);

  // Calculate dynamic booth participation statistics
  const boothParticipationStats = useMemo(() => {
    return booths.map(b => {
      const boothVisits = visits.filter(v => v.boothId === b.id && v.verificationStatus === 'verified');
      const uniqueParticipants = new Set(boothVisits.map(v => v.participantId)).size;
      const pct = metrics.totalAttended > 0 ? (uniqueParticipants / metrics.totalAttended) * 100 : 0;
      return {
        ...b,
        visitCount: uniqueParticipants,
        percentage: Math.round(pct * 10) / 10,
        reflections: boothVisits
      };
    }).sort((a, b) => b.visitCount - a.visitCount);
  }, [booths, visits, metrics.totalAttended]);

  // Calculate completion distribution (0, 1, 2, 3, 4, 5+ booths)
  const completionDistribution = useMemo(() => {
    const dist = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 };
    participants.forEach(p => {
      const count = participantVisitsMap[p.id]?.length || 0;
      if (count === 0) dist['0']++;
      else if (count === 1) dist['1']++;
      else if (count === 2) dist['2']++;
      else if (count === 3) dist['3']++;
      else if (count === 4) dist['4']++;
      else dist['5+']++;
    });
    return [
      { name: '0 Booths', count: dist['0'], fill: '#dce3eb' },
      { name: '1 Booth', count: dist['1'], fill: '#135eab' },
      { name: '2 Booths', count: dist['2'], fill: '#ff5c35' },
      { name: '3 Booths', count: dist['3'], fill: '#ff5c35' },
      { name: '4 Booths', count: dist['4'], fill: '#004f51' },
      { name: '5+ Booths', count: dist['5+'], fill: '#004f51' },
    ];
  }, [participants, participantVisitsMap]);

  // Calculate Hourly attendance distribution
  const hourlyAttendance = useMemo(() => {
    const hours: Record<string, number> = {
      '08:00 - 09:00': 0,
      '09:00 - 10:00': 0,
      '10:00 - 11:00': 0,
      '11:00 - 12:00': 0,
      '12:00 - 13:00': 0,
      '13:00 - 14:00': 0,
      '14:00 - 15:00': 0,
      '15:00+': 0
    };

    attendance.forEach(a => {
      if (a.checkInTime) {
        const hour = new Date(a.checkInTime).getHours();
        if (hour <= 8) hours['08:00 - 09:00']++;
        else if (hour === 9) hours['09:00 - 10:00']++;
        else if (hour === 10) hours['10:00 - 11:00']++;
        else if (hour === 11) hours['11:00 - 12:00']++;
        else if (hour === 12) hours['12:00 - 13:00']++;
        else if (hour === 13) hours['13:00 - 14:00']++;
        else if (hour === 14) hours['14:00 - 15:00']++;
        else hours['15:00+']++;
      }
    });

    return Object.entries(hours).map(([time, attendees]) => ({ time, attendees }));
  }, [attendance]);

  // Filtered Participants List
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const isCheckedIn = checkedInIds.has(p.id);
      const boothCount = participantVisitsMap[p.id]?.length || 0;
      const hasSurvey = surveyParticipantIds.has(p.id);

      const matchesSearch =
        p.fullName.toLowerCase().includes(searchParticipant.toLowerCase()) ||
        p.code.toLowerCase().includes(searchParticipant.toLowerCase()) ||
        p.email.toLowerCase().includes(searchParticipant.toLowerCase()) ||
        p.phone.toLowerCase().includes(searchParticipant.toLowerCase()) ||
        (p.psghRegistrationNumber || '').toLowerCase().includes(searchParticipant.toLowerCase()) ||
        (p.institution || '').toLowerCase().includes(searchParticipant.toLowerCase());

      if (!matchesSearch) return false;

      if (filterCheckIn === 'checkedIn' && !isCheckedIn) return false;
      if (filterCheckIn === 'notCheckedIn' && isCheckedIn) return false;

      if (filterBooths === '0' && boothCount !== 0) return false;
      if (filterBooths === '1-3' && (boothCount < 1 || boothCount > 3)) return false;
      if (filterBooths === '4+' && boothCount < 4) return false;

      if (filterSurvey === 'done' && !hasSurvey) return false;
      if (filterSurvey === 'pending' && hasSurvey) return false;

      if (filterInstitution !== 'all' && (p.institution || '') !== filterInstitution) return false;

      return true;
    });
  }, [participants, searchParticipant, filterCheckIn, filterBooths, filterSurvey, filterInstitution, checkedInIds, participantVisitsMap, surveyParticipantIds]);

  // Resend registration code email for a participant
  const [codeEmailStatus, setCodeEmailStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const resendRegistrationCodeEmail = async (p: Participant) => {
    setCodeEmailStatus(null);
    const payload = {
      email: p.email,
      fullName: p.fullName,
      code: p.code,
      eventName: config.eventName
    };
    const res = await GoogleSheetsService.sendWebhook('resendCode', payload);
    setCodeEmailStatus({
      type: res.success ? 'success' : 'error',
      text: res.success ? 'Registration code email re-sent.' : (res.error || 'Email not sent (check webhook URL & script deployment).')
    });
  };

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyRegistrationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      setCopiedCode(null);
    }
  };

  // Handle Save/Add Booth
  const handleSaveBooth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoothData.name || !editingBoothData.boothCode) return;

    let updatedBooths: Booth[];
    if (editingBoothData.id) {
      // Edit
      updatedBooths = booths.map(b => b.id === editingBoothData.id ? { ...b, ...editingBoothData as Booth } : b);
    } else {
      // Create new
      const newBooth: Booth = {
        id: `booth-${Date.now()}`,
        name: editingBoothData.name,
        description: editingBoothData.description || '',
        location: editingBoothData.location || 'Hall A',
        facilitators: editingBoothData.facilitators?.filter(f => f.trim().length > 0) || ['Lead Facilitator'],
        boothCode: editingBoothData.boothCode.trim().toUpperCase(),
        isActive: editingBoothData.isActive ?? true,
        category: editingBoothData.category || 'Job Readiness'
      };
      updatedBooths = [...booths, newBooth];
    }

    StorageService.saveBooths(updatedBooths);
    setBooths(updatedBooths);
    setIsEditingBooth(false);
  };

  const handleDeleteBooth = (boothId: string) => {
    const booth = booths.find(b => b.id === boothId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Booth',
      message: `Are you sure you want to delete "${booth?.name || 'this booth'}"? This cannot be undone.`,
      confirmLabel: 'Delete Booth',
      isDestructive: true,
      onConfirm: () => {
        const updated = booths.filter(b => b.id !== boothId);
        StorageService.saveBooths(updated);
        setBooths(updated);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Google Sheets Direct / Apps Script Webhook Sync
  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await GoogleSheetsService.sendWebhook('batchSync', {
        participants,
        attendance,
        booths,
        boothVisits: visits,
        surveys
      });

      if (res.success) {
        setSyncStatusMsg({ type: 'success', text: 'Successfully synchronized state with Google Sheets!' });
      } else {
        setSyncStatusMsg({ type: 'error', text: res.error || 'Failed to sync with Google Sheets endpoint' });
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: err.message || 'Sync error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualCheckIn = (p: Participant) => {
    const res = RegistrationService.checkInParticipant(p.id);
    if ('error' in res) {
      setCodeEmailStatus({ type: 'error', text: res.error });
    } else {
      reloadData();
      setCodeEmailStatus({ type: 'success', text: `${p.fullName} checked in successfully.` });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange/15 text-orange border border-orange/30 text-[11px] font-bold uppercase tracking-wider">
              M&E Admin Center
            </span>
            <span className="text-xs text-mist/60">• Live Event Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {config.eventName}
          </h1>
          <p className="text-xs text-mist/60">
            Real-time analytics dynamically calculated from participant sessions and Google Sheets data.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reloadData}
            title="Refresh M&E Data"
            className="p-2.5 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist/80 hover:text-white border border-mist/25 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => GoogleSheetsService.exportAllDatasets()}
            className="px-3.5 py-2.5 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold border border-mist/25 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-orange" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="px-4 py-2.5 rounded-xl bg-navy/70 hover:bg-rose-950/40 text-mist/80 hover:text-rose-300 border border-mist/25 hover:border-rose-900 text-xs font-bold transition"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-mist/15 pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
          { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
          { id: 'booths', label: `Booths (${booths.length})`, icon: Compass },
          { id: 'surveys', label: `Surveys (${surveys.length})`, icon: Star },
          { id: 'questions', label: 'Questions', icon: MessageSquare },
          { id: 'sheets', label: 'Google Sheets Integration', icon: FileSpreadsheet },
          { id: 'settings', label: 'Event Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${isActive
                  ? 'bg-orange text-white shadow-lg shadow-orange/30'
                  : 'text-mist/60 hover:text-white hover:bg-navy/70'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Row 1: Registration Funnel KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mist/60 block">Registered</span>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">{metrics.totalRegistered}</p>
                <span className="text-[10px] text-mist/40">Total signups</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal block">Pre-Registered</span>
                <p className="text-xl sm:text-2xl font-black text-teal font-mono">{metrics.preRegisteredCount}</p>
                <span className="text-[10px] text-mist/40">Registered before event</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue block">Walk-Ins</span>
                <p className="text-xl sm:text-2xl font-black text-blue font-mono">{metrics.walkedInCount}</p>
                <span className="text-[10px] text-mist/40">Registered at venue</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange block">Checked In</span>
                <p className="text-xl sm:text-2xl font-black text-orange font-mono">{metrics.checkedInCount}</p>
                <span className="text-[10px] text-mist/40">Checked in at venue</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal block">Pre-Reg Check-In Rate</span>
                <p className="text-xl sm:text-2xl font-black text-teal font-mono">{metrics.preRegistrationAttendanceRate}%</p>
                <span className="text-[10px] text-mist/40">Pre-regs who attended</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue block">Attendance Rate</span>
                <p className="text-xl sm:text-2xl font-black text-blue font-mono">{metrics.attendanceRate}%</p>
                <span className="text-[10px] text-mist/40">Turnout percentage</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange block">Avg Booths</span>
                <p className="text-xl sm:text-2xl font-black text-orange font-mono">{metrics.avgBoothsPerAttendee}</p>
                <span className="text-[10px] text-mist/40">Per attendee</span>
              </div>
            </div>

            {/* Row 2: Engagement Outcome KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange block">Booth Visits</span>
                <p className="text-xl sm:text-2xl font-black text-orange font-mono">{metrics.totalBoothVisits}</p>
                <span className="text-[10px] text-mist/40">Verified sessions</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue block">4+ Completed</span>
                <p className="text-xl sm:text-2xl font-black text-blue font-mono">{metrics.completedMinBoothsCount}</p>
                <span className="text-[10px] text-mist/40">Goal achieved</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange block">Completion Rate</span>
                <p className="text-xl sm:text-2xl font-black text-orange font-mono">{metrics.completionRate}%</p>
                <span className="text-[10px] text-mist/40">4+ booths of attendees</span>
              </div>

              <div className="bg-navy/90 border border-mist/15 rounded-2xl p-4 space-y-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue block">Exit Surveys</span>
                <p className="text-xl sm:text-2xl font-black text-blue font-mono">{metrics.exitSurveysCount}</p>
                <span className="text-[10px] text-mist/40">Submitted feedback</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Booth Participation Ranking */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Booth Participation</h3>
                  <p className="text-xs text-mist/60">Total verified participant visits per session</p>
                </div>
                <span className="text-xs font-mono text-orange bg-orange/15 px-2.5 py-1 rounded-md border border-orange/30">
                  {booths.length} Active Booths
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boothParticipationStats} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                    <XAxis type="number" stroke="#dce3eb" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#dce3eb" width={110} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a2240', borderColor: 'rgba(220,227,235,0.25)', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} participants`, 'Attendees']}
                    />
                    <Bar dataKey="visitCount" fill="#ff5c35" radius={[0, 8, 8, 0]}>
                      {boothParticipationStats.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={i === 0 ? '#004f51' : i === 1 ? '#ff5c35' : '#135eab'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Hourly Attendance Timeline */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Check-in Timeline</h3>
                  <p className="text-xs text-mist/60">Hourly participant arrival cadence</p>
                </div>
                <span className="text-xs font-mono text-orange bg-teal/15 px-2.5 py-1 rounded-md border border-teal/40">
                  {metrics.totalAttended} Checked In
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyAttendance} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="attendArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#004f51" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#004f51" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#dce3eb" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#dce3eb" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a2240', borderColor: 'rgba(220,227,235,0.25)', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="attendees" stroke="#004f51" strokeWidth={2} fillOpacity={1} fill="url(#attendArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Booth Milestone Completion Distribution */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Booth Completion Distribution</h3>
                  <p className="text-xs text-mist/60">Number of booths attended per participant</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionDistribution} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <XAxis dataKey="name" stroke="#dce3eb" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#dce3eb" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a2240', borderColor: 'rgba(220,227,235,0.25)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {completionDistribution.map((entry, idx) => (
                        <Cell key={`dist-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Quick Summary Table */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">M&E Summary Sheet Overview</h3>
                <p className="text-xs text-mist/60">Synced directly with Google Sheets Formula Sheet</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Total Registered</span>
                  <span className="font-bold text-white font-mono">{metrics.totalRegistered}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Total Pre-Registrations</span>
                  <span className="font-bold text-teal font-mono">{metrics.preRegisteredCount}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Walk-In Registrations</span>
                  <span className="font-bold text-blue font-mono">{metrics.walkedInCount}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Checked In</span>
                  <span className="font-bold text-orange font-mono">{metrics.checkedInCount}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Pre-Reg → Check-In Rate</span>
                  <span className="font-bold text-teal font-mono">{metrics.preRegistrationAttendanceRate}%</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Total Attended & Verified</span>
                  <span className="font-bold text-orange font-mono">{metrics.totalAttended}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Attendance Rate</span>
                  <span className="font-bold text-blue font-mono">{metrics.attendanceRate}%</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Participants Meeting 4+ Requirement</span>
                  <span className="font-bold text-blue font-mono">{metrics.completedMinBoothsCount}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-navy/70 border border-mist/15">
                  <span className="text-mist/60">Exit Surveys Received</span>
                  <span className="font-bold text-blue font-mono">{metrics.exitSurveysCount}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('sheets')}
                className="w-full py-2.5 px-4 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold transition flex items-center justify-center gap-2 border border-mist/25"
              >
                <FileSpreadsheet className="w-4 h-4 text-orange" />
                <span>Open Google Sheets Connection Tab</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARTICIPANTS DIRECTORY */}
      {activeTab === 'participants' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-mist/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search participants by name, code, email, institution..."
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy/70 border border-mist/15 rounded-xl text-xs sm:text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange"
                />
              </div>

              <span className="text-xs font-semibold text-mist/60 shrink-0">
                Showing {filteredParticipants.length} of {participants.length} participants
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-mist/15">
              <div>
                <label className="block text-[10px] font-bold uppercase text-mist/60 mb-1">Check-in Status</label>
                <select
                  value={filterCheckIn}
                  onChange={(e) => setFilterCheckIn(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-navy/70 border border-mist/25 rounded-lg text-xs text-white"
                >
                  <option value="all">All Status</option>
                  <option value="checkedIn">Checked In Only</option>
                  <option value="notCheckedIn">Not Checked In</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-mist/60 mb-1">Booths Completed</label>
                <select
                  value={filterBooths}
                  onChange={(e) => setFilterBooths(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-navy/70 border border-mist/25 rounded-lg text-xs text-white"
                >
                  <option value="all">All Booth Counts</option>
                  <option value="0">0 Booths</option>
                  <option value="1-3">1 - 3 Booths</option>
                  <option value="4+">4+ Booths (Target Met)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-mist/60 mb-1">Exit Survey</label>
                <select
                  value={filterSurvey}
                  onChange={(e) => setFilterSurvey(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-navy/70 border border-mist/25 rounded-lg text-xs text-white"
                >
                  <option value="all">All Survey States</option>
                  <option value="done">Survey Submitted</option>
                  <option value="pending">Survey Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-mist/60 mb-1">Institution</label>
                <select
                  value={filterInstitution}
                  onChange={(e) => setFilterInstitution(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-navy/70 border border-mist/25 rounded-lg text-xs text-white"
                >
                  <option value="all">All Institutions</option>
                  {config.registrationFields.institutionsList.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-mist/80">
                <thead className="bg-navy/80 text-[11px] font-bold uppercase tracking-wider text-mist/60 border-b border-mist/15">
                  <tr>
                    <th className="py-3.5 px-4">Participant</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Institution</th>
                    <th className="py-3.5 px-4 text-center">Check-In</th>
                    <th className="py-3.5 px-4 text-center">Booths</th>
                    <th className="py-3.5 px-4 text-center">Requirement</th>
                    <th className="py-3.5 px-4 text-center">Survey</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist/15">
                  {filteredParticipants.map(p => {
                    const isCheckedIn = checkedInIds.has(p.id);
                    const pVisits = participantVisitsMap[p.id] || [];
                    const boothCount = pVisits.length;
                    const isReqMet = boothCount >= (config.minBoothsRequired || 4);
                    const hasSurvey = surveyParticipantIds.has(p.id);

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-navy/60 transition cursor-pointer"
                        onClick={() => setSelectedParticipantDetail(p)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{p.fullName}</div>
                          <div className="text-[11px] text-mist/60">{p.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-orange">
                          {p.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.registrationType === 'walk_in'
                              ? 'bg-blue/15 text-blue border-blue/40'
                              : 'bg-teal/15 text-teal border-teal/40'
                            }`}>
                            {p.registrationType === 'walk_in' ? 'Walk-In' : 'Pre-Reg'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="truncate block max-w-[150px]">{p.institution || '—'}</span>
                          {p.careerInterest && <span className="text-[10px] text-mist/40">{p.careerInterest}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isCheckedIn ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-teal/15 text-orange border border-teal/40 text-[10px] font-bold">
                              ✓ In
                            </span>
                          ) : (
                            <span className="text-mist/40">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                          {boothCount}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${isReqMet
                              ? 'bg-teal/15 text-orange border border-teal/40'
                              : 'bg-navy/70 text-mist/60 border border-mist/15'
                            }`}>
                            {isReqMet ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {hasSurvey ? (
                            <span className="text-orange font-bold">✓</span>
                          ) : (
                            <span className="text-mist/30">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipantDetail(p);
                            }}
                            className="p-1.5 rounded-lg bg-navy/70 hover:bg-orange hover:text-white text-mist/80 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PARTICIPANT DETAIL MODAL */}
      {selectedParticipantDetail && (() => {
        const detail = selectedParticipantDetail;
        const isDetailCheckedIn = checkedInIds.has(detail.id) || detail.checkedIn === true;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-mist/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-orange font-bold uppercase">{detail.code}</span>
                <h3 className="text-lg font-bold text-white">{detail.fullName}</h3>
                <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${detail.registrationType === 'walk_in'
                    ? 'bg-blue/15 text-blue border-blue/40'
                    : 'bg-teal/15 text-teal border-teal/40'
                  }`}>
                  {detail.registrationType === 'walk_in' ? 'Walk-In Registration' : 'Pre-Registration'}
                </span>
              </div>
              <button
                onClick={() => setSelectedParticipantDetail(null)}
                className="p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/70"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Registration & Check-in Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-navy/70 p-4 rounded-2xl border border-mist/15">
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Registered At</span>
                  <span className="text-mist font-semibold">
                    {detail.registeredAt ? new Date(detail.registeredAt).toLocaleString() : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Check-In Status</span>
                  <span className={`font-bold ${isDetailCheckedIn ? 'text-orange' : 'text-mist/40'}`}>
                    {isDetailCheckedIn ? '✓ Checked In' : 'Not Checked In'}
                  </span>
                </div>
                {isDetailCheckedIn && (
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Checked In At</span>
                    <span className="text-mist font-semibold">
                      {detail.checkedInAt ? new Date(detail.checkedInAt).toLocaleString() : '—'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Event Date</span>
                  <span className="text-mist font-semibold">{detail.eventDate || config.eventDate || '—'}</span>
                </div>
              </div>

              {/* Code Assistance Actions */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => copyRegistrationCode(detail.code)}
                    className="py-2.5 px-3 rounded-xl bg-navy/70 border border-mist/25 text-mist hover:border-orange transition flex items-center justify-center gap-1.5 font-bold"
                  >
                    {copiedCode === detail.code ? <Check className="w-4 h-4 text-orange" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode === detail.code ? 'Code Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => resendRegistrationCodeEmail(detail)}
                    className="py-2.5 px-3 rounded-xl bg-navy/70 border border-mist/25 text-mist hover:border-orange transition flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Code by Email</span>
                  </button>
                  {!isDetailCheckedIn && (
                    <button
                      onClick={() => handleManualCheckIn(detail)}
                      className="py-2.5 px-3 rounded-xl bg-orange hover:bg-orange/90 text-white transition flex items-center justify-center gap-1.5 font-bold"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Manual Check-In</span>
                    </button>
                  )}
                </div>
                {codeEmailStatus && (
                  <p className={`text-[11px] font-semibold px-3 py-2 rounded-lg ${codeEmailStatus.type === 'success'
                      ? 'bg-teal/15 text-orange border border-teal/40'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                    {codeEmailStatus.text}
                  </p>
                )}
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-navy/70 p-4 rounded-2xl border border-mist/15">
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Phone</span>
                  <span className="text-mist font-semibold">{detail.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Email</span>
                  <span className="text-mist font-semibold truncate block">{detail.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">PSGH Reg. No.</span>
                  <span className="text-mist font-semibold font-mono">{detail.psghRegistrationNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Year of Completion</span>
                  <span className="text-mist font-semibold">{detail.yearOfCompletion || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Highest Education</span>
                  <span className="text-mist font-semibold">{detail.highestEducation || detail.educationLevel || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Current Job Title</span>
                  <span className="text-mist font-semibold">{detail.currentJobTitle || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Area of Practice</span>
                  <span className="text-mist font-semibold">
                    {detail.currentAreaOfPractice || '—'}
                    {detail.currentAreaOther && <span className="text-mist/60"> ({detail.currentAreaOther})</span>}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Region</span>
                  <span className="text-mist font-semibold">{detail.regionOfResidence || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-mist/40 uppercase block">Ideal Career Path</span>
                  <span className="text-mist font-semibold">
                    {detail.idealCareerPath || '—'}
                    {detail.idealCareerPathOther && <span className="text-mist/60"> ({detail.idealCareerPathOther})</span>}
                  </span>
                </div>
                {detail.institution && (
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Institution</span>
                    <span className="text-mist font-semibold">{detail.institution}</span>
                  </div>
                )}
                {detail.careerInterest && (
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Career Interest</span>
                    <span className="text-mist font-semibold">{detail.careerInterest}</span>
                  </div>
                )}
                {detail.employmentStatus && (
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Employment</span>
                    <span className="text-mist font-semibold">{detail.employmentStatus}</span>
                  </div>
                )}
              </div>

              {/* Career Fair Expectations */}
              {(detail.careerFairExpectations?.length || detail.careerFairExpectationsOther) && (
                <div className="bg-navy/70 p-4 rounded-2xl border border-mist/15 space-y-2">
                  <span className="text-[10px] text-mist/40 uppercase block">Career Fair Expectations</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(detail.careerFairExpectations || []).map(exp => (
                      <span key={exp} className="px-2 py-1 rounded-md bg-blue/15 text-blue border border-blue/40 text-[10px] font-semibold">{exp}</span>
                    ))}
                    {detail.careerFairExpectationsOther && (
                      <span className="px-2 py-1 rounded-md bg-blue/15 text-blue border border-blue/40 text-[10px] font-semibold">{detail.careerFairExpectationsOther}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Career Tracks */}
              {detail.careerTracks?.length > 0 && (
                <div className="bg-navy/70 p-4 rounded-2xl border border-mist/15 space-y-2">
                  <span className="text-[10px] text-mist/40 uppercase block">Career Tracks of Interest</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.careerTracks.map(ct => (
                      <span key={ct} className="px-2 py-1 rounded-md bg-teal/15 text-teal border border-teal/40 text-[10px] font-semibold">{ct}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Lab & Preparation */}
              {(detail.skillsLabResumeAssistance || detail.resumeQuality || detail.interviewConfidence || detail.mockInterview) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-navy/70 p-4 rounded-2xl border border-mist/15">
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Skills Lab Resume Assistance</span>
                    <span className="text-mist font-semibold">
                      {detail.skillsLabResumeAssistance || '—'}
                      {detail.skillsLabResumeAssistanceOther && <span className="text-mist/60"> ({detail.skillsLabResumeAssistanceOther})</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Resume Quality</span>
                    <span className="text-mist font-semibold">
                      {detail.resumeQuality ? `${detail.resumeQuality}/5${RESUME_QUALITY_LABELS[detail.resumeQuality - 1] ? ` — ${RESUME_QUALITY_LABELS[detail.resumeQuality - 1]}` : ''}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">CV Uploaded</span>
                    <span className="text-mist font-semibold">
                      {detail.cvUploaded ? `Yes${detail.cvFileName ? ` (${detail.cvFileName})` : ''}` : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Interview Confidence</span>
                    <span className="text-mist font-semibold">
                      {detail.interviewConfidence ? `${detail.interviewConfidence}/5${INTERVIEW_CONFIDENCE_LABELS[detail.interviewConfidence - 1] ? ` — ${INTERVIEW_CONFIDENCE_LABELS[detail.interviewConfidence - 1]}` : ''}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Mock Interview</span>
                    <span className="text-mist font-semibold">{detail.mockInterview || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Attended Last Year</span>
                    <span className="text-mist font-semibold">{detail.attendedLastYear || '—'}</span>
                  </div>
                </div>
              )}

              {/* Sources & Feedback */}
              {(detail.heardAboutCareerFair || detail.facilitatorQuestions) && (
                <div className="space-y-2">
                  <div className="bg-navy/70 p-3.5 rounded-xl border border-mist/15">
                    <span className="text-[10px] text-mist/40 uppercase block">How Heard About Career Fair</span>
                    <span className="text-mist font-semibold">
                      {detail.heardAboutCareerFair || '—'}
                      {detail.heardAboutCareerFairOther && <span className="text-mist/60"> ({detail.heardAboutCareerFairOther})</span>}
                    </span>
                  </div>
                  {detail.facilitatorQuestions && (
                    <div className="bg-navy/70 p-3.5 rounded-xl border border-mist/15">
                      <span className="text-[10px] text-mist/40 uppercase block">Questions for Facilitators</span>
                      <p className="text-mist italic mt-1">"{detail.facilitatorQuestions}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Booth Journey */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Booth Attendance & Learning Journey ({(participantVisitsMap[selectedParticipantDetail.id] || []).length})</span>
                </h4>

                {(participantVisitsMap[selectedParticipantDetail.id] || []).length === 0 ? (
                  <p className="text-mist/40 italic p-3 bg-navy/70 rounded-xl">No booth visits recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {(participantVisitsMap[selectedParticipantDetail.id] || []).map((v, i) => (
                      <div key={v.id} className="p-3.5 bg-navy/70 rounded-xl border border-mist/15 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white">{i + 1}. {v.boothName}</span>
                          <span className="text-[10px] text-mist/60 font-mono">
                            {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-mist/60">Facilitator: <strong className="text-mist">{v.facilitator}</strong> • Code: <span className="font-mono text-orange">{v.boothCode}</span></p>
                        <div className="p-2 bg-navy rounded-lg text-mist/80 italic text-[11px]">
                          "{v.reflection}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Survey Responses if any */}
              {surveys.find(s => s.participantId === selectedParticipantDetail.id) && (
                <div className="space-y-2 pt-2 border-t border-mist/15">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    <span>Exit Survey Feedback</span>
                  </h4>
                  {(() => {
                    const s = surveys.find(surv => surv.participantId === selectedParticipantDetail.id)!;
                    return (
                      <div className="p-3.5 bg-navy/70 rounded-xl border border-mist/15 space-y-2">
                        <div className="flex gap-4 flex-wrap">
                          <span>Overall Rating: <strong>{s.overallRating} / 5 ⭐</strong></span>
                          <span>Career Confidence: <strong>{s.confidenceRating} / 5</strong></span>
                          <span>Career Awareness: <strong>{s.careerAwareness} / 5</strong></span>
                        </div>
                        <p>Most Valuable Session: <strong>{s.mostUsefulBoothName}</strong></p>
                        <div className="flex gap-4 flex-wrap">
                          <span>Speaker Effectiveness: <strong>{s.speakerEffectiveness} / 5</strong></span>
                          <span>Advice Actionability: <strong>{s.careerAdviceActionability} / 5</strong></span>
                        </div>
                        {s.facilitatorFeedback && (
                          <p className="text-mist/80">Facilitator Feedback: <span className="italic">{s.facilitatorFeedback}</span></p>
                        )}
                        <p className="text-mist/80">
                          Actionable Next Steps: <span className="italic">
                            {s.actionableNextSteps.length ? s.actionableNextSteps.join(', ') : 'None'}
                            {s.actionableNextSteps.includes('Other') && s.actionableNextStepsOther ? ` (${s.actionableNextStepsOther})` : ''}
                          </span>
                        </p>
                        <p className="text-mist/80">Improvement Suggestion: <span className="italic">{s.improvement}</span></p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* TAB 3: BOOTHS MANAGEMENT & PARTICIPATION */}
      {activeTab === 'booths' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Booth Directory & Performance</h2>
              <p className="text-xs text-mist/60">Track facilitator attendance and manage booth verification codes.</p>
            </div>
            <button
              onClick={() => {
                setEditingBoothData({
                  name: '',
                  description: '',
                  location: '',
                  facilitators: [''],
                  boothCode: '',
                  isActive: true,
                  category: 'Job Readiness'
                });
                setIsEditingBooth(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-orange/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Booth</span>
            </button>
          </div>

          {/* Booths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boothParticipationStats.map(booth => (
              <div
                key={booth.id}
                className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-4 shadow-xl relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange/15 text-orange border border-orange/30">
                      {booth.category || 'Workshop'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{booth.name}</h3>
                    <p className="text-xs text-mist/60 leading-relaxed mt-0.5">{booth.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-navy/70 border border-mist/15 rounded-lg text-orange block">
                      {booth.boothCode}
                    </span>
                    <span className={`text-[10px] font-semibold ${booth.isActive ? 'text-orange' : 'text-rose-400'}`}>
                      {booth.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-mist/80 bg-navy/70 p-3 rounded-2xl border border-mist/15">
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Facilitators</span>
                    <span className="font-semibold text-mist">{booth.facilitators.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mist/40 uppercase block">Location</span>
                    <span className="font-semibold text-mist">{booth.location}</span>
                  </div>
                </div>

                {/* Attendance Count Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-mist/60">Total Attendees Verified:</span>
                    <span className="font-bold text-white font-mono">{booth.visitCount} ({booth.percentage}% of attendees)</span>
                  </div>
                  <div className="w-full h-2 bg-navy/70 rounded-full overflow-hidden border border-mist/15">
                    <div className="h-full bg-orange rounded-full" style={{ width: `${Math.min(100, booth.percentage)}%` }}></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-mist/15">
                  <button
                    onClick={() => {
                      setSelectedBoothDetail(booth);
                      setReflectionSearch('');
                    }}
                    className="text-xs text-orange hover:text-orange font-bold flex items-center gap-1"
                  >
                    <span>View {booth.reflections.length} Reflections</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBoothData(booth);
                        setIsEditingBooth(true);
                      }}
                      className="p-1.5 rounded-lg bg-navy/70 hover:bg-navy/60 text-mist/80 transition"
                      title="Edit Booth"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBooth(booth.id)}
                      className="p-1.5 rounded-lg bg-navy/70 hover:bg-rose-950 text-mist/60 hover:text-rose-400 transition"
                      title="Delete Booth"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOTH REFLECTIONS DRAWER */}
      {selectedBoothDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-mist/15 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedBoothDetail.name}</h3>
                <p className="text-xs text-mist/60">
                  Facilitated by {selectedBoothDetail.facilitators.join(', ')} • Code: <span className="font-mono text-orange">{selectedBoothDetail.boothCode}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedBoothDetail(null)}
                className="p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/70"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-mist/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search verbatim learning quotes..."
                  value={reflectionSearch}
                  onChange={(e) => setReflectionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy/70 border border-mist/15 rounded-xl text-xs text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div className="space-y-2.5">
                {visits
                  .filter(v => v.boothId === selectedBoothDetail.id && v.verificationStatus === 'verified')
                  .filter(v => v.reflection.toLowerCase().includes(reflectionSearch.toLowerCase()) || v.participantName.toLowerCase().includes(reflectionSearch.toLowerCase()))
                  .map((v) => (
                    <div key={v.id} className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-mist/60">
                        <span className="font-bold text-mist">{v.participantName}</span>
                        <span className="font-mono text-[10px]">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="italic text-mist/80 leading-relaxed">
                        "{v.reflection}"
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOTH ADD/EDIT MODAL */}
      {isEditingBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingBoothData.id ? 'Edit Booth' : 'Add New Booth'}
              </h3>
              <button
                onClick={() => setIsEditingBooth(false)}
                className="p-1.5 rounded-lg text-mist/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooth} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-mist/80 mb-1">Booth Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CV & Cover Letter Masterclass"
                  value={editingBoothData.name || ''}
                  onChange={(e) => setEditingBoothData({ ...editingBoothData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short overview of what is taught in this session..."
                  value={editingBoothData.description || ''}
                  onChange={(e) => setEditingBoothData({ ...editingBoothData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-mist/80 mb-1">Verification Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CV4827"
                    value={editingBoothData.boothCode || ''}
                    onChange={(e) => setEditingBoothData({ ...editingBoothData, boothCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-navy/70 border border-mist/25 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mist/80 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall A — Booth 1"
                    value={editingBoothData.location || ''}
                    onChange={(e) => setEditingBoothData({ ...editingBoothData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1">
                  Facilitators (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ama Mensah, Kwame Asare"
                  value={(editingBoothData.facilitators || []).join(', ')}
                  onChange={(e) => setEditingBoothData({
                    ...editingBoothData,
                    facilitators: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
                <p className="text-[10px] text-mist/40 mt-1">
                  These names will appear in the participant's facilitator dropdown to eliminate spelling errors.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeBooth"
                  checked={editingBoothData.isActive ?? true}
                  onChange={(e) => setEditingBoothData({ ...editingBoothData, isActive: e.target.checked })}
                  className="rounded text-orange"
                />
                <label htmlFor="activeBooth" className="font-semibold text-mist/80">
                  Active for verification
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingBooth(false)}
                  className="flex-1 py-2.5 rounded-xl bg-navy/70 text-mist/80 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold"
                >
                  Save Booth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SURVEYS & FEEDBACK */}
      {activeTab === 'surveys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Exit Survey Analytics ({surveys.length} Responses)</h2>
              <p className="text-xs text-mist/60">Participant satisfaction, confidence uplift, and qualitative learnings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Avg Rating Card */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Average Event Usefulness</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {surveys.length > 0
                  ? (surveys.reduce((acc, s) => acc + s.overallRating, 0) / surveys.length).toFixed(1)
                  : '0.0'} <span className="text-lg font-sans">/ 5.0</span>
              </p>
              <div className="flex justify-center gap-1 text-orange">
                {'★★★★★'}
              </div>
            </div>

            {/* Confidence Card */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Career Transition Confidence</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {surveys.length > 0
                  ? (surveys.reduce((acc, s) => acc + s.confidenceRating, 0) / surveys.length).toFixed(1)
                  : '0.0'} <span className="text-lg font-sans">/ 5.0</span>
              </p>
              <span className="text-xs text-mist/60">Post-event readiness index</span>
            </div>

            {/* Response Rate */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Survey Response Rate</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {metrics.totalAttended > 0
                  ? Math.round((surveys.length / metrics.totalAttended) * 100)
                  : 0}%
              </p>
              <span className="text-xs text-mist/60">{surveys.length} of {metrics.totalAttended} attendees</span>
            </div>

            {/* Career Awareness Card */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Career Pathway Awareness</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {surveys.length > 0
                  ? (surveys.reduce((acc, s) => acc + s.careerAwareness, 0) / surveys.length).toFixed(1)
                  : '0.0'} <span className="text-lg font-sans">/ 5.0</span>
              </p>
              <span className="text-xs text-mist/60">Non-traditional pathway awareness</span>
            </div>

            {/* Speaker Effectiveness Card */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Speaker Effectiveness</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {surveys.length > 0
                  ? (surveys.reduce((acc, s) => acc + s.speakerEffectiveness, 0) / surveys.length).toFixed(1)
                  : '0.0'} <span className="text-lg font-sans">/ 5.0</span>
              </p>
              <span className="text-xs text-mist/60">Communicated path realities well</span>
            </div>

            {/* Career Advice Actionability Card */}
            <div className="bg-navy/90 border border-mist/15 rounded-3xl p-5 space-y-2 shadow-xl text-center">
              <span className="text-[11px] font-bold uppercase text-orange">Advice Actionability</span>
              <p className="text-3xl sm:text-4xl font-black text-orange font-mono">
                {surveys.length > 0
                  ? (surveys.reduce((acc, s) => acc + s.careerAdviceActionability, 0) / surveys.length).toFixed(1)
                  : '0.0'} <span className="text-lg font-sans">/ 5.0</span>
              </p>
              <span className="text-xs text-mist/60">Actionable for current career stage</span>
            </div>
          </div>

          {/* Qualitative Feedback Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-mist/80">
              Verbatim Participant Next Steps & Improvement Notes
            </h3>

            {surveys.length === 0 ? (
              <div className="p-8 bg-navy/60 rounded-3xl border border-mist/15 text-center text-xs text-mist/40">
                No exit surveys submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map(s => (
                  <div key={s.id} className="bg-navy/90 border border-mist/15 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{s.participantName}</span>
                      <span className="font-mono text-orange font-bold">{s.overallRating}★ Useful • {s.confidenceRating}★ Confidence</span>
                    </div>

                    <div className="bg-navy/70 p-3 rounded-xl border border-mist/15 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-orange uppercase block">Actionable Next Steps:</span>
                      <p className="text-mist/80 italic">
                        "{s.actionableNextSteps.length ? s.actionableNextSteps.join(', ') : 'None'}
                        {s.actionableNextSteps.includes('Other') && s.actionableNextStepsOther ? ` (${s.actionableNextStepsOther})` : ''}"
                      </p>
                    </div>

                    {s.facilitatorFeedback && (
                      <div className="bg-navy/70 p-3 rounded-xl border border-mist/15 text-xs space-y-1.5">
                        <span className="text-[10px] font-bold text-mist/60 uppercase block">Facilitator Feedback:</span>
                        <p className="text-mist/60 italic">"{s.facilitatorFeedback}"</p>
                      </div>
                    )}

                    {s.improvement && (
                      <div className="bg-navy/70 p-3 rounded-xl border border-mist/15 text-xs space-y-1.5">
                        <span className="text-[10px] font-bold text-mist/60 uppercase block">Suggested Improvement:</span>
                        <p className="text-mist/60 italic">"{s.improvement}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE SHEETS INTEGRATION & CODE GENERATOR */}
      {activeTab === 'questions' && (
        <QuestionsAdmin eventId={eventId || 'friday-professionals-2026'} />
      )}

      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal/15 border border-teal/40 text-orange flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Google Sheets & Google Apps Script Sync</h2>
                <p className="text-xs text-mist/60">
                  Google Sheets serves as the central data store. Use Google Apps Script as the lightweight API layer.
                </p>
              </div>
            </div>

            {/* Sync Action & Feedback */}
            {syncStatusMsg && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${syncStatusMsg.type === 'success'
                  ? 'bg-teal/15 text-orange border-teal/40'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
                }`}>
                {syncStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{syncStatusMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSyncToSheets}
                disabled={isSyncing}
                className="py-3 px-4 rounded-xl bg-teal hover:bg-teal/90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-teal/30 disabled:opacity-50"
              >
                {isSyncing ? (
                  <span>Syncing with Google Sheets...</span>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Synchronize Current Data to Google Sheets</span>
                  </>
                )}
              </button>

              <button
                onClick={() => GoogleSheetsService.exportAllDatasets()}
                className="py-3 px-4 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold transition flex items-center justify-center gap-2 border border-mist/25"
              >
                <Download className="w-4 h-4 text-orange" />
                <span>Export Master M&E CSV</span>
              </button>
            </div>
          </div>

          {/* Webhook Configuration Field */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Google Apps Script Webhook Endpoint URL</h3>
            <p className="text-xs text-mist/60">
              Deploy the Apps Script below as a Web App, and paste the URL here to enable automatic real-time writes from all participant phones.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={settingsForm.appsScriptWebhookUrl || ''}
                onChange={(e) =>
                  setSettingsForm(prev => ({ ...prev, appsScriptWebhookUrl: e.target.value }))
                }
                className="flex-1 px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-xs text-white font-mono placeholder-mist/30 focus:outline-none focus:border-orange"
              />
              <button
                onClick={() => {
                  onUpdateConfig({ ...settingsForm });
                  StorageService.saveConfig(settingsForm);
                  setSyncStatusMsg({ type: 'success', text: 'Webhook URL saved successfully!' });
                }}
                className="px-4 py-2 bg-orange hover:bg-orange/90 text-white text-xs font-bold rounded-xl transition"
              >
                Save URL
              </button>
            </div>
          </div>

          {/* 6 Tabs Architecture Blueprint */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Configured Google Sheets Tabs Structure (6 Sheets)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-orange block">1. Participants</span>
                <p className="text-[11px] text-mist/60">ID, Name, Phone, Email, Institution, Education, Employment, Interest, Referral, RegisteredAt</p>
              </div>
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-orange block">2. Attendance</span>
                <p className="text-[11px] text-mist/60">Participant ID, Name, Event, Check-in Time, Status</p>
              </div>
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-blue block">3. Booths</span>
                <p className="text-[11px] text-mist/60">Booth ID, Name, Description, Location, Facilitators, Booth Code, Active</p>
              </div>
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-blue block">4. Booth Visits</span>
                <p className="text-[11px] text-mist/60">Visit ID, Participant ID, Booth Name, Facilitator, Code, Reflection, Timestamp, Status</p>
              </div>
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-orange block">5. Surveys</span>
                <p className="text-[11px] text-mist/60">Response ID, Participant ID, Overall Rating, Confidence, Most Useful, Learning, Improvement</p>
              </div>
              <div className="p-3.5 bg-navy/70 rounded-2xl border border-mist/15 space-y-1">
                <span className="font-bold text-blue block">6. M&E Summary</span>
                <p className="text-[11px] text-mist/60">Dynamic Excel/Sheets formulas for Registered, Attended, Attendance %, 4+ Completed</p>
              </div>
            </div>
          </div>

          {/* Copyable Google Apps Script Code */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Complete Google Apps Script Code (Code.gs)</h3>
                <p className="text-xs text-mist/60">Paste into Google Sheets Extensions → Apps Script to run the event API.</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(GoogleSheetsService.getAppsScriptCode());
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="px-3.5 py-2 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold transition flex items-center gap-1.5 border border-mist/25"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-orange" /> : <Copy className="w-3.5 h-3.5 text-orange" />}
                <span>{copiedScript ? 'Copied Code!' : 'Copy Code.gs'}</span>
              </button>
            </div>

            <pre className="p-4 bg-navy/70 rounded-2xl border border-mist/15 text-[11px] font-mono text-mist/80 overflow-x-auto max-h-72 leading-relaxed">
              {GoogleSheetsService.getAppsScriptCode()}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 6: EVENT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Settings Saved Notification Banner */}
          {settingsSavedMsg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border shadow-lg ${settingsSavedMsg.type === 'success'
                ? 'bg-teal/15 text-orange border-teal/40 shadow-teal/30'
                : 'bg-rose-950/90 text-rose-200 border-rose-700/80 shadow-rose-950/50'
              }`}>
              <div className="flex items-center gap-2.5">
                {settingsSavedMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-orange shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className="font-semibold text-sm">{settingsSavedMsg.text}</span>
              </div>
              <button
                onClick={() => setSettingsSavedMsg(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-mist/80 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Core Event Configuration Card */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mist/15 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange" />
                  <span>Event Configuration & Rules</span>
                </h2>
                <p className="text-xs text-mist/60 mt-0.5">
                  Update event details, verification rules, registration forms, and administrator access codes.
                </p>
              </div>

              <button
                onClick={() => {
                  StorageService.saveConfig(settingsForm);
                  onUpdateConfig(settingsForm);
                  setSettingsSavedMsg({ type: 'success', text: 'All event configuration changes saved successfully!' });
                  setTimeout(() => setSettingsSavedMsg(null), 5000);
                }}
                className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange/25 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>

            {/* Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Career Fair Name</label>
                <input
                  type="text"
                  value={settingsForm.eventName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, eventName: e.target.value })}
                  placeholder="e.g. Nexus Career Fair 2026"
                  className="w-full px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Event Date</label>
                <input
                  type="date"
                  value={settingsForm.eventDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, eventDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Venue / Physical Location</label>
                <input
                  type="text"
                  value={settingsForm.eventLocation}
                  onChange={(e) => setSettingsForm({ ...settingsForm, eventLocation: e.target.value })}
                  placeholder="e.g. Grand Exhibition Center, Main Auditorium"
                  className="w-full px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Minimum Booth Requirement</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settingsForm.minBoothsRequired}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minBoothsRequired: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-white focus:outline-none focus:border-orange"
                />
                <p className="text-[10px] text-mist/40 mt-1">Number of verified booth visits needed to unlock exit survey & certificate.</p>
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Admin Passcode</label>
                <input
                  type="text"
                  value={settingsForm.adminPasscode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPasscode: e.target.value })}
                  placeholder="e.g. mne2026"
                  className="w-full px-3.5 py-2.5 bg-navy/70 border border-mist/25 rounded-xl text-white font-mono focus:outline-none focus:border-orange"
                />
                <p className="text-[10px] text-mist/40 mt-1">Passcode used to access this M&E Admin Portal.</p>
              </div>

              <div>
                <label className="block font-bold text-mist/80 mb-1.5">Public Participant Registration</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.allowPublicRegistration ?? true}
                      onChange={(e) => setSettingsForm({ ...settingsForm, allowPublicRegistration: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-navy/70 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-mist/25 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                  </label>
                  <span className="text-xs text-mist/80 font-medium">
                    {settingsForm.allowPublicRegistration ? 'Enabled (Open Registration)' : 'Disabled (Invite / Pre-registered Only)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Demographic Collection Toggles */}
            <div className="pt-4 border-t border-mist/15 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-mist/60">Demographic Data Collection</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-navy/70 border border-mist/15 cursor-pointer hover:border-mist/25 transition">
                  <input
                    type="checkbox"
                    checked={settingsForm.registrationFields?.collectAge ?? true}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      registrationFields: {
                        ...settingsForm.registrationFields,
                        collectAge: e.target.checked,
                        collectGender: settingsForm.registrationFields?.collectGender ?? true,
                        collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                        institutionsList: settingsForm.registrationFields?.institutionsList || [],
                        careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                      }
                    })}
                    className="rounded bg-navy/70 border-mist/25 text-orange focus:ring-orange"
                  />
                  <span className="text-mist/80 font-medium">Collect Age Range (e.g. 18-20, 21-24)</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-navy/70 border border-mist/15 cursor-pointer hover:border-mist/25 transition">
                  <input
                    type="checkbox"
                    checked={settingsForm.registrationFields?.collectGender ?? true}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      registrationFields: {
                        ...settingsForm.registrationFields,
                        collectAge: settingsForm.registrationFields?.collectAge ?? true,
                        collectGender: e.target.checked,
                        collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                        institutionsList: settingsForm.registrationFields?.institutionsList || [],
                        careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                      }
                    })}
                    className="rounded bg-navy/70 border-mist/25 text-orange focus:ring-orange"
                  />
                  <span className="text-mist/80 font-medium">Collect Gender Identification</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-navy/70 border border-mist/15 cursor-pointer hover:border-mist/25 transition">
                  <input
                    type="checkbox"
                    checked={settingsForm.registrationFields?.collectReferral ?? true}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      registrationFields: {
                        ...settingsForm.registrationFields,
                        collectAge: settingsForm.registrationFields?.collectAge ?? true,
                        collectGender: settingsForm.registrationFields?.collectGender ?? true,
                        collectReferral: e.target.checked,
                        institutionsList: settingsForm.registrationFields?.institutionsList || [],
                        careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                      }
                    })}
                    className="rounded bg-navy/70 border-mist/25 text-orange focus:ring-orange"
                  />
                  <span className="text-mist/80 font-medium">Collect Referral Source</span>
                </label>
              </div>
            </div>

            {/* Educational Institutions Manager */}
            <div className="pt-4 border-t border-mist/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-mist/60">Allowed Educational Institutions</h3>
                  <p className="text-[11px] text-mist/40">Available in participant registration dropdown.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(settingsForm.registrationFields?.institutionsList || []).map((inst, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy/70 border border-mist/15 text-xs text-mist/80"
                  >
                    <span>{inst}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = settingsForm.registrationFields?.institutionsList || [];
                        const updated = current.filter((_, i) => i !== idx);
                        setSettingsForm({
                          ...settingsForm,
                          registrationFields: {
                            ...settingsForm.registrationFields,
                            collectAge: settingsForm.registrationFields?.collectAge ?? true,
                            collectGender: settingsForm.registrationFields?.collectGender ?? true,
                            collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                            careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                            institutionsList: updated,
                          }
                        });
                      }}
                      className="text-mist/40 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new institution or university..."
                  value={newInstitutionInput}
                  onChange={(e) => setNewInstitutionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newInstitutionInput.trim()) {
                      e.preventDefault();
                      const current = settingsForm.registrationFields?.institutionsList || [];
                      if (!current.includes(newInstitutionInput.trim())) {
                        setSettingsForm({
                          ...settingsForm,
                          registrationFields: {
                            ...settingsForm.registrationFields,
                            collectAge: settingsForm.registrationFields?.collectAge ?? true,
                            collectGender: settingsForm.registrationFields?.collectGender ?? true,
                            collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                            careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                            institutionsList: [...current, newInstitutionInput.trim()],
                          }
                        });
                      }
                      setNewInstitutionInput('');
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-navy/70 border border-mist/25 rounded-xl text-xs text-white focus:outline-none focus:border-orange"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newInstitutionInput.trim()) return;
                    const current = settingsForm.registrationFields?.institutionsList || [];
                    if (!current.includes(newInstitutionInput.trim())) {
                      setSettingsForm({
                        ...settingsForm,
                        registrationFields: {
                          ...settingsForm.registrationFields,
                          collectAge: settingsForm.registrationFields?.collectAge ?? true,
                          collectGender: settingsForm.registrationFields?.collectGender ?? true,
                          collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                          careerInterestsList: settingsForm.registrationFields?.careerInterestsList || [],
                          institutionsList: [...current, newInstitutionInput.trim()],
                        }
                      });
                    }
                    setNewInstitutionInput('');
                  }}
                  className="px-3.5 py-2 bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold rounded-xl transition flex items-center gap-1 border border-mist/25"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Career Interests Manager */}
            <div className="pt-4 border-t border-mist/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-mist/60">Career Paths & Tracks</h3>
                  <p className="text-[11px] text-mist/40">Available in participant career interests selection.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(settingsForm.registrationFields?.careerInterestsList || []).map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy/70 border border-mist/15 text-xs text-orange"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = settingsForm.registrationFields?.careerInterestsList || [];
                        const updated = current.filter((_, i) => i !== idx);
                        setSettingsForm({
                          ...settingsForm,
                          registrationFields: {
                            ...settingsForm.registrationFields,
                            collectAge: settingsForm.registrationFields?.collectAge ?? true,
                            collectGender: settingsForm.registrationFields?.collectGender ?? true,
                            collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                            institutionsList: settingsForm.registrationFields?.institutionsList || [],
                            careerInterestsList: updated,
                          }
                        });
                      }}
                      className="text-mist/40 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add new career track (e.g. Cyber Security)..."
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newInterestInput.trim()) {
                      e.preventDefault();
                      const current = settingsForm.registrationFields?.careerInterestsList || [];
                      if (!current.includes(newInterestInput.trim())) {
                        setSettingsForm({
                          ...settingsForm,
                          registrationFields: {
                            ...settingsForm.registrationFields,
                            collectAge: settingsForm.registrationFields?.collectAge ?? true,
                            collectGender: settingsForm.registrationFields?.collectGender ?? true,
                            collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                            institutionsList: settingsForm.registrationFields?.institutionsList || [],
                            careerInterestsList: [...current, newInterestInput.trim()],
                          }
                        });
                      }
                      setNewInterestInput('');
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-navy/70 border border-mist/25 rounded-xl text-xs text-white focus:outline-none focus:border-orange"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newInterestInput.trim()) return;
                    const current = settingsForm.registrationFields?.careerInterestsList || [];
                    if (!current.includes(newInterestInput.trim())) {
                      setSettingsForm({
                        ...settingsForm,
                        registrationFields: {
                          ...settingsForm.registrationFields,
                          collectAge: settingsForm.registrationFields?.collectAge ?? true,
                          collectGender: settingsForm.registrationFields?.collectGender ?? true,
                          collectReferral: settingsForm.registrationFields?.collectReferral ?? true,
                          institutionsList: settingsForm.registrationFields?.institutionsList || [],
                          careerInterestsList: [...current, newInterestInput.trim()],
                        }
                      });
                    }
                    setNewInterestInput('');
                  }}
                  className="px-3.5 py-2 bg-navy/70 hover:bg-navy/60 text-mist text-xs font-bold rounded-xl transition flex items-center gap-1 border border-mist/25"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="pt-4 border-t border-mist/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsForm(config)}
                className="px-4 py-2.5 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist/80 text-xs font-semibold transition border border-mist/25"
              >
                Reset to Current
              </button>
              <button
                type="button"
                onClick={() => {
                  StorageService.saveConfig(settingsForm);
                  onUpdateConfig(settingsForm);
                  setSettingsSavedMsg({ type: 'success', text: 'All event configuration changes saved successfully!' });
                  setTimeout(() => setSettingsSavedMsg(null), 5000);
                }}
                className="px-6 py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange/30"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* Reset / Cohort Data Management */}
          <div className="bg-navy/90 border border-mist/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Cohort Data Management</span>
            </h3>
            <p className="text-xs text-mist/60">
              Reset data to test different event scenarios or clear all participants for the real event day.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Clear All Event Data',
                    message: 'Are you sure you want to erase all participants, check-in records, booth visits, and survey responses? This provides a clean slate for the live event.',
                    confirmLabel: 'Clear All Data (Clean Start)',
                    isDestructive: true,
                    onConfirm: () => {
                      StorageService.clearAllData();
                      reloadData();
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      setSettingsSavedMsg({ type: 'success', text: 'All event data cleared. Starting with a clean slate.' });
                    }
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800 transition"
              >
                Clear All Event Data (Clean Start)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${confirmDialog.isDestructive
                  ? 'bg-rose-950 border border-rose-800 text-rose-400'
                  : 'bg-orange/15 border border-orange/30 text-orange'
                }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmDialog.title}</h3>
                <p className="text-xs text-mist/60">Please confirm your action</p>
              </div>
            </div>

            <p className="text-xs text-mist/80 leading-relaxed bg-navy/70 p-3.5 rounded-2xl border border-mist/15">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl bg-navy/70 hover:bg-navy/60 text-mist/80 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-orange hover:bg-orange/90 text-white shadow-orange/30'
                  }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
