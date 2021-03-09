import { injectable } from 'inversify';
import { Applicable } from '../applicable';
import { DataType } from '../../interfaces';
import { OperatorBase } from '../operator-base';

/**
 * String Does not start with substring
 */
@injectable()
export class NotStartsWith extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        String: [DataType.string],
        Array: []
    })
    execute(left: string | Array<unknown>, right: unknown): boolean {
        if (Array.isArray(left)) return !left.length ? true : left[0] !== right;
        return !left.startsWith(<string>right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return [];
    }
}