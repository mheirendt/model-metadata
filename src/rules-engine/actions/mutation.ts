import { IExecutableAction, IMutation, PropertyModifier } from '../../interfaces';
import { merge } from 'lodash';
import { Token } from './token';
import { Model } from '../../model';
import { ArrayType, Modifiers, Validators } from '../../decorators';
import { FactCheck } from '../fact-check';
import { Facts } from '../facts';

/** @inheritdoc */
export class Mutation extends Model implements IMutation, IExecutableAction {

    /** @inheritdoc */
    @Validators.required
    path!: string;

    /** @inheritdoc */
    @Validators.required
    mutation!: string;

    /** @inheritdoc */
    @ArrayType(Token)
    tokens!: Token[]

    @Modifiers([PropertyModifier.system])
    private tokenMatcher: RegExp;

    /** @inheritdoc */
    constructor(props?: IMutation) {
        props = merge({
            path: '',
            mutation: '',
            tokens: []
        }, props || {});
        super(props);

        this.tokenMatcher = /{.*?}/g;
    }

    /**
     * Asynchronously executes the mutation against an input model
     * @param model - The model to be mutated
     * @param factCheck - A lookup cache for fact values
     * @returns An empty promise
     */
    async execute(model: Model, factCheck?: FactCheck): Promise<void> {

        const { parent, property } = model.evaluatePath(this.path);
        if (!factCheck) factCheck = new FactCheck({ ...model.facts(), ...Facts() });

        // Initialize all variables that the while loop will update
        let match: RegExpExecArray | null,
            result = '',
            startIdx = 0,
            endIdx = 0,
            tokenIdx = 0;

        // Apply all tokens to the mutation string
        while ((match = this.tokenMatcher.exec(this.mutation)) !== null) {

            // If this is not the first matched token
            // be sure to include any string segment that is between the last token and the current
            if (result.length) result += this.mutation.slice(endIdx, match.index);

            // Update the start index to the match index
            startIdx = match.index;
            endIdx = startIdx + match[0].length;

            // Append the mutation string to result until the start index of the match
            // If this is the first matched token
            // start at the beginning, otherwise pick up where the last slice left off
            result += this.mutation.slice(result.length ? endIdx : 0, match.index);

            // Get a reference to the token that should be injected into the mutation
            const token = this.tokens[tokenIdx];

            result += await token.execute(factCheck);

            // Increment token index for token identification
            tokenIdx++;
        }

        // Update result to contain all mutation following the last token, if present,
        // otherwise result will equal this.mutation
        result += this.mutation.slice(endIdx);

        // Update the parent property
        parent[property] = result;

        // Try to coerce the parent property into its correct type
        (parent as Model).coerceProperty(property);
    }

    /** @inheritdoc */
    async errors(): Promise<Record<string, unknown> | false> {

        // Run base validation
        let result = await super.errors();

        // Calculate token count within the mutation
        let tokens = 0;
        while (this.tokenMatcher.exec(this.mutation) !== null) tokens++;

        // mutation property is invalid if tokens identifiers do not match tokens
        if (this.tokens.length !== tokens) {
            if (!result) result = {};
            if (!('mutation' in result)) result.mutation = [];
            (<string[]>result.mutation).push('Token identifier count: {} must match token length');
        }

        return result;
    }
}
