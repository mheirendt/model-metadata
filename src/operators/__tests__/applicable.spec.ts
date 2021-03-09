import { Applicable } from '../applicable';
import { DataType, IOperator } from '../../interfaces';
import { OperatorBase } from '../operator-base';

class TestOperator extends OperatorBase implements IOperator {
    @Applicable({ String: [DataType.number, DataType.string] })
    execute(left: string, right: unknown) {
        return left === right;
    }
    alias(): string[] {
        return [];
    }
}

describe('operators:applicable', () => {
    it('should throw when right type is not applicable', () => {
        const test = new TestOperator();
        expect(() => test.execute('test', new Date())).toThrow('Not Applicable');
    });
});