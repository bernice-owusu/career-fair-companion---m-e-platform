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
  'Pharmacovigilance',
  'Supply Chain',
  'Health-Tech / Digital Health',
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
  'Pharmacovigilance',
  'Supply Chain',
  'Health-Tech / Digital Health',
  'Other',
];

export const CAREER_STAGE_OPTIONS = [
  'Pharmacy graduate (Awaiting December Professional Exams)',
  'House Officer / Intern Pharmacist',
  'Early-Career Pharmacist (1–3 years post-licensure)',
  'Mid-to-Senior Level Pharmacist',
];

export const CAREER_CHALLENGES_OPTIONS = [
  'Limited awareness of diverse career options outside hospital/community practice',
  'Lack of structured mentorship or professional networks',
  'Gaps in practical employability skills (CV writing, LinkedIn branding, interviewing)',
  'Geographic or institutional isolation (limited access to employers/fairs)',
  'Scarcity of formal entry-level opportunities or public sector openings',
  'Other',
];

export const ACTIONABLE_NEXT_STEPS_OPTIONS = [
  'Updating my CV for industry roles',
  'Reaching out to a mentor I met today',
  'Applying for a pharmacovigilance internship',
  'Exploring non-traditional career pathways online',
  'Joining a professional network or association',
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

export const CAREER_AWARENESS_LABELS: Record<number, string> = {
  1: 'Very Low / Unaware',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High / Well-Informed',
};

export const CAREER_TRANSITION_CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Not Confident at all',
  2: 'Slightly Confident',
  3: 'Moderately Confident',
  4: 'Confident',
  5: 'Extremely Confident',
};

// Characters used for registration codes. Ambiguous pairs (O/0, I/1, S/5) are excluded.
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';
export const CODE_DIGITS = 6;