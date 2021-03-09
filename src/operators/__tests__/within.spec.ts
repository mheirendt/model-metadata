import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:within', () => {
    const operator = OperatorMap.get('within') as IOperator;
    it('should check item is within array', () => {
        const falseCase = operator.execute([1, 2, 3], '1');
        const truthCase = operator.execute([1, 2, 3], 1);
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array contains sub-array', () => {
        const falseCase = operator.execute([1, 2, 3], [1, 4]);
        const truthCase = operator.execute([1, 2, 3], [1, 2]);
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });
});