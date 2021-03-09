import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:match', () => {
    const operator = OperatorMap.get('match') as IOperator;
    it('should check if string matches pattern', () => {
        const falseCase = operator.execute(/\d+/, 'test');
        const truthCase = operator.execute(/\d+/, 'test1');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should not require value on the right', () => {
        const result = operator.execute(/\d+/, '');
        expect(result).toBeTruthy();
    });

    it('should convert string[] to a RegExp', () => {
        const result = operator.execute(['.+@.+\\..+', 'i'], 'test@test.com');
        expect(result).toBeTruthy();
    });

    it('should convert string to a RegExp', () => {
        const result = operator.execute('.+@.+\\..+', 'test@test.com');
        expect(result).toBeTruthy();
    });
});