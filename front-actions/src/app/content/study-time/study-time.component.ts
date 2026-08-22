import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { StudyArea } from './models/study-area.model';
import { StudyAreaService } from './services/study-area.service';

@Component({
  selector: 'app-study-time',
  templateUrl: './study-time.component.html',
  styleUrl: './study-time.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StudyTimeComponent
  implements OnInit, OnDestroy {

  studyAreas: StudyArea[] = [];

  isLoading = false;

  errorMessage: string | null = null;

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

  trackByStudyAreaId(_index: number, studyArea: StudyArea): string {
    return studyArea.id;
  }
}