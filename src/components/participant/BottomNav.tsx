import React from 'react';
import { Home, Compass, Award, UserCheck } from 'lucide-react';

export type ParticipantTab = 'home' | 'booths' | 'progress' | 'profile';

interface BottomNavProps {
  activeTab: ParticipantTab;
  onChangeTab: (tab: ParticipantTab) => void;
  completedBoothsCount: number;
  minRequired: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  completedBoothsCount,
  minRequired,
}) => {
  const tabs = [
    { id: 'home' as ParticipantTab, label: 'Home', icon: Home },
    { id: 'booths' as ParticipantTab, label: 'Booths', icon: Compass },
    {
      id: 'progress' as ParticipantTab,
      label: 'Progress',
      icon: Award,
      badge: `${completedBoothsCount}/${minRequired}`
    },
    { id: 'profile' as ParticipantTab, label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1.5 rounded-full transition-all ${
                isActive
                  ? 'text-orange font-semibold'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    completedBoothsCount >= minRequired
                      ? 'bg-teal text-navy'
                      : 'bg-orange text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-orange rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
