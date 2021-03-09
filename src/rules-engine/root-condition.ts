import { IRootCondition, NestedCondition, ICondition } from '../interfaces';
import { Model } from '../model';
import { Condition } from './condition';

/** @inheritdoc */
export class RootCondition extends Model implements IRootCondition {

    /** @inheritdoc */
    any?: NestedCondition[];

    /** @inheritdoc */
    all?: NestedCondition[];

    get conditions(): NestedCondition[] {
        return this.any || this.all as NestedCondition[];
    }

    /** @inheritdoc */
    constructor(props?: IRootCondition) {
        if (!props || (!props.any && !props.all)) {
            props = {
                all: []
            };
        }
        super(props);

        this.conditions.forEach((nestedCondition, index) =>
            this.conditions[index] = RootCondition.Implements(nestedCondition)
                ? new RootCondition(nestedCondition as RootCondition)
                : new Condition(nestedCondition as ICondition));
    }

    static Implements(props: any): boolean {
        return Object.keys(props).length === 1 && ('all' in props || 'any' in props);
    }
}