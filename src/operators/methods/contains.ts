import { injectable } from 'inversify';
import { Applicable } from '../applicable';
import { DataType } from '../../interfaces';
import { OperatorBase } from '../operator-base';

/**
 * **Check to see if the value on the left contains the value on the right**<br />
 * Left data types can be **Strings** or **Arrays**<br />
 * For a left **String**, the right data type must be a **String**<br />
 * For a left **Array**, the right data type should match the type within the array
 * @example
 * ```typescript
 * // Import the operator map
 * import { OperatorMap } from '@mheirendt/model-metadata';
 * 
 * // Get the operator by name or alias
 * const operator = OperatorMap.get('contains');
 * 
 * const a = operator.execute('String to be searched', 'search'); // => true
 * const b = operator.execute('String to be searched', 'search!'); // => false
 * 
 * // OR
 * 
 * const c = operator.execute(['a', 'b', 'c'], 'a'); // => true
 * const d = operator.execute([0, 1, 2, 3, 4], 'a'); //=> false 
 * ```
 */
@injectable()
export class Contains extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        String: [DataType.string],
        Array: []
    })
    execute(left: string | Array<unknown>, right: any): boolean { // eslint-disable-line
        return left.includes(right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['index-of', 'includes'];
    }
}
