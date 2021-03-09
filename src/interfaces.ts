import * as JsonRulesEngine from 'json-rules-engine';
/* #region  Common */
import { Model } from './model';

/**
 * Type alias for a generic object where each key is a string, and the value can be of any type
 */
export type IModel = Record<string, unknown>;

/**
 * A type alias for coordinates. Consists of a pair of numbers, the first entry will be the latitude, the second will be the longitude
 */
export type Position = number[]

/**
 * Generic geoJSON interface for any type of feature
 */
export interface IFeature {
    /** The GeoJSON type */
    type: 'Feature',
    geometry: {
        type: 'MultiPolygon' | 'Polygon' | 'MultiLineString' | 'LineString' | 'MultiPoint' | 'Point',
        coordinates: Position[][][] | Position[][] | Position[] | Position;
    }
}


/**
 * Enforces additional validation for a [[Polygon]] Feature
 */
export interface IPolygonConfiguration {
    /**
     * The minimum acceptable area in sq units
     */
    minArea?: number;
    /** 
     * The maximum acceptable area in sq units
     */
    maxArea?: number;
    /**
     * The minimum acceptable perimeter in sq units
     */
    minPerimeter?: number;
    /**
     * The maximum acceptable perimeter in sq units
     */
    maxPerimeter?: number;
    /**
     * Flag to determine if a Polygon is allowed to have multiple parts
     */
    multiPart?: boolean;
    /**
     * Flag to determine if a Polygon is allowed to have holes
     */
    holes?: boolean;
    /**
     * The unit of measurement for perimeter and area
     */
    unit?: DistanceUnit;
}

/**
 * An enumeration of applicable input data types for the execute method of an [[IOperator]]
 */
export enum DataType {
    string = 'String',
    number = 'Number',
    boolean = 'Boolean',
    date = 'Date',
    array = 'Array',
}

/**
 * Type alias representing the different units of distance measurement available
 */
export type DistanceUnit = 'miles' | 'meters' | 'kilometers' | 'acres' | 'yards';

export interface LengthWise {
    length: number;
}

/**
 * Customize the shape of the query with options
 */
export interface IModelOptions {
    /**
     * Include extended properties in the queries
     */
    includeExtended?: boolean;
    /**
     * Include internal properties in the queries
     */
    includeInternals?: boolean;
}

export interface ISwaggerOptions extends IModelOptions {
    /**
     * The description of the field
     */
    description?: string;
}

export interface ISwaggerSchema {
    type?: 'array' | 'object';
    description?: string,
    required?: string[];
    properties?: Record<string, unknown>;
}

/**
 * #### The purpose of an Operator is to evaluate one value against another, and return true or false based on the evaluation<br>
 * Operators can explicitly declare which **right** data types are applicable for the **left** data type,
 * allowing consumers to filter the list of applicable operators based on the type of input<br><br>
 * Operators are consumed by the rules engine and property validators
 */
export interface IOperator {

    /**
     * The name of the operator. Can be used via [[OperatorMap]] to retrieve the operator
     */
    name: string;

    /**
     * Evaluate the value on the left (static value) against the value on the right (comparison value)
     * @param left - The target value
     * @param right - the reference value
     * @returns True if the evaluation is applicable
     * @throws Not Applicable if the left type is not applicable with the right type
     */
    execute(left: any, right: any): boolean; // eslint-disable-line

    /**
     * Other names to access the operator by
     * @returns An array of alternative names for the operator
     */
    alias(): string[];

    /**
     * Summarizes the applicability of the left and right data types for the execute method.
     * @returns a key value pair where each key represents the applicable left hand data type, and the value are all applicable right and data types for that key
     */
    applicable(): Record<DataType, DataType[]>
}

/* #endregion */

/* #region  Decorators */

/**
 * #### A [[Decorator]] is syntactic sugar above or inline with properties, methods, parameters, or class declarations <br>
 * It can be identified by an \@ symbol prepended by the name of the decorator, and any arguments they accept if applicable
 * ```typescript
 * @Description('Test Example')
 * name: string;
 * ```
 * A decorator resolves to a function which takes a target object and a propertyKey as parameters<br><br>
 * How the function is implemented is up to the developer <br>
 * In most cases, this library uses decorators to attach information to properties via the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) npm package
 * @typeParam T - The type of the class being decorated
 * @remarks Decorators can be easily identified by an '\@' symbol prepended before the decorator name, and prior to the target class or property key
 */
export type Decorator<T> = (target: T, propertyKey: string | symbol) => void;

