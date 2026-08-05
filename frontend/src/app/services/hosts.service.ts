import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Host, NewHost } from '../models/host.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class HostsService {
  private readonly listUrl = `${API_URL}/hosts`;
  private readonly adminUrl = `${API_URL}/admin/hosts`;

  constructor(private http: HttpClient) {}

  list(): Observable<Host[]> {
    return this.http.get<Host[]>(this.listUrl);
  }

  create(host: NewHost): Observable<Host> {
    return this.http.post<Host>(this.adminUrl, host);
  }
}
