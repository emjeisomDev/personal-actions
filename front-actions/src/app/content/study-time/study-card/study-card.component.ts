import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { StudyArea } from '../models/study-area.model';

@Component({
  selector: 'app-study-card',
  templateUrl: './study-card.component.html',
  styleUrl: './study-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StudyCardComponent {
  @Input({ required: true }) studyArea!: StudyArea;

  @Output() studyTimeAdded = new EventEmitter<number>();
  @Output() studyTimeRemoved = new EventEmitter<void>();

  studyTimeInput = '';

  get weeklyStudiedMinutes(): number {
    const { start, end } = this.getCurrentWeekRange();

    return this.studyArea.studyRecords
      .filter(record => {
        const recordDate = this.parseDate(record.date);

        return recordDate >= start && recordDate <= end;
      })
      .reduce(
        (total, record) => total + record.minutes,
        0
      );
  }

  get progressPercentage(): number {
    const weeklyGoal =
      this.studyArea.weeklyGoalMinutes;

    if (weeklyGoal <= 0) {
      return 0;
    }

    return Math.min(
      (this.weeklyStudiedMinutes / weeklyGoal) * 100,
      100
    );
  }

  get remainingMinutes(): number {
    return Math.max(
      this.studyArea.weeklyGoalMinutes -
        this.weeklyStudiedMinutes,
      0
    );
  }

  get goalCompleted(): boolean {
    return (
      this.studyArea.weeklyGoalMinutes > 0 &&
      this.weeklyStudiedMinutes >=
        this.studyArea.weeklyGoalMinutes
    );
  }

  get hasStudyRecords(): boolean {
    return this.studyArea.studyRecords.length > 0;
  }

  onStudyTimeInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.studyTimeInput = input.value;
  }

  submitStudyTime(): void {
    const minutes = this.parseStudyTime(
      this.studyTimeInput
    );

    if (minutes === null || minutes <= 0) {
      return;
    }

    this.studyTimeAdded.emit(minutes);
    this.studyTimeInput = '';
  }

  removeStudyTime(): void {
    if (!this.hasStudyRecords) {
      return;
    }

    this.studyTimeRemoved.emit();
  }

  parseStudyTime(value: string): number | null {
    const normalizedValue = value
      .trim()
      .toLowerCase()
      .replace(',', '.');

    if (!normalizedValue) {
      return null;
    }

    const clockMatch = normalizedValue.match(
      /^(\d{1,3}):([0-5]\d)$/
    );

    if (clockMatch) {
      const hours = Number(clockMatch[1]);
      const minutes = Number(clockMatch[2]);

      if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
      ) {
        return null;
      }

      return hours * 60 + minutes;
    }

    const hourMinuteMatch = normalizedValue.match(
      /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*min?)?$/
    );

    if (
      hourMinuteMatch &&
      (hourMinuteMatch[1] || hourMinuteMatch[2])
    ) {
      const hours = hourMinuteMatch[1]
        ? Number(hourMinuteMatch[1])
        : 0;

      const minutes = hourMinuteMatch[2]
        ? Number(hourMinuteMatch[2])
        : 0;

      if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes) ||
        minutes >= 60
      ) {
        return null;
      }

      return Math.round(
        hours * 60 + minutes
      );
    }

    const minutesOnly = normalizedValue.match(
      /^(\d+(?:\.\d+)?)\s*(?:min)?$/
    );

    if (minutesOnly) {
      const minutes = Number(minutesOnly[1]);

      if (!Number.isFinite(minutes)) {
        return null;
      }

      return Math.round(minutes);
    }

    return null;
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

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    }).format(this.parseDate(date));
  }

  private getCurrentWeekRange(): {
    start: Date;
    end: Date;
  } {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay();

    const daysFromMonday =
      dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const start = new Date(today);

    start.setDate(
      today.getDate() - daysFromMonday
    );

    const end = new Date(start);

    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      start,
      end
    };
  }

  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00`);
  }
}