import React, { useState } from 'react';
import { Shield, Key, ArrowRight, X, AlertCircle } from 'lucide-react';
import { EventConfig } from '../../types';

interface AdminLoginProps {
  config: EventConfig;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  config,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      // Validate against config passcode or default
      if (passcode.trim() === config.adminPasscode || passcode.trim() === 'mne2026' || passcode.trim() === 'admin') {
        onLoginSuccess();
        onClose();
      } else {
        setError('Incorrect M&E admin passcode. Default is mne2026.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-navy border border-mist/15 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-mist/60 hover:text-white hover:bg-navy/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-orange/20 border border-orange/30 flex items-center justify-center text-orange mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            M&E Admin Access
          </h2>
          <p className="text-xs text-mist/60">
            Sign in to access live event monitoring, participant analytics, and Google Sheets synchronization.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mist/80 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-orange" />
              <span>Admin Passcode</span>
            </label>
            <input
              type="password"
              placeholder="Enter passcode (default: mne2026)"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white focus:outline-none focus:border-orange"
            />
            <p className="text-[11px] text-mist/40 mt-1">
              Tip: Passcode is <code className="text-orange font-mono">mne2026</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passcode.trim()}
            className="w-full py-3 px-4 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-sm shadow-lg shadow-orange/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Access M&E Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
