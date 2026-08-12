import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit sidebarToggle when the toggle button is clicked', () => {
  const emitSpy = spyOn(component.sidebarToggle, 'emit');

  const button = fixture.nativeElement.querySelector(
    '.header__toggle'
  ) as HTMLButtonElement;

  button.click();

  expect(emitSpy).toHaveBeenCalled();
});

});
