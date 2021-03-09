import { IModel } from '../interfaces';

const facts: IModel = {};

export const AddFact = (name: string, value: unknown) => {
    facts[name] = value;
};

export const Facts = () => facts;