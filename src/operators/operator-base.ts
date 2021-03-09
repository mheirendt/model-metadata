import 'reflect-metadata';
import { applicableSymbol } from './applicable';
import { injectable } from 'inversify';
import { DataType, IOperator } from '../interfaces';

/**
 * The base class for all operators
 */
@injectable()
export abstract class OperatorBase implements IOperator {

    /** @inheritdoc */
    get name(): string {
        return this.constructor.name.kebabcase();
    }

    /** @inheritdoc */
    applicable(): Record<DataType, DataType[]> {
        const metadata = Reflect.getMetadata(applicableSymbol, this, 'execute');
        return metadata;
    }

    /** @inheritdoc */
    execute(left: any, right: any): boolean {
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    alias(): string[] {
        return [];
    }
}