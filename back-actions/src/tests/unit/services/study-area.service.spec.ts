import { describe, expect, it, vi } from 'vitest';

import type { StudyAreaRepository } from '../../../repositories/study-area.repository.js';
import { StudyAreaService } from '../../../services/study-area.service.js';

function createRepositoryMock(): StudyAreaRepository {
    return {
        create: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    } as unknown as StudyAreaRepository;
}

describe('StudyAreaService', () => {
    describe('create', () => {
        it('deve remover espaços externos do nome antes de criar a área', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.create).mockResolvedValue(
                {} as Awaited<ReturnType<StudyAreaRepository['create']>>
            );

            const service = new StudyAreaService(repository);

            await service.create({
                name: '  Angular  ',
                weeklyGoalMinutes: 1500
            });

            expect(repository.create).toHaveBeenCalledWith({
                name: 'Angular',
                weeklyGoalMinutes: 1500
            });
        });

        it('deve rejeitar nome vazio', async () => {
            const repository = createRepositoryMock();
            const service = new StudyAreaService(repository);

            await expect(
                service.create({
                    name: '   ',
                    weeklyGoalMinutes: 1500
                })
            ).rejects.toThrowError(
                'Study area name is required.'
            );

            expect(repository.create).not.toHaveBeenCalled();
        });

        it('deve rejeitar meta semanal igual a zero', async () => {
            const repository = createRepositoryMock();
            const service = new StudyAreaService(repository);

            await expect(
                service.create({
                    name: 'Angular',
                    weeklyGoalMinutes: 0
                })
            ).rejects.toThrowError(
                'weeklyGoalMinutes must be a positive integer.'
            );

            expect(repository.create).not.toHaveBeenCalled();
        });

        it('deve rejeitar meta semanal negativa', async () => {
            const repository = createRepositoryMock();
            const service = new StudyAreaService(repository);

            await expect(
                service.create({
                    name: 'Angular',
                    weeklyGoalMinutes: -30
                })
            ).rejects.toThrowError(
                'weeklyGoalMinutes must be a positive integer.'
            );

            expect(repository.create).not.toHaveBeenCalled();
        });

        it('deve rejeitar meta semanal decimal', async () => {
            const repository = createRepositoryMock();
            const service = new StudyAreaService(repository);

            await expect(
                service.create({
                    name: 'Angular',
                    weeklyGoalMinutes: 30.5
                })
            ).rejects.toThrowError(
                'weeklyGoalMinutes must be a positive integer.'
            );

            expect(repository.create).not.toHaveBeenCalled();
        });

        it('deve criar uma área com meta semanal válida', async () => {
            const repository = createRepositoryMock();

            const expectedArea = {
                id: 'area-id',
                name: 'Angular',
                weeklyGoalMinutes: 1500
            } as Awaited<
                ReturnType<StudyAreaRepository['create']>
            >;

            vi.mocked(repository.create).mockResolvedValue(expectedArea);

            const service = new StudyAreaService(repository);

            const result = await service.create({
                name: 'Angular',
                weeklyGoalMinutes: 1500
            });

            expect(result).toBe(expectedArea);
            expect(repository.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('findAll', () => {
        it('deve retornar todas as áreas', async () => {
            const repository = createRepositoryMock();

            const areas = [
                {
                    id: 'area-1',
                    name: 'Angular',
                    weeklyGoalMinutes: 1500
                }
            ] as Awaited<
                ReturnType<StudyAreaRepository['findAll']>
            >;

            vi.mocked(repository.findAll).mockResolvedValue(areas);

            const service = new StudyAreaService(repository);

            await expect(service.findAll()).resolves.toBe(areas);
        });
    });

    describe('findById', () => {
        it('deve retornar a área existente', async () => {
            const repository = createRepositoryMock();

            const area = {
                id: 'area-1',
                name: 'Angular',
                weeklyGoalMinutes: 1500
            } as Awaited<
                ReturnType<StudyAreaRepository['findById']>
            >;

            vi.mocked(repository.findById).mockResolvedValue(area);

            const service = new StudyAreaService(repository);

            await expect(
                service.findById('area-1')
            ).resolves.toBe(area);
        });

        it('deve lançar erro quando a área não existir', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.findById).mockResolvedValue(null);

            const service = new StudyAreaService(repository);

            await expect(
                service.findById('missing-id')
            ).rejects.toThrowError(
                'StudyArea with id "missing-id" was not found.'
            );
        });
    });

    describe('update', () => {
        it('deve atualizar a área com dados válidos', async () => {
            const repository = createRepositoryMock();

            const updatedArea = {
                id: 'area-1',
                name: 'TypeScript',
                weeklyGoalMinutes: 1800
            } as Awaited<
                ReturnType<StudyAreaRepository['update']>
            >;

            vi.mocked(repository.update).mockResolvedValue(updatedArea);

            const service = new StudyAreaService(repository);

            const result = await service.update('area-1', {
                name: '  TypeScript ',
                weeklyGoalMinutes: 1800
            });

            expect(result).toBe(updatedArea);

            expect(repository.update).toHaveBeenCalledWith(
                'area-1',
                {
                    name: 'TypeScript',
                    weeklyGoalMinutes: 1800
                }
            );
        });

        it('deve lançar erro quando a atualização não encontrar a área', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.update).mockResolvedValue(null);

            const service = new StudyAreaService(repository);

            await expect(
                service.update('missing-id', {
                    name: 'Angular',
                    weeklyGoalMinutes: 1500
                })
            ).rejects.toThrowError(
                'StudyArea with id "missing-id" was not found.'
            );
        });
    });

    describe('delete', () => {
        it('deve excluir uma área existente', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.delete).mockResolvedValue(true);

            const service = new StudyAreaService(repository);

            await expect(
                service.delete('area-1')
            ).resolves.toBeUndefined();

            expect(repository.delete).toHaveBeenCalledWith('area-1');
        });

        it('deve lançar erro quando a área não existir', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.delete).mockResolvedValue(false);

            const service = new StudyAreaService(repository);

            await expect(
                service.delete('missing-id')
            ).rejects.toThrowError(
                'StudyArea with id "missing-id" was not found.'
            );
        });
    });
});