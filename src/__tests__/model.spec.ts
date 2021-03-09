import { Foo, Bar, IFoo } from '../../jest.setup';
import { Validation } from '../rules-engine';
import { ModifiersSymbol } from '../decorators';
import { PropertyModifier } from '../interfaces';

describe('models:model', () => {

    it('should coerce constructor properties to data type of class property', () => {
        const date = new Date();
        const foo = new Foo({
            coerceDate: (<unknown>date.toISOString()) as Date,
            coerceBoolean: (<unknown>'Y') as boolean,
            coerceNumber: (<unknown>'123.32') as number,
            coerceString: (<unknown>null) as string,
        } as IFoo);

        expect(foo.coerceBoolean).toEqual(true);
        expect(foo.coerceNumber).toEqual(123.32);
        expect(foo.coerceDate).toEqual(date);
        expect(foo.coerceString).toEqual('');
    });

    describe('reflectType', () => {
        it('should reflect type at path', () => {
            const foo = new Foo({ foo: 'foo' });
            const type = foo.reflectType('/foo');
            expect(type).toEqual(String);
        });

        it('should return undefined if path doesn\'t exist', () => {
            const foo = new Foo({ foo: 'foo' });
            const type = foo.reflectType('/bar');
            expect(type).toBeUndefined();
        });
    });

    describe('errors', () => {
        it('should return false when valid', () => {
            const foo = new Foo({ foo: 'foo' });
            expect(foo.errors()).toBeFalsy();
        });

        it('should return an array of errors for property if invalid', () => {
            const bar = new Bar({
                foo: {
                    foo: ''
                }
            });

            expect(bar.errors()).toBeTruthy();
        });

        it('should not evaluate other validators if required and operator resolves to false', () => {
            const foo = new Foo({ foo: '' });
            const validation = new Validation({ path: '/foo', validator: { name: 'length', args: 3, message: 'foo is 3 chars' } });
            validation.execute(foo);
            expect((foo.errors() as Record<string, Array<unknown>>).foo).toHaveLength(1);
        });
    });

    describe('toString', () => {
        let spy: jest.SpyInstance;
        beforeEach(() => {
            spy = jest.spyOn(JSON, 'stringify');
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('should format in a prettified format', () => {
            const foo = new Foo({ foo: 'foo' });
            foo.toString();
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ foo: 'foo' }), undefined, ' ');
        });

        it('should format in an uglified format', () => {
            const foo = new Foo({ foo: 'foo' });
            foo.toString(false);
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ foo: 'foo' }));
        });
    });
    describe('toJSON', () => {
        it('should ignore extended properties if told to do so', () => {
            const ticket = new Foo({}, { includeExtended: false });
            const json = ticket.toJSON();
            let extended = '';
            Object.keys(ticket).forEach(key => {
                if (extended.length) return;
                const metadata = ticket.reflectMetadata(key).find(m => m.key === ModifiersSymbol)?.args as number[] || [];
                if (metadata.includes(PropertyModifier.extended)) extended = key;
            });
            expect(json[extended]).toBeUndefined();
        });

        it('should ignore internal properties if told to do so', () => {
            const foo = new Foo({}, { includeInternals: false });
            const json = foo.toJSON();
            let internal = '';
            Object.keys(foo).forEach(key => {
                if (internal.length) return;
                const metadata = foo.reflectMetadata(key).find(m => m.key === ModifiersSymbol)?.args as number[] || [];
                if (metadata.includes(PropertyModifier.internal)) internal = key;
            });
            expect(json[internal]).toBeUndefined();
        });
    });
});
