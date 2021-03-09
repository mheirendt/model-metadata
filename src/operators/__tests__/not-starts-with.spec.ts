import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:not-starts-with', () => {
    const operator = OperatorMap.get('not-starts-with') as IOperator;
    it('should check if string doesn\'t start with substring', () => {
        const falseCase = operator.execute('test', 't');
        const truthCase = operator.execute('test', 'e');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array doesn\'t start with entry', () => {
        const falseCase = operator.execute([1, 2, 3], 1);
        const trueCase = operator.execute([1, 2, 3], 2);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should return true if an empty array is provided', () => {
        const result = operator.execute([], 1);
        expect(result).toBeTruthy();
    });
});