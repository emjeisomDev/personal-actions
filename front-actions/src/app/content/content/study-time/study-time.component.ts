import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-study-time',
  templateUrl: './study-time.component.html',
  styleUrl: './study-time.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class StudyTimeComponent {}
