import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StudyPlan, StudyPlanStatus } from '../../../models/study-plan.model.js';

describe('StudyPlan model', () => {
    it('deve possuir o contrato de tipos esperado', () => {
        expectTypeOf<StudyPlan>().toEqualTypeOf<{
            id: string;
            name: string;
            coefficient: number;
            status: StudyPlanStatus;
        }>();
    });

    it('deve representar um plano ativo', () => {
        const plan = {
            id: 'plan-1',
            name: 'Plano padrão',
            coefficient: 1.5,
            status: 'active'
        } satisfies StudyPlan;

        expect(plan.id).toBe('plan-1');
        expect(plan.name).toBe('Plano padrão');
        expect(plan.coefficient).toBe(1.5);
        expect(plan.status).toBe('active');
    });

    it('deve representar um plano inativo', () => {
        const plan = {
            id: 'plan-2',
            name: 'Plano antigo',
            coefficient: 1,
            status: 'inactive'
        } satisfies StudyPlan;

        expect(plan.status).toBe('inactive');
    });

    it('deve restringir StudyPlanStatus aos valores active e inactive', () => {
        expectTypeOf<StudyPlanStatus>()
            .toEqualTypeOf<'active' | 'inactive'>();
    });

    it('deve utilizar number para coefficient', () => {
        expectTypeOf<StudyPlan['coefficient']>()
            .toEqualTypeOf<number>();
    });
});