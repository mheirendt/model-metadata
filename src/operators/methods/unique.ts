import { Applicable } from '../applicable';
import { injectable } from 'inversify';
import { DataType } from '../../interfaces';
import { OperatorBase } from '../operator-base';

/**
 * Array is unique
 */
@injectable()
export class Unique extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        any: [DataType.array]
    })
    execute(left: ((item: any) => unknown) | undefined, right: Array<unknown>): boolean { // eslint-disable-line

        // Initialize left as a transparent transformation if it is not a function
        if (!left || typeof left !== 'function') left = (item: unknown) => item;

        // Apply the transformation to the array & sort entries in ascending order
        const transformation: Array<unknown> = right.map(entry => (<(item: unknown) => unknown>left)(entry));

        // Create a new set from the transformation to remove duplicates
        const set = new Set(transformation);

        // Compare the size of the original array and set
        return set.size === right.length;
    }

    /** @inheritdoc */
    alias(): string[] {
        return [];
    }
}