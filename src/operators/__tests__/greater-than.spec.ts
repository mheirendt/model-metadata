import { IOperator } from '../../interfaces';
import { OperatorMap } from '../operator-map';

describe('operators:greater-than', () => {
    const operator = OperatorMap.get('greater-than') as IOperator;
    it('should convert left type to string when right is string', () => {
        const falseCase = operator.execute(3, '123');
        const truthCase = operator.execute(3, '12');
        expect(falseCase).toBeFalsy();
        expect(truthCase).toBeTruthy();
    });

    it('should convert left type to array when right is array', () => {
        const falseCase = operator.execute(2, ['1', '2']);
        const trueCase = operator.execute(2, ['1']);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should compare dates', () => {
        const falseCase = operator.execute(new Date(), new Date());
        const trueCase = operator.execute(new Date(), new Date().addDays(-1));
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });

    it('should compare numbers', () => {
        const falseCase = operator.execute(1, 1);
        const trueCase = operator.execute(2, 1);
        expect(falseCase).toBeFalsy();
        expect(trueCase).toBeTruthy();
    });
});