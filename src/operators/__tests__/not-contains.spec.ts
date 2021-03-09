import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:not-contains', () => {
    const operator = OperatorMap.get('not-contains') as IOperator;
    it('Should check if string does not contain substring', () => {
        const falseCase = operator.execute('test', 'test');
        const truthCase = operator.execute('test', 'ttes');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should check if array does not contain entry', () => {
        const falseCase = operator.execute(['1', '2'], '2');
        const trueCase = operator.execute(['1', '2'], '5');
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });
});