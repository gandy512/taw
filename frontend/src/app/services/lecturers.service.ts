import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LecturerSummary, NewLecturer } from '../models/lecturer.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class LecturersService {
  private readonly listUrl = `${API_URL}/lecturers`;
  private readonly adminUrl = `${API_URL}/admin/lecturers`;

  constructor(private http: HttpClient) {}

  list(): Observable<LecturerSummary[]> {
    return this.http.get<LecturerSummary[]>(this.listUrl);
  }

  create(lecturer: NewLecturer): Observable<LecturerSummary> {
    return this.http.post<LecturerSummary>(this.adminUrl, lecturer);
  }
}
