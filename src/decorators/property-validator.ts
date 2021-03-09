import { Model } from '../model';
import { IPropertyValidator, IValidator, Decorator } from '../interfaces';
import { OperatorMap } from '../operators';

/**
 * Decorate a property with generic validation
 * @param options - The validator to be applied to the property
 * @returns A decorator function
 * @throws Not implemented if the operator is not registered
 * @throws Not applicable if the target data type is not applicable to the operator
 */
export const PropertyValidator = (options: IValidator): Decorator<Model> => {

    return function (target: Model, propertyKey: string | symbol): void {

        // Get the operator by name for the validator, if exists
        const operator = OperatorMap.get(options.name);
        if (!operator) throw `Operator not implemented: ${options.name}`;

        // Attach the corresponding operator to the property metadata
        const propertyValidator: IPropertyValidator = {
            left: options.args,
            operator,
            message: options.message || 'Field is invalid'
        };
        Reflect.defineMetadata(`validator:${operator.name}`, propertyValidator, target, <string>propertyKey);
    };
};