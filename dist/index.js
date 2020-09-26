var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import "reflect-metadata";
var Injection = {
    PROVIDE_RETURNTYPE: Symbol.for("inject:provide:returntype"),
    PROVIDE_PARAMETERS: Symbol.for("inject:provide:parameters"),
    PROVIDE_NAMED: Symbol.for("inject:provide:named"),
    PROVIDES: Symbol.for("inject:provides"),
    IS_SINGLETON: Symbol.for("inject:isSingleton"),
    PROXY_PROPERTY: Symbol.for("inject:proxypropertykey")
};
var LazyProvider = /** @class */ (function () {
    function LazyProvider(value) {
        this.value = value;
    }
    LazyProvider.prototype.get = function () {
        return this.value;
    };
    return LazyProvider;
}());
export { LazyProvider };
var singletonContainer = new Map();
var provideContainer = new Map();
var storageSingleton = function (key, value) { return singletonContainer.set(key, value).get(key); };
var injectSingleton = function (type, defaultValue) {
    var isSingleton = Reflect.getMetadata(Injection.IS_SINGLETON, type);
    if (isSingleton) {
        var value = singletonContainer.get(type);
        return !value ? storageSingleton(type, defaultValue()) : value;
    }
    else {
        return defaultValue();
    }
};
var inject = function (provideNamed, type) {
    var provide = provideContainer.get(provideNamed);
    if (provide) {
        var returnType = provide.returnType;
        var func_1 = provide.provideFunc;
        if (type === LazyProvider)
            return injectSingleton(type, function () { return new LazyProvider(func_1.apply(void 0, injectParameters(provide.parameters))); });
        return returnType === type ? injectSingleton(type, function () { return func_1.apply(void 0, injectParameters(provide.parameters)); }) : undefined;
    }
    else {
        return undefined;
    }
};
var injectParameters = function (parameters) { return parameters.map(function (parameter) { return inject(parameter.provideNamed, parameter.parameterType); }); };
export var Parameter = function (named) { return function (target, propertyKey, parameterIndex) {
    var parameters = Reflect.getOwnMetadata(Injection.PROVIDE_PARAMETERS, target, propertyKey) || [];
    var paramtypes = Reflect.getOwnMetadata("design:paramtypes", target, propertyKey);
    var parameter = {
        provideNamed: named,
        parameterType: paramtypes[parameterIndex],
        propertyKey: propertyKey,
        parameterIndex: parameterIndex
    };
    parameters[parameterIndex] = parameter;
    Reflect.defineMetadata(Injection.PROVIDE_PARAMETERS, __spreadArrays(parameters), target, propertyKey);
}; };
export var ReturnType = function (type) { return Reflect.metadata(Injection.PROVIDE_RETURNTYPE, type); };
export var Named = function (named) { return Reflect.metadata(Injection.PROVIDE_NAMED, named); };
export var Provides = function (target, propertyKey) {
    var named = Reflect.getOwnMetadata(Injection.PROVIDE_NAMED, target, propertyKey);
    var returnType = Reflect.getOwnMetadata(Injection.PROVIDE_RETURNTYPE, target, propertyKey);
    var provides = Reflect.getOwnMetadata(Injection.PROVIDES, target) || [];
    var parameters = Reflect.getOwnMetadata(Injection.PROVIDE_PARAMETERS, target, propertyKey) || [];
    var provide = {
        returnType: returnType,
        provideNamed: named,
        provideFunc: target[propertyKey],
        parameters: parameters
    };
    Reflect.defineMetadata(Injection.PROVIDES, __spreadArrays(provides, [provide]), target);
};
export var Module = function (target) {
    var provides = Reflect.getMetadata(Injection.PROVIDES, target.prototype) || [];
    provides.forEach(function (provide) { return provideContainer.set(provide.provideNamed, provide); });
};
export var Singleton = Reflect.metadata(Injection.IS_SINGLETON, true);
export var Inject = function (named) { return function (target, propertyKey) {
    var type = Reflect.getMetadata("design:type", target, propertyKey);
    var isSingleton = Reflect.getMetadata(Injection.IS_SINGLETON, type);
    return {
        get: function () {
            return inject(named, type);
        },
        set: function (newVal) {
            if (isSingleton)
                singletonContainer.set(type, newVal);
        }
    };
}; };
//# sourceMappingURL=index.js.map