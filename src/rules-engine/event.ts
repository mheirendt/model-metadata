import { merge } from 'lodash';
import { Validation, Mutation, Modification } from './actions';
import { Action, IEvent, EventProperties } from '../interfaces';
import { Model } from '../model';
import { FactCheck } from './fact-check';
import { Facts } from './facts';

/** @inheritdoc */
export class Event extends Model implements IEvent {

    /** @inheritdoc */
    success!: Action[];

    /** @inheritdoc */
    failure!: Action[];

    /** @inheritdoc */
    constructor(props?: EventProperties) {
        props = merge({
            success: [],
            failure: []
        }, props || {});
        super(props);
    }

    /** @inheritdoc */
    async execute(result: 'success' | 'failure', model: Model, cache = true): Promise<void> {
        const actions = this[result].map(Event.DetermineAction);
        let factCheck: FactCheck | undefined;
        if (cache) factCheck = new FactCheck({ ...model.facts(), ...Facts() });
        for (const action of actions) {
            await action.execute(model, factCheck);
        }
    }

    static DetermineAction(action: Action) {
        if ('validator' in action) {
            return new Validation(action);
        }
        if ('modifiers' in action) {
            return new Modification(action);
        }
        if ('mutation' in action) {
            return new Mutation(action);
        }
        throw 'Not Implemented';
    }
}