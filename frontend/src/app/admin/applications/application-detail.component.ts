import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationsService } from '../../services/applications.service';
import { AdminApplicationDetail } from '../../models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './application-detail.component.html',
})
export class ApplicationDetailComponent implements OnInit {
  application = signal<AdminApplicationDetail | null>(null);
  terminateError = signal<string | null>(null);
  cancelError = signal<string | null>(null);
  verifyError = signal<string | null>(null);

  cfMapping = computed(() => (this.application()?.mapping ?? []).filter((m) => !m.module.host));
  overseasMapping = computed(() => (this.application()?.mapping ?? []).filter((m) => !!m.module.host));
  cfCredits = computed(() => this.cfMapping().reduce((sum, m) => sum + m.module.credits, 0));
  overseasCredits = computed(() => this.overseasMapping().reduce((sum, m) => sum + m.module.credits, 0));

  isActionable = computed(() => {
    const status = this.application()?.status;
    return status === 'default' || status === 'pre_departure_verified';
  });
  canVerifyPreDeparture = computed(() => {
    const app = this.application();
    return !!app && app.status === 'default' && app.last_decision === 'acceptance';
  });
  canTerminate = computed(() => {
    const app = this.application();
    return !!app && this.isActionable() && !!app.grades_approved_date;
  });

  private id!: string;

  constructor(private route: ActivatedRoute, private applicationsService: ApplicationsService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.applicationsService.get(this.id).subscribe((application) => this.application.set(application));
  }

  verifyPreDeparture(): void {
    this.verifyError.set(null);
    this.applicationsService.verifyPreDeparture(this.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.verifyError.set(err.error?.error ?? 'Errore.'),
    });
  }

  terminate(): void {
    this.terminateError.set(null);
    this.applicationsService.terminate(this.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.terminateError.set(err.error?.error ?? 'Errore.'),
    });
  }

  cancel(): void {
    if (!confirm('Cancellare questa application? Azione irreversibile, riservata a casi gravi.')) {
      return;
    }
    this.cancelError.set(null);
    this.applicationsService.cancel(this.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.cancelError.set(err.error?.error ?? 'Errore.'),
    });
  }
}
