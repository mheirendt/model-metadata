import { ICondition } from '../interfaces';
import { merge } from 'lodash';
import { Model } from '../model';

/** @inheritdoc */
export class Condition extends Model implements ICondition {

   /** @inheritdoc */
   fact!: string;

   /** @inheritdoc */
   path?: string;

   /** @inheritdoc */
   operator!: string;

   /** @inheritdoc */
   value!: unknown;

   /** @inheritdoc */
   constructor(props?: ICondition) {
       props = merge({
           fact: '',
           operator: '',
           value: undefined
       }, props || {});

       super(props);
   }
}