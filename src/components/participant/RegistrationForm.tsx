import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Phone, Mail, GraduationCap, Briefcase, Compass, Users, Sparkles } from 'lucide-react';
import { EventConfig, Participant } from '../../types';

interface RegistrationFormProps {
  config: EventConfig;
  onSubmit: (data: Omit<Participant, 'id' | 'code' | 'registeredAt'>) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  config,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    institution: config.registrationFields.institutionsList[0] || 'University of Ghana (UG)',
    customInstitution: '',
    educationLevel: 'Bachelor\'s Degree',
    employmentStatus: 'Recent Graduate / Job Seeker',
    careerInterest: config.registrationFields.careerInterestsList[0] || 'Software Engineering & AI',
    ageRange: '21-24',
    gender: 'Female',
    referralSource: 'Social Media / LinkedIn'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.institution === 'Other / Self-Taught' && !formData.customInstitution.trim()) {
      newErrors.customInstitution = 'Please specify your institution or background';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalInstitution = formData.institution === 'Other / Self-Taught' && formData.customInstitution.trim()
      ? formData.customInstitution.trim()
      : formData.institution;

    onSubmit({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      institution: finalInstitution,
      educationLevel: formData.educationLevel,
      employmentStatus: formData.employmentStatus,
      careerInterest: formData.careerInterest,
      ageRange: formData.ageRange,
      gender: formData.gender,
      referralSource: formData.referralSource
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-900">
          Step 1 of 2: Registration
        </span>
      </div>

      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Participant Registration</span>
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Please provide your details below. You will instantly receive your unique Participant Code for event check-in and booth tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-3.5 h-3.5" />
            <span>Personal Information</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bernice Owusu"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+233 24 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                  errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Education & Background */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education & Background</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Institution / University <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {config.registrationFields.institutionsList.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {formData.institution === 'Other / Self-Taught' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specify Institution / Organization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter institution name"
                value={formData.customInstitution}
                onChange={(e) => setFormData({ ...formData, customInstitution: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.customInstitution && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.customInstitution}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Education Level
              </label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Undergraduate (1st/2nd Year)">Undergraduate (1st/2nd Year)</option>
                <option value="Undergraduate (Final Year)">Undergraduate (Final Year)</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Diploma / HND">Diploma / HND</option>
                <option value="Master's Degree / PhD">Master's Degree / PhD</option>
                <option value="High School / Senior High">High School / Senior High</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Recent Graduate / Job Seeker">Recent Graduate / Job Seeker</option>
                <option value="Employed (Looking to Switch)">Employed (Looking to Switch)</option>
                <option value="Self-Employed / Founder">Self-Employed / Founder</option>
                <option value="National Service Personnel">National Service Personnel</option>
                <option value="Intern / Apprentice">Intern / Apprentice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Career Interest
            </label>
            <select
              value={formData.careerInterest}
              onChange={(e) => setFormData({ ...formData, careerInterest: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {config.registrationFields.careerInterestsList.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: M&E Demographics (Configurable) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>M&E Demographics</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {config.registrationFields.collectAge && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Age Range
                </label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="18-20">18 - 20</option>
                  <option value="21-24">21 - 24</option>
                  <option value="25-29">25 - 29</option>
                  <option value="30-34">30 - 34</option>
                  <option value="35+">35+</option>
                </select>
              </div>
            )}

            {config.registrationFields.collectGender && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            )}
          </div>

          {config.registrationFields.collectReferral && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                How did you hear about this career fair?
              </label>
              <select
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Social Media / LinkedIn">Social Media / LinkedIn</option>
                <option value="University Notice Board">University Notice Board</option>
                <option value="Friend / Word of Mouth">Friend / Word of Mouth</option>
                <option value="Email Newsletter">Email Newsletter</option>
                <option value="Lecturer / Career Advisor">Lecturer / Career Advisor</option>
                <option value="WhatsApp Community">WhatsApp Community</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Generating Participant Code...
            </span>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
