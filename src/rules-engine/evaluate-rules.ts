import { Engine, RuleProperties, Fact as jsonRulesEngineFact } from 'json-rules-engine';
import { EngineEvent, ConditionResult, IRulesEngineOptions, Lifecycle, IRule, IEvent, IOperator } from '../interfaces';
import { OperatorMap } from '../operators';
import { Facts } from './facts';
import { Rule } from './rule';
import { Event } from './event';
import { Model } from '../model';
import { merge } from 'lodash';

/**
 * Run the engine against the provided [[Model]] instance and list of [[Rule]]s
 * @param target - The target model instance to run against the rules engine
 * @param rules - Configured rules to be executed against the target
 * @param options - Options for how the rule engine affects the model
 * @returns An array containing any events that were raised during the run cycle
 */
export const EvaluateRules = async (model: Model, rules: IRule[], options?: IRulesEngineOptions): Promise<EngineEvent[]> => {

    options = merge({
        dryRun: false,
        lifecycle: Lifecycle.Validation
    }, options || {});

    const events: Promise<EngineEvent>[] = [];
    const engineRules: RuleProperties[] = [];

    // rules = rules.map(rule => new Rule(rule));

    // Filter rules to the appropriate lifecycle phase & apply the translation for the rules engine library
    rules.filter(rule => rule.lifecycle === options?.lifecycle).forEach(rule => {

        // If there is a condition for the rule, translation will be able to be applied to the rules engine
        const translation = rule.forEngine();
        if (translation) engineRules.push(translation);
        // Otherwise the rule automatically succeeds, apply the success actions
        else {
            events.push(handleEvent(model, rule.name as string, 'success', rule.event as IEvent, options));
        }
    });

    const engine = initializeEngine(engineRules);

    // Add an event listener to the engine for all 'success' and 'failure' events.
    const results: ConditionResult[] = ['success', 'failure'];
    results.forEach((result: ConditionResult) => engine.on(result, ({ type, params }) => events.push(handleEvent(model, type, result, new Event(params), options))));

    // Run the engine to see which events were raised
    const allFacts = { ...model.facts(), ...Facts() };
    const facts = Object.keys(allFacts).map(factId => {
        const factValue = allFacts[factId];
        try {
            return new jsonRulesEngineFact(factId, factValue, {
                cache: false
            });
        } catch (e) {
            throw e;
        }
    });
    await engine.run(facts);

    return Promise.all(events);
};

function initializeEngine(rules: RuleProperties[]): Engine {
    // Instantiate a new engine on each run to clear out the success-events cache from the event result
    const engine = new Engine(rules, {
        allowUndefinedFacts: true
    });

    // remove all default operators from the engine, so there are no clashes
    if ('operators' in engine) {
        engine['operators'] = new Map() as never;
    }

    // Add all operators  to the engine
    OperatorMap.forEach((value: IOperator, identifier: string) => engine.addOperator(identifier, value.execute));

    return engine;
}

async function handleEvent(model: Model, name: string, result: 'success' | 'failure', event: IEvent, options?: IRulesEngineOptions): Promise<EngineEvent> {

    // Apply all the actions if it is not a dry run
    if (!options?.dryRun) {
        await event.execute(result, model);
    }

    // Extract the action from the corresponding event and attach it to the EngineEvent result
    return {
        result,
        name,
        actions: event[result]?.map(Event.DetermineAction) || [],
    };
}
