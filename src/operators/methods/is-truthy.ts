import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';

/**
 * **Check to see if the value on the right exists**<br />
 * If the value on the right is undefined or null, the operator will evaluate as false<br />
 * For a right **String**, at least one non-space character is required
 * @remarks The value on the left is ignored
 * @example
 * ```typescript
 * // Import the operator map
 * import { OperatorMap } from '@mheirendt/model-metadata';
 * 
 * 
 * // Get the operator by name or alias
 * const operator = OperatorMap.get('is-truthy');
 * 
 * const a = operator.execute(undefined, undefined); // => false
 * const b = operator.execute(undefined, 't'); // => true
 * const c = operator.execute(undefined, ' '); // => false
 * ```
 */
@injectable()
export class IsTruthy extends OperatorBase {

    /** @inheritdoc */
    execute(left: unknown, right?: unknown): boolean {
        let result = right !== null && right !== undefined;

        if (typeof right === 'string') {
            result = right.trim().length > 0;
        }
        return result;
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['required'];
    }
}