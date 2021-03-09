import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:unique', () => {
    const operator = OperatorMap.get('unique') as IOperator;
    it('should check array is unique', () => {
        const falseCase = operator.execute((t: unknown) => (<any>t).val, [{ name: '1', val: 1 }, { name: '2', val: 2 }, { name: '2', val: 2 }]); // eslint-disable-line
        const truthCase = operator.execute((t: unknown) => t as number, [1, 2, 3]);
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('Should apply default transformation function if not provdied', () => {
        const result = operator.execute(undefined, [1, 2, 3]);
        expect(result).toBeTruthy();
    });
});