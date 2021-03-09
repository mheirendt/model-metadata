import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:is-truthy', () => {
    const operator = OperatorMap.get('is-truthy') as IOperator;
    it('should evaluate truthiness', () => {
        const falseCase = operator.execute(undefined, '');
        const truthCase = operator.execute(undefined, 't');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should not be truthy for strings with blank space', () => {
        const falseCase = operator.execute(undefined, ' ');
        expect(falseCase).toBeFalsy();
    });

    it('should check for undefined value', () => {
        const result = operator.execute(undefined, undefined);
        expect(result).toBeFalsy();
    });
});