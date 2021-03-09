import { ModelBuilder } from '../model-builder';

describe('model-builder', () => {

    it('should not allow duplicate properties', () => {
        const builder = new ModelBuilder();
        builder.string('test');
        expect(() => builder.string('test')).toThrowError('Duplicate property: test');
    });

    it('should validate a string property', () => {
        const builder = new ModelBuilder();
        builder.string('test').required().min(5).max(10).pattern(/\d+/);

        let valid = builder.validate({ test: 'kjfdlkjfd' });
        expect(valid.error).toEqual(expect.objectContaining({ test: expect.arrayContaining(['Field is invalid']) }));

        valid = builder.validate({ test: '12345' });
        expect(valid.error).toBeUndefined();
    });

    it('should evaluate a condition', () => {
        const builder = new ModelBuilder();
        const prop = builder.string('name').required().min(2).max(10);

        prop.when('equal', 'test', (builder: ModelBuilder) => {
            builder.string('another').required();
        });

        const { error } = builder.validate({
            name: 'test'
        });
        expect(typeof error).toEqual('object');
        expect(error!.another).toEqual(expect.arrayContaining(['Field is required']));

        const birthday = builder.date('birthday').required();

        // Require additional info when user is under 21
        const min = new Date();
        min.setFullYear(min.getFullYear() - 21);
        birthday.when('greater-than', min, (builder: ModelBuilder) => {
            builder.string('guardian').required();
        });

        const { error: nextError } = builder.validate({ name: 'Michael', birthday: new Date('01/01/2010') });
        expect(typeof nextError).toEqual('object');
        expect(nextError!.guardian).toEqual(expect.arrayContaining(['Field is required']));
    });

    it('should validate a date property', () => {
        const builder = new ModelBuilder();
        const now = new Date();
        builder.date('created').required().max(now);

        let result = builder.validate({ created: now });
        expect(result.error).toBeUndefined();

        result = builder.validate({ created: new Date() });
        expect(result.error).toEqual(expect.objectContaining({ created: expect.arrayContaining([expect.stringContaining('Maximum date of')]) }));
    });

    it('should validate a number property', () => {
        const builder = new ModelBuilder();
        builder.number('count').max(5).min(3);
        let result = builder.validate({ count: 3 });
        expect(result.error).toBeUndefined();

        result = builder.validate({ count: 2 });
        expect(result.error).toEqual(expect.objectContaining({ count: expect.arrayContaining(['Minimum length of 3']) }));
    });
});