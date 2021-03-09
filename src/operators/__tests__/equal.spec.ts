import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:equal', () => {
    const operator = OperatorMap.get('equal') as IOperator;
    it('should check equality', () => {
        const falseCase = operator.execute('test', 'tes');
        const truthCase = operator.execute('test', 'test');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });
});