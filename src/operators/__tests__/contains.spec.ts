import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:contains', () => {
    const operator = OperatorMap.get('contains') as IOperator;
    it('should check if string contains substring', () => {
        const falseCase = operator.execute('test', 'ttes');
        const truthCase = operator.execute('test', 'test');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array contains entry', () => {
        const falseCase = operator.execute(['1', '2'], '5');
        const trueCase = operator.execute(['1', '2'], '1');
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });
});