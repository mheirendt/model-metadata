import EventEmitter from 'events';
import { Validators } from './decorators';
import { Decorator, IOperator } from './interfaces';
import { Model } from './model';
import { OperatorMap } from './operators';

export class ModelBuilder {

    private properties: PropertyBuilder[] = [];

    property(property: string): PropertyBuilder | undefined {
        return this.properties.find(p => p.property === property);
    }

    string(name: string): StringBuilder {
        if (this.property(name)) throw new Error(`Duplicate property: ${name}`);
        return this.pushProperty<StringBuilder>(new StringBuilder(name));
    }

    number(name: string) {
        if (this.property(name)) throw new Error(`Duplicate property: ${name}`);
        return this.pushProperty<NumberBuilder>(new NumberBuilder(name));
    }

    date(name: string): DateBuilder {
        if (this.property(name)) throw new Error(`Duplicate property: ${name}`);
        return this.pushProperty<DateBuilder>(new DateBuilder(name));
    }

    validate(input: Record<string, unknown>) {
        const value = new Model(input);
        const errors: Record<string, unknown> = {};

        for (let i = 0; i < this.properties.length; i++) {

            const builder = this.properties[i];

            const prop = builder.property as string;

            // Validate the property
            const { error } = builder.validate(input[prop]);

            // Update the errors if there is an error
            if (error) errors[prop] = error;
        }

        return {
            error: Object.keys(errors).length ? errors : undefined,
            value
        };
    }

    private pushProperty<T extends PropertyBuilder>(builder: PropertyBuilder) {
        // Listen to the condition events emitted by the property builder
        builder.on('condition', (fn: (builder: ModelBuilder) => void) => fn(this));
        this.properties.push(builder);
        return this.properties[this.properties.length - 1] as T;
    }
}

abstract class PropertyBuilder extends EventEmitter {

    protected metadata: Map<string | symbol, Function> = new Map();

    protected conditions: Set<ConditionBuilder> = new Set();

    abstract type: Function;

    constructor(public property: string | symbol) {
        super();

        const key = 'design:type';
        this.metadata.set(key, (model: Model, property: string | symbol) => {
            Reflect.defineMetadata(key, this.type, model, property);
        });
    }


    apply(model: Model): void {
        const prop = this.property as string;
        this.conditions.forEach(condition => {
            const event = condition.evaluate(model[prop]);
            if (event) this.emit('condition', event);
        });
        this.metadata.forEach(decorate => decorate(model, prop));
        model.coerceProperty(prop);
    }

    validate(input: unknown) {
        // Generate a new model around the input
        const value = new Model({ [this.property as string]: input });

        // Apply the metadata to the model
        this.apply(value);

        // Validate the property
        const error = value.validateProperty(this.property as string) || undefined;

        return { error, value };
    }

    when(operator: string, value: unknown, success?: (builder: ModelBuilder) => void, failure?: (builder: ModelBuilder) => void) {
        const result = new ConditionBuilder(operator, value, success, failure);
        this.conditions.add(result);
        return result;
    }

    protected addMetadata<T extends PropertyBuilder>(key: (string | symbol), decorator: Decorator<Model>): T {
        this.metadata.set(key, decorator);
        return <PropertyBuilder>this as T;
    }
}

class StringBuilder extends PropertyBuilder {

    type = String;

    required(): StringBuilder {
        return this.addMetadata<StringBuilder>('validator:is-truthy', Validators.required);
    }

    min(chars: number): StringBuilder {
        return this.addMetadata<StringBuilder>('validator:<=', Validators.min(chars));
    }

    max(chars: number): StringBuilder {
        return this.addMetadata<StringBuilder>('validator:>=', Validators.max(chars));
    }

    pattern(regex: RegExp): StringBuilder {
        return this.addMetadata<StringBuilder>('validator:pattern', Validators.pattern(regex));
    }

}

class DateBuilder extends PropertyBuilder {

    type = Date;

    required(): DateBuilder {
        return this.addMetadata<DateBuilder>('validator:is-truthy', Validators.required);
    }

    min(date: Date): DateBuilder {
        return this.addMetadata<DateBuilder>('validator:<=', Validators.min(date));
    }

    max(date: Date): DateBuilder {
        return this.addMetadata<DateBuilder>('validator:>=', Validators.max(date));
    }

}

class NumberBuilder extends PropertyBuilder {

    type = Number;

    required(): NumberBuilder {
        return this.addMetadata<NumberBuilder>('validator:is-truthy', Validators.required);
    }

    min(val: number): NumberBuilder {
        return this.addMetadata<NumberBuilder>('validator:<=', Validators.min(val));
    }

    max(val: number): NumberBuilder {
        return this.addMetadata<NumberBuilder>('validator:>=', Validators.max(val));
    }

}

class ConditionBuilder {

    protected operator: IOperator;

    constructor(
        operator: string,
        protected value: unknown,
        protected success?: (builder: ModelBuilder) => void,
        protected failure?: (builder: ModelBuilder) => void
    ) {
        const implementation = OperatorMap.get(operator);
        if (!implementation) throw new Error(`Unknown operator: ${operator}`);
        this.operator = implementation;
    }

    evaluate(value: unknown): ((builder: ModelBuilder) => void) | undefined {
        if (this.operator.execute(value, this.value)) return this.success;
        return this.failure;
    }
}