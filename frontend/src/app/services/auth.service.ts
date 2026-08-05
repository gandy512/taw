import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginResponse, Role } from '../models/auth.model';
import { API_URL } from './api-config';

const TOKEN_KEY = 'overseas_token';
const USER_KEY = 'overseas_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_URL}/auth`;
  readonly currentUser = signal<AuthUser | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(username: string, password: string, role: Role): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password, role }).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
