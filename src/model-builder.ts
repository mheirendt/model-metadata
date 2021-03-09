import { Validators } from './decorators';
import { Constructor, Decorator, IModel } from './interfaces';
import { Model } from './model';

export class ModelBuilder {

    private model = new Model();
    private properties: PropertyBuilder[] = [];

    string(name: string): StringBuilder {
        return this.pushProperty<StringBuilder>(new StringBuilder(name, this.model));
    }

    number(name: string) {
        return this.pushProperty<NumberBuilder>(new NumberBuilder(name, this.model));
    }

    date(name: string): DateBuilder {
        return this.pushProperty<DateBuilder>(new DateBuilder(name, this.model));
    }


    async validateAsync(model: IModel) {
        Object.keys(model).forEach(key => {
            if (key in this.model) this.model[key] = model[key];
        });
        const error = (await this.model.errors()) || undefined;
        return { error, value: model };
    }

    private pushProperty<T extends PropertyBuilder>(builder: PropertyBuilder) {
        this.properties.push(builder);
        return this.properties[this.properties.length - 1] as T;
    }
}

export abstract class PropertyBuilder {

    protected metadataKeys: (string | symbol)[] = [];

    abstract type: Function;

    constructor(protected property: string | symbol, protected model: Model) {
    }

    private applyType() {
        if (!this.metadataKeys.includes('design:type')) {
            this.metadataKeys.push('design:type');
            this.model[this.property as string] = '';
            Reflect.defineMetadata('design:type', this.type, this.model, this.property);
            this.model.coerceProperty(this.property as string);
        }
    }

    protected addMetadata<T extends PropertyBuilder>(key: (string | symbol), decorator: Decorator<Model>): T {
        this.applyType();
        if (!this.metadataKeys.includes(key)) {
            this.metadataKeys.push(key);
            decorator(this.model, this.property);
        }
        return <PropertyBuilder>this as T;
    }
}

export class StringBuilder extends PropertyBuilder {

    type: Function = String;

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

    type: Function = Date;

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

    type: Function = Number;

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