import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LecturerApplicationDetail, LecturerApplicationSummary } from '../models/application.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class LecturerApplicationsService {
  private readonly apiUrl = `${API_URL}/lecturer/applications`;

  constructor(private http: HttpClient) {}

  list(): Observable<LecturerApplicationSummary[]> {
    return this.http.get<LecturerApplicationSummary[]>(this.apiUrl);
  }

  get(id: string): Observable<LecturerApplicationDetail> {
    return this.http.get<LecturerApplicationDetail>(`${this.apiUrl}/${id}`);
  }

  downloadLearningAgreement(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/learning-agreement`, { responseType: 'blob' });
  }

  decide(id: string, decision: 'acceptance' | 'rejection', reason?: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${id}/decision`, { decision, reason });
  }

  downloadTranscriptOfRecords(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/transcript-of-records`, { responseType: 'blob' });
  }

  setConvertedGrade(id: string, mappingId: string, gradeCf: number): Observable<{ grade_cf: number }> {
    return this.http.patch<{ grade_cf: number }>(`${this.apiUrl}/${id}/mapping/${mappingId}/grade`, {
      grade_cf: gradeCf,
    });
  }

  downloadNewLearningAgreement(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/new-learning-agreement`, { responseType: 'blob' });
  }

  decideModification(id: string, decision: 'acceptance' | 'rejection', reason?: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${id}/modification-decision`, { decision, reason });
  }
}
