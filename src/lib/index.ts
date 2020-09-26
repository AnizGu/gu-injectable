import "reflect-metadata";

const Injection = {
    PROVIDE_RETURNTYPE: Symbol.for("inject:provide:returntype"),
    PROVIDE_PARAMETERS: Symbol.for("inject:provide:parameters"),
    PROVIDE_NAMED: Symbol.for("inject:provide:named"),
    PROVIDES: Symbol.for("inject:provides"),
    IS_SINGLETON: Symbol.for("inject:isSingleton"),
    PROXY_PROPERTY: Symbol.for("inject:proxypropertykey")
}

interface Constructor extends Function {
    new(...args: any[]): {};
    readonly prototype: Object;
}

interface IParameterMetadata {
    provideNamed: string | symbol;
    propertyKey: string | symbol;
    parameterType: Constructor;
    parameterIndex: number;
}

interface IProvideMetadata {
    returnType: Constructor,
    provideNamed: string | symbol;
    provideFunc: Function;
    parameters: IParameterMetadata[];
}

export class LazyProvider<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }
    get(): T {
        return this.value;
    }
}

const singletonContainer = new Map<Constructor, any>();
const provideContainer = new Map<string | symbol, IProvideMetadata>();

const storageSingleton = (key: Constructor, value: Object | undefined) => singletonContainer.set(key, value).get(key);
const injectSingleton = (type: Constructor, defaultValue: () => Object | undefined) => {
    const isSingleton = Reflect.getMetadata(Injection.IS_SINGLETON, type);
    if (isSingleton) {
        const value = singletonContainer.get(type);
        return !value ? storageSingleton(type, defaultValue()) : value;
    } else {
        return defaultValue();
    }
}

const inject = (provideNamed: string | symbol, type: Constructor) => {
    const provide = provideContainer.get(provideNamed);
    if (provide) {
        const returnType = provide.returnType;
        const func = provide.provideFunc;
        if (type === LazyProvider)
            return injectSingleton(type, () => new LazyProvider(func(...injectParameters(provide.parameters))));
        return returnType === type ? injectSingleton(type, () => func(...injectParameters(provide.parameters))) : undefined;
    } else {
        return undefined;
    }
}

const injectParameters = (parameters: IParameterMetadata[]): any[] => parameters.map(parameter => inject(parameter.provideNamed, parameter.parameterType));
export const Parameter = (named: string | symbol): ParameterDecorator => (target, propertyKey, parameterIndex) => {
    const parameters: IParameterMetadata[] = Reflect.getOwnMetadata(Injection.PROVIDE_PARAMETERS, target, propertyKey) || [];
    const paramtypes = Reflect.getOwnMetadata("design:paramtypes", target, propertyKey);
    const parameter: IParameterMetadata = {
        provideNamed: named,
        parameterType: paramtypes[parameterIndex],
        propertyKey,
        parameterIndex
    }
    parameters[parameterIndex] = parameter;
    Reflect.defineMetadata(Injection.PROVIDE_PARAMETERS, [...parameters], target, propertyKey);
}
export const ReturnType = (type: Constructor) => Reflect.metadata(Injection.PROVIDE_RETURNTYPE, type);
export const Named = (named: string | symbol) => Reflect.metadata(Injection.PROVIDE_NAMED, named);
export const Provides: MethodDecorator = (target, propertyKey) => {
    const named = Reflect.getOwnMetadata(Injection.PROVIDE_NAMED, target, propertyKey);
    const returnType = Reflect.getOwnMetadata(Injection.PROVIDE_RETURNTYPE, target, propertyKey);
    const provides: IProvideMetadata[] = Reflect.getOwnMetadata(Injection.PROVIDES, target) || [];
    const parameters: IParameterMetadata[] = Reflect.getOwnMetadata(Injection.PROVIDE_PARAMETERS, target, propertyKey) || [];
    const provide: IProvideMetadata = {
        returnType,
        provideNamed: named,
        provideFunc: target[propertyKey],
        parameters
    }
    Reflect.defineMetadata(Injection.PROVIDES, [...provides, provide], target);
}
export const Module: ClassDecorator = (target) => {
    const provides: IProvideMetadata[] = Reflect.getMetadata(Injection.PROVIDES, target.prototype) || [];
    provides.forEach(provide => provideContainer.set(provide.provideNamed, provide));
}
export const Singleton = Reflect.metadata(Injection.IS_SINGLETON, true);
export const Inject = (named: string | symbol): PropertyDecorator => (target, propertyKey) => {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    const isSingleton = Reflect.getMetadata(Injection.IS_SINGLETON, type);
    return {
        get: function () {
            return inject(named, type);
        },
        set: function (newVal: any) {
            if (isSingleton)
                singletonContainer.set(type, newVal);
        }
    }
}