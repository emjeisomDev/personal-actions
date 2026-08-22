import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { CreateStudyAreaRequest, StudyAreaService, UpdateStudyAreaRequest } from '../services/study-area.service';
import { StudyArea } from '../models/study-area.model';

@Component({
  selector: 'app-study-area-manager',
  templateUrl: './study-area-manager.component.html',
  styleUrl: './study-area-manager.component.scss',
  standalone: false,
})

export class StudyAreaManagerComponent implements OnInit, OnDestroy {

  @Output()
  readonly closed = new EventEmitter<void>();

  studyAreas: StudyArea[] = [];
  isLoading = false;
  isSaving = false;
  deletingId: string | null = null;
  errorMessage: string | null = null;
  validationMessage: string | null = null;
  editingId: string | null = null;
  name = '';
  weeklyGoalMinutes = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly studyAreaService: StudyAreaService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadStudyAreas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudyAreas(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.studyAreaService
      .getAll()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (
          studyAreas: StudyArea[]
        ) => {
          this.studyAreas = studyAreas;
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },

        error: () => {
          this.studyAreas = [];
          this.isLoading = false;
          this.errorMessage = 'Não foi possível carregar as áreas de estudo.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  startCreate(): void {
    this.editingId = null;
    this.name = '';
    this.weeklyGoalMinutes = '';
    this.validationMessage = null;
    this.errorMessage = null;

    this.changeDetectorRef.markForCheck();
  }

  startEdit(studyArea: StudyArea): void {
    this.editingId = studyArea.id;
    this.name = studyArea.name;
    this.weeklyGoalMinutes = String(studyArea.weeklyGoalMinutes);
    this.validationMessage = null;
    this.errorMessage = null;
    this.changeDetectorRef.markForCheck();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.name = '';
    this.weeklyGoalMinutes = '';
    this.validationMessage = null;
    this.errorMessage = null;
    this.changeDetectorRef.markForCheck();
  }

  save(): void {
    this.validationMessage = null;
    this.errorMessage = null;
    const input = this.buildInput();

    if (!input) {
      return;
    }

    this.isSaving = true;

    if (this.editingId) {
      this.update(this.editingId, input);
      return;
    }

    this.create(input);
  }

  delete(
    studyArea: StudyArea
  ): void {
    if (this.deletingId !== null || this.isSaving) {
      return;
    }

    const confirmed = window.confirm(`Deseja excluir a área "${studyArea.name}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = null;
    this.deletingId = studyArea.id;

    this.studyAreaService
      .delete(studyArea.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deletingId = null;

          if (this.editingId === studyArea.id) {
            this.cancelEdit();
          }

          this.loadStudyAreas();
        },

        error: () => {
          this.deletingId = null;
          this.errorMessage = 'Não foi possível excluir a área de estudo.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  close(): void {
    if (this.isSaving || this.deletingId !== null) {
      return;
    }
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  trackByStudyAreaId(_index: number, studyArea: StudyArea): string {
    return studyArea.id;
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}min`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  private create(input: CreateStudyAreaRequest): void {
    this.studyAreaService
      .create(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.cancelEdit();
          this.loadStudyAreas();
        },

        error: () => {
          this.isSaving = false;
          this.errorMessage = 'Não foi possível criar a área de estudo.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private update(
    id: string,
    input: UpdateStudyAreaRequest
  ): void {
    this.studyAreaService
      .update(id, input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.cancelEdit();
          this.loadStudyAreas();
        },

        error: () => {
          this.isSaving = false;

          this.errorMessage = 'Não foi possível atualizar a área de estudo.';

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private buildInput(): CreateStudyAreaRequest | null {
    const normalizedName = this.name.trim();
    if (normalizedName.length === 0) {
      this.validationMessage = 'Informe o nome da área de estudo.';
      return null;
    }

    if (this.weeklyGoalMinutes.trim().length === 0) {
      this.validationMessage = 'Informe a meta semanal em minutos.';
      return null;
    }

    const weeklyGoalMinutes = Number(this.weeklyGoalMinutes.trim());

    if (!Number.isInteger(weeklyGoalMinutes) || weeklyGoalMinutes <= 0) {
      this.validationMessage = 'A meta semanal deve ser um número inteiro positivo.';
      return null;
    }

    return {
      name: normalizedName,
      weeklyGoalMinutes
    };
  }
}
