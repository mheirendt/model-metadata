import { Mutation } from '../actions';
import { Bar } from '../../../jest.setup';
import { IMutation } from '../../interfaces';

describe('rules-engine:mutation', () => {

    let bar: Bar, oldValue: unknown; // eslint-disable-line

    beforeEach(async () => {
        bar = new Bar({
            foo: { foo: 'foo' }
        });
        oldValue = bar.facts()['/foo/foo'];

    });

    it('should replace', async () => {
        const mutation = new Mutation({ path: '/foo/foo', mutation: 'test' });
        await mutation.execute(bar);
        const newValue = bar.foo.foo;
        expect(newValue).toEqual(mutation.mutation);
        expect(newValue).not.toEqual(oldValue);
    });

    it('should interpolate a token\'s execution', async () => {
        const mutation = mockTokens({ path: '/foo/foo', mutation: 'test {} test', tokens: [{ fact: '/foo/foo' }] });
        (<jest.Mock>mutation.tokens[0].execute).mockResolvedValue('foo');
        await mutation.execute(bar);
        expect(bar.foo.foo).toEqual('test foo test');
    });

    function mockTokens(mutation: IMutation): Mutation {
        const result = new Mutation(mutation);
        result.tokens?.map(token => token.execute = jest.fn());
        return result;
    }
});
