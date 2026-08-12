import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { StudyTimeComponent } from './study-time.component';
import { StudyCardComponent } from './study-card/study-card.component';

describe('StudyTimeComponent', () => {
  let component: StudyTimeComponent;
  let fixture: ComponentFixture<StudyTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        StudyTimeComponent,
        StudyCardComponent
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        StudyTimeComponent
      );

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain study areas', () => {
    expect(
      component.studyAreas.length
    ).toBeGreaterThan(0);
  });

  it('should render one study card for each study area', () => {
    const cards =
      fixture.nativeElement.querySelectorAll(
        'app-study-card'
      );

    expect(
      cards.length
    ).toBe(
      component.studyAreas.length
    );
  });

  it('should identify study areas by unique ids', () => {
    const ids =
      component.studyAreas.map(
        studyArea => studyArea.id
      );

    expect(
      new Set(ids).size
    ).toBe(ids.length);
  });

  it('should add a new study record', () => {
    const studyArea =
      component.studyAreas[0];

    const recordsBefore =
      studyArea.studyRecords.length;

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea
        ?.studyRecords.length
    ).toBe(recordsBefore + 1);

    const lastRecord =
      updatedStudyArea
        ?.studyRecords.at(-1);

    expect(
      lastRecord?.minutes
    ).toBe(30);

    expect(
      lastRecord?.date
    ).toBe(getTodayDate());

    expect(
      lastRecord?.id
    ).toBeTruthy();
  });

  it('should create independent records for each submission', () => {
    const studyArea =
      component.studyAreas[0];

    const recordsBefore =
      studyArea.studyRecords.length;

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    component.onStudyTimeAdded(
      studyArea,
      45
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea
        ?.studyRecords.length
    ).toBe(recordsBefore + 2);

    const records =
      updatedStudyArea?.studyRecords ?? [];

    expect(
      records.at(-2)?.minutes
    ).toBe(30);

    expect(
      records.at(-1)?.minutes
    ).toBe(45);

    expect(
      records.at(-2)?.id
    ).not.toBe(
      records.at(-1)?.id
    );
  });

  it('should remove the last inserted record first', () => {
    const studyArea =
      component.studyAreas[0];

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    component.onStudyTimeAdded(
      studyArea,
      45
    );

    component.onStudyTimeAdded(
      studyArea,
      60
    );

    component.onStudyTimeRemoved(
      studyArea
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea
        ?.studyRecords.at(-1)
        ?.minutes
    ).toBe(45);
  });

  it('should remove all new records in reverse order', () => {
    const studyArea =
      component.studyAreas[0];

    const recordsBefore =
      studyArea.studyRecords.length;

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    component.onStudyTimeAdded(
      studyArea,
      45
    );

    component.onStudyTimeAdded(
      studyArea,
      60
    );

    component.onStudyTimeRemoved(
      studyArea
    );

    component.onStudyTimeRemoved(
      studyArea
    );

    component.onStudyTimeRemoved(
      studyArea
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea
        ?.studyRecords.length
    ).toBe(recordsBefore);
  });

  it('should not remove a record when there are no records', () => {
    const studyArea =
      component.studyAreas[0];

    studyArea.studyRecords = [];

    component.onStudyTimeRemoved(
      studyArea
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea?.studyRecords
    ).toEqual([]);
  });

  it('should ignore invalid study time', () => {
    const studyArea =
      component.studyAreas[0];

    const recordsBefore =
      studyArea.studyRecords.length;

    component.onStudyTimeAdded(
      studyArea,
      0
    );

    component.onStudyTimeAdded(
      studyArea,
      -30
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      updatedStudyArea
        ?.studyRecords.length
    ).toBe(recordsBefore);
  });

  it('should create a record with id and creation timestamp', () => {
    const studyArea =
      component.studyAreas[0];

    const recordsBefore =
      studyArea.studyRecords.length;

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    const lastRecord =
      updatedStudyArea?.studyRecords.at(-1);

    expect(
      updatedStudyArea
        ?.studyRecords.length
    ).toBe(recordsBefore + 1);

    expect(
      lastRecord?.id
    ).toBeTruthy();

    expect(
      lastRecord?.date
    ).toBe(getTodayDate());

    expect(
      lastRecord?.minutes
    ).toBe(30);

    expect(
      lastRecord?.createdAt
    ).toBeTruthy();

    expect(
      Date.parse(
        lastRecord?.createdAt ?? ''
      )
    ).not.toBeNaN();
  });

  it('should remove the last created record first', () => {
    const studyArea =
      component.studyAreas[0];

    component.onStudyTimeAdded(
      studyArea,
      30
    );

    component.onStudyTimeAdded(
      studyArea,
      45
    );

    const updatedStudyArea =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    const lastRecord =
      updatedStudyArea
        ?.studyRecords.at(-1);

    expect(
      lastRecord?.minutes
    ).toBe(45);

    const lastRecordId =
      lastRecord?.id;

    component.onStudyTimeRemoved(
      studyArea
    );

    const afterRemoval =
      component.studyAreas.find(
        area =>
          area.id === studyArea.id
      );

    expect(
      afterRemoval
        ?.studyRecords
        .some(
          record =>
            record.id === lastRecordId
        )
    ).toBeFalse();

    expect(
      afterRemoval
        ?.studyRecords
        .at(-1)
        ?.minutes
    ).toBe(30);
  });


});

function getTodayDate(): string {
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