import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Module } from '../models/module.model';
import { API_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class ModulesService {
  private readonly apiUrl = `${API_URL}/modules`;

  constructor(private http: HttpClient) {}

  list(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }
}
