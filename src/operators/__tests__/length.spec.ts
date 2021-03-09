import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:length', () => {
    const operator = OperatorMap.get('length') as IOperator;
    it('should compare length of string', () => {
        const falseCase = operator.execute(5, 'test');
        const truthCase = operator.execute(4, 'test');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should compare length of array', () => {
        const falseCase = operator.execute(2, [0]);
        const truthCase = operator.execute(1, [0]);
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });
});