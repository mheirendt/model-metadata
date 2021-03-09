import { Applicable } from '../applicable';
import { injectable } from 'inversify';
import { DataType } from '../../interfaces';
import { OperatorBase } from '../operator-base';

/**
 * Each item in the array is sequential
 */
@injectable()
export class Sequential extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        any: [DataType.array]
    })
    execute(left: ((item: any) => number) | undefined, right: Array<unknown>): boolean { // eslint-disable-line

        // The array is sequential
        if (right.length <= 1) return true;

        // Initialize left as a transparent transformation if it is not a function
        if (!left || typeof left !== 'function') left = (item: unknown) => item as number;

        // Apply the transformation to the array & sort entries in ascending order
        const transformation: Array<number> = right.map(entry => (<(item: unknown) => number>left)(entry)).sort((a, b) => a - b);

        // Assert that each entry is exactly one number less than the following number, unless it is the last
        return transformation.every((number, idx) => {
            if (idx === transformation.length - 1) {
                return number === transformation[idx - 1] + 1;
            } else {
                return number < transformation[idx + 1];
            }
        });
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['ascending'];
    }
}