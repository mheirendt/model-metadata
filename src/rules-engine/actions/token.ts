import { IToken, IMethod } from '../../interfaces';
import { merge } from 'lodash';
import { Validators } from '../../decorators';
import { Model } from '../../model';
import { FactCheck } from '../fact-check';

/** @inheritdoc */
export class Token extends Model implements IToken {

    /** @inheritdoc */
    @Validators.required
    fact!: string;

    /**
     * @inheritdoc
     * @example
     * ```typescript
     * const token = new Token({
     *   fact: '/testArray',
     *   property: 'length',
     * });
     * const input = new Model({
     *   test: [1, 2],
     * });
     * // Evaluation of 'token' against 'input' will yield '2'
     * ```
     */
    property?: string;
    /**
     * @inheritdoc
     * @example
     * ```typescript
     * const token = new Token({
     *   path: '/testArray',
     *   method: {
     *     name: 'slice',
     *     args: [0, 1],
     *   },
     * });
     * const input = new Model({
     *   testArray: [1, 2],
     * });
     * // Evaluation of 'token' against 'input' will yield '1'
     * ```
     */
    method?: IMethod;

    /**
     * Constructs a new instance of a Token model
     * @param props - Optional properties to be provided to the model
     */
    constructor(props?: IToken) {
        props = merge({
            fact: ''
        }, props || {});
        super(props);
    }

    /**
     * Execute a token against a factCheck. There is an order of precedence for each transformation of the token.
     * 1. The fact value is extracted from [[FactCheck]]
     * 2. If there is a method, the method is applied to the value returned from step 1.
     *    Otherwise the value from step 1 is returned
     * 3. If there is a property, the property is applied to the result of step 2.
     *    Otherwise the value from step 2 is returned
     * @param factCheck - A factCheck instance to reference other fact values
     * @returns A promise with the expected return type
     * @throws If the method is not applicable for the fact
     * @throws If the property does not exist for the fact / result of the method
     */
    async execute(factCheck: FactCheck): Promise<unknown> {

        // If the fact is defined in for the model, pull the value from the fact
        let fact = await factCheck.factValue<any>(this.fact);

        if (this.method) {
            const args = this.method.args?.map((arg, idx) => {

                /**
                 * Try to create a RegExp class instance from the arg input
                 * @param arg - The input to the RegExp constructor
                 * @returns A RegExp if the arg is valid for the RegExp constructor
                 */
                const tryNewRegExp = (arg: unknown): RegExp | undefined => {
                    try {
                        if (Array.isArray(arg)) {
                            return new RegExp(arg[0], arg[1]);
                        } else if (typeof arg === 'string') {
                            return new RegExp(arg as string);
                        }
                    } catch (e) {
                        return;
                    }
                };

                // The first param of string.replace can be a RegExp
                if (idx === 0 && this.method?.name === 'replace') {
                    const regexp = tryNewRegExp(arg);
                    if (regexp) return regexp;
                }

                // Return the arg as is if no conversion is necessary
                return arg;
            }) as unknown[];

            // Try to execute the method on the fact value and return the result
            try {
                fact = fact[this.method.name](...args);
            } catch (e) {
                e.message = `Unable to execute method '${this.method.name}(${(this.method.args || []).join(', ')})' for fact '${this.fact}'`;
                throw e;
            }
        }

        // Index into a sub property of the fact if specified
        if (this.property) {
            if (typeof fact !== 'object' && !(fact[this.property])) throw new Error(`Cannot index into property '${this.property}' for ${fact}`);
            fact = fact[this.property];
        }

        // Return the fact value
        return fact;
    }
}