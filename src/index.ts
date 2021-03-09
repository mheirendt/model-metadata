/**
 * The common module is the building block for all [[Model]] classes.
 * 
 * - Defines interfaces used by **all modules**. Each module should only refer to external classes by their interface, unless it is a class defined in this module
 *
 * @packageDocumentation
 */
import './globals';
export * from './model';
export * from './validator';
export * from './interfaces';
export * from './operators';
export * from './decorators';
export * from './rules-engine';
export * from './service-provider';