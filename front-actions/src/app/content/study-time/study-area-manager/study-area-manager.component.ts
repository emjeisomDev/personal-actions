import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  CreateStudyAreaRequest,
  StudyAreaService,
  UpdateStudyAreaRequest
} from '../services/study-area.service';

import {
  StudyArea
} from '../models/study-area.model';

interface BackendErrorResponse {
  error?: {
    code?: string;
    message?: string;
    issues?: Array<{
      field?: string;
      message?: string;
    }>;
  };
}

@Component({
  selector: 'app-study-area-manager',
  templateUrl: './study-area-manager.component.html',
  styleUrl: './study-area-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
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

  private readonly destroy$ =
    new Subject<void>();

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

  @HostListener(
    'document:keydown.escape',
    ['$event']
  )
  onEscape(event: Event): void {
    event.preventDefault();
    this.close();
  }

  loadStudyAreas(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.changeDetectorRef.markForCheck();

    this.studyAreaService
      .getAll()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (
          studyAreas: StudyArea[]
        ) => {
          this.studyAreas =
            studyAreas;

          this.isLoading = false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: (
          error: unknown
        ) => {
          this.studyAreas = [];
          this.isLoading = false;

          this.errorMessage =
            this.getHttpErrorMessage(
              error,
              'Não foi possível carregar as áreas de estudo.'
            );

          this.changeDetectorRef
            .markForCheck();
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

  startEdit(
    studyArea: StudyArea
  ): void {
    this.editingId =
      studyArea.id;

    this.name =
      studyArea.name;

    this.weeklyGoalMinutes =
      String(
        studyArea.weeklyGoalMinutes
      );

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
    if (
      this.isSaving ||
      this.deletingId !== null
    ) {
      return;
    }

    this.validationMessage = null;
    this.errorMessage = null;

    const input =
      this.buildInput();

    if (!input) {
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.isSaving = true;

    this.changeDetectorRef.markForCheck();

    if (this.editingId !== null) {
      this.update(
        this.editingId,
        input
      );

      return;
    }

    this.create(input);
  }

  delete(
    studyArea: StudyArea
  ): void {
    if (
      this.deletingId !== null ||
      this.isSaving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja excluir a área "${studyArea.name}"?`
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = null;
    this.validationMessage = null;

    this.deletingId =
      studyArea.id;

    this.changeDetectorRef.markForCheck();

    this.studyAreaService
      .delete(
        studyArea.id
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.deletingId = null;

          if (
            this.editingId ===
            studyArea.id
          ) {
            this.cancelEdit();
          }

          this.loadStudyAreas();
        },

        error: (
          error: unknown
        ) => {
          this.deletingId = null;

          this.errorMessage =
            this.getHttpErrorMessage(
              error,
              'Não foi possível excluir a área de estudo.'
            );

          this.changeDetectorRef
            .markForCheck();
        }
      });
  }

  close(): void {
    if (
      this.isSaving ||
      this.deletingId !== null
    ) {
      return;
    }

    this.closed.emit();
  }

  onBackdropClick(
    event: MouseEvent
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.close();
    }
  }

  trackByStudyAreaId(
    _index: number,
    studyArea: StudyArea
  ): string {
    return studyArea.id;
  }

  formatMinutes(
    minutes: number
  ): string {
    const hours =
      Math.floor(
        minutes / 60
      );

    const remainingMinutes =
      minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}min`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  private create(
    input: CreateStudyAreaRequest
  ): void {
    this.studyAreaService
      .create(input)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.cancelEdit();
          this.loadStudyAreas();
        },

        error: (
          error: unknown
        ) => {
          this.isSaving = false;

          this.errorMessage =
            this.getHttpErrorMessage(
              error,
              'Não foi possível criar a área de estudo.'
            );

          this.changeDetectorRef
            .markForCheck();
        }
      });
  }

  private update(
    id: string,
    input: UpdateStudyAreaRequest
  ): void {
    this.studyAreaService
      .update(
        id,
        input
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.cancelEdit();
          this.loadStudyAreas();
        },

        error: (
          error: unknown
        ) => {
          this.isSaving = false;

          this.errorMessage =
            this.getHttpErrorMessage(
              error,
              'Não foi possível atualizar a área de estudo.'
            );

          this.changeDetectorRef
            .markForCheck();
        }
      });
  }

  private buildInput():
    CreateStudyAreaRequest | null {

    const normalizedName =
      this.name.trim();

    if (
      normalizedName.length === 0
    ) {
      this.validationMessage =
        'Informe o nome da área de estudo.';

      return null;
    }

    if (
      this.weeklyGoalMinutes
        .trim()
        .length === 0
    ) {
      this.validationMessage =
        'Informe a meta semanal em minutos.';

      return null;
    }

    const weeklyGoalMinutes =
      Number(
        this.weeklyGoalMinutes.trim()
      );

    if (
      !Number.isInteger(
        weeklyGoalMinutes
      ) ||
      weeklyGoalMinutes <= 0
    ) {
      this.validationMessage =
        'A meta semanal deve ser um número inteiro positivo.';

      return null;
    }

    return {
      name: normalizedName,
      weeklyGoalMinutes
    };
  }

  private getHttpErrorMessage(
    error: unknown,
    fallback: string
  ): string {
    if (
      !(error instanceof HttpErrorResponse)
    ) {
      return fallback;
    }

    const backendError =
      this.getBackendError(
        error.error
      );

    if (
      backendError?.issues &&
      backendError.issues.length > 0
    ) {
      const issueMessage =
        backendError.issues
          .map(
            issue => issue.message
          )
          .filter(
            message =>
              typeof message === 'string' &&
              message.trim().length > 0
          )
          .join(' ');

      if (issueMessage.length > 0) {
        return issueMessage;
      }
    }

    if (
      typeof backendError?.message ===
      'string' &&
      backendError.message.trim().length > 0
    ) {
      return backendError.message;
    }

    if (error.status === 404) {
      return 'A área de estudo não foi encontrada.';
    }

    if (error.status === 409) {
      return 'A operação não pode ser realizada devido a uma regra de negócio.';
    }

    if (
      error.status === 400 ||
      error.status === 422
    ) {
      return 'Os dados informados são inválidos.';
    }

    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    return fallback;
  }

  private getBackendError(
    value: unknown
  ): BackendErrorResponse['error'] | null {
    if (
      typeof value !== 'object' ||
      value === null
    ) {
      return null;
    }

    const response =
      value as BackendErrorResponse;

    return response.error ?? null;
  }
}