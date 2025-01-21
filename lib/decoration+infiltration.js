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
        // const propName = decoratorObj._propName__decorated;
        // return decoratorObj[propName];
        return decoratorObj._wrappedObj;
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
        // logger.log("logDeco", "getDecoratorObj__with_class", obj__dec, decoratorClass);

        var outObj;
        var found = false;
        var obj = obj__dec; 
        while(!found && DecorationUtils.isDecorator(obj)) {
            // logger.log("logDeco", "getDecoratorObj__with_class", {
            //     "obj.constructor":            obj.constructor, 
            //     "decoratorClass.constructor": decoratorClass.constructor,
            // });

            // if(obj instanceof decoratorClass) {
            if(obj.constructor == decoratorClass) {
                // logger.log("logDeco", "getDecoratorObj__with_class", obj.constructor, "==", decoratorClass);

                found = true;
                outObj = obj;
            } else {
                obj = DecorationUtils.getWrappedObj(obj);
            }
        }
        return outObj;
    }



    static getDecoratorObj__with_class__ideal(obj__dec, decoratorClass__ideal) {
        var outObj;
        var found = false;
        var obj = obj__dec; 
        while(!found && DecorationUtils.isDecorator(obj)) {
            if(obj._class__ideal == decoratorClass__ideal) {
                found = true;
                outObj = obj;
            } else {
                obj = DecorationUtils.getWrappedObj(obj);
            }
        }
        return outObj;
    }

    /*
    * SHU: using this function, one can create decoratorClass__ideal variants of the ones with decoratorClass(__practical)
    */
    static getDecoratorClass__practical__with_decoratorClass__ideal(obj__dec, decoratorClass__ideal) {  
        var outKlass;
        const obj = DecorationUtils.getDecoratorObj__with_class__ideal(obj__dec, decoratorClass__ideal);
        outKlass = obj?.constructor;
        return outKlass;
    }

    static isOfficiallyDecorated_with_class__ideal(obj__dec, decoratorClass__ideal) {
        const decoratorClass__practical = DecorationUtils.getDecoratorClass__practical__with_decoratorClass__ideal(obj__dec, decoratorClass__ideal);
        return (decoratorClass__practical != null);
    }

    


    static getDecorationConfigDict(obj__dec) {
        return obj__dec["_decorationConfig"];
    }

    static getDecorationConfigDict__for_decorator(obj__dec, decoratorClass) {
        // logger.log("logDeco", "getDecorationConfigDict__for_decorator", obj__dec, decoratorClass);
        
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

            // logger.log("logDeco", "setIsDecorationActive__updateDecorationConfig_in_decorator", {
            //  dict__update:           dict__update,
            //  dict__decorationConfig: dict__decorationConfig,
            // });

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







    // static isSmartFunc(func) {
    //     var outBool = false;
    //     try {
    //         outBool = (func(new _SmartFunctionInput()) instanceof _SmartFunctionOutput);
    //     } catch(e) {

    //     }
    //     return outBool;
    // }

    // static createSmartFunc(func, this__new) {
    //     const dict__compagnon = {
    //         _myThis: this__new,
    //         _myFunc: func,
    //     };
    //     const proxy__func = new Proxy(func, {
    //         get(target, key, receiver) {
    //             if(key == "_myThis") {
    //                 return dict__compagnon._myThis;
    //             } 
    //             else if(key == "_myFunc") { 
    //                 return dict__compagnon._myFunc;
    //             }

    //             // else if(key == "bind") { 
    //             //     return dict__compagnon._myFunc.bind;
    //             // }
    //             else if(key == "call") { 
    //                 return dict__compagnon._myFunc.call;
    //             } 
                
    //             else {
    //                 throw new Error("Unexpected key for func proxy, get: " + key);
    //             }
    //         },
    //         set(target, key, value) {
    //             if(key == "_myThis") {
    //                 dict__compagnon._myThis = value;
    //             } 
    //             else {
    //                 throw new Error("Unexpected key for func proxy, set: " + key);
    //             }
    //             return true;
    //         },
    //         apply(target, thisArg, args) {
    //             // logger.log("logDeco", "apply", target, thisArg, args, this__new);
    //             // logger.log("logDeco", "(_myFunc, _myThis)", proxy__func._myFunc, proxy__func._myThis);
    //             // logger.log("logDeco", "apply", "args:", args);
    //             if(args[0] instanceof _SmartFunctionInput) {
    //                 return new _SmartFunctionOutput(dict__compagnon._myFunc);
    //             } else {
    //                 return (proxy__func._myFunc).call(proxy__func._myThis, ...args);
    //             }
    //         }
    //     });
    //     return proxy__func;
    // }

    static func_with_forwarded_this(func, this__new) {
        var outFunc;

        // if(!DecorationUtils.isSmartFunc(func)) {
        //     outFunc = DecorationUtils.createSmartFunc(func, this__new); 
        // } else {
        //     func["_myThis"] = this__new;
        //     outFunc = func;
        // }

        outFunc = function(...arr_arg) {
            return Reflect.apply(func, this__new, arr_arg);
        };

        return outFunc;
    }


    // static isFunctionAndNotClass(funcOrClass) {
    //     const propertyNames = Object.getOwnPropertyNames(funcOrClass);
    //     return (!propertyNames.includes('prototype') || propertyNames.includes('arguments'));
    // }

    // static isClass(anyObj) {
    //     return (anyObj instanceof Function) && (!this.isFunctionAndNotClass(anyObj));
    // }

    // static isFunction(anyObj) {
    //     const isInstanceOfFunction   = (anyObj instanceof Function);
    //     const isFunctionAndNotAClass = (this.isFunctionAndNotClass(anyObj)) 
        
    //     logger.log("logDeco", "isFunction", anyObj, {
    //         isInstanceOfFunction:   isInstanceOfFunction,
    //         isFunctionAndNotAClass: isFunctionAndNotAClass,
    //     });
        
    //     return isInstanceOfFunction && isFunctionAndNotAClass;
    // }

    static isFunction(anyObj) {
        return (anyObj instanceof Function);
    }

    
    static createDecoratorClass(klass__raw, dict__deco, klass__ideal = Object) {
        return DecorationUtils.createAbusiveTopDownDecoratorClass(klass__raw, dict__deco, klass__ideal);
    }

    // static createDecoratorClass(klass__raw, dict__deco, klass__ideal = Object) {
    //     // logger.log("logDeco", "createDecoratorClass", "(klass__raw, arr_arg):", klass__raw, dict__deco);

    //     if(klass__raw == null) {
    //         throw new Error("createDecoratorClass, klass__raw is null: " + klass__raw);
    //     }

    //     // const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(v instanceof Function));   
    //     const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(DecorationUtils.isFunction(v)));
    //     // logger.log("logDeco", "createDecoratorClass", klass__raw.name,  "arr_entry__props:", arr_entry__props);


    //     const dict_prop__new      = Object.fromEntries(arr_entry__props.filter(([k,v]) => !(v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));
    //     const dict_prop__override = Object.fromEntries(arr_entry__props.filter(([k,v]) =>  (v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));

    //     // const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (v instanceof Function));   
    //     const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (DecorationUtils.isFunction(v)));
    //     // logger.log("logDeco", "createDecoratorClass", klass__raw.name, "arr_entry__funcs:", arr_entry__funcs);


    //     const dict_func        = Object.fromEntries(arr_entry__funcs);

    //     const dict__deco__private = {
    //         "_dict__infiltration":  true,
    //         "_setInfiltration":     true,
    //         "_removeInfiltration":  true,

    //         "_propName__decorated": true,
    //         "_wrappedObj"         : true,
    //         "_class__ideal"       : true,

    //         "_decorationConfig"   : true,
    //     };
    //     // const dict__deco__extended = Object.assign({}, dict__deco, dict__deco__private);

    //     const klass = class extends klass__raw {

    //         static decorate(wrappedObj, ...args) {
    //             const instance__deco = new this(...args);      //SHU:...
    //             // logger.log("logComb", "instance__deco", instance__deco);

    //             if(!(wrappedObj instanceof klass__raw)) {
    //                 throw new Error("Cannot decorate object with invalid type:", wrappedObj);
    //             } else {
    //                 instance__deco._propName__decorated = "_wrappedObj";
    //                 instance__deco._wrappedObj          = wrappedObj;
    //             }

    //             instance__deco._class__ideal = klass__ideal;

    //             // DecorationUtils.upgrade_decorator__with_infiltration(instance__deco);

    //             const proxy__new = new Proxy(instance__deco, {
    //                 get(target, key, receiver) {
    //                     // logger.log("logDeco", "get", target, key, receiver);
    //                     // logger.log("logDeco", "get", "." + key, target, receiver);
    //                     var outProp;

    //                     if(key in dict__deco__private) {
    //                         outProp = instance__deco[key];
    //                     } else if(key in dict__deco) {
    //                         const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
    //                         if(isDecorationActive) {
    //                             outProp = instance__deco[key];
    //                         } else {
    //                             // logger.log("logFDZ", key, "decoration is inactive","forward to wrapped obj");
    //                             outProp = instance__deco._wrappedObj[key];

    //                             // if(outProp instanceof Function) {
    //                             if(DecorationUtils.isFunction(outProp)) {
    //                                 outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
    //                             }
    //                         }     
    //                     } else {
    //                         outProp = instance__deco._wrappedObj[key];
                            
    //                         // if(outProp instanceof Function) {
    //                         if(DecorationUtils.isFunction(outProp)) {
    //                             outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
    //                         }
    //                     }
                        
    //                     return outProp;
    //                 },
    //                 set(target, key, value) {
    //                     // logger.log("logDeco", "set", target, key, value);

    //                     if(key in dict__deco__private) {
    //                         //ignore
    //                         throw new Error("trying to set protected property: " + key);
    //                         return false;
    //                     } else if(key in dict__deco) {
    //                         const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
    //                         if(isDecorationActive) {
    //                             instance__deco[key] = value;
    //                         } else {
    //                             instance__deco._wrappedObj[key] = value;
    //                         }                            
    //                     } else {
    //                         instance__deco._wrappedObj[key] = value;
    //                     }
    //                     return true;
    //                 },

    //                 has(target, key) {
    //                     var outBool;

    //                     if(key in instance__deco) {
    //                         outBool = true;
    //                     } else if(key in instance__deco._wrappedObj) {
    //                         outBool = true;
    //                     } else {
    //                         outBool = false;
    //                     }
                        
    //                     return outBool;
    //                 },

    //                 // _setInfiltration(key, value) {

    //                 // },

    //             });
    //             // logger.log("logDeco", "decorate", "proxy__new:", proxy__new);

    //             //set new props
    //             Object.assign(instance__deco, dict_prop__new);

    //             //set overridden props
    //             Object.entries(dict_prop__override).forEach(([propName, dict_override]) => {
    //                 instance__deco[propName] = null;
    //                 delete instance__deco[propName];
    //                 Object.defineProperty(instance__deco, propName, {
    //                   get: dict_override.get.bind(proxy__new),
    //                   set: dict_override.set.bind(proxy__new),
    //                 });
    //             });

    //             //set new methods
    //             Object.entries(dict_func).forEach(([funcName, func]) => {  
    //                 // logger.log("logDeco", "createDecoratorClass", klass__raw.name, "setting new method:", funcName);

    //                 instance__deco[funcName] = func;
    //                 // instance__deco[funcName] = func.bind(proxy__new);
    //             });

    //             //initialize _decorationConfig (.isActive)
    //             instance__deco._decorationConfig = Object.entries(dict__deco).reduce((acc, [propName,_]) => {
    //                 acc[propName] = {
    //                     isActive: true,
    //                 };
    //                 return acc;
    //             }, {});


    //             // function func__bind(func) {
    //             //     return func.bind(proxy__new);
    //             // }
    //             // func__deco?.(instance__deco, func__bind);

    //             //initialize props (this may go down the decoration chain)
    //             try {
    //                 // logger.log("logDeco", "args:", ...args);

    //                 if(args[0]?.isDecorationUtils_dict__initialization) {
    //                     const dict_prop__init = args[0];
    //                     Object.entries(dict_prop__init).forEach(([k,v]) => {
    //                         if(k == "isDecorationUtils_dict__initialization") {
    //                             //ignore
    //                         } else {
    //                             proxy__new[k] = v;
    //                         }
    //                     });
    //                 }
    //             } catch(e) {
    //                 logger.log("logDeco", "error", e);
    //             }
    
    //             return proxy__new;
    //         }

    //         constructor() {
    //             super();
    //             return this;
    //         }

    //     }
    //     // Object.defineProperty(klass, 'klass__raw', {
    //     //     value: klass__raw,
    //     //     writable: false,
    //     // });

    //     return klass;
    // }







    // static upgrade_decorator__with_infiltration(decoratorObj) {

    //     //SHU: remark: infiltration could be callback-based via property getter
    //         //=> setInfiltration(propName, func__get)

    //     if(!DecorationUtils.isDecorator(decoratorObj)) {
    //         throw new Error("trying to upgrade non-decorator obj: " + decoratorObj);
    //     }

    //     decoratorObj._dict__infiltration = {};

    //     decoratorObj._setInfiltration = (function(propName, prop) {
    //         const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
    //         this[propName] = prop;
    //         this._dict__infiltration[propName] = prop;
    //         if(DecorationUtils.isDecorator(wrappedObj)) {
    //             // if(!("_setInfiltration" in wrappedObj)) {
    //             //     DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
    //             // }
    //             wrappedObj._setInfiltration(propName, prop);
    //         } else {
    //             wrappedObj[propName] = prop;
    //         }
    //     }).bind(decoratorObj);
          
    //     decoratorObj._removeInfiltration = (function(propName) {
    //         const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
    //         if(DecorationUtils.isDecorator(wrappedObj)) {
    //             // if(!("_removeInfiltration" in wrappedObj)) {
    //             //     DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
    //             // }
    //             wrappedObj._removeInfiltration(propName);
    //         } else {
    //             delete wrappedObj[propName];
    //         }
    //         delete this._dict__infiltration[propName];
    //         delete this[propName];
    //     }).bind(decoratorObj);
    
    // }



    // static getInnermost(obj) {
    //     var outObj;

    //     if(DecorationUtils.isDecorator(obj)) {
    //         const wrappedObj = DecorationUtils.getWrappedObj(obj);
    //         outObj = DecorationUtils.getInnermost(wrappedObj);
    //     } else {
    //         outObj = obj;
    //     }

    //     return outObj;
    // }


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





    //the abusive part

    static wrapperKey() {
        return "_wrapper";
    }

    static isDecorated(obj) {
        const propName__decorator = DecorationUtils.wrapperKey();
        return (propName__decorator in obj);
    }

    static getWrapperObj(decoratedObj) {
        const propName__decorator = DecorationUtils.wrapperKey();
        return decoratedObj[propName__decorator];
    }


    static getOutermost(obj) {
        var outObj;

        var myObj = obj;
        // var count = 0;
        while(DecorationUtils.isDecorated(myObj) /*&& (count < 10)*/ ) {
            const decoratedObj = myObj; 
            const wrapperObj = DecorationUtils.getWrapperObj(decoratedObj);
            if(wrapperObj != null) {
                myObj = wrapperObj;
            } else {
                break;
            }
            // logger.log("logDeco", "abusive", "getOutermost", "decoratedObj:", decoratedObj, "myObj:", myObj);
            // count += 1;
        }
        outObj = myObj;

        Reflect.set(outObj, "_go_down", true);

        // logger.log("logDeco", "abusive", "getOutermost", "obj:", obj, "outerMost:", outObj);

        return outObj;
    }


    static getGoDownThis(obj) {
        Reflect.set(obj, "_go_down", true);
        return obj;
    }



    static createAbusiveDecoratorClass(klass__raw, dict__deco, klass__ideal = Object) {
        // logger.log("logDeco", "createAbusiveDecoratorClass", "(klass__raw, arr_arg):", klass__raw, dict__deco);

        const wrapperKey = DecorationUtils.wrapperKey();

        // const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(v instanceof Function));   
        const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(DecorationUtils.isFunction(v)));
        // logger.log("logDeco", "createAbusiveDecoratorClass", klass__raw.name,  "arr_entry__props:", arr_entry__props);


        const dict_prop__new      = Object.fromEntries(arr_entry__props.filter(([k,v]) => !(v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));
        const dict_prop__override = Object.fromEntries(arr_entry__props.filter(([k,v]) =>  (v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));

        // const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (v instanceof Function));   
        const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (DecorationUtils.isFunction(v)));   
        // logger.log("logDeco", "createAbusiveDecoratorClass", klass__raw.name,  "arr_entry__funcs:", arr_entry__funcs);

        const dict_func        = Object.fromEntries(arr_entry__funcs);

        const dict__deco__private = {
            "_dict__infiltration":  true,
            "_setInfiltration":     true,
            "_removeInfiltration":  true,

            "_propName__decorated": true,
            "_wrappedObj"         : true,
            "_class__ideal"       : true,

            "_decorationConfig"   : true,

            //abusive part
            [wrapperKey] : true,
        };
        // const dict__deco__extended = Object.assign({}, dict__deco, dict__deco__private);

        const klass = class extends klass__raw {

            static decorate(wrappedObj, ...args) {
                const instance__deco = new this(...args);      //SHU:...       => please only declare stuff in constructor (don't process args too much, or else !BOOM!)
                // logger.log("logComb", "instance__deco", instance__deco);

                if(!(wrappedObj instanceof klass__raw)) {
                    throw new Error("Cannot decorate object with invalid type:", wrappedObj);
                } else {
                    instance__deco._propName__decorated = "_wrappedObj";
                    instance__deco._wrappedObj          = wrappedObj;
                }

                instance__deco._class__ideal = klass__ideal;

                // DecorationUtils.upgrade_decorator__with_infiltration(instance__deco);

                const proxy__new = new Proxy(instance__deco, {
                    get(target, key, receiver) {
                        // logger.log("logDeco", "get", target, key, receiver);
                        // logger.log("logDeco", "get", "." + key, target, receiver);
                        var outProp;

                        if(key in dict__deco__private) {
                            outProp = instance__deco[key];
                        }
                        else if(key in dict__deco) {
                            const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
                            if(isDecorationActive) {
                                outProp = instance__deco[key];
                            } else {
                                // logger.log("logFDZ", key, "decoration is inactive","forward to wrapped obj");
                                outProp = instance__deco._wrappedObj[key];

                                // if(outProp instanceof Function) {
                                if(DecorationUtils.isFunction(outProp)) {
                                    const wrapper__outerMost = DecorationUtils.getOutermost(proxy__new);
                                    outProp = DecorationUtils.func_with_forwarded_this(outProp, wrapper__outerMost);
                                }

                            }     
                        } else {
                            outProp = instance__deco._wrappedObj[key];
                            
                            // if(outProp instanceof Function) {
                            if(DecorationUtils.isFunction(outProp)) {
                                const wrapper__outerMost = DecorationUtils.getOutermost(proxy__new);
                                outProp = DecorationUtils.func_with_forwarded_this(outProp, wrapper__outerMost);
                            }
                        }

                        //abusive part
                        if( (outProp === undefined) && (key != wrapperKey) && DecorationUtils.isDecorated(proxy__new) ) {
                            // logger.log("logDeco", "abusive", "get", target, key);
                            const wrapper__outerMost = DecorationUtils.getOutermost(proxy__new);
                            // logger.log("logDeco", "abusive", "wrapper__outerMost:", wrapper__outerMost);

                            var isFound = false;
                            var myWrapper = wrapper__outerMost;
                            while(!isFound && (myWrapper != proxy__new)) {
                                if(key in myWrapper) {
                                    // logger.log("logDeco", "key in myWrapper", {
                                    //     key:        key,
                                    //     myWrapper:  myWrapper,
                                    // });

                                    outProp = myWrapper[key];

                                    // if(outProp instanceof Function) {
                                    if(DecorationUtils.isFunction(outProp)) {
                                        // outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
                                        // outProp = DecorationUtils.func_with_forwarded_this(outProp, myWrapper);
                                        outProp = DecorationUtils.func_with_forwarded_this(outProp, wrapper__outerMost);
                                    }
                                    
                                    isFound = true;
                                } else {
                                    myWrapper = myWrapper._wrappedObj;
                                }
                            }
                            if(!isFound) {
                                // logger.log("logDeco", "abusive", "key not found:", key);
                            }
                        }
                        
                        return outProp;
                    },
                    set(target, key, value) {
                        // logger.log("logDeco", "set", target, key, value);

                        if(key == wrapperKey) { //abusive part
                            
                            if(key in instance__deco) {
                                //ignore
                                throw new Error("tring to set already set ." + key + " with value: " + value);
                                return false;
                            } else {
                                instance__deco[wrapperKey] = value;
                            }

                        }
                        else if(key in dict__deco__private) {
                            //ignore
                            throw new Error("trying to set protected property: " + key);
                            return false;
                        }
                        else if(key in dict__deco) {
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
                // logger.log("logDeco", "abusive", "decorate", "proxy__new:", proxy__new);

                //abusive part
                {
                    wrappedObj[wrapperKey] = proxy__new;
                }
               

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
                    // logger.log("logDeco", "createAbusiveDecoratorClass", klass__raw.name, "setting new method:", funcName);

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
                    logger.log("logDeco", "error", e);
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





    static createAbusiveTopDownDecoratorClass(klass__raw, dict__deco, klass__ideal = Object) {
        // logger.log("logDeco", "createAbusiveTopDownDecoratorClass", "(klass__raw, arr_arg):", klass__raw, dict__deco);

        const wrapperKey = DecorationUtils.wrapperKey();

        // const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(v instanceof Function));   
        const arr_entry__props    = Object.entries(dict__deco).filter(([k,v]) => !(DecorationUtils.isFunction(v)));
        // logger.log("logDeco", "createAbusiveTopDownDecoratorClass", klass__raw.name,  "arr_entry__props:", arr_entry__props);


        const dict_prop__new      = Object.fromEntries(arr_entry__props.filter(([k,v]) => !(v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));
        const dict_prop__override = Object.fromEntries(arr_entry__props.filter(([k,v]) =>  (v instanceof Object && "isDecorationUtils_dict__overrideProperty" in v)));

        // const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (v instanceof Function));   
        const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (DecorationUtils.isFunction(v)));   
        // logger.log("logDeco", "createAbusiveTopDownDecoratorClass", klass__raw.name,  "arr_entry__funcs:", arr_entry__funcs);

        const dict_func        = Object.fromEntries(arr_entry__funcs);

        const dict__deco__private = {
            "_dict__infiltration":  true,
            "_setInfiltration":     true,
            "_removeInfiltration":  true,

            "_propName__decorated": true,
            "_wrappedObj"         : true,
            "_class__ideal"       : true,

            "_decorationConfig"   : true,

            "_identity"           : true,
            "_go_down"            : true,

            //abusive part
            [wrapperKey]          : true,
        };
        // const dict__deco__extended = Object.assign({}, dict__deco, dict__deco__private);

        const klass = class extends klass__raw {

            static decorate(wrappedObj, ...args) {
                const instance__deco = new this(...args);      //SHU:...       => please only declare stuff in constructor (don't process args too much, or else !BOOM!)

                if(!(wrappedObj instanceof klass__raw)) {
                    throw new Error("Cannot decorate object with invalid type:", wrappedObj);
                } else {
                    instance__deco._propName__decorated = "_wrappedObj";
                    instance__deco._wrappedObj          = wrappedObj;
                }

                instance__deco._go_down = false;

                instance__deco._class__ideal = klass__ideal;

                // DecorationUtils.upgrade_decorator__with_infiltration(instance__deco);

                const proxy__new = new Proxy(instance__deco, {
                    get(target, key, receiver) {
                        // logger.log("logDeco", "<> get <>", target, key, receiver);
                        // logger.log("logDeco", "get", "." + key, target, receiver);

                        // if(key == "addBrush") {
                        //     logger.trace("logDeco", "get", "." + key, target, receiver);
                        // }

                        var outProp;

                        if(key == "_wrappedObj") {
                            // logger.log("logDeco", "get", "_wrappedObj");

                            const wrappedObj = instance__deco._wrappedObj;

                            //set "go_down"
                            wrappedObj["_go_down"] = true;       //SHU: to prevent DecorationUtils.getWrappedObj(this).funcX to go get funcX at top

                            outProp = wrappedObj;
                        } 
                        else if(key in dict__deco__private) {
                            // logger.log("logDeco", "###--- private ---###", key);
                            outProp = instance__deco[key];
                            // logger.log("logDeco", "###--- private ---###", key, outProp);
                        } else {

                            function getItDown() {
                                var outProp;

                                if(key in dict__deco) {
                                    const isDecorationActive = DecorationUtils.isDecorationActive(instance__deco, key);
                                    if(isDecorationActive) {
                                        outProp = instance__deco[key];
                                        // outProp = Reflect.get(instance__deco, key, wrapper__outerMost);                          //SHU: bad idea
                                        // logger.log("logDeco", "got it (outermost):", outProp, proxy__new);

                                        // if(DecorationUtils.isFunction(outProp)) {
                                        //     const wrapper__outerMost = DecorationUtils.getOutermost(proxy__new);
                                        //     outProp = DecorationUtils.func_with_forwarded_this(outProp, wrapper__outerMost);     //SHU: bad idea
                                        // }

                                        if(DecorationUtils.isFunction(outProp)) {
                                            outProp = DecorationUtils.func_with_forwarded_this(outProp, proxy__new);
                                        }

                                    } else {
                                        outProp = getItInWrappedObjects();
                                    }     
                                } else {
                                    outProp = getItInWrappedObjects();
                                }

                                return outProp;
                            }

                            function getItInWrappedObjects() {
                                // logger.log("logDeco", "getItInWrappedObjects", key);

                                var outProp;
    
                                const wrappedObj = proxy__new._wrappedObj;  //SHU: /!\ instance__deco is simply a dict, the proxy is proxy__new /!\

                                outProp = wrappedObj[key];
    
                                return outProp;
                            }

                            const isOutermost = (instance__deco._wrapper == null);
                            // logger.log("logDeco", "isOutermost:", isOutermost);
    
                            if(isOutermost) {
                                //go down until you find
                                // logger.log("logDeco", "go down (outermost)", key);

                                outProp = getItDown();

                            } else {

                                const isGoDown = target["_go_down"];
                                // logger.log("logDeco", "isGoDown:", isGoDown);

                                if(target["_go_down"]) {
                                    //go down until you find
                                    // logger.log("logDeco", "go down (inner)", key);

                                    outProp = getItDown();
                                }
                                else {
                                    //go top level
                                    // logger.log("logDeco", "go top level:", key);
                                    
                                    const wrapper__outerMost = DecorationUtils.getOutermost(proxy__new);
                                    outProp = Reflect.get(wrapper__outerMost, key, wrapper__outerMost);
                                }

                            }

                        }

                        //reset _go_down
                        if( (key != "_wrappedObj") && (key != "_go_down") ) {
                            instance__deco["_go_down"] = false;
                        }

                        return outProp;

                    },
                    set(target, key, value) {
                        // logger.log("logDeco", "set", target, key, value);

                        if(key == wrapperKey) { //abusive part
                            
                            //debug
                            instance__deco[wrapperKey] = value;

                            // if(key in instance__deco) {
                            //     //ignore
                            //     throw new Error("tring to set already set ." + key + " with value: " + value);
                            //     return false;
                            // } else {
                            //     instance__deco[wrapperKey] = value;
                            // }

                        }
                        else if(key in dict__deco__private) {

                            if(key == "_go_down") {
                                // logger.log("logDeco", "set _go_down", value);
                                instance__deco[key] = value;
                            } else {
                                //ignore
                                throw new Error("trying to set protected property: " + key);
                                return false;
                            }

                        }
                        else if(key in dict__deco) {
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
                // logger.log("logDeco", "abusive", "decorate", "proxy__new:", proxy__new);

                //abusive part
                {
                    wrappedObj[wrapperKey] = proxy__new;
                }
               

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
                    // logger.log("logDeco", "createAbusiveDecoratorClass", klass__raw.name, "setting new method:", funcName);

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
                    logger.log("logDeco", "error", e);
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

}