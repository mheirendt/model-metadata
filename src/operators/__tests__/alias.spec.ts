import * as Methods from '../methods';
import { OperatorMap } from '../operator-map';

describe('operators:alias', () => {
    it('all operators should define an alias method that returns Array<string> of unique names', () => {

        const methods = Object.keys(Methods);
        let cache: string[] = [...methods];
        methods.forEach((operatorName: string) => {
            const instance = OperatorMap.get(operatorName);
            const alias = instance!.alias();
            expect(Array.isArray(alias)).toBeTruthy();
            expect(alias.every((entry: string) => entry.length > 0 && typeof entry === 'string'));
            cache = [...cache, ...alias];
        });

        const unique = OperatorMap.get('unique');
        expect(unique!.execute(undefined, cache)).toBeTruthy();

    });
});