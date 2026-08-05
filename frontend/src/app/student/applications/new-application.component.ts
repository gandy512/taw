import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HostsService } from '../../services/hosts.service';
import { LecturersService } from '../../services/lecturers.service';
import { ApplicationsService } from '../../services/applications.service';
import { Host } from '../../models/host.model';
import { LecturerSummary } from '../../models/lecturer.model';
import { Semester } from '../../models/application.model';

@Component({
  selector: 'app-new-application',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './new-application.component.html',
})
export class NewApplicationComponent implements OnInit {
  hosts = signal<Host[]>([]);
  lecturers = signal<LecturerSummary[]>([]);

  host = '';
  lecturer = '';
  year = new Date().getFullYear();
  semester: Semester | '' = '';

  error = signal<string | null>(null);

  constructor(
    private hostsService: HostsService,
    private lecturersService: LecturersService,
    private applicationsService: ApplicationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hostsService.list().subscribe((hosts) => this.hosts.set(hosts));
    this.lecturersService.list().subscribe((lecturers) => this.lecturers.set(lecturers));
  }

  submit(): void {
    this.error.set(null);
    if (!this.semester) {
      return;
    }
    this.applicationsService
      .create({ host: this.host, lecturer: this.lecturer, year: this.year, semester: this.semester })
      .subscribe({
        next: () => this.router.navigateByUrl('/student'),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.error ?? 'Errore durante la creazione.');
        },
      });
  }
}
