class _SmartFunctionInput {}
class _SmartFunctionOutput {
    constructor(func) {
        this.func = func;
    }
}
class DecorationUtils {

    static isDecorator(obj) {
        return ("_propName__decorated" in obj);
    }

    static getWrappedObj(decoratorObj) {
        const propName = decoratorObj._propName__decorated;
        return decoratorObj[propName];
    }


    
    static createInitializationDict(dict) {
        return Object.assign({}, dict, {
            isDecorationUtils_dict__initialization: true,
        });
    }



    static overrideProperty(dict_override) {
        return Object.assign({}, dict_override, {
            isDecorationUtils_dict__overrideProperty: true,
        });
    }



    static isOfficiallyDecorated_with_class(obj__dec, decoratorClass) {
        return (DecorationUtils.getDecoratorObj__with_class(obj__dec, decoratorClass) != null);
    }

    static isActivelyDecorated_with_class(obj__dec, decoratorClass) {
        return Object.entries(DecorationUtils.getDecorationConfigDict__for_decorator(obj__dec, decoratorClass)).reduce((acc, [propName, miniDict]) => {
            acc = acc || miniDict.isActive; 
            return acc;
        }, false);
    }

    static getDecoratorObj__with_class(obj__dec, decoratorClass) {
        var outObj;
        var found = false;
        var obj = obj__dec; 
        while(!found && DecorationUtils.isDecorator(obj)) {
            if(obj instanceof decoratorClass) {
                found = true;
                outObj = obj;
            } else {
                obj = DecorationUtils.getWrappedObj(obj);
            }
        }
        return outObj;
    }


    static getDecorationConfigDict(obj__dec) {
        return obj__dec["_decorationConfig"];
    }

    static getDecorationConfigDict__for_decorator(obj__dec, decoratorClass) {
        var outDict;
        const obj__dec__with_class = DecorationUtils.getDecoratorObj__with_class(obj__dec, decoratorClass);
        if(obj__dec__with_class != null) {
            outDict = DecorationUtils.getDecorationConfigDict(obj__dec__with_class);
        }
        return outDict;
    }

    static setIsDecorationActive__for_propName_in_decorator(obj__dec, decoratorClass, propName, isActive__new) {
        var outSuccess;

        const dict__decorationConfig = DecorationUtils.getDecorationConfigDict__for_decorator(obj__dec, decoratorClass);
        if(dict__decorationConfig != null) {
            dict__decorationConfig[propName].isActive = isActive__new;
            outSuccess = true;
        } else {
            outSuccess = false;
            throw new Error("propName("+propName+") not found in obj__dec: " + obj__dec);
        }

        return outSuccess;
    }

    static setIsDecorationActive__updateDecorationConfig_in_decorator(obj__dec, decoratorClass, dict__update) {
        var outSuccess;

        const dict__decorationConfig = DecorationUtils.getDecorationConfigDict__for_decorator(obj__dec, decoratorClass);
        if(dict__decorationConfig != null) {
            Object.entries(dict__update).forEach(([propName,isActive]) => {
                if(propName in dict__decorationConfig) {
                    dict__decorationConfig[propName].isActive = isActive;
                } else {
                    throw new Error("updateDecorationConfig: unknown propName: " + propName);
                }
            });
            outSuccess = true;
        } else {
            outSuccess = false;
            throw new Error("propName("+propName+") not found in obj__dec: " + obj__dec);
        }

        return outSuccess;
    }

    static setIsDecorationActive__for_decorator(obj__dec, decoratorClass, isActive) {
        var outSuccess;

        const dict__decorationConfig = DecorationUtils.getDecorationConfigDict__for_decorator(obj__dec, decoratorClass);
        outSuccess = Object.entries(dict__decorationConfig).reduce((acc, [propName, _]) => {
            acc = acc && DecorationUtils.setActivated__propName_in_decorator(obj__dec, propName, isActive);
            return acc;
        }, true);

        return outSuccess;
    }

    static isDecorationActive(obj__dec, propName) {
        return DecorationUtils.getDecorationConfigDict(obj__dec)[propName].isActive;
    }

    static isSmartFunc(func) {
        var outBool = false;
        try {
            outBool = (func(new _SmartFunctionInput()) instanceof _SmartFunctionOutput);
        } catch(e) {

        }
        return outBool;
    }

