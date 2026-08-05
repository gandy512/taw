import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminApplicationDetail,
  ApplicationSummary,
  NewApplication,
  StudentApplicationDetail,
  StudentApplicationSummary,
} from '../models/application.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly adminUrl = `${API_URL}/admin/applications`;
  private readonly studentUrl = `${API_URL}/student/applications`;

  constructor(private http: HttpClient) {}

  list(): Observable<ApplicationSummary[]> {
    return this.http.get<ApplicationSummary[]>(this.adminUrl);
  }

  get(id: string): Observable<AdminApplicationDetail> {
    return this.http.get<AdminApplicationDetail>(`${this.adminUrl}/${id}`);
  }

  terminate(id: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/${id}/terminate`, {});
  }

  cancel(id: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/${id}/cancel`, {});
  }

  verifyPreDeparture(id: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.adminUrl}/${id}/verify-pre-departure`, {});
  }

  listMine(): Observable<StudentApplicationSummary[]> {
    return this.http.get<StudentApplicationSummary[]>(this.studentUrl);
  }

  create(application: NewApplication): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.studentUrl, application);
  }

  getMine(id: string): Observable<StudentApplicationDetail> {
    return this.http.get<StudentApplicationDetail>(`${this.studentUrl}/${id}`);
  }

  cancelMine(id: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.studentUrl}/${id}/cancel`, {});
  }

  confirmPlan(id: string, start: string, moduleIds: string[], file: File | null): Observable<{ ok: true }> {
    const formData = new FormData();
    formData.append('start', start);
    formData.append('modules', JSON.stringify(moduleIds));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<{ ok: true }>(`${this.studentUrl}/${id}/plan`, formData);
  }

  proposeModification(
    id: string,
    moduleIds: string[],
    modificationReason: string,
    file: File | null
  ): Observable<{ ok: true }> {
    const formData = new FormData();
    formData.append('modules', JSON.stringify(moduleIds));
    formData.append('modification_reason', modificationReason);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<{ ok: true }>(`${this.studentUrl}/${id}/propose-modification`, formData);
  }

  completeMobility(
    id: string,
    finish: string,
    grades: { mappingId: string; grade: number; examDate: string }[],
    file: File | null
  ): Observable<{ ok: true }> {
    const formData = new FormData();
    formData.append('finish', finish);
    formData.append('grades', JSON.stringify(grades));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<{ ok: true }>(`${this.studentUrl}/${id}/complete`, formData);
  }

  downloadTranscriptOfRecords(id: string): Observable<Blob> {
    return this.http.get(`${this.studentUrl}/${id}/transcript-of-records`, { responseType: 'blob' });
  }

  downloadNewLearningAgreement(id: string): Observable<Blob> {
    return this.http.get(`${this.studentUrl}/${id}/new-learning-agreement`, { responseType: 'blob' });
  }
}
