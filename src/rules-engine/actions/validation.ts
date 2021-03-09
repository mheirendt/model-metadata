import { merge } from 'lodash';
import { Validators } from '../../decorators';
import { IExecutableAction, IValidation } from '../../interfaces';
import { Model } from '../../model';
import { Validator } from '../../validator';

/** @inheritdoc */
export class Validation extends Model implements IValidation, IExecutableAction {

    /** @inheritdoc */
    @Validators.required
    path!: string;

    /** @inheritdoc */
    @Validators.required
    validator!: Validator

    /** @inheritdoc */
    constructor(props?: IValidation) {
        props = merge({
            path: '',
            validator: {
                name: ''
            }
        }, props || {});
        super(props);
    }

    /** @inheritdoc */
    execute(model: Model): Promise<void> {
        const { parent, property } = model.evaluatePath(this.path);
        this.validator.decorate(parent, property);
        return Promise.resolve();
    }
}