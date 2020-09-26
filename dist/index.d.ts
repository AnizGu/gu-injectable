import "reflect-metadata";
interface Constructor extends Function {
    new (...args: any[]): {};
    readonly prototype: Object;
}
export declare class LazyProvider<T> {
    private value;
    constructor(value: T);
    get(): T;
}
export declare const Parameter: (named: string | symbol) => ParameterDecorator;
export declare const ReturnType: (type: Constructor) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare const Named: (named: string | symbol) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare const Provides: MethodDecorator;
export declare const Module: ClassDecorator;
export declare const Singleton: {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare const Inject: (named: string | symbol) => PropertyDecorator;
export {};
