import moment from 'moment';
import { PropertyValidator } from './property-validator';
import { Decorator } from '../interfaces';
import { Model } from '../model';
const emailRegex = /.+@.+\..+/i;
const phoneRegex = /^[0-9]{10}$/;
const zipRegex = /^[0-9]{5}$/;

/**
 * Validators that can be applied to [[Model]] properties as a [[Decorator]]
 * @example
 * ```typescript
 * class Example extends Model {
 *      @Validators.required
 *      @Validators.max(10)
 *      @Validators.min(4)
 *      name: string;
 * }
 * ```
 */
export const Validators = {
    /** 
     * Configures a property to validate against the [[IsTruthy]] operator
     */
    required: PropertyValidator({
        name: 'is-truthy',
        message: 'Field is required'
    }),
    /** 
     * Configures a property to validate against the [[Match]] operator
     */
    pattern: (pattern: RegExp): Decorator<Model> =>
        PropertyValidator({
            name: 'pattern',
            args: pattern
        }),
    /** 
    * Configures a property to validate against the [[Match]] operator with the default email validation regular expression
    */
    email: PropertyValidator({
        name: 'pattern',
        args: emailRegex,
        message: 'Invalid email format'
    }),
    /** 
     * Configures a property to validate against the [[Match]] operator with the default phone validation regular expression
     */
    phone: PropertyValidator({
        name: 'pattern',
        args: phoneRegex,
        message: 'Invalid phone number format'
    }),
    /** 
     * Configures a property to validate against the [[Match]] operator with the default zip validation regular expression
     */
    zip: PropertyValidator({
        name: 'pattern',
        args: zipRegex,
        message: 'Invalid zip code format'
    }),
    /** 
     * Configures a property to validate against the [[Length]] operator
     * @param length - The exact acceptable value for the length of the property
     * @returns A decorator function to be applied to the target model and property
     */
    length: (length: number): Decorator<Model> =>
        PropertyValidator({
            name: 'length',
            args: length,
            message: `Expected length of ${length}`
        }),
    /** 
    * Configures a property to validate against the [[GreaterThanOrEqual]] operator
    * @param length - The maximum acceptable value for the property
    * @returns A decorator function to be applied to the target model and property
    */
    max: (length: number | Date): Decorator<Model> => {
        const message = length instanceof Date ? `Maximum date of ${moment(length).format('MMM DD YYYY hh:mm A')}` : `Maximum length of ${length}`;
        return PropertyValidator({
            name: '>=',
            args: length,
            message
        });
    },
    /** 
    * Configures a property to validate against the [[LessThanOrEqual]] operator
    * @param length - The minimum acceptable value for the property
    * @returns A decorator function to be applied to the target model and property
    */
    min: (length: number | Date): Decorator<Model> => {
        const message = length instanceof Date ? `Minimum date of ${moment(length).format('MMM DD YYYY hh:mm A')}` : `Minimum length of ${length}`;
        return PropertyValidator({
            name: '<=',
            args: length,
            message
        });
    },
    /** 
    * Configures a property to validate against the [[Within]] operator
    * @param array - An array that contains the valid range of values for the operator comparison
    * @returns A decorator function to be applied to the target model and property
    */
    within: (array: Array<unknown>): Decorator<Model> =>
        PropertyValidator({
            name: 'within',
            args: array,
            message: `Invalid value. Valid values include: ${array.join(', ')}`
        }),
    /** 
    * Configures a property to validate against the [[Unique]] operator
    * @param transformation - An arrow function to transform the target property before executing the operator
    * @returns A decorator function to be applied to the target model and property
    */
    unique: (transformation?: (item: any) => unknown): Decorator<Model> => // eslint-disable-line
        PropertyValidator({
            name: 'unique',
            args: transformation,
            message: 'Values must be unique'
        }),
    /**
     * Configures a property to validate against the [[Sequential]] operator
     * @param transformation - An arrow function to transform the target property before executing the operator
     * @returns A decorator function to be applied to the target model and property
     */
    sequential: (transformation?: (item: any) => number): Decorator<Model> => // eslint-disable-line
        PropertyValidator({
            name: 'sequential',
            args: transformation,
            message: 'Values must be sequential'
        })
};