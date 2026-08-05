import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationsService } from '../../services/applications.service';
import { ModulesService } from '../../services/modules.service';
import { StudentApplicationDetail, ApplicationMappingEntry } from '../../models/application.model';
import { Module } from '../../models/module.model';

const MIN_CREDITS_PER_SIDE = 12;

type Phase =
  | 'loading'
  | 'canceled'
  | 'terminated'
  | 'rejected'
  | 'incomplete'
  | 'waiting-start'
  | 'choice'
  | 'pending-modification'
  | 'completing'
  | 'grades-approved';

@Component({
  selector: 'app-application-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application-edit.component.html',
})
export class ApplicationEditComponent implements OnInit {
  application = signal<StudentApplicationDetail | null>(null);
  allModules = signal<Module[]>([]);

  cfModules = computed(() => this.allModules().filter((m) => !m.host));
  hostModules = computed(() => {
    const app = this.application();
    return app ? this.allModules().filter((m) => m.host === app.host.id) : [];
  });

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

  phase = computed<Phase>(() => {
    const app = this.application();
    if (!app) return 'loading';
    if (app.status === 'canceled') return 'canceled';
    if (app.status === 'terminated') return 'terminated';
    if (app.last_decision === 'rejection') return 'rejected';
    if (!app.last_decision) return 'incomplete';
    if (!this.mobilityStarted()) return 'waiting-start';
    if (app.grades_approved_date) return 'grades-approved';
    if (this.hasBegunCompletion()) return 'completing';
    if (this.hasPendingModification()) return 'pending-modification';
    return 'choice';
  });

  overseasMapping = computed(() => (this.application()?.mapping ?? []).filter((m) => !!m.module.host));

  // Draft builder shared between the initial plan (phase "incomplete")
  // and a modification proposal (phase "choice" -> modifyChosen).
  draftModules = signal<Module[]>([]);
  cfCredits = computed(() => this.draftModules().filter((m) => !m.host).reduce((sum, m) => sum + m.credits, 0));
  overseasCredits = computed(() =>
    this.draftModules().filter((m) => !!m.host).reduce((sum, m) => sum + m.credits, 0)
  );
  draftValid = computed(
    () =>
      this.cfCredits() >= MIN_CREDITS_PER_SIDE &&
      this.overseasCredits() >= MIN_CREDITS_PER_SIDE &&
      this.cfCredits() <= this.overseasCredits()
  );

  modifyChosen = signal(false);
  completeChosen = signal(false);

  startInput = '';
  finishInput = '';
  selectedModule = '';
  modificationReasonInput = '';
  selectedLaFile: File | null = null;
  selectedTorFile: File | null = null;
  gradeDrafts: Record<string, { grade: string; examDate: string }> = {};

  planError = signal<string | null>(null);
  modificationError = signal<string | null>(null);
  completeError = signal<string | null>(null);
  cancelError = signal<string | null>(null);

  private id!: string;

  constructor(
    private route: ActivatedRoute,
    private applicationsService: ApplicationsService,
    private modulesService: ModulesService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.modulesService.list().subscribe((modules) => {
      this.allModules.set(modules);
      this.load();
    });
  }

  private moduleFromEntry(entry: ApplicationMappingEntry): Module | undefined {
    return this.allModules().find((m) => m.id === entry.module.id);
  }

  load(): void {
    this.applicationsService.getMine(this.id).subscribe((application) => {
      this.application.set(application);
      this.startInput = application.start ? application.start.slice(0, 10) : '';
      this.finishInput = application.finish ? application.finish.slice(0, 10) : '';
      this.modifyChosen.set(false);
      this.completeChosen.set(false);
      this.modificationReasonInput = '';
      this.selectedLaFile = null;
      this.selectedTorFile = null;
      if (!application.last_decision) {
        this.draftModules.set(application.mapping.map((m) => this.moduleFromEntry(m)).filter((m): m is Module => !!m));
      }
      for (const mapping of application.mapping) {
        if (!this.gradeDrafts[mapping.id]) {
          this.gradeDrafts[mapping.id] = {
            grade: mapping.grade != null ? String(mapping.grade) : '',
            examDate: mapping.exam_date ? mapping.exam_date.slice(0, 10) : '',
          };
        }
      }
    });
  }

  addToDraft(): void {
    const module = [...this.cfModules(), ...this.hostModules()].find((m) => m.id === this.selectedModule);
    if (!module || this.draftModules().some((m) => m.id === module.id)) {
      return;
    }
    this.draftModules.update((modules) => [...modules, module]);
    this.selectedModule = '';
  }

  removeFromDraft(moduleId: string): void {
    this.draftModules.update((modules) => modules.filter((m) => m.id !== moduleId));
  }

  onLaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedLaFile = input.files?.[0] ?? null;
  }

  confirmPlan(): void {
    this.planError.set(null);
    const app = this.application();
    if (!app) return;
    if (!this.selectedLaFile && !app.learning_agreement) {
      this.planError.set('Il Learning Agreement è obbligatorio.');
      return;
    }
    this.applicationsService
      .confirmPlan(this.id, this.startInput, this.draftModules().map((m) => m.id), this.selectedLaFile)
      .subscribe({
        next: () => this.load(),
        error: (err: HttpErrorResponse) => this.planError.set(err.error?.error ?? 'Errore.'),
      });
  }

  startModify(): void {
    const app = this.application();
    if (!app) return;
    this.draftModules.set(app.mapping.map((m) => this.moduleFromEntry(m)).filter((m): m is Module => !!m));
    this.modifyChosen.set(true);
  }

  confirmModification(): void {
    this.modificationError.set(null);
    const app = this.application();
    if (!app) return;
    if (!this.modificationReasonInput.trim()) {
      this.modificationError.set('Una descrizione della modifica è obbligatoria.');
      return;
    }
    if (!this.selectedLaFile && !app.new_learning_agreement) {
      this.modificationError.set('Il nuovo Learning Agreement è obbligatorio.');
      return;
    }
    this.applicationsService
      .proposeModification(
        this.id,
        this.draftModules().map((m) => m.id),
        this.modificationReasonInput.trim(),
        this.selectedLaFile
      )
      .subscribe({
        next: () => this.load(),
        error: (err: HttpErrorResponse) => this.modificationError.set(err.error?.error ?? 'Errore.'),
      });
  }

  startComplete(): void {
    this.completeChosen.set(true);
  }

  onTorFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedTorFile = input.files?.[0] ?? null;
  }

  confirmCompletion(): void {
    this.completeError.set(null);
    const app = this.application();
    if (!app) return;
    if (!this.selectedTorFile && !app.transcript_of_records) {
      this.completeError.set('Il Transcript of Records è obbligatorio.');
      return;
    }
    const grades = this.overseasMapping().map((m) => {
      const draft = this.gradeDrafts[m.id];
      return { mappingId: m.id, grade: Number(draft?.grade), examDate: draft?.examDate ?? '' };
    });
    if (grades.some((g) => Number.isNaN(g.grade) || !g.examDate)) {
      this.completeError.set('Voto e data esame sono richiesti per ogni esame overseas.');
      return;
    }
    this.applicationsService.completeMobility(this.id, this.finishInput, grades, this.selectedTorFile).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.completeError.set(err.error?.error ?? 'Errore.'),
    });
  }

  cancelApplication(): void {
    if (!confirm('Annullare questa application? Non potrai più modificarla.')) {
      return;
    }
    this.cancelError.set(null);
    this.applicationsService.cancelMine(this.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => this.cancelError.set(err.error?.error ?? 'Errore.'),
    });
  }
}
