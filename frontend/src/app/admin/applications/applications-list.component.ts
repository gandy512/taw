import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApplicationsService } from '../../services/applications.service';
import { ApplicationSummary } from '../../models/application.model';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './applications-list.component.html',
})
export class ApplicationsListComponent implements OnInit {
  applications = signal<ApplicationSummary[]>([]);

  constructor(private applicationsService: ApplicationsService, private router: Router) {}

  ngOnInit(): void {
    this.applicationsService.list().subscribe((applications) => this.applications.set(applications));
  }

  open(id: string): void {
    this.router.navigate(['/admin/applications', id]);
  }
}
