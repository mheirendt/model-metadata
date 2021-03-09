import { Applicable } from '../applicable';
import { DataType, LengthWise } from '../../interfaces';
import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';

/**
 * **Check if the length of the value on the right is equal to the left value**<br />
 * For a right **String**, the operator will evaluate the string's length against the left **Number**<br />
 * For a right **Array**, the operator will evaluate the array's length against the left **Number**<br />
 * @example
 * ```typescript
 * // Import the operator map
 * import { OperatorMap } from '@mheirendt/model-metadata';
 * 
 * 
 * // Get the operator by name or alias
 * const operator = OperatorMap.get('length');
 * 
 * const a = operator.execute(2, 'test'); // => false
 * const b = operator.execute(2, 'to'); // => true
 * const c = operator.execute(2, [1, 2, 3]); // => false
 * ```
 */
@injectable()
export class Length extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        Number: [DataType.string, DataType.array]
    })
    execute(left: number, right: LengthWise): boolean {
        return right.length === left;
    }

    /** @inheritdoc */
    alias(): string[] {
        return [];
    }
}