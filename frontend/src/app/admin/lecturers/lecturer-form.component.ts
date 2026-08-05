import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LecturersService } from '../../services/lecturers.service';

@Component({
  selector: 'app-lecturer-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './lecturer-form.component.html',
})
export class LecturerFormComponent {
  username = '';
  password = '';
  name = '';
  surname = '';
  email = '';
  error = signal<string | null>(null);

  constructor(private lecturersService: LecturersService, private router: Router) {}

  submit(): void {
    this.error.set(null);
    this.lecturersService
      .create({
        username: this.username,
        password: this.password,
        name: this.name,
        surname: this.surname,
        email: this.email,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/admin/lecturers'),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.error ?? 'Errore durante la creazione.');
        },
      });
  }
}