    static createSmartFunc(func, this__new) {
        const dict__compagnon = {
            _myThis: this__new,
            _myFunc: func,
        };
        const proxy__func = new Proxy(func, {
            get(target, key, receiver) {
                if(key == "_myThis") {
                    return dict__compagnon._myThis;
                } else if(key == "_myFunc") { 
                    return dict__compagnon._myFunc;
                } else {
                    throw new Error("Unexpected key for func proxy, get: " + key);
                }
            },
            set(target, key, value) {
                if(key == "_myThis") {
                    dict__compagnon._myThis = value;
                } else {
                    throw new Error("Unexpected key for func proxy, set: " + key);
                }
                return true;
            },
            apply(target, thisArg, args) {
                // logger.log("logDeco", "apply", target, thisArg, args, this__new);
                // logger.log("logDeco", "(_myFunc, _myThis)", proxy__func._myFunc, proxy__func._myThis);
                // logger.log("logDeco", "apply", "args:", args);
                if(args[0] instanceof _SmartFunctionInput) {
                    return new _SmartFunctionOutput(dict__compagnon._myFunc);
                } else {
                    return (proxy__func._myFunc).call(proxy__func._myThis, ...args);
                }
            }
        });
        return proxy__func;
    }

    static func_with_forwarded_this(func, this__new) {
        var outFunc;

        if(!DecorationUtils.isSmartFunc(func)) {
            outFunc = DecorationUtils.createSmartFunc(func, this__new); 
        } else {
            func["_myThis"] = this__new;
            outFunc = func;
        }

        return outFunc;
    }


    static createDecoratorClass(klass__raw, dict__deco/*, func__deco*/) {
        // logger.log("logDeco", "createDecoratorClass", "(klass__raw, arr_arg):", klass__raw, dict__deco);

        const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(v instanceof Function));         
        const dict_prop__new      = Object.fromEntries(arr_entry__props.filter(([k,v]) => !(v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));
        const dict_prop__override = Object.fromEntries(arr_entry__props.filter(([k,v]) =>  (v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));

        const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (v instanceof Function));         
        const dict_func        = Object.fromEntries(arr_entry__funcs);

        const dict__deco__private = {
            "_dict__infiltration":  true,
            "_setInfiltration":     true,
            "_removeInfiltration":  true,

            "_propName__decorated": true,
            "_wrappedObj"         : true,

            "_decorationConfig"   : true,
        };
        // const dict__deco__extended = Object.assign({}, dict__deco, dict__deco__private);

        const klass = class extends klass__raw {

            static decorate(wrappedObj, ...args) {
                const instance__deco = new this(...args);      //SHU:...
                // logger.log("logComb", "instance__deco", instance__deco);

                if(!(wrappedObj instanceof klass__raw)) {
                    throw new Error("Cannot decorate object with invalid type:", wrappedObj);
                } else {
                    instance__deco._propName__decorated = "_wrappedObj";
                    instance__deco._wrappedObj          = wrappedObj;
                }

                DecorationUtils.upgrade_decorator__with_infiltration(instance__deco);

                const proxy__new = new Proxy(instance__deco, {
                    get(target, key, receiver) {
                        // logger.log("logDeco", "get", target, key, receiver);
                        // logger.log("logDeco", "get", "." + key, target, receiver);
                        var outProp;

                        if(key in dict__deco__private) {
                            outProp = instance__deco[key];
                        } else if(key in dict__deco) {
                            const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
                            if(isDecorationActive) {
                                outProp = instance__deco[key];
                            } else {
                                // logger.log("logFDZ", key, "decoration is inactive","forward to wrapped obj");
                                outProp = instance__deco._wrappedObj[key];
                                if(outProp instanceof Function) {
                                    outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
                                }
                            }     
                        } else {
                            outProp = instance__deco._wrappedObj[key];
                            if(outProp instanceof Function) {
                                outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
                            }
                        }
                        
                        return outProp;
                    },
                    set(target, key, value) {
                        // logger.log("logDeco", "set", target, key, value);

                        if(key in dict__deco__private) {
                            //ignore
                            throw new Error("trying to set protected property: " + key);
                            return false;
                        } else if(key in dict__deco) {
                            const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
                            if(isDecorationActive) {
                                instance__deco[key] = value;
                            } else {
                                instance__deco._wrappedObj[key] = value;
                            }                            
                        } else {
                            instance__deco._wrappedObj[key] = value;
                        }
                        return true;
                    },

                    has(target, key) {
                        var outBool;

                        if(key in instance__deco) {
                            outBool = true;
                        } else if(key in instance__deco._wrappedObj) {
                            outBool = true;
                        } else {
                            outBool = false;
                        }
                        
                        return outBool;
                    },

                    // _setInfiltration(key, value) {

                    // },

                });
                // logger.log("logDeco", "decorate", "proxy__new:", proxy__new);

                //set new props
                Object.assign(instance__deco, dict_prop__new);

                //set overridden props
                Object.entries(dict_prop__override).forEach(([propName, dict_override]) => {
                    instance__deco[propName] = null;
                    delete instance__deco[propName];
                    Object.defineProperty(instance__deco, propName, {
                      get: dict_override.get.bind(proxy__new),
                      set: dict_override.set.bind(proxy__new),
                    });
                });

                //set new methods
                Object.entries(dict_func).forEach(([funcName, func]) => {  
                    instance__deco[funcName] = func;
                    // instance__deco[funcName] = func.bind(proxy__new);
                });

                //initialize _decorationConfig (.isActive)
                instance__deco._decorationConfig = Object.entries(dict__deco).reduce((acc, [propName,_]) => {
                    acc[propName] = {
                        isActive: true,
                    };
                    return acc;
                }, {});


                // function func__bind(func) {
                //     return func.bind(proxy__new);
                // }
                // func__deco?.(instance__deco, func__bind);

                //initialize props (this may go down the decoration chain)
                try {
                    // logger.log("logDeco", "args:", ...args);

                    if(args[0]?.isDecorationUtils_dict__initialization) {
                        const dict_prop__init = args[0];
                        Object.entries(dict_prop__init).forEach(([k,v]) => {
                            if(k == "isDecorationUtils_dict__initialization") {
                                //ignore
                            } else {
                                proxy__new[k] = v;
                            }
                        });
                    }
                } catch(e) {
                    logger.log("logDeco", e);
                }
    
                return proxy__new;
            }

            constructor() {
                super();
                return this;
            }

        }
        // Object.defineProperty(klass, 'klass__raw', {
        //     value: klass__raw,
        //     writable: false,
        // });

        return klass;
    }







