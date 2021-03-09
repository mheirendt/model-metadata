import 'reflect-metadata';
export const MockGetService = jest.fn();
jest.mock('./src/service-provider', () => ({
    ...jest.requireActual('./src/service-provider') as Record<string, unknown>,
    GetService: MockGetService
}));
import { Validators, Model, IModelOptions, PropertyModifier, Modifiers } from './src';

export interface IFoo {
    foo?: string;
    coerceDate?: Date;
}
export class Foo extends Model implements IFoo {
    @Validators.required foo!: string;

    @Modifiers([PropertyModifier.internal])
    coerceBoolean!: boolean;

    @Modifiers([PropertyModifier.internal])
    coerceNumber!: number;

    @Modifiers([PropertyModifier.internal])
    coerceDate!: Date;

    @Modifiers([PropertyModifier.internal])
    @Modifiers([PropertyModifier.extended])
    coerceString!: string;

    constructor(props: IFoo, options?: IModelOptions) {
        super(props, options);
    }
}
export interface IBar {
    foo?: IFoo;
    bar?: string;
}
export class Bar extends Model implements IBar {
    @Validators.required foo!: Foo
    bar!: string;
    constructor(props: IBar) {
        super(props);
        this.foo = new Foo(this.foo);
    }
}