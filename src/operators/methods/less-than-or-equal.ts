import { Applicable } from '../applicable';
import { ValidateOperator } from '../validate-operator';
import { DataType, LengthWise } from '../../interfaces';
import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';

/**
 * **Check to see if the value on the left is *less than or equal to* the value on the right**<br />
 * Left data types can be **Numbers** or **Dates**<br />
 * * For a left **Number**
 *   * If the right data type is a **String** or **Array** the operator will evaluate
 *   > ```left <= right.length```
 *   * If the right data type is a **Number** the operator will evaluate
 *   > ```left <= right```
 * * For a left **Date**
 *   * The right data type must be a **Date**. The operator will evaluate
 *   > ```left <= right```
 * @example
 * ```typescript
 * // Import the operator map
 * import { OperatorMap } from '@mheirendt/model-metadata';
 * 
 * 
 * // Get the operator by name or alias
 * const operator = OperatorMap.get('lte');
 * 
 * const a = operator.execute(5, 'Longer String'); // => true
 * const b = operator.execute(5, [0, 1, 2]); // => false
 * 
 * // OR
 * 
 * const c = operator.execute(new Date('01/01/2020'), new Date('01/01/2000')); // => false
 * const d = operator.execute(new Date(), new Date()); //=> true 
 * ```
 */
@injectable()
export class LessThanOrEqual extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        Number: [DataType.string, DataType.number, DataType.array],
        Date: [DataType.date]
    })
    execute(originalLeft: number | Date, right: unknown): boolean {
        const { left, isString, isArray } = ValidateOperator(originalLeft, right);

        if (isString || isArray) {
            return left.length <= (<LengthWise>right).length;
        }
        return left <= (<Date | number>right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['lte', '<=', 'min'];
    }
}