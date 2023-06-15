class DecorationUtils {

    static createInitializationDict(dict) {
        return Object.assign({}, dict, {
            isDecorationUtilsInitializationDict: true,
        });
    }

    static createDecoratorClass(klass__raw, dict__deco, func__deco) {
        // logger.log("logDeco", "createDecoratorClass", "(klass__raw, arr_arg):", klass__raw, dict__deco);

        const arr_entry__props = Object.entries(dict__deco).filter(([k,v]) => !(v instanceof Function));         
        const dict_prop        = Object.fromEntries(arr_entry__props);

        const arr_entry__funcs = Object.entries(dict__deco).filter(([k,v]) => (v instanceof Function));         
        const dict_func        = Object.fromEntries(arr_entry__funcs);

        const dict__deco__extended = Object.assign({}, dict__deco, {
            "_dict__infiltration":  true,
            "_setInfiltration":     true,
            "_removeInfiltration":  true,

            "propName__decorated":  true,
            "wrappedObj"         :  true,
        });

        const klass = class extends klass__raw {

            static decorate(wrappedObj, ...args) {
                const instance__deco = new this(...args);      //SHU:...
                // logger.log("logComb", "instance__deco", instance__deco);

                if(!(wrappedObj instanceof klass__raw)) {
                    throw new Error("Cannot decorate object with invalid type:", wrappedObj);
                } else {
                    instance__deco.propName__decorated = "wrappedObj";
                    instance__deco.wrappedObj          = wrappedObj;
                }

                DecorationUtils.upgrade_decorator__with_infiltration(instance__deco);

                const proxy__new = new Proxy(instance__deco, {
                    get(target, key, receiver) {
                        // logger.log("logDeco", "get", target, key, receiver);
                        // logger.log("logDeco", "get", "." + key, target, receiver);
                        var outProp;

                        // if(key in instance__deco) {
                        if(key in dict__deco__extended) {
                            outProp = instance__deco[key];
                        } else {
                            outProp = instance__deco.wrappedObj[key];
                            // if(key == "_points") {
                            //     logger.trace("logDeco", "get", "." + key, "in wrappedObj", "outProp:", outProp, "target:", target, "receiver:", receiver);
                            // }
                        }
                        
                        return outProp;
                    },
                    set(target, key, value) {
                        // logger.log("logDeco", "set", target, key, value);

                        // if(key in instance__deco) {
                        if(key in dict__deco__extended) {
                            instance__deco[key] = value;
                        } else {
                            instance__deco.wrappedObj[key] = value;
                        }
                        return true;
                    },

                    has(target, key) {
                        var outBool;

                        if(key in instance__deco) {
                            outBool = true;
                        } else if(key in instance__deco.wrappedObj) {
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
                Object.assign(instance__deco, dict_prop);

                //set new methods
                Object.entries(dict_func).forEach(([funcName, func]) => {
                    // instance__deco[funcName] = func.bind(instance__deco);   
                    instance__deco[funcName] = func.bind(proxy__new);   //SHU: OMG
                });

                function func__bind(func) {
                    return func.bind(proxy__new);
                }

                func__deco?.(instance__deco, func__bind);

                //initialize props (this may go down the decoration chain)
                try {
                    // logger.log("logDeco", "args:", ...args);

                    if(args[0]?.isDecorationUtilsInitializationDict) {
                        const dict_prop__init = args[0];
                        Object.entries(dict_prop__init).forEach(([k,v]) => {
                            if(k == "isDecorationUtilsInitializationDict") {
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



    static isDecorator(obj) {
        return ("propName__decorated" in obj);
    }

    static getWrappedObj(decoratorObj) {
        const propName = decoratorObj.propName__decorated;
        return decoratorObj[propName];
    }

    static upgrade_decorator__with_infiltration(decoratorObj) {

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

}