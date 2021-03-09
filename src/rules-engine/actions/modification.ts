import { merge } from 'lodash';
import { Modifiers, ModifiersSymbol, Validators } from '../../decorators';
import { IExecutableAction, IModification, PropertyModifier } from '../../interfaces';
import { Model } from '../../model';

/** @inheritdoc */
export class Modification extends Model implements IModification, IExecutableAction {

    /** @inheritdoc */
    @Validators.required
    path!: string;

    /** @inheritdoc */
    @Validators.within(Object.keys(PropertyModifier))
    modifiers!: number[]

    /** @inheritdoc */
    constructor(props?: IModification) {
        props = merge({
            path: '',
            modifiers: [],
        }, props || {});
        super(props);
    }

    /** @inheritdoc */
    execute(model: Model): Promise<void> {
        const { parent, property } = model.evaluatePath(this.path);
        // Get the existing modifiers, if any
        let modifiers = Reflect.getMetadata(ModifiersSymbol, parent, property) || [];
        // Create a Set to remove potential duplicates
        modifiers = new Set([...modifiers, ...this.modifiers]);
        // Convert the Set back to an array & apply the decorator
        Modifiers(Array.from(modifiers))(parent, property);
        return Promise.resolve();
    }
}