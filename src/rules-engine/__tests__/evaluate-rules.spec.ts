import { EvaluateRules } from '../evaluate-rules';
import { Rule } from '../rule';
import { Bar } from '../../../jest.setup';
import { IModification, IValidation, Lifecycle, PropertyModifier } from '../../interfaces';
import { ModifiersSymbol } from '../../decorators';

describe('rules-engine:evaluateRules', () => {
    let rule: Rule, nonCondition: Rule, bar: Bar;

    beforeEach(() => {
        bar = new Bar({
            foo: {
                foo: 'foo'
            }
        });
        rule = new Rule({
            name: 'test',
            condition: {
                all: [{
                    fact: '/foo/foo',
                    operator: 'equal',
                    value: 'foo'
                }]
            },
            event: {
                success: [{
                    path: '/foo',
                    validator: {
                        name: 'length',
                        args: 3,
                        message: 'foo should have a length of 3'
                    }
                } as IValidation]
            }
        });
        nonCondition = new Rule({
            name: 'no condition',
            event: {
                success: [{
                    path: '/foo',
                    modifiers: [PropertyModifier.internal]
                } as IModification]
            }
        });
    });

    it('should apply event actions to the model', async () => {
        const events = await EvaluateRules(bar, [rule]);
        expect(events).toBeTruthy();
        expect(events.length).toEqual(1);
        expect(events[0].result).toEqual('success');
        const validator = bar.reflectMetadata('/foo').find(meta => meta.key === 'validator:length');
        expect(validator).toBeDefined();
    });

    it('should not apply event actions on a dry run', async () => {
        const events = await EvaluateRules(bar, [rule], { dryRun: true });
        expect(events).toBeTruthy();
        expect(events.length).toEqual(1);
        expect(events[0].result).toEqual('success');
        const validator = bar.reflectMetadata('/foo').find(meta => meta.key === 'validator:length');
        expect(validator).not.toBeDefined();
    });

    it('should automatically succeed when no condition is present', async () => {
        const events = await EvaluateRules(bar, [nonCondition]);
        expect(events).toBeTruthy();
        expect(events.length).toEqual(1);
        expect(events[0].result).toEqual('success');
        const modifiers = bar.reflectMetadata('/foo').find(meta => meta.key === ModifiersSymbol);
        expect(modifiers?.args).toEqual((<IModification>nonCondition.event.success[0]).modifiers);
    });

    it('should not apply pre-save events during validation', async () => {
        const preSave = new Rule({
            ...nonCondition,
            lifecycle: Lifecycle.PreSave
        });
        const events = await EvaluateRules(bar, [preSave]);
        expect(events).toBeTruthy();
        expect(events.length).toEqual(0);
        const modifiers = bar.reflectMetadata('/foo').find(meta => meta.key === ModifiersSymbol);
        expect(modifiers).toBeUndefined();
    });

    it('should use a custom fact', async () => {
        const isAdministrator = new Rule({
            name: 'Administrators',
            condition: {
                all: [{
                    fact: 'role',
                    operator: 'equal',
                    value: 'Administrator'
                }]
            },
            event: {
                success: rule.event.success
            }
        });

        bar.facts = jest.fn().mockReturnValue({
            role: 'Administrator'
        });

        const events = await EvaluateRules(bar, [isAdministrator]);
        expect(events[0].result).toEqual('success');
    });
});
