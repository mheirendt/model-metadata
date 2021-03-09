import { DataType } from '../../interfaces';
import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';
import { Applicable } from '../applicable';

/**
 * Generic within array
 */
@injectable()
export class Within extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        Array: [DataType.array, DataType.string, DataType.number, DataType.date]
    })
    execute(left: Array<unknown>, right: unknown): boolean {
        if (Array.isArray(right)) return right.every(entry => left.includes(entry));
        return left.includes(right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['in-array'];
    }
}
