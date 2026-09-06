// Shared option lists for the Nexus Career Fair pre-registration questionnaire
// and M&E reporting. Kept in one place so forms, validation, and analytics agree.

export const EDUCATION_OPTIONS = ['BPharm', 'PharmD', "Master's", 'PhD', 'Student'];

export const AREA_OF_PRACTICE_OPTIONS = [
  'Hospitals',
  'Community',
  'Industry',
  'Marketing',
  'Academia & Research',
  'Regulatory',
  'Other',
];

export const REGION_OPTIONS = [
  'Ashanti',
  'Brong Ahafo',
  'Central',
  'Eastern',
  'Greater Accra',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
];

export const CAREER_PATH_OPTIONS = [
  'Hospital',
  'Community',
  'Industry',
  'Academia',
  'Marketing',
  'Regulatory',
  'Other',
];

export const CAREER_FAIR_EXPECTATIONS_OPTIONS = [
  'To gather unbiased information on different career pathways available',
  'To network with industry professionals',
  'To secure a new job',
  'To get assistance with creating a good résumé/CV',
  'Other',
];

export const CAREER_TRACK_OPTIONS = [
  'International Development',
  'Pharmacovigilance & Patient Safety',
  'Insurance & Payer Services',
  'Business & Commerce',
  'Supply Chain Management',
  'Law',
  'Media & Acting',
  'Clinical Trials & Research',
  'Product Development & Management',
  'School & Scholarships',
  'Software Engineering',
  'Market Intelligence',
];

export const HOW_HEARD_OPTIONS = [
  'Twitter/X',
  'WhatsApp',
  'PSGH Communications',
  'Through a friend/colleague',
  'Other',
];

export const RESUME_QUALITY_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Very Good',
};

export const INTERVIEW_CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Not Confident',
  2: 'Slightly Confident',
  3: 'Neutral',
  4: 'Confident',
  5: 'Very Confident',
};

// Characters used for registration codes. Ambiguous pairs (O/0, I/1, S/5) are excluded.
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';
export const CODE_DIGITS = 6;