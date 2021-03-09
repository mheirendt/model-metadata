import { ValidateOperator } from '../validate-operator';

describe('validate-operator', () => {

    it('should throw when left is undefined', () => {
        expect(() => ValidateOperator(undefined, 2)).toThrow('Left value must be defined');
    });

    it('should throw when right is undefined', () => {
        expect(() => ValidateOperator('test', undefined)).toThrow('Right value must be defined');
    });

    it('should throw when types don\'t match', () => {
        expect(() => ValidateOperator('test', 2)).toThrow('Left and right types must match');
    });
});