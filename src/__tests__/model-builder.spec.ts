import { ModelBuilder } from '../model-builder';

describe('model-builder', () => {
    it('should validate a string property', () => {
        const builder = new ModelBuilder();
        builder.string('test').required().min(5).max(10).pattern(/\d+/);

        let valid = builder.validate({ test: 'kjfdlkjfd' });
        expect(valid.error).toEqual(expect.objectContaining({ test: expect.arrayContaining(['Field is invalid']) }));

        valid = builder.validate({ test: '12345' });
        expect(valid.error).toBeUndefined();
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