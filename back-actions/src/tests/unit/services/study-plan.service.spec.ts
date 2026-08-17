import { describe, expect, it, vi } from 'vitest';

import type { StudyPlanRepository } from '../../../repositories/study-plan.repository.js';
import { StudyPlanService } from '../../../services/study-plan.service.js';

function createRepositoryMock(): StudyPlanRepository {
    return {
        create: vi.fn(),
        findAll: vi.fn(),
        findActive: vi.fn(),
        findById: vi.fn()
    } as unknown as StudyPlanRepository;
}

describe('StudyPlanService', () => {
    describe('create', () => {
        it('deve remover espaços externos do nome', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.create).mockResolvedValue(
                {} as Awaited<ReturnType<StudyPlanRepository['create']>>
            );

            const service = new StudyPlanService(repository);

            await service.create({
                name: '  Plano principal  ',
                coefficient: 1.5,
                status: 'active'
            });

            expect(repository.create).toHaveBeenCalledWith({
                name: 'Plano principal',
                coefficient: 1.5,
                status: 'active'
            });
        });

        it('deve rejeitar nome vazio', async () => {
            const repository = createRepositoryMock();
            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: '   ',
                    coefficient: 1,
                    status: 'active'
                })
            ).rejects.toThrowError(
                'Study plan name is required.'
            );
        });

        it('deve rejeitar coefficient igual a zero', async () => {
            const repository = createRepositoryMock();
            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: 'Plano',
                    coefficient: 0,
                    status: 'active'
                })
            ).rejects.toThrowError(
                'Coefficient must be greater than zero.'
            );
        });

        it('deve rejeitar coefficient negativo', async () => {
            const repository = createRepositoryMock();
            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: 'Plano',
                    coefficient: -1,
                    status: 'active'
                })
            ).rejects.toThrowError(
                'Coefficient must be greater than zero.'
            );
        });

        it('deve rejeitar NaN como coefficient', async () => {
            const repository = createRepositoryMock();
            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: 'Plano',
                    coefficient: Number.NaN,
                    status: 'active'
                })
            ).rejects.toThrowError(
                'Coefficient must be greater than zero.'
            );
        });

        it('deve aceitar coefficient positivo', async () => {
            const repository = createRepositoryMock();

            const expectedPlan = {
                id: 'plan-1',
                name: 'Plano',
                coefficient: 1.5,
                status: 'active'
            } as Awaited<
                ReturnType<StudyPlanRepository['create']>
            >;

            vi.mocked(repository.create).mockResolvedValue(expectedPlan);

            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: 'Plano',
                    coefficient: 1.5,
                    status: 'active'
                })
            ).resolves.toBe(expectedPlan);
        });

        it('deve rejeitar status diferente de active ou inactive', async () => {
            const repository = createRepositoryMock();
            const service = new StudyPlanService(repository);

            await expect(
                service.create({
                    name: 'Plano',
                    coefficient: 1,
                    status: 'archived' as never
                })
            ).rejects.toThrowError(
                'Study plan status must be active or inactive.'
            );
        });
    });

    describe('findById', () => {
        it('deve retornar plano existente', async () => {
            const repository = createRepositoryMock();

            const plan = {
                id: 'plan-1',
                name: 'Plano',
                coefficient: 1,
                status: 'active'
            } as Awaited<
                ReturnType<StudyPlanRepository['findById']>
            >;

            vi.mocked(repository.findById).mockResolvedValue(plan);

            const service = new StudyPlanService(repository);

            await expect(
                service.findById('plan-1')
            ).resolves.toBe(plan);
        });

        it('deve lançar erro quando o plano não existir', async () => {
            const repository = createRepositoryMock();

            vi.mocked(repository.findById).mockResolvedValue(null);

            const service = new StudyPlanService(repository);

            await expect(
                service.findById('missing-id')
            ).rejects.toThrowError(
                'StudyPlan with id "missing-id" was not found.'
            );
        });
    });

    describe('findSelectableById', () => {
        it('deve retornar plano ativo', async () => {
            const repository = createRepositoryMock();

            const plan = {
                id: 'plan-1',
                name: 'Plano',
                coefficient: 1,
                status: 'active'
            } as Awaited<
                ReturnType<StudyPlanRepository['findById']>
            >;

            vi.mocked(repository.findById).mockResolvedValue(plan);

            const service = new StudyPlanService(repository);

            await expect(
                service.findSelectableById('plan-1')
            ).resolves.toBe(plan);
        });

        it('deve rejeitar plano inativo', async () => {
            const repository = createRepositoryMock();

            const plan = {
                id: 'plan-1',
                name: 'Plano',
                coefficient: 1,
                status: 'inactive'
            } as Awaited<
                ReturnType<StudyPlanRepository['findById']>
            >;

            vi.mocked(repository.findById).mockResolvedValue(plan);

            const service = new StudyPlanService(repository);

            await expect(
                service.findSelectableById('plan-1')
            ).rejects.toThrowError(
                'Inactive study plans cannot be selected for a new week.'
            );
        });
    });

    describe('findAll', () => {
        it('deve delegar a consulta ao repository', async () => {
            const repository = createRepositoryMock();

            const plans = [] as Awaited<
                ReturnType<StudyPlanRepository['findAll']>
            >;

            vi.mocked(repository.findAll).mockResolvedValue(plans);

            const service = new StudyPlanService(repository);

            await expect(service.findAll()).resolves.toBe(plans);
        });
    });

    describe('findActive', () => {
        it('deve retornar os planos ativos', async () => {
            const repository = createRepositoryMock();

            const plans = [] as Awaited<
                ReturnType<StudyPlanRepository['findActive']>
            >;

            vi.mocked(repository.findActive).mockResolvedValue(plans);

            const service = new StudyPlanService(repository);

            await expect(service.findActive()).resolves.toBe(plans);
        });
    });
});