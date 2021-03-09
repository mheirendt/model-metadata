import { injectable } from 'inversify';
import { Applicable } from '../applicable';
import { DataType } from '../../interfaces';
import { OperatorBase } from '../operator-base';

/**
 * Generic excludes operator
 */
@injectable()
export class NotContains extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        String: [DataType.string],
        Array: []
    })
    execute(left: string | Array<unknown>, right: any): boolean { // eslint-disable-line
        return !left.includes(right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['excludes', '!index-of', 'does-not-contain', '!includes'];
    }
}