import {ChangeDetectionStrategy, Component } from '@angular/core';

import { StudyArea } from './models/study-area.model';
import { StudyRecord } from './models/study-record.model';

@Component({
  selector: 'app-study-time',
  templateUrl: './study-time.component.html',
  styleUrl: './study-time.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StudyTimeComponent {
  studyAreas: StudyArea[] = [
    {
      id: 'concusos',
      name: 'Concusos',
      weeklyGoalMinutes: 600,
      studyRecords: [
        {
          id: 'concusos-2026-08-10-01',
          date: '2026-08-10',
          minutes: 60,
          createdAt: '2026-08-10T18:00:00-03:00'
        },
        {
          id: 'concusos-2026-08-11-01',
          date: '2026-08-11',
          minutes: 90,
          createdAt: '2026-08-11T19:00:00-03:00'
        },
        {
          id: 'concusos-2026-08-12-01',
          date: '2026-08-12',
          minutes: 120,
          createdAt: '2026-08-12T18:30:00-03:00'
        }
      ]
    },
    {
      id: 'engenharia',
      name: 'Inglês',
      weeklyGoalMinutes: 300,
      studyRecords: [
        {
          id: 'engenharia-2026-08-10-01',
          date: '2026-08-10',
          minutes: 30,
          createdAt: '2026-08-10T20:00:00-03:00'
        },
        {
          id: 'engenharia-2026-08-12-01',
          date: '2026-08-12',
          minutes: 60,
          createdAt: '2026-08-12T19:00:00-03:00'
        }
      ]
    },
    {
      id: 'tech',
      name: 'Tech',
      weeklyGoalMinutes: 240,
      studyRecords: [
        {
          id: 'tech-2026-08-11-01',
          date: '2026-08-11',
          minutes: 60,
          createdAt: '2026-08-11T17:30:00-03:00'
        },
        {
          id: 'tech-2026-08-12-01',
          date: '2026-08-12',
          minutes: 45,
          createdAt: '2026-08-12T18:00:00-03:00'
        }
      ]
    }
  ];

  onStudyTimeAdded(
    studyArea: StudyArea,
    minutes: number
  ): void {
    if (
      minutes <= 0 ||
      !Number.isFinite(minutes)
    ) {
      return;
    }

    const record: StudyRecord = {
      id: crypto.randomUUID(),
      date: this.getTodayDate(),
      minutes,
      createdAt: new Date().toISOString()
    };

    this.updateStudyArea(
      studyArea.id,
      area => ({
        ...area,
        studyRecords: [
          ...area.studyRecords,
          record
        ]
      })
    );
  }

  onStudyTimeRemoved(
    studyArea: StudyArea
  ): void {
    this.updateStudyArea(
      studyArea.id,
      area => {
        if (
          area.studyRecords.length === 0
        ) {
          return area;
        }

        return {
          ...area,
          studyRecords:
            area.studyRecords.slice(0, -1)
        };
      }
    );
  }

  private updateStudyArea(
    studyAreaId: string,
    update: (
      studyArea: StudyArea
    ) => StudyArea
  ): void {
    this.studyAreas =
      this.studyAreas.map(
        studyArea =>
          studyArea.id === studyAreaId
            ? update(studyArea)
            : studyArea
      );
  }

  private getTodayDate(): string {
    const today = new Date();

    const year =
      today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}