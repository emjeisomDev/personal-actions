import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  of,
  throwError
} from 'rxjs';

import {
  FormsModule
} from '@angular/forms';

import {
  StudyAreaManagerComponent
} from './study-area-manager.component';

import {
  StudyArea
} from '../models/study-area.model';

import {
  StudyAreaService
} from '../services/study-area.service';

describe('StudyAreaManagerComponent', () => {
  let component: StudyAreaManagerComponent;
  let fixture: ComponentFixture<StudyAreaManagerComponent>;
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
        [
          'getAll',
          'create',
          'update',
          'delete'
        ]
      );

    studyAreaService.getAll.and.returnValue(
      of(studyAreas)
    );

    studyAreaService.create.and.returnValue(
      of(studyAreas[0])
    );

    studyAreaService.update.and.returnValue(
      of(studyAreas[0])
    );

    studyAreaService.delete.and.returnValue(
      of(undefined)
    );

    await TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [
        StudyAreaManagerComponent
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
        StudyAreaManagerComponent
      );

    component =
      fixture.componentInstance;
  });

  it('should create', () => {
    expect(
      component
    ).toBeTruthy();
  });

  it('should load study areas on initialization', () => {
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

  it('should start with an empty form', () => {
    expect(
      component.editingId
    ).toBeNull();

    expect(
      component.name
    ).toBe('');

    expect(
      component.weeklyGoalMinutes
    ).toBe('');
  });

  it('should start creating a new study area', () => {
    component.editingId =
      'study-area-1';

    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '300';

    component.startCreate();

    expect(
      component.editingId
    ).toBeNull();

    expect(
      component.name
    ).toBe('');

    expect(
      component.weeklyGoalMinutes
    ).toBe('');
  });

  it('should populate the form when editing', () => {
    component.startEdit(
      studyAreas[0]
    );

    expect(
      component.editingId
    ).toBe(
      'study-area-1'
    );

    expect(
      component.name
    ).toBe(
      'Matemática'
    );

    expect(
      component.weeklyGoalMinutes
    ).toBe(
      '300'
    );
  });

  it('should validate empty name', () => {
    component.name = '';
    component.weeklyGoalMinutes =
      '300';

    component.save();

    expect(
      studyAreaService.create
    ).not.toHaveBeenCalled();

    expect(
      component.validationMessage
    ).toBe(
      'Informe o nome da área de estudo.'
    );
  });

  it('should validate empty weekly goal', () => {
    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '';

    component.save();

    expect(
      studyAreaService.create
    ).not.toHaveBeenCalled();

    expect(
      component.validationMessage
    ).toBe(
      'Informe a meta semanal em minutos.'
    );
  });

  it('should validate positive integer weekly goal', () => {
    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '0';

    component.save();

    expect(
      studyAreaService.create
    ).not.toHaveBeenCalled();

    expect(
      component.validationMessage
    ).toBe(
      'A meta semanal deve ser um número inteiro positivo.'
    );
  });

  it('should validate non-integer weekly goal', () => {
    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '30.5';

    component.save();

    expect(
      studyAreaService.create
    ).not.toHaveBeenCalled();

    expect(
      component.validationMessage
    ).toBe(
      'A meta semanal deve ser um número inteiro positivo.'
    );
  });

  it('should create a study area through the service', () => {
    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '300';

    component.save();

    expect(
      studyAreaService.create
    ).toHaveBeenCalledWith({
      name: 'Matemática',
      weeklyGoalMinutes: 300
    });

    expect(
      studyAreaService.getAll
    ).toHaveBeenCalled();
  });

  it('should trim the study area name before creating', () => {
    component.name =
      '  Matemática  ';

    component.weeklyGoalMinutes =
      '300';

    component.save();

    expect(
      studyAreaService.create
    ).toHaveBeenCalledWith({
      name: 'Matemática',
      weeklyGoalMinutes: 300
    });
  });

  it('should update an existing study area through the service', () => {
    component.editingId =
      'study-area-1';

    component.name =
      'Matemática Avançada';

    component.weeklyGoalMinutes =
      '420';

    component.save();

    expect(
      studyAreaService.update
    ).toHaveBeenCalledWith(
      'study-area-1',
      {
        name: 'Matemática Avançada',
        weeklyGoalMinutes: 420
      }
    );
  });

  it('should cancel editing', () => {
    component.startEdit(
      studyAreas[0]
    );

    component.cancelEdit();

    expect(
      component.editingId
    ).toBeNull();

    expect(
      component.name
    ).toBe('');

    expect(
      component.weeklyGoalMinutes
    ).toBe('');
  });

  it('should delete a study area after confirmation', () => {
    spyOn(
      window,
      'confirm'
    ).and.returnValue(true);

    component.delete(
      studyAreas[0]
    );

    expect(
      studyAreaService.delete
    ).toHaveBeenCalledWith(
      'study-area-1'
    );

    expect(
      studyAreaService.getAll
    ).toHaveBeenCalled();
  });

  it('should not delete when confirmation is cancelled', () => {
    spyOn(
      window,
      'confirm'
    ).and.returnValue(false);

    component.delete(
      studyAreas[0]
    );

    expect(
      studyAreaService.delete
    ).not.toHaveBeenCalled();
  });

  it('should handle create errors', () => {
    studyAreaService.create.and.returnValue(
      throwError(
        () => new Error(
          'create error'
        )
      )
    );

    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '300';

    component.save();

    expect(
      component.isSaving
    ).toBeFalse();

    expect(
      component.errorMessage
    ).toBe(
      'Não foi possível criar a área de estudo.'
    );
  });

  it('should handle update errors', () => {
    studyAreaService.update.and.returnValue(
      throwError(
        () => new Error(
          'update error'
        )
      )
    );

    component.editingId =
      'study-area-1';

    component.name =
      'Matemática';

    component.weeklyGoalMinutes =
      '300';

    component.save();

    expect(
      component.isSaving
    ).toBeFalse();

    expect(
      component.errorMessage
    ).toBe(
      'Não foi possível atualizar a área de estudo.'
    );
  });

  it('should handle delete errors', () => {
    spyOn(
      window,
      'confirm'
    ).and.returnValue(true);

    studyAreaService.delete.and.returnValue(
      throwError(
        () => new Error(
          'delete error'
        )
      )
    );

    component.delete(
      studyAreas[0]
    );

    expect(
      component.deletingId
    ).toBeNull();

    expect(
      component.errorMessage
    ).toBe(
      'Não foi possível excluir a área de estudo.'
    );
  });

  it('should emit closed when closing', () => {
    const emitSpy =
      spyOn(
        component.closed,
        'emit'
      );

    component.close();

    expect(
      emitSpy
    ).toHaveBeenCalled();
  });

  it('should not close while saving', () => {
    const emitSpy =
      spyOn(
        component.closed,
        'emit'
      );

    component.isSaving =
      true;

    component.close();

    expect(
      emitSpy
    ).not.toHaveBeenCalled();
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
  });
});