import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsService } from '../../services/students.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent {
  username = '';
  password = '';
  name = '';
  surname = '';
  course = '';
  email = '';
  error = signal<string | null>(null);

  constructor(private studentsService: StudentsService, private router: Router) {}

  submit(): void {
    this.error.set(null);
    this.studentsService
      .create({
        username: this.username,
        password: this.password,
        name: this.name,
        surname: this.surname,
        course: this.course,
        email: this.email,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/admin/students'),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.error ?? 'Errore durante la creazione.');
        },
      });
  }
}
