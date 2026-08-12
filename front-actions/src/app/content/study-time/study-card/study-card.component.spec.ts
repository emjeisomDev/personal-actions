import {ComponentFixture, TestBed} from '@angular/core/testing';

import { StudyCardComponent } from './study-card.component';
import { StudyArea } from '../models/study-area.model';

describe('StudyCardComponent', () => {
  let component: StudyCardComponent;
  let fixture: ComponentFixture<StudyCardComponent>;

  const studyArea: StudyArea = {
    id: 'angular',
    name: 'Angular',
    weeklyGoalMinutes: 600,
    studyRecords: [
      {
        id: 'record-1',
        date: '2026-08-10',
        minutes: 60
      },
      {
        id: 'record-2',
        date: '2026-08-11',
        minutes: 90
      },
      {
        id: 'record-3',
        date: '2026-08-12',
        minutes: 120
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyCardComponent]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        StudyCardComponent
      );

    component = fixture.componentInstance;
    component.studyArea = studyArea;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress percentage', () => {
    expect(component.progressPercentage).toBe(45);
  });

  it('should calculate remaining minutes', () => {
    expect(component.remainingMinutes).toBe(330);
  });

  it('should parse minutes without unit', () => {
    expect(
      component.parseStudyTime('90')
    ).toBe(90);
  });

  it('should parse minutes with unit', () => {
    expect(
      component.parseStudyTime('90min')
    ).toBe(90);
  });

  it('should parse hours', () => {
    expect(
      component.parseStudyTime('2h')
    ).toBe(120);
  });

  it('should parse hours and minutes', () => {
    expect(
      component.parseStudyTime('1h 30min')
    ).toBe(90);
  });

  it('should parse hh:mm format', () => {
    expect(
      component.parseStudyTime('01:30')
    ).toBe(90);

    expect(
      component.parseStudyTime('08:45')
    ).toBe(525);
  });

  it('should parse decimal hours', () => {
    expect(
      component.parseStudyTime('1,5h')
    ).toBe(90);
  });

  it('should reject invalid time', () => {
    expect(
      component.parseStudyTime('abc')
    ).toBeNull();
  });

  it('should reject minutes greater than 59', () => {
    expect(
      component.parseStudyTime('1h 60min')
    ).toBeNull();
  });

  it('should emit added study time', () => {
    const emitSpy = spyOn(
      component.studyTimeAdded,
      'emit'
    );

    component.studyTimeInput = '1h 30min';

    component.submitStudyTime();

    expect(
      emitSpy
    ).toHaveBeenCalledWith(90);

    expect(
      component.studyTimeInput
    ).toBe('');
  });

  it('should not emit invalid study time', () => {
    const emitSpy = spyOn(
      component.studyTimeAdded,
      'emit'
    );

    component.studyTimeInput =
      'tempo inválido';

    component.submitStudyTime();

    expect(
      emitSpy
    ).not.toHaveBeenCalled();

    expect(
      component.studyTimeInput
    ).toBe('tempo inválido');
  });

  it('should emit study time removed', () => {
    const emitSpy = spyOn(
      component.studyTimeRemoved,
      'emit'
    );

    component.removeStudyTime();

    expect(
      emitSpy
    ).toHaveBeenCalled();
  });

  it('should not emit removal without records', () => {
    component.studyArea = {
      id: 'empty',
      name: 'Empty',
      weeklyGoalMinutes: 600,
      studyRecords: []
    };

    const emitSpy = spyOn(
      component.studyTimeRemoved,
      'emit'
    );

    component.removeStudyTime();

    expect(
      emitSpy
    ).not.toHaveBeenCalled();
  });

  it('should never exceed 100 percent', () => {
    const completedStudyArea: StudyArea = {
      id: 'completed',
      name: 'Completed',
      weeklyGoalMinutes: 100,
      studyRecords: [
        {
          id: 'completed-record',
          date: '2026-08-12',
          minutes: 150
        }
      ]
    };

    component.studyArea =
      completedStudyArea;

    expect(
      component.progressPercentage
    ).toBe(100);
  });

  it('should return zero progress when weekly goal is zero', () => {
    component.studyArea = {
      id: 'without-goal',
      name: 'Without Goal',
      weeklyGoalMinutes: 0,
      studyRecords: [
        {
          id: 'record-1',
          date: '2026-08-12',
          minutes: 120
        }
      ]
    };

    expect(
      component.progressPercentage
    ).toBe(0);
  });

  it('should calculate only current week records', () => {
    const currentWeekStart =
      getCurrentWeekMonday();

    component.studyArea = {
      id: 'angular',
      name: 'Angular',
      weeklyGoalMinutes: 600,
      studyRecords: [
        {
          id: 'current-1',
          date: formatDate(
            currentWeekStart
          ),
          minutes: 150
        },
        {
          id: 'previous-1',
          date: formatDate(
            addDays(
              currentWeekStart,
              -1
            )
          ),
          minutes: 300
        }
      ]
    };

    expect(
      component.weeklyStudiedMinutes
    ).toBe(150);
  });

  it('should identify when the weekly goal is completed', () => {
    const currentWeekStart =
      getCurrentWeekMonday();

    component.studyArea = {
      id: 'angular',
      name: 'Angular',
      weeklyGoalMinutes: 600,
      studyRecords: [
        {
          id: 'goal-record',
          date: formatDate(
            currentWeekStart
          ),
          minutes: 600
        }
      ]
    };

    expect(
      component.goalCompleted
    ).toBeTrue();
  });
});

function getCurrentWeekMonday(): Date {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();

  const daysFromMonday =
    dayOfWeek === 0
      ? 6
      : dayOfWeek - 1;

  const monday = new Date(today);

  monday.setDate(
    today.getDate() -
      daysFromMonday
  );

  return monday;
}

function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function formatDate(
  date: Date
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}