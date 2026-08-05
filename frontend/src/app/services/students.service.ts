import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewStudent, StudentSummary } from '../models/student.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly apiUrl = `${API_URL}/admin/students`;

  constructor(private http: HttpClient) {}

  list(): Observable<StudentSummary[]> {
    return this.http.get<StudentSummary[]>(this.apiUrl);
  }

  create(student: NewStudent): Observable<StudentSummary> {
    return this.http.post<StudentSummary>(this.apiUrl, student);
  }
}
