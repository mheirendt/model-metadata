import { merge } from 'lodash';
import { Event } from './event';
import { IRule, NestedCondition, Lifecycle, RuleProperties } from '../interfaces';
import { RootCondition } from './root-condition';
import * as JsonRulesEngine from 'json-rules-engine';
import { Condition } from './condition';
import { Model } from '../model';
import { Description, Validators } from '../decorators';

/** @inheritdoc */
export class Rule extends Model implements IRule {

    /** @inheritdoc */
    @Validators.required
    @Validators.min(2)
    @Validators.max(75)
    name!: string;

    /** @inheritdoc */
    @Description('Designate the model lifecycle hook when the rule should be evaluated')
    lifecycle!: Lifecycle;

    /** @inheritdoc */
    @Description('The condition that will be evaluated to determine whether the event should fail or succeed')
    condition?: RootCondition;

    /** @inheritdoc */
    @Description('The actions that will be raised on successful / failure of condition evaluation')
    @Validators.required
    event!: Event;

    // todo: 0 does not make it past validate operator fn
    // @Validators.min(0)
    /** @inheritdoc */
    priority!: number;

    /** @inheritdoc */
    constructor(props?: RuleProperties) {
        props = merge({
            name: '',
            lifecycle: Lifecycle.Validation,
            event: {},
            priority: 0,
        }, props || {});
        super(props);
    }

    forEngine(): JsonRulesEngine.RuleProperties | undefined {
        if (!this.condition) return undefined;
        return {
            name: this.name,
            priority: this.priority,
            conditions: this.conditionsForEngine(),
            event: this.eventForEngine()
        };
    }

    private conditionsForEngine(): JsonRulesEngine.TopLevelCondition {
        return rootConditionForEngine(this.condition as RootCondition);
        function rootConditionForEngine(condition: RootCondition): JsonRulesEngine.TopLevelCondition {

            const nestedConditions = (<NestedCondition[]>(condition.all || condition.any)).map(nestedCondition => {
                const isRoot = 'any' in nestedCondition || 'all' in nestedCondition;
                if (isRoot) return rootConditionForEngine(nestedCondition as RootCondition);
                else return conditionForEngine(nestedCondition as Condition);
            });

            const result = {}, junction = condition.all ? 'all' : 'any';
            Object.defineProperty(result, junction, { value: nestedConditions });

            return result as JsonRulesEngine.TopLevelCondition;
        }

        function conditionForEngine(condition: Condition): JsonRulesEngine.ConditionProperties {
            const result = Object.assign({}, condition);
            if (result.path) result.path = result.path.replace('/', '.');
            return result;
        }

    }

    private eventForEngine(): JsonRulesEngine.Event {
        return {
            type: this.name,
            params: {
                ...this.event
            }
        };
    }
}