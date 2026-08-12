import { ChangeDetectionStrategy, Component, EventEmitter, Output  } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }
}