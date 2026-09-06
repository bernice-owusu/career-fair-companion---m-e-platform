import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, UserPlus, Info } from 'lucide-react';
import { WalkInRegistrationData } from '../../types';

interface WalkInRegistrationFormProps {
  onSubmit: (data: WalkInRegistrationData) => void;
  onCancel: () => void;
}

const baseInputClass =
  'w-full px-3.5 py-2.5 bg-navy border border-mist/25 rounded-xl text-sm text-white placeholder-mist/40 focus:outline-none focus:border-orange transition';

// Module-scope helper — must NOT be defined inside the render body, otherwise
// a fresh component identity each render makes React remount the subtree on
// every keystroke and the inputs lose focus (type one-by-one bug).
const FieldError: React.FC<{ field: string; errors: Record<string, string> }> = ({ field, errors }) =>
  errors[field] ? <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors[field]}</p> : null;

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({ onSubmit, onCancel }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setError = (field: string, value: string) => {
    setErrors(prev => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'This field is required.';
    if (!email.trim()) next.email = 'This field is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!phone.trim()) next.phone = 'This field is required.';
    else if (phone.replace(/[^0-9+]/g, '').length < 8) next.phone = 'Please enter a valid phone number.';
    if (!registrationNumber.trim()) next.registrationNumber = 'This field is required.';
    else if (!/^\d+$/.test(registrationNumber.trim())) next.registrationNumber = 'Registration numbers should contain numbers only.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      psghRegistrationNumber: registrationNumber.trim(),
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-mist/60 hover:text-white transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <form onSubmit={handleSubmit} className="bg-navy/90 border border-mist/15 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-orange/20 border border-orange/30 text-orange flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Register In Person
          </h1>
          <p className="text-xs text-mist/60 max-w-sm mx-auto">
            A few quick details and you're in. You'll receive your registration code instantly.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Bernice Owusu"
            value={fullName}
            onChange={e => { setFullName(e.target.value); setError('fullName', ''); }}
            className={baseInputClass}
          />
          <FieldError field="fullName" errors={errors} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Email <span className="text-rose-400">*</span>
          </label>
          <input
            type="email"
            placeholder="e.g. you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('email', ''); }}
            className={baseInputClass}
          />
          <FieldError field="email" errors={errors} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Phone <span className="text-rose-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. +233 24 555 0101"
            value={phone}
            onChange={e => { setPhone(e.target.value); setError('phone', ''); }}
            className={baseInputClass}
          />
          <FieldError field="phone" errors={errors} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Registration Number <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 20981"
            value={registrationNumber}
            onChange={e => { setRegistrationNumber(e.target.value.replace(/[^0-9]/g, '')); setError('registrationNumber', ''); }}
            className={`${baseInputClass} font-mono`}
          />
          <p className="text-[11px] text-mist/60 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            Students can enter 0000 if they do not have a registration number yet.
          </p>
          <FieldError field="registrationNumber" errors={errors} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-base shadow-lg shadow-orange/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Registering...
            </span>
          ) : (
            <>
              <span>Register & Check In</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};