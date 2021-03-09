import { IFactCheck } from '../interfaces';

/** @inheritdoc */
export class FactCheck implements IFactCheck {

    /**
     * A cache of facts that are evaluated by function call
     */
    private readonly cache: Record<string, unknown> = {};

    /** @inheritdoc */
    constructor(
        private readonly facts: Record<string, unknown> = {}
    ) {

    }

    /** @inheritdoc */
    hasFact(fact: string): boolean {
        return fact in this.facts;
    }

    /**
     * @inheritdoc
     * @example
     * ```typescript
     * // Create a fact check from runtime facts via [[Model.facts]]
     * const factCheck = new FactCheck(...facts);
     * 
     * // Resolves to the value of the '/name' property of the input model, if it exists
     * const propEvaluation = await factCheck.factValue('/name');
     * 
     * // OR you can query using async service methods
     * 
     * // Resolves to a User class instance for the 'DEMO' user, if it exists
     * const demoUser = await factCheck.factValue('GetUser', { account: 'DEMO' });
     * ```
     */
    async factValue<TResult>(fact: string, params: Record<string, unknown> = {}): Promise<TResult> {
        if (!(fact in this.facts)) throw new Error(`Fact '${fact}' is not registered.`);
        const value = this.facts[fact] as TResult;
        if (typeof value === 'function') {
            const cacheKey = fact + Object.keys(params).map(param => `[${param}]:${params[param]}`).join(',');
            if (!(cacheKey in this.cache)) {
                this.cache[cacheKey] = await value(params, this);
            }
            return this.cache[cacheKey] as TResult;
        } else {
            return Promise.resolve(value);
        }
    }
}