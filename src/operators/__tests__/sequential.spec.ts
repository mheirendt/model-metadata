import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:sequential', () => {
    const operator = OperatorMap.get('sequential') as IOperator;
    it('should check array is sequential', () => {
        const falseCase = operator.execute((t: { name: string, val: number }) => t.val, [{ name: '1', val: 1 }, { name: '2', val: 2 }, { name: '4', val: 4 }]);
        const truthCase = operator.execute((t: unknown) => t as number, [1, 2, 3]);
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should return true with an array length of 1', () => {
        const result = operator.execute(undefined, [1]);
        expect(result).toBeTruthy();
    });

    it('Should apply default transformation function if not provdied', () => {
        const result = operator.execute(undefined, [1, 2, 3]);
        expect(result).toBeTruthy();
    });
});