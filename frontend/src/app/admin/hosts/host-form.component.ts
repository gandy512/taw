import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HostsService } from '../../services/hosts.service';

@Component({
  selector: 'app-host-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './host-form.component.html',
})
export class HostFormComponent {
  name = '';
  country = '';
  city = '';
  email = '';
  error = signal<string | null>(null);

  constructor(private hostsService: HostsService, private router: Router) {}

  submit(): void {
    this.error.set(null);
    this.hostsService
      .create({ name: this.name, country: this.country, city: this.city, email: this.email })
      .subscribe({
        next: () => this.router.navigateByUrl('/admin/hosts'),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.error ?? 'Errore durante la creazione.');
        },
      });
  }
}
