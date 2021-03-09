import 'reflect-metadata';
import { DataType, IOperator, MethodDecorator } from '../interfaces';

/**
 * A unique identifier used as the metadata key for applicability of left and right data types for the execute method of an [[IOperator]]
 */
export const applicableSymbol = Symbol('operators::applicable');

/**
 * Specifies the range of valid data types for an operation
 * @param value - A mapping of a left type with its valid right hand types
 * @returns A decorator function to apply metadata to the [[IOperator]] execute method
 */
export const Applicable = (value: Record<string, DataType[]>): MethodDecorator<IOperator> => {
    return function (target?: IOperator, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): void {

        // Decorate applicable types for consumer operator filtering
        Reflect.defineMetadata(applicableSymbol, value, <IOperator>target, <string>propertyKey);

        // Descriptor will always be defined, but the Decorator type expects a nullable type
        /* istanbul ignore next */
        if (!descriptor) return;

        // Store a reference to the original function
        const originalMethod = descriptor.value;

        // Wrap the original method with applicable validation
        descriptor.value = function (...args: any[]) { // eslint-disable-line

            // The first argument is the left value, second is the right
            const nonApplicable = NonApplicable(value, args[0], args[1]);

            // If not applicable throw the reasoning
            if (nonApplicable) throw nonApplicable;

            // Apply the original method
            return originalMethod.apply(this, args);
        };
    };
};

/**
 * Check if the left and right data types are applicable
 * @param value - The applicability map for left and right types
 * @param left - the left hand side of value
 * @param right  - the right hand side value
 * @returns false if the values are applicable, a string with the reason why they aren't if not
 */
const NonApplicable = (value: Record<string, DataType[]>, left: unknown, right: unknown): false | string => {
    // Allow any value on the left hand side (regex, functions, undefined, etc)
    const anyLeft = 'any' in value || !left;

    const typeNameFromValue = (value: unknown): DataType => {
        // Capitalize the name of the right hand value type
        let typeName = (typeof value).capitalize();
        if (value instanceof Date) typeName = 'Date';
        if (Array.isArray(value)) typeName = 'Array';
        return typeName as DataType;
    };

    const tLeft = anyLeft ? 'any' : typeNameFromValue(left), tRight = typeNameFromValue(right);

    if (left && !(tLeft in value)) return `Not Applicable: '${tLeft}' Applicable data types for left side are '${Object.keys(value).join(', ')}`;

    // Check if type name is applicable
    const appicableForTRight = value[tLeft] || '';
    const applicable = !appicableForTRight.length || appicableForTRight.indexOf(tRight) > -1;

    // If not applicable, prevent operator from executing
    if (!applicable) return `Not Applicable: '${tRight}' Valid right hand data types for left type of '${tLeft}' are '${appicableForTRight.join(', ')}'`;

    return false;
};