/**
 * Type alias for a method decorator function
 * @typeParam T - The type of the class being decorated
 */
export type MethodDecorator<T> = (target: T, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;

/**
 * Type alias for a decorator that can be applied to Classes
 */
export type ClassDecorator<T extends IModel> = (ctor: Constructor<T>) => void;

/**
 * Type alias for the constructor function of an IModel
 */
export type Constructor<T> = new (...args: any[]) => T; // eslint-disable-line

/**
 * Establish the behavior of a property. Property modifiers are applied to properties through a property decorator function
 * @see [[Modifiers]] [[Decorator]]
 */
export const PropertyModifier = {
    /**
     * Specifies that the property should not be enumerable
     */
    hidden: 0,
    /**
     * Specifies that the property is calculated internally, and should not be trusted from user input
     */
    internal: 1,
    /**
     * Specifies that the property should only be included with the model when fetching extended details
     */
    extended: 2,
    /**
     * Specifies that the property is used internally by the class & should not represent state
     */
    system: 3,
    /**
     * Specifies that the property is computed by other fields & should not be validated or hidden
     */
    computed: 4
};

/**
 * Establishes a validator for a property. An IPropertyValidator is attached to properties as metadata when decorated as such
 * @See [[PropertyValidator]] [[Validators]]
 */
export interface IPropertyValidator extends IModel {
    /**
     * The static (left) value to be used against the dynamic (right) property value in the [[IOperator.execute]] function
     */
    left: unknown;
    /**
     * The operator that should be used for the evaluation of the two values
     */
    operator: IOperator;
    /**
     * The message that should be reported if the operator does not truthfully evaluate
     */
    message: string;
}

/* #endregion */

/* #region  Rules Engine */

/* #region  Events */

/**
 * Serves as a lookup for fact values. Inspired by [Almanac](https://github.com/CacheControl/json-rules-engine/blob/master/src/almanac.js)
 */
export interface IFactCheck {

    /**
     * Checks to see if a fact is registered
     * @param fact - The name of the fact to check for
     * @returns True if the fact can be checked
     */
    hasFact(fact: string): boolean;

    /**
     * Asynchronously lookup the value associated with the fact name
     * @typeParam TResult - The expected data type of the result within the promise
     * @param fact - The name of the fact to lookup
     * @param params - Optional parameters for fact evaluation
     * @returns A promise with the value of the fact
     */
    factValue<TResult>(fact: string, params?: Record<string, unknown>): Promise<TResult>;
}

/**
 * Apply a validation constraint to model's property
 * @see [[PropertyValidator]] [[OperatorMap]]
 */
export interface IValidator {
    /**
     * The name or alias of the operator to use for comparison
     */
    name: string;
    /**
     * Arguments to be provided to [[IOperator.execute]] as the left parameter, if necessary. Some operators, like required and unique, do not require a left parameter.
     */
    args?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    /**
     * The feedback to be provided to the consumer if the operator is evaluated as false
     */
    message?: string;
}

export interface IExecutableAction {
    /**
     * Updates a model with the payload of the action
     * @param model - The model to be updated
     */
    execute(model: Model): Promise<void>;
}

/**
 * Represents a configured validation state for a [[Model]] at the specified path
 */
export interface IValidation {
    /**
     * The path to the property targeted for validation
     */
    path?: string;
    /**
     * A validator to be applied to the property at the path
     */
    validator?: IValidator;
}

/**
 * Update the property modifiers of the property at the path
 */
export interface IModification {
    /**
     * The path to the property targeted for modification
     */
    path?: string;
    /**
     * The modifiers to be attached to the property
     */
    modifiers?: number[];
}

/**
 * An action that will throw an authorization error when executed against a Model
 */
export interface IUnauthorized {
    /**
     * The message to send along with the authorization error
     */
    message?: string;
}

/**
 * Capture a reference to the value of a [[Model]]'s property directly, as a result of a property index, or as a result of a function execution
 */
export interface IToken {
    /**
     * The name of the fact to be used for the token reference<br \>
     * Facts must be explicitly declared with the \@Fact decorator, or included in an override of the [[IModel.facts]] method
     */
    fact: string;
    /**
     * An optional translation for the reference value. If this property exists, tokens will evaluate an
     * input Model's property indexed against the value of this property
     */
    property?: string;
    /**
    * An optional translation for the reference value.
    * It is a reference to a prototype function that is applicable to the data type at the path for the token.
    * The function will be called, and the value resulting from the function call will be used in place of the value at the path.
    */
    method?: IMethod
}

/**
 * Represents a prototype function for a class instance
 */
export interface IMethod {
    /**
     * The name of the method to be called
     */
    name: string;
    /**
     * An optional array of arguments to be provided to the method
     */
    args?: unknown[];
}

/**
 * Defines a mutation that can be executed against a [[Model]]'s property at the designated path
 */
export interface IMutation {
    /**
     * The path to the property targeted for validation
     */
    path?: string;
    /**
     * The mutation to be applied to the model
     */
    mutation: string;
    /**
     * Tokens to be substituted into the mutation. The amount of tokens must match the amount of token identifiers in the mutation string
     */
    tokens?: IToken[]
}

export type Action = IMutation | IValidation | IUnauthorized | IModification;

export interface EventProperties {
    /**
     * A list of actions to be raised when a rule's [[IRootCondition]] successfully evaluates against an input
     */
    success?: Action[]
    /**
     * A list of actions to be raised when a rule's [[IRootCondition]] fails to evaluate against an input
     */
    failure?: Action[];
}

/**
 * Represents an event that can raise a list of executable actions from the [[ConditionResult]] of a rule
 */
export interface IEvent extends EventProperties {
    /**
     * Executes all actions within the success or failure list
     * @param result - The list of actions to execute
     * @param model - The model to execute the actions against
     * @param cache - Specify whether or not FactCheck should cache evaluations
     */
    execute: (result: 'success' | 'failure', model: Model) => Promise<void>;
}

/* #endregion */

/**
 * A base condition that uses an [[IOperator]] by name or alias to evaluate the fact against the value
 */
export interface ICondition {
    /**
     * The name of the fact to be used as the **left** value in the [[IOperator]] execute method
     */
    fact: string;
    /**
     * An optional path to a sub property from the fact value
     */
    path?: string;
    /**
     * The name or alias of the [[IOperator]] to use for evaluation
     */
    operator: string;
    /**
     * The value to compare against the fact as the right hand argument in the operator's execute function
     */
    value: unknown;
}

/**
 * Type alias representing a either a condition or nested any | all conditions for an [[IRule]]
 */
export type NestedCondition = ICondition | IRootCondition;

/**
 * The root level condition for an [[IRule]]
 * @remarks An instance of this interface can only have an 'any' property, or an 'all' property at one time
 */
export interface IRootCondition {
    /**
     * If any condition evaluates successfully against the input, the rule will succeed
     */
    any?: NestedCondition[];
    /**
     * The rule will only succeed if all conditions successfully evaluate against the input
     */
    all?: NestedCondition[];
}

/**
 * Lifecycle identifiers for a Model instance
 */
export enum Lifecycle {
    /**
     * When the model is first instantiated
     */
    Init,
    /**
     * When validation is evaluated
     */
    Validation,
    /**
     * Before the model is saved
     */
    PreSave,
}

export interface RuleProperties {
    /**
     * The friendly name of the rule. The sole purpose of this property is identification for the rule
     */
    name?: string;
    /**
     * The lifecycle phase of the Model when the rule should be evaluated
     */
    lifecycle?: Lifecycle;
    /**
     * The root condition of the rule
     */
    condition?: IRootCondition;
    /**
     * The event that is raised if the rule's condition applies to the input
     */
    event?: EventProperties;
    /**
     * Determines the order in which the rule should be evaluated. Lower numbers are treated with a higher precedence than higher numbers.
     */
    priority?: number;
}

/**
 * Represents a rule that can be evaluated by the Rules Engine against an input [[Model]] instance via [[EvaluateRules]]
 */
export interface IRule extends RuleProperties {
    forEngine: () => JsonRulesEngine.RuleProperties | undefined;
}

/**
 * Override the default behavior of how rules are evaluated, and how they should affect the model input
 */
export interface IRulesEngineOptions {
    /**
     * Whether or not the events should be applied to the input model. If set to true, the model will not be changed
     */
    dryRun?: boolean;
    /**
     * The Model lifecycle phase that the rule should apply to. Defaults to Validation
     */
    lifecycle?: Lifecycle;
}

/**
 * A type alias for the result of a condition's evaluation against an input
 */
export type ConditionResult = 'success' | 'failure';

/**
 * An event that is raised after each rule is evaluated by the rules engine
 */
export interface EngineEvent {
    result: ConditionResult;
    name: string;
    actions: IExecutableAction[];
}

/* #endregion */