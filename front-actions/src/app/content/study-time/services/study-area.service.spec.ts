import {
  TestBed
} from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  StudyAreaService
} from './study-area.service';

import {
  StudyArea
} from '../models/study-area.model';

describe('StudyAreaService', () => {
  let service: StudyAreaService;
  let httpMock: HttpTestingController;

  const studyArea: StudyArea = {
    id: 'study-area-1',
    name: 'Matemática',
    weeklyGoalMinutes: 300
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        StudyAreaService
      ]
    });

    service =
      TestBed.inject(
        StudyAreaService
      );

    httpMock =
      TestBed.inject(
        HttpTestingController
      );
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(
      service
    ).toBeTruthy();
  });

  it('should get all study areas', () => {
    service
      .getAll()
      .subscribe(response => {
        expect(
          response
        ).toEqual([
          studyArea
        ]);
      });

    const request =
      httpMock.expectOne(
        '/api/study-areas'
      );

    expect(
      request.request.method
    ).toBe('GET');

    request.flush([
      studyArea
    ]);
  });

  it('should get a study area by id', () => {
    service
      .getById(
        studyArea.id
      )
      .subscribe(response => {
        expect(
          response
        ).toEqual(
          studyArea
        );
      });

    const request =
      httpMock.expectOne(
        '/api/study-areas/study-area-1'
      );

    expect(
      request.request.method
    ).toBe('GET');

    request.flush(
      studyArea
    );
  });

  it('should create a study area', () => {
    const input = {
      name: 'Matemática',
      weeklyGoalMinutes: 300
    };

    service
      .create(input)
      .subscribe(response => {
        expect(
          response
        ).toEqual(
          studyArea
        );
      });

    const request =
      httpMock.expectOne(
        '/api/study-areas'
      );

    expect(
      request.request.method
    ).toBe('POST');

    expect(
      request.request.body
    ).toEqual(
      input
    );

    request.flush(
      studyArea
    );
  });

  it('should update a study area', () => {
    const input = {
      name: 'Matemática Avançada',
      weeklyGoalMinutes: 420
    };

    const updatedArea: StudyArea = {
      ...studyArea,
      ...input
    };

    service
      .update(
        studyArea.id,
        input
      )
      .subscribe(response => {
        expect(
          response
        ).toEqual(
          updatedArea
        );
      });

    const request =
      httpMock.expectOne(
        '/api/study-areas/study-area-1'
      );

    expect(
      request.request.method
    ).toBe('PUT');

    expect(
      request.request.body
    ).toEqual(
      input
    );

    request.flush(
      updatedArea
    );
  });

it('should delete a study area', () => {
  let completed = false;

  service
    .delete(
      studyArea.id
    )
    .subscribe({
      next: response => {
        expect(
          response
        ).toBeNull();
      },
      complete: () => {
        completed = true;
      }
    });

  const request =
    httpMock.expectOne(
      '/api/study-areas/study-area-1'
    );

  expect(
    request.request.method
  ).toBe('DELETE');

  request.flush(null, {
    status: 204,
    statusText: 'No Content'
  });

  expect(
    completed
  ).toBeTrue();
});

  it('should encode the study area id in the URL', () => {
    service
      .getById(
        'area/id'
      )
      .subscribe();

    const request =
      httpMock.expectOne(
        '/api/study-areas/area%2Fid'
      );

    expect(
      request.request.method
    ).toBe('GET');

    request.flush({
      ...studyArea,
      id: 'area/id'
    });
  });
});