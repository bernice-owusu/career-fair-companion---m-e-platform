import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Info } from 'lucide-react';
import { CareerFairEvent, MondayRegistrationData } from '../../types';
import { StorageService } from '../../services/storageService';

interface MondayRegistrationFormProps {
  event: CareerFairEvent;
  onSubmit: (data: MondayRegistrationData) => void;
  onCancel: () => void;
}

const baseInputClass =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-navy placeholder:text-slate-300 focus:outline-none focus:border-orange transition';

const YEAR_OF_STUDY_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Other'];

const FieldError: React.FC<{ field: string; errors: Record<string, string> }> = ({ field, errors }) =>
  errors[field] ? <p className="text-[11px] text-error font-semibold mt-1">{errors[field]}</p> : null;

export const MondayRegistrationForm: React.FC<MondayRegistrationFormProps> = ({ event, onSubmit, onCancel }) => {
  const config = StorageService.getConfig();
  const institutions = config.registrationFields.institutionsList;

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setError = (field: string, value: string) => setErrors(prev => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'This field is required.';
    if (!surname.trim()) next.surname = 'This field is required.';
    if (!email.trim()) next.email = 'This field is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!institution.trim()) next.institution = 'Please select your school.';
    if (!yearOfStudy.trim()) next.yearOfStudy = 'Please select your year of study.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    onSubmit({
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim().toLowerCase(),
      institution,
      yearOfStudy,
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-lg p-5 sm:p-6 shadow-card space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full bg-orange/20 border border-orange/30 text-orange flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
            Students' Career Fair — Register
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {event.name} · {event.date} · {event.time} · {event.venue}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              First Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Adwoa"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setError('firstName', ''); }}
              className={baseInputClass}
            />
            <FieldError field="firstName" errors={errors} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Surname <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Entsua"
              value={surname}
              onChange={e => { setSurname(e.target.value); setError('surname', ''); }}
              className={baseInputClass}
            />
            <FieldError field="surname" errors={errors} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Email <span className="text-error">*</span>
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
            Institution / School <span className="text-error">*</span>
          </label>
          <select
            value={institution}
            onChange={e => { setInstitution(e.target.value); setError('institution', ''); }}
            className={baseInputClass}
          >
            <option value="">Select your school...</option>
            {institutions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <FieldError field="institution" errors={errors} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-orange mb-1.5">
            Year of Study <span className="text-error">*</span>
          </label>
          <select
            value={yearOfStudy}
            onChange={e => { setYearOfStudy(e.target.value); setError('yearOfStudy', ''); }}
            className={baseInputClass}
          >
            <option value="">Select your year...</option>
            {YEAR_OF_STUDY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            All pharmacy students are welcome.
          </p>
          <FieldError field="yearOfStudy" errors={errors} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-orange hover:bg-orange/90 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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