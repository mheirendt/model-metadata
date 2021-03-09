import { Bar } from '../../../jest.setup';
import { Model } from '../../model';
import { Token } from '../actions';
import { FactCheck } from '../fact-check';

describe('token', () => {
    describe('execute', () => {
        let input: Bar, stringFact: string, dateFact: string, factCheck: FactCheck;

        beforeEach(() => {
            input = new Bar({
                foo: { foo: 'foo', coerceDate: new Date('10-19-2020') }
            });
            stringFact = '/foo/foo';
            dateFact = '/foo/coerceDate';
            factCheck = new FactCheck(input.facts());
        });
        it('should reference current value by token', async () => {
            const token = new Token({ fact: stringFact });
            const result = await token.execute(factCheck);
            expect(result).toEqual(input.foo.foo);
        });
        it('should evaluate a property from a token', async () => {
            const token = new Token({ fact: stringFact, property: 'length' });
            const result = await token.execute(factCheck);
            expect(result).toEqual(input.foo.foo.length);
        });
        it('should evaluate a method for an input date', async () => {
            const token = new Token({ fact: dateFact, method: { name: 'addDays', args: [2] } });
            const result = await token.execute(factCheck);
            expect(result).toEqual(input.foo.coerceDate.addDays(2));
        });
        it('should evaluate a replace parameter as a RegExp', async () => {
            input.foo.foo = 'test\r\nnew line';
            factCheck = new FactCheck(input.facts());

            // A pattern string is not able to check multiline strings
            // We expect this to fail unless pattern is an instance of RegExp with the 'g' flag
            const pattern = '\\r\\nnew line';
            expect(input.foo.foo.replace(pattern, '')).toEqual(input.foo.foo);

            const token = new Token({ fact: stringFact, method: { name: 'replace', args: [pattern, ''] } });
            const result = await token.execute(factCheck);
            expect(result).toEqual('test');
        });
        it('should factCheck an async fact', async () => {
            class TestModel extends Model {
                account!: string;

                facts(): Record<string, unknown> {
                    const base = super.facts();
                    base.currentUser = (params: any, factCheck: FactCheck) => {
                        return Promise.resolve({
                            account: 'test',
                            role: 'admin'
                        });
                    };
                    return base;
                }
            }

            const token = new Token({ fact: 'currentUser', property: 'account' });
            const testInput = new TestModel();
            factCheck = new FactCheck(testInput.facts());
            const result = await token.execute(factCheck);
            expect(result).toEqual('test');
        });
        it('should throw when a bad property is given', async () => {
            const token = new Token({ fact: stringFact, property: 'badProp' });
            await expect(token.execute(factCheck)).rejects.toEqual(expect.objectContaining({ message: expect.stringContaining('Cannot index into property') }));
        });
        it('should throw when a bad method is given', async () => {
            const token = new Token({ fact: stringFact, method: { name: 'badMethod' } });
            await expect(token.execute(factCheck)).rejects.toEqual(expect.objectContaining({ message: expect.stringContaining('Unable to execute method') }));
        });
    });
});