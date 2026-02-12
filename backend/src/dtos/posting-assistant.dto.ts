// backend/src/dtos/posting-assistant.dto.ts

export interface PolishTextRequest {
  text: string;
  fieldType:
    | "title"
    | "description"
    | "eligibility"
    | "benefits"
    | "instructions"
    | "summary";
  context?: {
    scholarshipType?: string;
    educationLevel?: string;
    fieldOfStudy?: string[];
  };
}

export interface PolishTextResponse {
  originalText: string;
  polishedText: string;
  improvements: string[];
  changesCount: number;
}

export interface CompletenessAnalysisRequest {
  formData: Partial<ScholarshipFormData>;
}

export interface CompletenessAnalysisResponse {
  score: number; // 0-100
  completedFields: string[];
  missingFields: MissingField[];
  suggestions: string[];
  criticalMissing: string[];
}

export interface MissingField {
  fieldName: string;
  displayName: string;
  importance: "critical" | "recommended" | "optional";
  suggestion: string;
}

export interface ScholarshipFormData {
  // Step 1
  title?: string;
  organization_name?: string;
  short_summary?: string;

  // Step 2
  description?: string;
  eligibility_criteria?: string;
  benefits?: string;
  deadline?: Date;

  // Step 3
  country?: string;
  education_level?: string;
  scholarship_type?: string;
  fields_of_study?: string[];
  min_gpa?: number;

  // Step 4
  min_age?: number;
  max_age?: number;
  eligibility_gender?: string;
  requires_disability?: boolean;
  income_level?: string;
  eligibility_countries?: string[];

  // Step 5
  application_link?: string;
  application_instructions?: string;
  contact_email?: string;
  contact_phone?: string;

  // Step 6
  admin_notes?: string;
  has_flyer?: boolean;
  has_banner?: boolean;
  has_verification_docs?: boolean;
}

export interface GenerateSuggestionRequest {
  fieldType: "eligibility" | "benefits" | "instructions";
  context: {
    scholarshipType: string;
    educationLevel: string;
    fieldsOfStudy: string[];
    country?: string;
  };
}

export interface GenerateSuggestionResponse {
  suggestions: string[];
  template: string;
}
