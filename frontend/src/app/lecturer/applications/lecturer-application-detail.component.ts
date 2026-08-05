import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LecturerApplicationsService } from '../../services/lecturer-applications.service';
import { LecturerApplicationDetail } from '../../models/application.model';

type Phase =
  | 'loading'
  | 'canceled'
  | 'terminated'
  | 'rejected'
  | 'awaiting-decision'
  | 'incomplete'
  | 'waiting-start'
  | 'pending-modification'
  | 'completing'
  | 'grades-approved'
  | 'idle';

@Component({
  selector: 'app-lecturer-application-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lecturer-application-detail.component.html',
})
export class LecturerApplicationDetailComponent implements OnInit {
  application = signal<LecturerApplicationDetail | null>(null);
  laError = signal<string | null>(null);
  torError = signal<string | null>(null);
  newLaError = signal<string | null>(null);
  decisionError = signal<string | null>(null);
  gradeError = signal<string | null>(null);
  modificationError = signal<string | null>(null);
  decisionReason = '';
  modificationReason = '';
  gradeCfDrafts: Record<string, string> = {};

  cfMapping = computed(() => (this.application()?.mapping ?? []).filter((m) => !m.module.host));
  overseasMapping = computed(() => (this.application()?.mapping ?? []).filter((m) => !!m.module.host));
  cfCredits = computed(() => this.cfMapping().reduce((sum, m) => sum + m.module.credits, 0));
  overseasCredits = computed(() => this.overseasMapping().reduce((sum, m) => sum + m.module.credits, 0));

  newCfMapping = computed(() => (this.application()?.new_mapping ?? []).filter((m) => !m.module.host));
  newOverseasMapping = computed(() => (this.application()?.new_mapping ?? []).filter((m) => !!m.module.host));

  mobilityStarted = computed(() => {
    const app = this.application();
    return !!app?.start && new Date(app.start) < new Date();
  });

  hasBegunCompletion = computed(() => {
    const app = this.application();
    if (!app) return false;
    return !!app.finish || !!app.transcript_of_records || app.mapping.some((m) => m.grade != null);
  });

  hasPendingModification = computed(() => {
    const app = this.application();
    if (!app) return false;
    return app.new_mapping.length > 0 || !!app.new_learning_agreement;
  });

  readyForInitialDecision = computed(() => {
    const app = this.application();
    if (!app) return false;
    return app.mapping.length > 0 && !!app.start && !!app.learning_agreement;
  });

  readyForModificationDecision = computed(() => {
    const app = this.application();
    if (!app) return false;
    return app.new_mapping.length > 0 && !!app.new_learning_agreement;
  });

  canConvertGrades = computed(() => {
    const app = this.application();
    if (!app) return false;
    return !!app.finish && !!app.transcript_of_records && !app.grades_approved_date;
  });

  phase = computed<Phase>(() => {
    const app = this.application();
    if (!app) return 'loading';
    if (app.status === 'canceled') return 'canceled';
    if (app.status === 'terminated') return 'terminated';
    if (app.last_decision === 'rejection') return 'rejected';
    if (!app.last_decision) return this.readyForInitialDecision() ? 'awaiting-decision' : 'incomplete';
    if (!this.mobilityStarted()) return 'waiting-start';
    if (app.grades_approved_date) return 'grades-approved';
    if (this.hasBegunCompletion()) return 'completing';
    if (this.hasPendingModification()) return 'pending-modification';
    return 'idle';
  });

  private id!: string;

  constructor(private route: ActivatedRoute, private applicationsService: LecturerApplicationsService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.applicationsService.get(this.id).subscribe((application) => {
      this.application.set(application);
      for (const mapping of application.mapping) {
        if (mapping.module.host && this.gradeCfDrafts[mapping.id] === undefined) {
          this.gradeCfDrafts[mapping.id] = mapping.grade_cf != null ? String(mapping.grade_cf) : '';
        }
      }
    });
  }

  viewLearningAgreement(): void {
    this.laError.set(null);
    this.applicationsService.downloadLearningAgreement(this.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.laError.set('Impossibile aprire il Learning Agreement.'),
    });
  }

  viewTranscriptOfRecords(): void {
    this.torError.set(null);
    this.applicationsService.downloadTranscriptOfRecords(this.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.torError.set('Impossibile aprire il Transcript of Records.'),
    });
  }

  viewNewLearningAgreement(): void {
    this.newLaError.set(null);
    this.applicationsService.downloadNewLearningAgreement(this.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.newLaError.set('Impossibile aprire il nuovo Learning Agreement.'),
    });
  }

  decide(decision: 'acceptance' | 'rejection'): void {
    this.decisionError.set(null);
    this.applicationsService.decide(this.id, decision, this.decisionReason || undefined).subscribe({
      next: () => {
        this.decisionReason = '';
        this.load();
      },
      error: (err: HttpErrorResponse) => this.decisionError.set(err.error?.error ?? 'Errore.'),
    });
  }

  decideModification(decision: 'acceptance' | 'rejection'): void {
    this.modificationError.set(null);
    this.applicationsService.decideModification(this.id, decision, this.modificationReason || undefined).subscribe({
      next: () => {
        this.modificationReason = '';
        this.load();
      },
      error: (err: HttpErrorResponse) => this.modificationError.set(err.error?.error ?? 'Errore.'),
    });
  }

  saveConvertedGrade(mappingId: string): void {
    this.gradeError.set(null);
    const draft = this.gradeCfDrafts[mappingId];
    const gradeCf = Number(draft);
    if (!draft || Number.isNaN(gradeCf)) {
      this.gradeError.set('Il voto Ca\' Foscari è richiesto.');
      return;
    }
    this.applicationsService.setConvertedGrade(this.id, mappingId, gradeCf).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.gradeError.set(err.error?.error ?? 'Errore.'),
    });
  }
}
