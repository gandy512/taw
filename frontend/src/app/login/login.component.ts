import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal<string | null>(null);

  constructor(protected auth: AuthService, private router: Router) {}

  login(role: Role): void {
    this.error.set(null);
    this.auth.login(this.username, this.password, role).subscribe({
      next: () => {
        this.password = '';
        if (role === 'admin') {
          this.router.navigateByUrl('/admin');
        } else if (role === 'student') {
          this.router.navigateByUrl('/student');
        } else if (role === 'lecturer') {
          this.router.navigateByUrl('/lecturer');
        }
      },
      error: () => {
        this.error.set('Credenziali non valide.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
