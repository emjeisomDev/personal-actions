import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StudyArea } from '../models/study-area.model';


@Component({
  selector: 'app-study-card',
  templateUrl: './study-card.component.html',
  styleUrl: './study-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})

export class StudyCardComponent {

  @Input({
    required: true
  })
  studyArea!: StudyArea;

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
}