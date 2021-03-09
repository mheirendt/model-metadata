import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:not-ends-with', () => {
    const operator = OperatorMap.get('not-ends-with') as IOperator;
    it('should check if string doesn\'t end with substring', () => {
        const falseCase = operator.execute('test', 't');
        const truthCase = operator.execute('test', 's');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array doesn\'t end with entry', () => {
        const falseCase = operator.execute([1, 2, 3], 3);
        const trueCase = operator.execute([1, 2, 3], 2);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should return true if an empty array is provided', () => {
        const result = operator.execute([], 1);
        expect(result).toBeTruthy();
    });
});