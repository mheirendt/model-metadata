import 'reflect-metadata';
import JSONPointer from 'json-pointer';
import { OperatorMap } from './operators';
import { merge } from 'lodash';
import { ModifiersSymbol, DescriptionSymbol, Modifiers, ArrayTypeSymbol } from './decorators';
import { Constructor, IModel, IModelOptions, IPropertyValidator, ISwaggerOptions, ISwaggerSchema, PropertyModifier } from './interfaces';
import { IsTruthy } from './operators/methods';

/**
 * Base class for all model instances
 */
export class Model implements IModel {

    /**
     * Implement the indexable interface so unknown properties can be returned without casting the Model instance
     * @example
     * ```typescript
     * // Create a new instance of a Generic model with some additional properties
     * const model = new Model({
     *  foo: 'foo',
     *  bar: 'bar',
     * });
     *
     * // bar is not a concrete property of Model, its type will be 'unknown'
     * const bar: unknown = model.bar
     * ```
     */
    [indexableProperty: string]: unknown;

    /**
     * Specify how the model should be serialized
     */
    @Modifiers([PropertyModifier.system])
    protected options: IModelOptions;

    /**
     * Constructs a new instance of a Model class
     * @param props - Properties that should be assigned to the model. Defaults are typically provided from subclass constructor overrides
     * @param options - Optional options to override default behavior
     */
    constructor(props?: unknown, options?: IModelOptions) {
        merge(this, props || {});

        this.options = merge({
            includeInternals: true,
            includeExtended: true,
        }, options || {});

        for (const property in this) {
            const value = this[property];

            // If the property should be hidden, update the descriptor to be non-enumerable
            const modifiers = Reflect.getMetadata(ModifiersSymbol, this, property) as number[] || [];
            if (modifiers.some(modifier => [PropertyModifier.hidden, PropertyModifier.system].includes(modifier))) {
                Object.defineProperty(this, property, {
                    configurable: true,
                    enumerable: false,
                    value
                });
            }
            this.coerceProperty(property);
        }
    }

    /**
     * Retrieve all model and sub-model facts for the rules engine. Facts are specified for properties that are decorated as a [[Fact]]
     * @returns an object where the key is the path and the value is the value of the property
     */
    facts(): Record<string, unknown> {

        function pathFacts(model: Model, path: string): Record<string, unknown> {
            const result: Record<string, unknown> = {};
            Object.entries(model).forEach(entries => {
                const property = entries[0], value = entries[1], valuePath = path + property;
                if (value instanceof Model) {
                    Object.assign(result, pathFacts(value, valuePath + '/'));
                } else {
                    result[valuePath] = value;
                }
            });
            return result;
        }

        return pathFacts(this, '/');
    }

    /**
     * Initialize a property as the type annotated within its design:type metadata
     * @param property - The name of the property to be coerced
     */
    coerceProperty(property: string): void {
        // Type will be undefined if there is no metadata for the property
        const type = this.reflectType(property);
        if (!type) return;

        const value = this[property];

        if (type.name === 'Array') {
            // If array type is decorated, we can initialize each element within the array as a class instance
            const metadata = this.reflectMetadata(property);
            const arrayType = metadata.find(m => m.key === ArrayTypeSymbol);
            if (arrayType && value && Array.isArray(value)) {
                const ctor = arrayType.args as new (...args: unknown[]) => unknown;
                this[property] = (<[]>value).map(v => new ctor(v));
            }
        } else if (['String', 'Number', 'Boolean', 'Date'].includes(type.name)) {

            // Compare the decorated property type against the type of value within props
            // If there is a type mismatch, try to coerce the property value before assignment
            const propType = value && (value as any).constructor.name;
            const noProp = value === null || value === undefined;
            if (type.name === 'String') {
                if (noProp || (propType === 'String' && !(<string>value)?.trim().length)) (<unknown>this[property]) = '';
            } else if (type.name === 'Boolean') {
                if (noProp) (<unknown>this[property]) = false;
                else if (propType === 'String') (<unknown>this[property]) = ['Y', 'T', 'YES', 'TRUE'].includes((<string>value).toUpperCase());
            } else if (type.name === 'Number') {
                if (noProp) (<unknown>this[property]) = 0;
                else if (propType === 'String') {
                    if ((<string>value).isNumeric()) (<unknown>this[property]) = (<string>value).toNumber();
                }
            } else if (type.name === 'Date') {
                if (noProp) (<unknown>this[property]) = new Date();
                if (propType === 'String') {
                    const parsed = new Date(Date.parse(<string>value));
                    if (!isNaN(parsed.getTime())) (<unknown>this[property]) = parsed;
                }
            }
        } else {
            (<unknown>this[property]) = new type(value);
        }
    }


    /**
     * Retrieve constructor for the type at the specified path
     * @param path - A JSON pointer to the property to reflect upon
     * @returns The data type if found at the path
     */
    reflectType(path: string): (new (...args: unknown[]) => unknown) | undefined {
        if (!path || !path.length) return undefined;
        const { parent, property } = this.evaluatePath(path);
        return Reflect.getMetadata('design:type', parent, property);
    }

