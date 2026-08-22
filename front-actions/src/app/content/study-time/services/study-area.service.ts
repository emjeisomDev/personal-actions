import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudyArea } from '../models/study-area.model';

export interface CreateStudyAreaRequest {
    name: string;
    weeklyGoalMinutes: number;
}

export interface UpdateStudyAreaRequest {
    name: string;
    weeklyGoalMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class StudyAreaService {
    private readonly http = inject(HttpClient);

    private readonly resourceUrl = '/api/study-areas';

    getAll(): Observable<StudyArea[]> {
        return this.http.get<StudyArea[]>(this.resourceUrl);
    }

    getById(id: string): Observable<StudyArea> {
        return this.http.get<StudyArea>(
            this.buildResourceUrl(id)
        );
    }

    create(input: CreateStudyAreaRequest): Observable<StudyArea> {
        return this.http.post<StudyArea>(this.resourceUrl, input);
    }

    update(id: string, input: UpdateStudyAreaRequest): Observable<StudyArea> {
        return this.http.put<StudyArea>(this.buildResourceUrl(id), input);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(this.buildResourceUrl(id));
    }

    private buildResourceUrl(id: string): string {
        return `${this.resourceUrl}/${encodeURIComponent(id)}`;
    }
}