import { Model } from '../model';
import { Decorator } from '../interfaces';

/**
 * Unique identifier used as the metadata key to attach the data type of items within an **Array**
 * @remarks The metadata attached to the key 'design:type' by reflect-metadata for arrays is the Array constructor.
 * That information combined with the ArrayType metadata gives a complete picture of the property's type
 */
export const ArrayTypeSymbol = Symbol('design:arrayType');

/**
 * Decorate an **Array** property with the data type of its entries
 * @param options - The constructor for the data type of the underlying array
 * @returns A decorator function that applies the metadata to the target object's property
*/
export const ArrayType = (ctor: new (...args: any[]) => unknown): Decorator<Model> => {
    try {
        // try to create an instance of options to prove that it's a constructor
        new ctor;
    } catch (error) {
        throw 'Options must be a constructor!';
    }

    return function (target: Model, propertyKey: string | symbol): void {
        Reflect.defineMetadata(ArrayTypeSymbol, ctor, target, <string>propertyKey);
    };
};
