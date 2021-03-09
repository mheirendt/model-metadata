import { Constructor, IOperator } from '../interfaces';
import * as Methods from './methods';

const operators: [string, IOperator][] = [];

for (const property in Methods) {
    const ctor = (<Record<string, Constructor<IOperator>>>Methods)[property];
    const operator = new ctor();
    const identifiers = [operator.name, property, ...operator.alias()];
    identifiers.forEach(identifier => operators.push([identifier, operator]));
}

/**
 * A Map of all available operators
 */
export const OperatorMap = new Map(operators);