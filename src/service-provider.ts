import { Container, decorate, injectable } from 'inversify';

const ServiceProvider = new Container();


/**
 * Binds an implementation of a service to an interface and service identifier
 * @param serviceIdentifier - The identifier of the service
 * @param implementation - The constructor function for the implementing class
 * @param args - Runtime arguments to be provided to the service instance
 */
export const RegisterService = <T>(serviceIdentifier: string, implementation: new (...args: any[]) => T, args?: Record<string, unknown>): void => {

    if (ServiceProvider.isBound(serviceIdentifier)) {
        ServiceProvider.rebind<T>(serviceIdentifier).toConstantValue(new implementation(args));
    } else {

        // Decorate the implementing class with the @injectable identifier
        decorate(injectable(), implementation);

        // Bind the service identifier to the implementation
        ServiceProvider.bind<T>(serviceIdentifier).toConstantValue(new implementation(args));
    }
};

/**
 * Get a registered implementation for a service interface
 * @typeParam T - The interface that the returned class instance will implement
 * @param serviceIdentifier - The identifier for the service to retrieve
 * @returns The implementing service adhering to interface T if found, otherwise undefined
 */
export const GetService = <T>(serviceIdentifier: string): T | undefined => {
    try {
        return ServiceProvider.get<T>(serviceIdentifier);
    } catch (e) {
        return undefined;
    }
};
