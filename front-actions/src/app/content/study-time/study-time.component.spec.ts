import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { StudyTimeComponent } from './study-time.component';
import { StudyArea } from './models/study-area.model';
import { StudyAreaService } from './services/study-area.service';
import { StudyCardComponent } from './study-card/study-card.component';

describe('StudyTimeComponent', () => {
  let component: StudyTimeComponent;
  let fixture: ComponentFixture<StudyTimeComponent>;
  let studyAreaService: jasmine.SpyObj<StudyAreaService>;

  const studyAreas: StudyArea[] = [
    {
      id: 'study-area-1',
      name: 'Matemática',
      weeklyGoalMinutes: 300
    },
    {
      id: 'study-area-2',
      name: 'Português',
      weeklyGoalMinutes: 240
    }
  ];

  beforeEach(async () => {
    studyAreaService =
      jasmine.createSpyObj(
        'StudyAreaService',
        ['getAll']
      );

    studyAreaService
      .getAll
      .and.returnValue(
        of(studyAreas)
      );

    await TestBed.configureTestingModule({
      declarations: [
        StudyTimeComponent,
        StudyCardComponent
      ],
      providers: [
        {
          provide: StudyAreaService,
          useValue: studyAreaService
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        StudyTimeComponent
      );

    component =
      fixture.componentInstance;
  });

  it('should create', () => {
    expect(
      component
    ).toBeTruthy();
  });

  it('should start without study areas', () => {
    expect(
      component.studyAreas
    ).toEqual([]);

    expect(
      studyAreaService.getAll
    ).not.toHaveBeenCalled();
  });

  it('should load study areas from the backend service', () => {
    fixture.detectChanges();

    expect(
      studyAreaService.getAll
    ).toHaveBeenCalledTimes(1);

    expect(
      component.studyAreas
    ).toEqual(
      studyAreas
    );
  });

  it('should expose the exact study area contract returned by the service', () => {
    fixture.detectChanges();

    expect(
      component.studyAreas
    ).toEqual([
      {
        id: 'study-area-1',
        name: 'Matemática',
        weeklyGoalMinutes: 300
      },
      {
        id: 'study-area-2',
        name: 'Português',
        weeklyGoalMinutes: 240
      }
    ]);
  });

  it('should render one study card for each study area returned by the backend', () => {
    fixture.detectChanges();

    const cards =
      fixture.nativeElement
        .querySelectorAll(
          'app-study-card'
        );

    expect(
      cards.length
    ).toBe(
      studyAreas.length
    );
  });

  it('should track study areas by id', () => {
    expect(
      component.trackByStudyAreaId(
        0,
        studyAreas[0]
      )
    ).toBe(
      'study-area-1'
    );

    expect(
      component.trackByStudyAreaId(
        1,
        studyAreas[1]
      )
    ).toBe(
      'study-area-2'
    );
  });

  it('should expose loading state while the request is pending', () => {
    studyAreaService.getAll.and.returnValue(
      new Observable<StudyArea[]>(subscriber => {
        expect(
          component.isLoading
        ).toBeTrue();

        subscriber.next(
          studyAreas
        );

        subscriber.complete();
      })
    );

    component.loadStudyAreas();

    expect(
      component.isLoading
    ).toBeFalse();

    expect(
      component.studyAreas
    ).toEqual(
      studyAreas
    );
  });

  it('should clear the error before loading study areas', () => {
    component.errorMessage =
      'previous error';

    component.loadStudyAreas();

    expect(
      component.errorMessage
    ).toBeNull();

    expect(
      studyAreaService.getAll
    ).toHaveBeenCalled();
  });

  it('should handle backend errors without creating local data', () => {
    studyAreaService.getAll.and.returnValue(
      throwError(
        () => new Error(
          'HTTP error'
        )
      )
    );

    component.loadStudyAreas();

    expect(
      component.studyAreas
    ).toEqual([]);

    expect(
      component.isLoading
    ).toBeFalse();

    expect(
      component.errorMessage
    ).toBe(
      'Não foi possível carregar as áreas de estudo.'
    );
  });

  it('should clear existing areas when loading fails', () => {
    component.studyAreas =
      [...studyAreas];

    studyAreaService.getAll.and.returnValue(
      throwError(
        () => new Error(
          'HTTP error'
        )
      )
    );

    component.loadStudyAreas();

    expect(
      component.studyAreas
    ).toEqual([]);
  });

  it('should stop using the observable when the component is destroyed', () => {
    fixture.detectChanges();

    component.ngOnDestroy();

    expect(
      component
    ).toBeTruthy();
  });
});