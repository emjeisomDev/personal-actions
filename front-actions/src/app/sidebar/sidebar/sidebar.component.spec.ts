import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      imports: [
        RouterModule.forRoot([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be expanded by default', () => {
  expect(component.collapsed).toBeFalse();
});

it('should hide the menu label when collapsed', () => {
  component.collapsed = true;
  fixture.detectChanges();

  const label = fixture.nativeElement.querySelector(
    '.sidebar__label'
  ) as HTMLElement;

  expect(label.classList.contains('sidebar__label--hidden')).toBeTrue();
});

});