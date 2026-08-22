import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyCardComponent } from './study-card.component';
import { StudyArea } from '../models/study-area.model';

describe('StudyCardComponent', () => {
  let component: StudyCardComponent;
  let fixture: ComponentFixture<StudyCardComponent>;

  const studyArea: StudyArea = {
    id: 'study-area-1',
    name: 'Matemática',
    weeklyGoalMinutes: 300
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        StudyCardComponent
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        StudyCardComponent
      );

    component =
      fixture.componentInstance;

    component.studyArea =
      studyArea;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(
      component
    ).toBeTruthy();
  });

  it('should receive a study area using the backend contract', () => {
    expect(
      component.studyArea
    ).toEqual(
      studyArea
    );
  });

  it('should expose the weekly goal minutes', () => {
    expect(
      component.weeklyGoalMinutes
    ).toBe(300);
  });

  it('should format the weekly goal in minutes', () => {
    component.studyArea = {
      id: 'study-area-2',
      name: 'Português',
      weeklyGoalMinutes: 45
    };

    expect(
      component.weeklyGoalLabel
    ).toBe('45min');
  });

  it('should format a weekly goal in hours', () => {
    component.studyArea = {
      id: 'study-area-3',
      name: 'Inglês',
      weeklyGoalMinutes: 120
    };

    expect(
      component.weeklyGoalLabel
    ).toBe('2h');
  });

  it('should format a weekly goal containing hours and minutes', () => {
    component.studyArea = {
      id: 'study-area-4',
      name: 'Programação',
      weeklyGoalMinutes: 150
    };

    expect(
      component.weeklyGoalLabel
    ).toBe('2h 30min');
  });

  it('should not require study records', () => {
    const backendStudyArea: StudyArea = {
      id: 'study-area-5',
      name: 'Banco de Dados',
      weeklyGoalMinutes: 180
    };

    component.studyArea =
      backendStudyArea;

    expect(
      component.studyArea
    ).toEqual(
      backendStudyArea
    );
  });
});