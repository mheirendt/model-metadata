import { Decorator } from '../interfaces';
import { Model } from '../model';

/**
 * Use this symbol if only looking for the modifiers metadata
 */
export const ModifiersSymbol = Symbol('property::modifiers');

/**
 * Modifies the default behavior of a class property
 * @param modifiers - An array of property modifiers to be applied to the target property
 * @returns A decorator function to apply the modifiers to the target property
 */
export const Modifiers = (modifiers: number[]): Decorator<Model> =>
    (target: Model, propertyKey: string | symbol) => Reflect.defineMetadata(ModifiersSymbol, modifiers, target, propertyKey);