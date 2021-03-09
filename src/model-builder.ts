import { Validators } from './decorators';
import { Decorator } from './interfaces';
import { Model } from './model';

export class ModelBuilder {

    private properties: PropertyBuilder[] = [];

    string(name: string): StringBuilder {
        return this.pushProperty<StringBuilder>(new StringBuilder(name));
    }

    number(name: string) {
        return this.pushProperty<NumberBuilder>(new NumberBuilder(name));
    }

    date(name: string): DateBuilder {
        return this.pushProperty<DateBuilder>(new DateBuilder(name));
    }


    validate(input: Record<string, unknown>) {
        const value = new Model(input);
        const errors: Record<string, unknown> = {};
        this.properties.forEach(builder => {
            // Apply the metadata to the model
            builder.apply(value);

            const prop = builder.property as string;

            // Validate the property
            const { error } = builder.validate(input[prop]);

            // Update the errors if there is an error
            if (error) errors[prop] = error;
        });

        return {
            error: Object.keys(errors).length ? errors : undefined,
            value
        };
    }

    private pushProperty<T extends PropertyBuilder>(builder: PropertyBuilder) {
        this.properties.push(builder);
        return this.properties[this.properties.length - 1] as T;
    }
}

export abstract class PropertyBuilder {

    protected metadata: Map<string | symbol, Function> = new Map();

    abstract type: Function;

    constructor(public property: string | symbol) {
        const key = 'design:type';
        this.metadata.set(key, (model: Model, property: string | symbol) => {
            Reflect.defineMetadata(key, this.type, model, property);
        });
    }


    apply(model: Model): void {
        const prop = this.property as string;
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

    protected addMetadata<T extends PropertyBuilder>(key: (string | symbol), decorator: Decorator<Model>): T {
        this.metadata.set(key, decorator);
        return <PropertyBuilder>this as T;
    }
}

export class StringBuilder extends PropertyBuilder {

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

export class DateBuilder extends PropertyBuilder {

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


export class NumberBuilder extends PropertyBuilder {

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