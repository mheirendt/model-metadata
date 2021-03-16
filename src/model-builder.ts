import EventEmitter from 'events';
import { Validators, ArrayType, ArrayTypeSymbol } from './decorators';
import { Constructor, Decorator, IOperator } from './interfaces';
import { Model } from './model';
import { OperatorMap } from './operators';

abstract class PropertyBuilder<T> extends EventEmitter {

    protected metadata: Map<string | symbol, Function> = new Map();

    protected conditions: Set<ConditionBuilder> = new Set();

    abstract type: Constructor<T>;

    protected root: boolean;

    constructor(public property?: string | symbol) {
        super();

        if (this.property) {
            this.root = false;
            const key = 'design:type';
            this.metadata.set(key, (model: Model, property: string | symbol) => {
                Reflect.defineMetadata(key, this.type, model, property);
            });
        } else {
            this.root = true;
        }
    }

    apply(model: Model): void {
        const prop = this.property as string || 'value';
        this.conditions.forEach(condition => {
            const event = condition.evaluate(model[prop]);
            if (event) this.emit('condition', event);
        });
        this.metadata.forEach(decorate => decorate(model, prop));
        model.coerceProperty(prop);
    }

    when(operator: string, value: unknown, success?: (builder: ModelBuilder) => void, failure?: (builder: ModelBuilder) => void) {
        const result = new ConditionBuilder(operator, value, success, failure);
        this.conditions.add(result);
        return result;
    }

    protected addMetadata<T extends PropertyBuilder<any>>(key: (string | symbol), decorator: Decorator<Model>): T {
        this.metadata.set(key, decorator);
        return <PropertyBuilder<any>>this as T;
    }
}

export class ModelBuilder extends PropertyBuilder<Model> {

    type = Model;

    private properties: PropertyBuilder<any>[] = [];

    findProperty(property: string): PropertyBuilder<any> | undefined {
        return this.properties.find(p => p.property === property);
    }

    model(name: string): ModelBuilder {
        return this.pushProperty<ModelBuilder>(new ModelBuilder(name));
    }

    array(name: string): ArrayBuilder {
        return this.pushProperty<ArrayBuilder>(new ArrayBuilder(name));
    }

    boolean(name: string): BooleanBuilder {
        return this.pushProperty<BooleanBuilder>(new BooleanBuilder(name));
    }

    string(name: string): StringBuilder {
        return this.pushProperty<StringBuilder>(new StringBuilder(name));
    }

    number(name: string) {
        return this.pushProperty<NumberBuilder>(new NumberBuilder(name));
    }

    date(name: string): DateBuilder {
        return this.pushProperty<DateBuilder>(new DateBuilder(name));
    }

    validate(input: any): { error: any, value: Model } {
        const value = new Model(input);
        const errors: Record<string, unknown> = {};

        for (let i = 0; i < this.properties.length; i++) {

            const builder = this.properties[i];

            const prop = builder.property as string;

            builder.apply(value);

            // Validate the property
            let error;
            if (builder instanceof ArrayBuilder) {
                error = value.validateProperty(prop) || undefined;
                if (!error) error = builder.validate(value[prop] as []);
            } else if (builder instanceof ModelBuilder) {
                error = builder.validate(value[prop] as Model).error;
            } else {
                error = value.validateProperty(prop) || undefined;
            }
            // Update the errors if there is an error
            if (error) errors[prop] = error;
        }

        return {
            error: Object.keys(errors).length ? errors : undefined,
            value
        };
    }

    private pushProperty<T extends PropertyBuilder<any>>(builder: PropertyBuilder<any>) {

        // If property exists, return the existing builder
        const property = this.findProperty(builder.property as string);
        if (property) return property as T;

        // Listen to the condition events emitted by the property builder
        builder.on('condition', (fn: (builder: ModelBuilder) => void) => fn(this));
        this.properties.push(builder);
        return this.properties[this.properties.length - 1] as T;
    }
}

export class BooleanBuilder extends PropertyBuilder<Boolean> {
    type = Boolean;
}

export class StringBuilder extends PropertyBuilder<String> {

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

    email(): StringBuilder {
        return this.addMetadata<StringBuilder>('validator:email', Validators.email);
    }

}

export class DateBuilder extends PropertyBuilder<Date> {

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

export class NumberBuilder extends PropertyBuilder<Number> {

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

export class ArrayBuilder extends PropertyBuilder<Array<any>> {

    type = Array;

    private itemBuilder?: PropertyBuilder<any>;

    apply(model: Model): void {
        if (!this.itemBuilder) throw new Error('Unknown item type for array. Did you forget to call .items() with the correct type?');
        super.apply(model);
    }

    item<T extends PropertyBuilder<any>>(): T {
        if (!this.itemBuilder) throw new Error();
        return this.itemBuilder as T;
    }

    items(type: Constructor<any>) {
        switch (type.name) {
            case 'String':
                this.itemBuilder = new StringBuilder();
                break;
            case 'Number':
                this.itemBuilder = new NumberBuilder();
                break;
            case 'Date':
                this.itemBuilder = new DateBuilder();
            case 'Model':
                this.itemBuilder = new ModelBuilder();
        }
        return this.addMetadata<ArrayBuilder>(ArrayTypeSymbol, ArrayType(type));
    }

    validate(value: any[]): any {
        if (!this.itemBuilder) throw new Error('Unknown item type for array. Did you forget to call .items() with the correct type?');
        let result;
        if (this.itemBuilder instanceof ModelBuilder) {
            result = value.map(item => (<ModelBuilder>this.itemBuilder).validate(item).error);
        } else {
            const prop = this.property as string || 'value';
            result = value.map(item => {
                const model = new Model({ [prop]: item });
                this.itemBuilder!.apply(model);
                return model.validateProperty(prop) || undefined;
            });
        }

        return result.some(item => item !== undefined) ? result : undefined;
    }

    min(val: number): ArrayBuilder {
        return this.addMetadata<ArrayBuilder>('validator:>=', Validators.min(val));
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