    /**
     * Retrieve all metadata assigned to the path
     * @param path - A JSON pointer to the property to reflect upon
     * @returns The metadata for the specified path
     */
    reflectMetadata(path: string): { key: string | symbol, args: unknown }[] {
        if (!path || !path.length) return [];
        const { parent, property } = this.evaluatePath(path);
        const keys = Reflect.getMetadataKeys(parent, property);
        return keys.map(key => ({
            key,
            args: Reflect.getMetadata(key, parent, property)
        }));
    }

    /**
     * Resolve a JSON pointer to an object reference
     * @remarks This implementation only allows for direct pointers (/path/to/subObj)<br>
     * It will not allow for array indexing (~~/path/to/array[0]~~)
     * @param path - A JSON pointer to a property of the model
     */
    evaluatePath(path: string): {
        parent: any, // eslint-disable-line
        property: string
    } {
        if (!path.startsWith('/')) path = '/' + path;
        const pieces = path.split('/'),                                 // Split the pointer into pieces
            property: string = pieces.pop() as string,                  // The last item in the array will be the target property
            parentPointer = pieces.join('/'),                           // The remaining pieces form a new pointer to the parent object
            parent: any = pieces.length // eslint-disable-line
                ? JSONPointer.get(this, parentPointer)                  // Get reference to parent via  parentPointer if exists
                : this;                                                 // If there are no pieces, path refers to a root level property, just send this
        return {
            parent,
            property
        };
    }

    /**
     * Run validation against the model instance
     * @returns False if valid or a key value pair with each invalid property
     */
    errors(): Record<string, unknown> | false {

        const errors: Record<string, unknown> = {};

        for (const property in this) {
            const value = this[property];

            // Recursively iterate through sub-models to get the full picture of validity
            if (value instanceof Model) {
                const invalid = value.errors();
                if (invalid) {
                    errors[property] = invalid;
                }
            }
            // Assess all validators applied to the property through decorators, configuration, or rules
            else {
                const propertyErrors = this.validateProperty(property);
                if (propertyErrors) errors[property] = propertyErrors;
            }
        }
        return Object.keys(errors).length ? errors : false;
    }

    validateProperty(property: string): string[] | false {
        let errors: string[] = [];
        const value = this[property];

        // Cannot validate a model here, call .errors() on the value itself
        if (value instanceof Model) {
            return false
        }
        // Assess all validators applied to the property through decorators, configuration, or rules
        else {

            // value should be validated, get metadata for the property
            const propertyMetadata = this.reflectMetadata(property);

            // Ensure the property is an instance of its correct type
            const expectedType = propertyMetadata.find(metadata => metadata.key === 'design:type');
            const propType = this.constructorForValue(value);
            if (expectedType && propType !== expectedType.args) {
                errors = [`Type mismatch. Expected '${(<any>expectedType.args).name}', but got '${propType.name}'`];

            } else {
                // Loop through the metadata keys & perform validation
                propertyMetadata.forEach(metadata => {

                    // If there are args and it has a property named 'operator' we can be confident that it is a validator
                    if (metadata.args instanceof Object && 'operator' in metadata.args) {

                        const propertyValidator: IPropertyValidator = metadata.args;

                        // If it is the truthiness operator (indicating required value), check to see if there was a default value assigned
                        if (propertyValidator.operator instanceof IsTruthy) {

                            // Check the metadata to see if we assigned a default value
                            const defaultAssigned = propertyMetadata.find(m => m.key === 'default:assigned');

                            // If a default value was assigned, fail, otherwise still evaluate for truthiness
                            const result = propertyValidator.operator.execute(undefined, value);
                            if (defaultAssigned || !result) errors.push(propertyValidator.message);
                        }
                        else { // Ignore validators other than required if there is not a truthy value

                            // Retrieve the operator
                            const required = OperatorMap.get('required');

                            // Evaluate truthiness
                            const isTruthy = required?.execute(undefined, value);

                            // Returning here will signal the next metadata key to be processed in the foreach
                            if (!isTruthy) return;

                            // Evaluate the operator against the decorated condition (left) and the current value (right)
                            const result = propertyValidator.operator.execute(propertyValidator.left, value);

                            // A falsy result means that the condition was not met, log the stuff
                            if (!result) errors.push(propertyValidator.message);
                        }
                    }
                });
            }
        }

        return errors.length ? errors : false;
    }

    /**
     * Convert the models instance to a string
     * @param pretty - Determines whether JSON should be formatted or uglified
     * @returns The stringified model
     */
    toString(pretty = true): string {
        return pretty ? JSON.stringify(this, undefined, ' ') : JSON.stringify(this);
    }

