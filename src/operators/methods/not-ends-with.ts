import { injectable } from 'inversify';
import { DataType } from '../../interfaces';
import { Applicable } from '../applicable';
import { OperatorBase } from '../operator-base';

/**
 * Generic does not end with operator
 */
@injectable()
export class NotEndsWith extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        String: [DataType.string],
        Array: []
    })
    execute(left: string | Array<unknown>, right: unknown): boolean {
        if (Array.isArray(left)) return !left.length ? true : left[left.length - 1] !== right;
        return !left.endsWith(<string>right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return [];
    }
}