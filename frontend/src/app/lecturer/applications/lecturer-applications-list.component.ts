import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LecturerApplicationsService } from '../../services/lecturer-applications.service';
import { AuthService } from '../../services/auth.service';
import { LecturerApplicationSummary } from '../../models/application.model';

@Component({
  selector: 'app-lecturer-applications-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lecturer-applications-list.component.html',
})
export class LecturerApplicationsListComponent implements OnInit {
  applications = signal<LecturerApplicationSummary[]>([]);

  constructor(
    private applicationsService: LecturerApplicationsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationsService.list().subscribe((applications) => this.applications.set(applications));
  }

  open(id: string): void {
    this.router.navigate(['/lecturer', id]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
