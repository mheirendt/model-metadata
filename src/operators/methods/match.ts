import { Applicable } from '../applicable';
import { DataType } from '../../interfaces';
import { injectable } from 'inversify';
import { OperatorBase } from '../operator-base';

/**
 * Generic regex pattern match operator
 */
@injectable()
export class Match extends OperatorBase {

    /** @inheritdoc */
    @Applicable({
        any: [DataType.string],
    })
    execute(left: RegExp | string[] | string, right: string): boolean {
        if (!right || !right.length) return true;
        if (!(left instanceof RegExp)) {
            if (!Array.isArray(left)) left = [left];
            const args = left as string[];
            left = new RegExp(args[0], ...args.slice(1));
        }
        return (<RegExp>left).test(right);
    }

    /** @inheritdoc */
    alias(): string[] {
        return ['pattern', 'matches'];
    }
}