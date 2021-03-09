import { Model } from '../model';
import { ModelBuilder } from '../model-builder';

describe('model-builder', () => {
    it('should validate a string property', async () => {
        const builder = new ModelBuilder();
        builder.string('test').required().min(5).max(10).pattern(/\d+/);

        let valid = await builder.validateAsync({ test: 'kjfdlkjfd' });
        expect(valid.error).toEqual(expect.objectContaining({ test: expect.arrayContaining(['Field is invalid']) }));

        valid = await builder.validateAsync({ test: '12345' });
        expect(valid.error).toBeUndefined();
    });

    it('should validate a date property', async () => {
        const builder = new ModelBuilder();
        const now = new Date();
        builder.date('created').required().max(now);

        let result = await builder.validateAsync({ created: now });
        expect(result.error).toBeUndefined();

        result = await builder.validateAsync({ created: new Date() });
        expect(result.error).toEqual(expect.objectContaining({ created: expect.arrayContaining([expect.stringContaining('Maximum date of')]) }));
    });

    it('should validate a number property', async () => {
        const builder = new ModelBuilder();
        builder.number('count').max(5).min(3);
        let result = await builder.validateAsync({ count: 3 });
        expect(result.error).toBeUndefined();

        result = await builder.validateAsync({ count: 2 });
        expect(result.error).toEqual(expect.objectContaining({ count: expect.arrayContaining(['Minimum length of 3']) }));
    });
});