    static upgrade_decorator__with_infiltration(decoratorObj) {

        //SHU: remark: infiltration could be callback-based via property getter
            //=> setInfiltration(propName, func__get)

        if(!DecorationUtils.isDecorator(decoratorObj)) {
            throw new Error("trying to upgrade non-decorator obj: " + decoratorObj);
        }

        decoratorObj._dict__infiltration = {};

        decoratorObj._setInfiltration = (function(propName, prop) {
            const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
            this[propName] = prop;
            this._dict__infiltration[propName] = prop;
            if(DecorationUtils.isDecorator(wrappedObj)) {
                // if(!("_setInfiltration" in wrappedObj)) {
                //     DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
                // }
                wrappedObj._setInfiltration(propName, prop);
            } else {
                wrappedObj[propName] = prop;
            }
        }).bind(decoratorObj);
          
        decoratorObj._removeInfiltration = (function(propName) {
            const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
            if(DecorationUtils.isDecorator(wrappedObj)) {
                // if(!("_removeInfiltration" in wrappedObj)) {
                //     DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
                // }
                wrappedObj._removeInfiltration(propName);
            } else {
                delete wrappedObj[propName];
            }
            delete this._dict__infiltration[propName];
            delete this[propName];
        }).bind(decoratorObj);
    
    }



    static getInnermost(obj) {
        var outObj;

        if(DecorationUtils.isDecorator(obj)) {
            const wrappedObj = DecorationUtils.getWrappedObj(obj);
            outObj = DecorationUtils.getInnermost(wrappedObj);
        } else {
            outObj = obj;
        }

        return outObj;
    }


    // static hasNuggetProperty(obj, propName) {
    //     logger.log("logDeco", "hasNuggetProperty", obj, propName);
    //     var outBool;
    // 
    //     if(propName in obj) {
    //         outBool = true;
    //     } else if(DecorationUtils.isDecorator(obj)) {
    //         const wrappedObj = DecorationUtils.getWrappedObj(obj);
    //         outBool = DecorationUtils.hasNuggetProperty(wrappedObj, propName);
    //     } else {
    //         outBool = false;
    //     }
    //
    //     return outBool;
    // }

    // static getNuggetProperty(obj, propName) {
    //     logger.log("logDeco", "getNuggetProperty", obj, propName);
    //     var outProp;
    //
    //     if(propName in obj) {
    //         outProp = obj[propName];
    //     } else if(DecorationUtils.isDecorator(obj)) {
    //         const wrappedObj = DecorationUtils.getWrappedObj(obj);
    //         outProp = DecorationUtils.getNuggetProperty(wrappedObj, propName);
    //     } else {
    //         outProp = null;
    //     }
    //
    //     return outProp;
    // }

}