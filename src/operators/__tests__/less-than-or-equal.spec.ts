import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:less-than-or-equal', () => {
    const operator = OperatorMap.get('less-than-or-equal') as IOperator;
    it('should convert left type to string when right is string', () => {
        const falseCase = operator.execute(3, '12');
        const truthCase = operator.execute(3, '123');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should convert left type to array when right is array', () => {
        const falseCase = operator.execute(2, ['1']);
        const trueCase = operator.execute(2, ['1', '2']);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should compare dates', () => {
        const falseCase = operator.execute(new Date(), new Date().addDays(-1));
        const trueCase = operator.execute(new Date(), new Date());
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should compare numbers', () => {
        const falseCase = operator.execute(2, 1);
        const trueCase = operator.execute(1, 1);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });
});