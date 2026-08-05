import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApplicationsService } from '../../services/applications.service';
import { StudentApplicationSummary } from '../../models/application.model';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-applications.component.html',
})
export class MyApplicationsComponent implements OnInit {
  applications = signal<StudentApplicationSummary[]>([]);

  constructor(private applicationsService: ApplicationsService, private router: Router) {}

  ngOnInit(): void {
    this.applicationsService.listMine().subscribe((applications) => this.applications.set(applications));
  }

  open(id: string): void {
    this.router.navigate(['/student/applications', id]);
  }
}
