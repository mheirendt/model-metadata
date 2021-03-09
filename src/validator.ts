import { merge } from 'lodash';
import { Model } from './model';
import { IValidator } from './interfaces';
import { PropertyValidator, Validators } from './decorators';
import { OperatorMap } from './operators';

/**
 * @inheritdoc
 * @example
 * ```typescript
 * // Create a new validator
 * const validator = new Validator({
 *   name: 'required',
 *   message: 'This is required!'
 * });
 * 
 * // Validators can be applied to any instances of a Model
 * cost model = new Model({
 *   prop1: ''
 * });
 * 
 * // Apply the validator to our model
 * validator.decorate(model, 'prop1');
 * 
 * // Errors will now run the required operator against model.prop1
 * const errors = await model.errors();
 * // errors => { prop1: ['This is required!]}
 * ```
 */
export class Validator extends Model implements IValidator {

    /** @inheritdoc */
    @Validators.required
    @Validators.within(Array.from(OperatorMap.keys()))
    name!: string;

    /** @inheritdoc */
    args?: Record<string, unknown>;

    /** @inheritdoc */
    message!: string;

    /** @inheritdoc */
    constructor(props?: IValidator) {
        props = merge({
            name: '',
            message: ''
        }, props || {});
        super(props);
    }

    /**
     * Attach the validator to a model's property as metadata to validate the property against runtime values
     * @param model - The model to be decorated with the validator
     * @param property - The property of the model that should be validated
     */
    decorate(model: Model, property: string): void {
        const decorateFn = PropertyValidator(this);
        decorateFn(model, property);
    }
}