export type Decision = "acceptance" | "rejection";
export type Semester = "Winter" | "Summer" | "FullYear";
export type AdminStatus = "default" | "pre_departure_verified" | "canceled" | "terminated";

export interface Application {
  id: string;
  student: string;
  host: string;
  lecturer: string;
  year: number;
  semester: Semester;
  start?: Date;
  finish?: Date;
  learning_agreement?: string;
  new_learning_agreement?: string;
  transcript_of_records?: string;
  last_modification?: Date;
  last_decision?: Decision;
  last_decision_date?: Date;
  last_decision_reason?: string;
  grades_approved_date?: Date;
  admin_status: AdminStatus;
}

export interface NewApplication {
  host: string;
  lecturer: string;
  year: number;
  semester: Semester;
}

export interface ApplicationSummary {
  id: string;
  student: { id: string; name: string; surname: string; username: string };
  lecturer: { id: string; name: string; surname: string; username: string };
  host: { id: string; name: string; country: string; city: string };
  status: AdminStatus;
}

export interface StudentApplicationSummary {
  id: string;
  lecturer: { id: string; name: string; surname: string; username: string };
  host: { id: string; name: string; country: string; city: string };
  year: number;
  semester: Semester;
  status: AdminStatus;
}

export interface ApplicationMappingEntry {
  id: string;
  module: { id: string; code: string; name: string; credits: number; host: string | null };
  grade?: number;
  grade_cf?: number;
  exam_date?: string;
}

export interface StudentApplicationDetail {
  id: string;
  lecturer: { id: string; name: string; surname: string; username: string };
  host: { id: string; name: string; country: string; city: string };
  year: number;
  semester: Semester;
  start?: string;
  finish?: string;
  learning_agreement?: string;
  new_learning_agreement?: string;
  modification_reason?: string;
  transcript_of_records?: string;
  last_decision?: Decision;
  last_decision_reason?: string;
  last_modification_decision?: Decision;
  last_modification_decision_reason?: string;
  grades_approved_date?: string;
  mapping: ApplicationMappingEntry[];
  new_mapping: ApplicationMappingEntry[];
  status: AdminStatus;
}

export interface LecturerApplicationSummary {
  id: string;
  student: { id: string; name: string; surname: string; username: string };
  host: { id: string; name: string; country: string; city: string };
  year: number;
  semester: Semester;
  status: AdminStatus;
}

export interface LecturerApplicationDetail {
  id: string;
  student: { id: string; name: string; surname: string; username: string; email: string };
  host: { id: string; name: string; country: string; city: string };
  year: number;
  semester: Semester;
  start?: string;
  finish?: string;
  learning_agreement?: string;
  new_learning_agreement?: string;
  modification_reason?: string;
  transcript_of_records?: string;
  last_decision?: Decision;
  last_decision_reason?: string;
  last_modification_decision?: Decision;
  last_modification_decision_reason?: string;
  grades_approved_date?: string;
  mapping: ApplicationMappingEntry[];
  new_mapping: ApplicationMappingEntry[];
  status: AdminStatus;
}

export interface AdminApplicationDetail {
  id: string;
  student: { id: string; name: string; surname: string; username: string; email: string };
  lecturer: { id: string; name: string; surname: string; username: string };
  host: { id: string; name: string; country: string; city: string };
  year: number;
  semester: Semester;
  start?: string;
  finish?: string;
  learning_agreement?: string;
  transcript_of_records?: string;
  last_decision?: Decision;
  last_decision_reason?: string;
  grades_approved_date?: string;
  mapping: ApplicationMappingEntry[];
  status: AdminStatus;
}