    /**
      * Customize JSON serialization
      */
    toJSON(options?: ISwaggerOptions): Record<string, unknown> {
        options = merge({
            includeInternals: this.options.includeInternals,
            includeExtended: this.options.includeExtended
        }, options || {});
        const result: Record<string, unknown> = {};
        const descriptors = Object.getOwnPropertyDescriptors(this);
        Object.keys(descriptors).forEach(property => {
            const { enumerable } = descriptors[property];

            const value = this[property];
            const metadata = this.reflectMetadata(property);
            const modifiers = metadata.find(m => m.key === ModifiersSymbol)?.args as number[] || [];
            // Check to see if field is should be included
            const isExtended = modifiers.includes(PropertyModifier.extended);
            const isInternal = modifiers.includes(PropertyModifier.internal);
            const isHidden = modifiers.some(modifier => [PropertyModifier.hidden, PropertyModifier.system].includes(modifier));
            // If the field is not enumerable & not configured so, don't include it
            if (!isHidden && !enumerable) return;
            // Otherwise if it is not configured to show, don't either
            if (isHidden || isInternal && !options?.includeInternals || isExtended && !options?.includeExtended) return;
            result[property] = value;
        });

        return result;
    }

    /**
     * Remove modifiers from the specified property
     * @param modifiers - The PropertyModifiers to be removed
     * @param property - The property to be modified
     */
    removeModifiers(modifiers: number[], property: string): void {
        // These properties should not be allowed to have modifiers removed
        if (property.includes('Service') || property === 'options') return;

        const targetModifiers = this.reflectMetadata(property).find(m => m.key === ModifiersSymbol)?.args as number[] || [];
        modifiers.forEach(modifier => {
            const idx = targetModifiers.indexOf(modifier);
            if (idx > -1) targetModifiers.splice(idx, 1);
        });
        if (modifiers.includes(PropertyModifier.hidden)) {
            const descriptor = Object.getOwnPropertyDescriptor(this, property) || {};
            descriptor.enumerable = true;
            Object.defineProperty(this, property, descriptor);
        }
        Modifiers(targetModifiers)(this, property);
    }

    /**
     * Modifies a property
     * @param modifiers - The modifiers to be added
     * @param property - The property to be modified
     */
    addModifiers(modifiers: number[], property: string): void {
        const targetModifiers = this.reflectMetadata(property).find(m => m.key === ModifiersSymbol)?.args as number[] || [];
        modifiers.filter(modifier => !targetModifiers.includes(modifier)).forEach(modifier => targetModifiers.push(modifier));
        Modifiers(targetModifiers)(this, property);
    }

    /**
     * 
     * @param options - Options to modify the output
     */
    toSwagger(options: ISwaggerOptions = {}): ISwaggerSchema {
        const properties: Record<string, unknown> = {};
        const description = options.description || '';
        const required: string[] = [];
        const json = this.toJSON(options);
        Object.entries(json).forEach(entry => {
            const property = entry[0], value = entry[1];
            const metadata = this.reflectMetadata(property);
            const fieldRequired = metadata.find(m => m.key === 'validator:is-truthy');

            // Update options.description with each field description to be passed down recursively if necessary
            options.description = <string>metadata.find(m => m.key === DescriptionSymbol)?.args || '';

            if (fieldRequired) required.push(property);
            if (Array.isArray(value)) {
                // type is reflected from the TypeScript type of the model's property
                const type = this.reflectType(property);

                // we can only build a useful swagger model if we have a type
                if (type) {

                    // this metadata key is defined in the arrayType decorator
                    const ctor = metadata.find(m => m.key === ArrayTypeSymbol);

                    // we can only build a useful swagger model if we have an ArrayType decorator
                    if (ctor) {
                        // ctor.args comes from reflectMetadata and is the Constructor for that type
                        const instance = new (ctor.args as any)();

                        if (instance instanceof Model) {
                            properties[property] = {
                                type: 'array',
                                description: options.description,
                                items: instance.toSwagger(options)
                            };
                        }
                        else {
                            const instanceTypeName = (ctor.args as any).name.toLowerCase();

                            // swagger does not respect 'date' as a type, so in that case use string
                            const swaggerType = instanceTypeName === 'date' ? 'string' : instanceTypeName;
                            properties[property] = {
                                type: 'array',
                                description: options.description,
                                items: {
                                    type: swaggerType
                                }
                            };
                        }
                    }
                }
            } else if (value instanceof Model || (value && typeof value === 'object' && !(value instanceof Date))) {
                properties[property] = value instanceof Model ? value.toSwagger(options) : new Model(value).toSwagger(options);
            } else {
                let swaggerType = typeof value as string;
                const type = this.reflectType(property);
                if (type) swaggerType = type.name.toLowerCase();
                properties[property] = {
                    type: swaggerType === 'date' ? 'string' : swaggerType,
                    description: options.description
                };
            }
        });

        const result: ISwaggerSchema = {
            type: 'object',
            description,
            properties
        };
        if (required.length) result.required = required;

        return result;
    }

    private constructorForValue(value: any): Constructor<any> {
        const type = typeof value;
        switch (type) {
            case 'string': return String;
            case 'number': return Number;
            case 'boolean': return Boolean;
        }
        if (value instanceof Date) return Date;
        if (Array.isArray(value)) return Array;
        return Object;
    }
}
