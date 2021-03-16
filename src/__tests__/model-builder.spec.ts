import { Model } from '../model';
import { DateBuilder, ModelBuilder, NumberBuilder, StringBuilder } from '../model-builder';

describe('model-builder', () => {

    it('should evaluate a condition', () => {
        const builder = new ModelBuilder();
        builder.string('name').required().min(2).max(10);

        const birthday = builder.date('birthday').required();

        // Require additional info when user is under 21
        const min = new Date();
        min.setFullYear(min.getFullYear() - 21);
        birthday.when('greater-than', min, (builder: ModelBuilder) => {
            builder.string('guardian').required();
        });

        const { error } = builder.validate({ name: 'Michael', birthday: new Date('01/01/2010') });
        expect(error.guardian).toEqual(expect.arrayContaining(['Field is required']));
    });

    it('should validate a sub-model', () => {
        const builder = new ModelBuilder();

        builder.string('name').required();
        const addressBuilder = builder.model('address');

        addressBuilder.string('street').required();

        const { error } = builder.validate({ name: 'Michael' });
        expect(error).toEqual(expect.objectContaining({ address: expect.objectContaining({ street: expect.arrayContaining(['Field is required']) }) }));
    });

    it('should validate arrays', () => {
        const builder = new ModelBuilder();

        const arrayBuilder = builder.array('users').items(Model).min(1);
        const itemBuilder = arrayBuilder.item<ModelBuilder>();
        itemBuilder.string('name').required();
        itemBuilder.string('email').email();


        const { error } = builder.validate({
            users: [{ name: 'Michael', email: 'test@test.com' }, { name: '' }]
        });

        expect(error).toEqual(
            expect.objectContaining({
                users: expect.arrayContaining([
                    undefined,
                    expect.objectContaining({ name: expect.arrayContaining(['Field is required']) })
                ])
            })
        );

    });

    describe('string', () => {
        let builder: ModelBuilder;
        let propertyBuilder: StringBuilder;
        beforeEach(() => {
            builder = new ModelBuilder();
            propertyBuilder = builder.string('name');
        });

        it('should build', () => {
            const { value } = builder.validate({});
            expect(value.name).toEqual('');
        });

        it('should validate', () => {
            propertyBuilder.required().min(5).max(10).pattern(/\d+/);

            let valid = builder.validate({ name: 'test' });
            expect(valid.error).toEqual(expect.objectContaining({ name: expect.arrayContaining(['Field is invalid']) }));

            valid = builder.validate({ name: '12345' });
            expect(valid.error).toBeUndefined();
        });
    });

    describe('date', () => {
        let builder: ModelBuilder;
        let propertyBuilder: DateBuilder;
        beforeEach(() => {
            builder = new ModelBuilder();
            propertyBuilder = builder.date('created');
        });
        it('should build', () => {
            const { value } = builder.validate({});
            expect(value.created).toBeDefined();
            expect(value.created).toBeInstanceOf(Date);
        });
        it('should validate', () => {
            const now = new Date();
            propertyBuilder.required().max(now);

            let result = builder.validate({ created: now });
            expect(result.error).toBeUndefined();

            result = builder.validate({ created: new Date() });
            expect(result.error).toEqual(expect.objectContaining({ created: expect.arrayContaining([expect.stringContaining('Maximum date of')]) }));
        });

    });

    describe('boolean', () => {
        let builder: ModelBuilder;
        beforeEach(() => {
            builder = new ModelBuilder();
            builder.boolean('confirm');
        });
        it('should build', () => {
            const { value } = builder.validate({});
            expect(value.confirm).toBeDefined();
            expect(value.confirm).toEqual(false);
        });
    });

    describe('number', () => {
        let builder: ModelBuilder;
        let propertyBuilder: NumberBuilder;
        beforeEach(() => {
            builder = new ModelBuilder();
            propertyBuilder = builder.number('count');
        });
        it('should build', () => {
            const { value } = builder.validate({});
            expect(value.count).toEqual(0);
        });
        it('should validate', () => {
            propertyBuilder.max(5).min(3);
            let result = builder.validate({ count: 3 });
            expect(result.error).toBeUndefined();

            result = builder.validate({ count: 2 });
            expect(result.error).toEqual(expect.objectContaining({ count: expect.arrayContaining(['Minimum length of 3']) }));
        });
    });
});