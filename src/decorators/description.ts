import { Decorator } from '../interfaces';
import { Model } from '../model';

/**
 * Unique identifier used as the metadata key to attach a description to an objects property
 */
export const DescriptionSymbol = Symbol('property:description');

/**
 * Provide insight into what purpose the property serves
 * @param description - The description of the property
 * @returns a decorator function to apply the description metadata to the target property
 */
export const Description = (description: string): Decorator<Model> => {
    return (target: Model, propertyKey: string | symbol) => {
        Reflect.defineMetadata(DescriptionSymbol, description, target, propertyKey);
    };
};