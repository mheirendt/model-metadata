import { Model } from '../../model';
import { FactCheck } from '../fact-check';

describe('FactCheck', () => {
    describe('hasFact', () => {
        it('should determine if a fact exists', () => {
            const model = new Model({
                fact: 'test'
            });
            const factCheck = new FactCheck(model.facts());
            expect(factCheck.hasFact('/fact')).toEqual(true);
            expect(factCheck.hasFact('/fiction')).toEqual(false);
        });
    });
    describe('factValue', () => {
        it('should cache function evaluations', async () => {
            let calls = 0;
            const factFn = (params: Record<string, unknown>): void => { calls++; };
            const factCheck = new FactCheck({ fn: factFn });

            // Call the function for the first time, which will initialize the cache
            await factCheck.factValue('fn', { test: true });
            // When called with the same parameter, the cache should be used
            await factCheck.factValue('fn', { test: true });
            await factCheck.factValue('fn', { test: true });
            expect(calls).toEqual(1);

            // When called with different parameters, the cache should not be used
            await factCheck.factValue('fn', { test: false });
            expect(calls).toEqual(2);

            await factCheck.factValue('fn', { test: 1 });
            expect(calls).toEqual(3);

            await factCheck.factValue('fn', { test: 'string' });
            expect(calls).toEqual(4);
        });
        it('should resolve runtime facts', async () => {
            const input = {
                test: 'test',
                bool: false
            };
            const factCheck = new FactCheck(input);
            expect(await factCheck.factValue<string>('test')).toEqual('test');
            expect(await factCheck.factValue<boolean>('bool')).toEqual(false);
        });
    });
});