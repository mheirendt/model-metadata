import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:ends-with', () => {
    const operator = OperatorMap.get('ends-with') as IOperator;
    it('should check if string ends with substring', () => {
        const falseCase = operator.execute('test', 's');
        const truthCase = operator.execute('test', 't');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array ends with entry', () => {
        const falseCase = operator.execute([1, 2, 3], 2);
        const trueCase = operator.execute([1, 2, 3], 3);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should return false if an empty array is provided', () => {
        const result = operator.execute([], 1);
        expect(result).toBeFalsy();
    });
});