import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';

/**
 * **Check to see if the value on the left is equal to the value on the right**
 * @remarks A strict equality check is performed (===)
 * @example
 * ```typescript
 * // Import the operator map
 * import { OperatorMap } from '@mheirendt/model-metadata';
 * 
 * 
 * // Get the operator by name or alias
 * const operator = OperatorMap.get('equal');
 * 
 * const a = operator.execute('string', 'string'); // => true
 * const b = operator.execute('1', 1); // => false
 * ```
 */
@injectable()
export class Equal extends OperatorBase {

    /** @inheritdoc */
    execute(left: unknown, right: unknown): boolean {
        return left === right;
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['eq', 'equals'];
    }
}