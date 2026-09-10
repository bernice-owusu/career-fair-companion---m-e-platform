import { supabase } from './supabaseClient';
import { Participant } from '../types';

export const SupabaseService = {
  async insertRegistration(
    participant: Participant & { eventName: string }
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('registrations').insert({
      participant_id: participant.id,
      code: participant.code,
      event_id: participant.eventId,
      event_name: participant.eventName,
      full_name: participant.fullName,
      email: participant.email,
      phone: participant.phone,
      registered_at: participant.registeredAt,
      registration_type: participant.registrationType,
      registered_before_event: participant.registeredBeforeEvent,
      checked_in: participant.checkedIn,
      checked_in_at: participant.checkedInAt ?? null,
      event_date: participant.eventDate ?? null,
      first_name: participant.firstName ?? null,
      surname: participant.surname ?? null,
      psgh_registration_number: participant.psghRegistrationNumber ?? null,
      year_of_completion: participant.yearOfCompletion ?? null,
      highest_education: participant.highestEducation ?? null,
      current_job_title: participant.currentJobTitle ?? null,
      institution: participant.institution ?? null,
      year_of_study: participant.yearOfStudy ?? null,
      current_area_of_practice: participant.currentAreaOfPractice ?? null,
      current_area_other: participant.currentAreaOther ?? null,
      region_of_residence: participant.regionOfResidence ?? null,
      ideal_career_path: participant.idealCareerPath ?? null,
      ideal_career_path_other: participant.idealCareerPathOther ?? null,
      career_fair_expectations: participant.careerFairExpectations ?? null,
      career_fair_expectations_other: participant.careerFairExpectationsOther ?? null,
      career_tracks: participant.careerTracks ?? null,
      skills_lab_resume_assistance: participant.skillsLabResumeAssistance ?? null,
      skills_lab_resume_assistance_other: participant.skillsLabResumeAssistanceOther ?? null,
      resume_quality: participant.resumeQuality ?? null,
      cv_uploaded: participant.cvUploaded ?? null,
      cv_file_name: participant.cvFileName ?? null,
      cv_link: participant.cvLink ?? null,
      interview_confidence: participant.interviewConfidence ?? null,
      mock_interview: participant.mockInterview ?? null,
      heard_about_career_fair: participant.heardAboutCareerFair ?? null,
      heard_about_career_fair_other: participant.heardAboutCareerFairOther ?? null,
      attended_last_year: participant.attendedLastYear ?? null,
      facilitator_questions: participant.facilitatorQuestions ?? null,
      // utm_source/medium/campaign intentionally omitted — column exists
      // (nullable) for Phase 5, no capture/passthrough wired yet.
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
