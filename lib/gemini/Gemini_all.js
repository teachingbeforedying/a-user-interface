//Gemini_all.js
//Gemini classes all in one place






//Gemini
const Gemini = (function () {

    const Gemini_ = {};

    class FieldDefinition {

        constructor(fieldName, fieldType, isReadonly = false) {
            this.fieldName = fieldName;

            this.fieldType = fieldType;
            this.isReadonly = isReadonly && ((fieldType.$gemini_isEcho != null) && fieldType.$gemini_isEcho);
        }

    };

    const handler = { construct() { return handler } }; //Must return ANY object, so reuse one
    const isConstructor = x => {
        try {
            return !!(new (new Proxy(x, handler))())
        } catch (e) {
            return false
        }
    };

    function isSubConstructor(ctorA, ctorB) {

        const protoB = ctorB.prototype;

        var proto = ctorA.prototype;
        var result = false;

        while (proto) {
            console.log(proto.constructor.name, "vs", protoB.constructor.name);
            if (proto === protoB) {
                console.log(proto.constructor.name, "===", protoB.constructor.name);
                result = true;
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }

        return result;
    }

    function fieldDefsForTarget(dstClass, target, isEcho, fieldTypesSetter, fieldsFunc) {
        logger.log("fieldDefsForTarget", fieldsFunc);

        if (target.$gemini_fieldDefs) {
            return target.$gemini_fieldDefs();
        } else {
            const fields = fieldsFunc(target);
            return Object.fromEntries(
                Object.entries(fields).map(([fieldName, fieldType]) => {
                    var geminiFieldType;

                    const isCtor = isConstructor(fieldType);
                    console.log("fieldDefs", fieldName, "isCtor", isCtor);
                    const isSubCtor = isCtor && isSubConstructor(fieldType, dstClass);
                    console.log("fieldDefs", fieldName, "isSubCtor", isSubCtor);


                    if (isSubCtor) {
                        const fieldDefs = fieldDefsForTarget(dstClass, fieldType, isEcho, fieldTypesSetter, fieldsFunc);
                        const geminiClass = createGeminiClass(dstClass, fieldType, isEcho, fieldTypesSetter, fieldDefs);
                        geminiFieldType = geminiClass;
                    } else {
                        geminiFieldType = fieldType;
                    }
                    console.log("fieldDefs", fieldName, "fieldType", fieldType);
                    console.log("fieldDefs", fieldName, "geminiFieldType", geminiFieldType);

                    return [fieldName, new FieldDefinition(fieldName, geminiFieldType, isEcho)];
                })
            );
        }
    }

    function fieldTypesForFieldDefs(fieldDefs) {
        return Object.fromEntries(
            Object.entries(fieldDefs).map(([fieldName, fieldDef]) => {
                return [fieldName, fieldDef.fieldType];
            })
        );
    }

    function createGeminiClass(dstClass, target, isEcho, fieldTypesSetter, fieldDefinitions) {
        console.log("createGeminiClass", target.constructor);
        var outClass;

        const targetClass = target.constructor;

        const fieldTypes = fieldTypesForFieldDefs(fieldDefinitions);
        const fieldsFunc = (obj) => {
            return fieldTypes;
        }

        const geminiMixin = Base => class extends Base {

            log() {
                console.log("super.$changes", super.$changes);
            }

            static $gemini_dstClass() {
                return dstClass;
            }
            static $gemini_fieldTypesSetter() {
                return fieldTypesSetter;
            }


            static $gemini_fieldDefs() {
                return fieldDefinitions;
            }
            static $gemini_fieldsFunc(obj) {
                fieldsFunc(obj);
            }
            static $gemini_isEcho() {
                return false;
            }
        };

        if (isEcho) {
            const echoMixin = Base => class extends Base {
                static $gemini_isEcho() {
                    return true;
                }
            }
            class Echo extends echoMixin(geminiMixin(targetClass)) { }
            outClass = Echo;
        } else {
            class Gemini extends geminiMixin(targetClass) { }
            outClass = Gemini;
        }

        console.log("targetClass/A", targetClass);
        fieldTypesSetter(outClass, fieldTypes);
        console.log("outClass/B", outClass);

        return outClass;
    }
    Gemini_.createGeminiClass = createGeminiClass;

    function createGemini(dstClass, target, fieldTypesSetter, fieldsFunc, postGeminiCallback = null, isEcho = false, fieldDefinitions = null) {
        logger.log("createGemini", dstClass, target, fieldTypesSetter, fieldsFunc, postGeminiCallback, isEcho, fieldDefinitions);

        const fieldDefs = fieldDefinitions ? fieldDefinitions : fieldDefsForTarget(dstClass, target, isEcho, fieldTypesSetter, fieldsFunc);
        const geminiClass = createGeminiClass(dstClass, target, isEcho, fieldTypesSetter, fieldDefs);

        const gemini = GeminiHatch.createGeminiWithClass(geminiClass, target, fieldsFunc, postGeminiCallback);

        return gemini;
    }
    Gemini_.createGemini = createGemini;

    function createMiniGemini(dstClass, target, fieldTypesSetter, fieldsFunc, isEcho = false, miniSel) {

        const fieldDefs = fieldDefsForTarget(dstClass, target, isEcho, fieldTypesSetter, fieldsFunc);
        console.log("fieldDefs", fieldDefs);
        // const miniFieldDefs = Mini.miniClone(fieldDefs, miniSel);
        const miniFieldDefs = Mini.miniClone(fieldDefs, fieldsFunc, miniSel); //SHU???
        console.log("miniFieldDefs", miniFieldDefs);
        const geminiClass = createGeminiClass(dstClass, target, isEcho, fieldTypesSetter, miniFieldDefs);

        class Mini_X extends geminiClass { }

        const gemini = GeminiHatch.createGeminiWithClass(Mini_X, target, fieldsFunc);

        return gemini;
    }
    Gemini_.createMiniGemini = createMiniGemini;

    return Gemini_;
})();







//GeminiObject
const GeminiObject = (function () {

    const GeminiObject_ = {};

    function fieldsFunc(obj) {
        if (!obj.$fields) {
            if (obj instanceof Object) {
                obj.$fields = Object.fromEntries(Object.keys(obj)
                    .filter(key => !key.startsWith("_"))
                    .filter(key => !key.startsWith("$"))
                    .map(key => [key, typeof obj[key]])
                    .filter(([fieldName, type]) => {
                        const allowedTypes = ['string', 'number', 'object'];
                        return allowedTypes.includes(type);
                    })
                );
            } else {
                obj.$fields = {};
            }
        }

        return obj.$fields;
    }
    GeminiObject_.fieldsFunc = fieldsFunc;

    function fieldTypesSetter(obj, fields) {
        if (!obj.$fields) {
            obj.$fields = {};
        }
        obj.$fields = Object.assign(obj.$fields, fields);
    }
    GeminiObject_.fieldTypesSetter = fieldTypesSetter;


    function createGemini_Object(target, isEcho, miniSel) {

        const name = target.constructor.name;
        const postGeminiCallback = null;
        return Gemini.createGemini(name, target, fieldTypesSetter, fieldsFunc, postGeminiCallback, isEcho, miniSel);
    }
    GeminiObject_.createGemini_Object = createGemini_Object;

    GeminiObject_.createGemini = (target) => createGemini_Object(target, isEcho = false, miniSel = null);
    GeminiObject_.createEcho   = (target) => createGemini_Object(target, isEcho = true,  miniSel = null);


    function createMiniGemini_Object(target, isEcho, miniSel) {

        const name = target.constructor.name;
        const postGeminiCallback = null;
        return Gemini.createMiniGemini(name, target, fieldTypesSetter, fieldsFunc, postGeminiCallback, isEcho, miniSel);
    }
    GeminiObject_.createMiniGemini_Object = createMiniGemini_Object;

    GeminiObject_.createMiniGemini = (target, miniSel) => createMiniGemini_Object(target, isEcho = false, miniSel);
    GeminiObject_.createMiniEcho   = (target, miniSel) => createMiniGemini_Object(target, isEcho = true,  miniSel);


    return GeminiObject_;

})();





//GeminiHatch
const GeminiHatch = (function () {

    const GeminiHatch_ = {};


    //bloodlink

    function getBloodlinks(obj) {
        if (!obj.$_geminiBloodlinks) {
            obj.$_geminiBloodlinks = {};
        }
        return obj.$_geminiBloodlinks;
    }

    function addBloodlink(obj, propName) {
        getBloodlinks(obj)[propName] = true;
    }

    function getBloodlink(obj, propName) {
        return getBloodlinks(obj)[propName];
    }

    //listeners

    function getListeners(obj) {
        if (!obj.$_geminiListeners) {
            obj.$_geminiListeners = [];
        }
        return obj.$_geminiListeners;
    }

    function setListeners(obj, listeners) {
        obj.$_geminiListeners = listeners;
    }

    function addListener(obj, listener) {
        getListeners(obj).push(listener);
    }

    //echo

    function reportChange(obj, fieldName, isDelete) {
        if (obj.$onGeminiChange != null) {
            obj.$onGeminiChange(fieldName, isDelete);
        }
    }

    function updateInternals(target, gemini, fieldName, isDelete, postGeminiCallback) {
        const targetFieldValue = target[fieldName];
        console.log("targetFieldValue", targetFieldValue);

        const _fieldName = "_" + fieldName;
        if (targetFieldValue != null) {

            if (gemini[_fieldName] == null) {
                console.log("new organ field -> organ link");
                organlink(target, gemini, fieldName, postGeminiCallback);
            } else {
                gemini[_fieldName] = targetFieldValue;
            }

        } else {
            gemini[_fieldName] = targetFieldValue;
        }
    }

    function updateGemini(target, gemini, fieldName, isDelete, postGeminiCallback) {
        console.log("updateGemini", fieldName, isDelete);

        updateInternals(target, gemini, fieldName, isDelete, postGeminiCallback);
        reportChange(gemini, fieldName, isDelete);

        echo(gemini, fieldName, isDelete, postGeminiCallback);
    }

    function echo(obj, fieldName, isDelete, postGeminiCallback) {
        getListeners(obj).forEach((gemini, i) => {
            const geminiNeedsUpdate = ((gemini.constructor.$gemini_fieldDefs())[fieldName] != null);
            if (geminiNeedsUpdate) {
                updateGemini(obj, gemini, fieldName, isDelete, postGeminiCallback);
            } else {
                // console.log("echo, geminiNeedsUpdate == false");
            }
        });
    }

    function createChangeFunc(obj, postGeminiCallback) {

        const changeFunc = (fieldName, isDelete) => {
            console.log("changeFunc", fieldName, isDelete);
            reportChange(obj, fieldName, isDelete);
            echo(obj, fieldName, isDelete, postGeminiCallback);
        }

        return changeFunc;

    }

    function getChangeFunc(obj) {
        var outFunc = null;
        const f_unbound = obj.$_geminiOnChange;
        if (f_unbound) {
            // outFunc = f_unbound.bind(obj);
            outFunc = f_unbound;
        }
        return outFunc;
    }

    function setChangeFunc(obj, changeFunc) {
        obj.$_geminiOnChange = changeFunc;
    }

    function echolink(target, gemini, postGeminiCallback) {

        if (!getChangeFunc(target)) {
            setChangeFunc(target, createChangeFunc(target, postGeminiCallback));
        }
        addListener(target, gemini);

        setChangeFunc(gemini, createChangeFunc(gemini, postGeminiCallback));
    }

    function organlink(target, gemini, fieldName, postGeminiCallback) {
        console.log("organlink", fieldName);
        const targetFieldValue = target[fieldName];
        const _fieldName = "_" + fieldName;
        if (targetFieldValue != null) {
            const fieldType = (gemini.constructor.$gemini_fieldDefs())[fieldName].fieldType;
            // console.log("organlink, fieldType:", fieldType);
            const isGeminiClass = fieldType.$gemini_fieldsFunc != null;
            // console.log("isGeminiClass", isGeminiClass);
            if (isGeminiClass) {
                const geminiClass = fieldType;
                gemini[_fieldName] = createGeminiWithClass(geminiClass, targetFieldValue, geminiClass.$gemini_fieldsFunc, postGeminiCallback);
            } else {
                gemini[_fieldName] = targetFieldValue;
            }
        } else {
            gemini[_fieldName] = targetFieldValue;  //null
        }
        bloodlink(target, gemini, fieldName);
    }

    function bloodlink(target, gemini, propName) {
        console.log("bloodlink", propName);

        if (!getBloodlink(target, propName)) {
            Object.defineProperty(target, propName, {
                get: function () {
                    console.log(target.$name, ".get", propName);
                    console.log("target.get", propName);
                    const _propName = "_" + propName;
                    return target[_propName];
                },
                set: function (value) {
                    console.log(target.$name, ".set", propName, value);
                    console.log("target.set", propName, value);
                    const _propName = "_" + propName;
                    target[_propName] = value;

                    const changeFunc = getChangeFunc(target);
                    changeFunc(propName);
                }
            });
            addBloodlink(target, propName);
        }

        if (!gemini.constructor.$gemini_isEcho()) {

            Object.defineProperty(gemini, propName, {
                get: function () {
                    // console.log(gemini.$debug_name, ".get", propName);
                    console.log("gemini.get", propName);
                    const _propName = "_" + propName;
                    return gemini[_propName];
                },
                set: function (value) {
                    console.log("gemini.set", propName, value);

                    // console.log(gemini.$debug_name, "->", target.$debug_name);
                    target[propName] = value;

                    const changeFunc = getChangeFunc(gemini);
                    changeFunc(propName);
                }
            });
            addBloodlink(gemini, propName);

        } else {

            Object.defineProperty(gemini, propName, {
                get: function () {
                    // console.log(gemini.$debug_name, ".get", propName);
                    console.log("echo.get", propName);
                    const _propName = "_" + propName;
                    return gemini[_propName];
                },
                set: function (value) {
                    console.log("echo.set", propName, value);
                    throw new Error("an echo cannot set its properties");
                }
            });
            addBloodlink(gemini, propName);

        }

    }

    function isPrepared(obj, fieldsFunc) {
        var outBool = true;
        for (var fieldName in fieldsFunc(obj)) {
            const _fieldName = "_" + fieldName;
            if (obj[_fieldName] === undefined) {
                outBool = false;
                break;
            }
        }
        return outBool;
    }

    function prepareForBloodlink(obj, fieldsFunc) {
        console.log("prepare for bloodlink");
        for (var fieldName in fieldsFunc(obj)) {
            const _fieldName = "_" + fieldName;
            if (obj[_fieldName] != obj[fieldName]) {
                obj[_fieldName] = obj[fieldName];
            }
        }
    }


    function geminiCloneWithClass(geminiClass, obj) {
        console.log("geminiCloneWithClass", geminiClass.name, obj);
        var cloned = new (geminiClass)();

        const fieldDefs = geminiClass.$gemini_fieldDefs(obj);
        for (var fieldName in fieldDefs) {
            const value = obj[fieldName];
            if (value != null) {
                const fieldType = fieldDefs[fieldName].fieldType;
                // console.log("geminiCloneWithClass, fieldType:", fieldName, fieldType, fieldType.$gemini_fieldDefs);
                if (fieldType.$gemini_fieldDefs) {
                    // deep clone
                    cloned[fieldName] = geminiCloneWithClass(fieldType, value);
                }
                else {
                    // primitive values
                    cloned[fieldName] = value;
                }
            } else {
                cloned[fieldName] = value;
            }
        }

        return cloned;
    }

    function createGeminiWithClass(geminiClass, target, fieldsFunc, postGeminiCallback_in = null) {
        // console.log("createGeminiWithClass", geminiClass);

        const postGeminiCallback = postGeminiCallback_in ? postGeminiCallback_in : ((target, gemini) => {});


        const targetIsEcho = (target.constructor.$gemini_isEcho != null && target.constructor.$gemini_isEcho());
        const geminiIsEcho = geminiClass.$gemini_isEcho();

        //check compatibility
        if (targetIsEcho && !geminiIsEcho) {
            throw new Error("Gemini error, cannot gemini() an echo");
        }

        //prepare target
        const prepared = isPrepared(target, fieldsFunc);
        if (!prepared) {
            prepareForBloodlink(target, fieldsFunc);
        } else {
            console.log("target is prepared");
        }

        //create gemini
        const gemini = geminiCloneWithClass(geminiClass, target);
        console.log("***gemini.log():", gemini.log());
        // console.log("***gemini.a.log():", gemini.a.log());


        //bind gemini and target
        const fieldDefs = gemini.constructor.$gemini_fieldDefs();
        for (var fieldName in fieldDefs) {
            organlink(target, gemini, fieldName, postGeminiCallback);
        }
        // console.log("**after organlink:", gemini.a);

        echolink(target, gemini, postGeminiCallback);
        // console.log("**after echolink:", gemini.a);

        postGeminiCallback(target, gemini);

        return gemini;
    }
    GeminiHatch_.createGeminiWithClass = createGeminiWithClass;

    return GeminiHatch_;

})();





//Mini
const Mini = (function () {

    const Mini_ = {};

    function miniAssign(dst, src, fieldsFunc, miniSel) {

        const miniFields = mini(fieldsFunc(src), miniSel);
    
        Object.keys(miniFields).forEach((miniFieldName, i) => {
            const subMiniSel = miniSel[miniFieldName];
            if (subMiniSel) {
                miniAssign(dst[miniFieldName], src[miniFieldName], fieldsFunc, subMiniSel);
            } else {
                dst[miniFieldName] = src[miniFieldName];
            }
        });
    }
    Mini_.miniAssign = miniAssign;
    
    function cloneFunc(fieldsFunc) {
        function clone(obj) {
            console.log("clone", obj);
            console.log("obj.constructor", obj.constructor);
            var cloned = new (obj.constructor);
    
            for (var field in fieldsFunc(obj)) {
                const value = obj[field];
                if (value != null) {
                    const fields = fieldsFunc(value);
                    if (fields != null) {
                        // deep clone
                        cloned[field] = clone(value);
                    }
                    else {
                        // primitive values
                        cloned[field] = value;
                    }
                } else {
                    cloned[field] = value;
                }
            }
    
            return cloned;
        }
        return clone;
    }
    
    
    //shallow
    function mini(obj, miniSel) {
        const miniObj = Object.keys(miniSel).reduce((acc, miniFieldName) => {
            var miniFieldValue = obj[miniFieldName];
            if (miniFieldValue) {
                const miniFieldMiniSel = miniSel[miniFieldName];
                if (miniFieldMiniSel) {
                    miniFieldValue = mini(miniFieldValue, miniFieldMiniSel);
                }
                return Object.assign(acc, { [miniFieldName]: miniFieldValue });
            }
            return acc;
        }, {});
        return miniObj;
    }
    Mini_.mini = mini;

    
    //deep
    function miniClone(obj, fieldsFunc, miniSel) {
        var miniCloned;
    
        const cloned = (cloneFunc(fieldsFunc))(obj);
    
        if (!miniSel) {
            miniCloned = cloned;
        } else {
            miniCloned = mini(cloned, miniSel);
        }
    
        return miniCloned;
    }
    Mini_.miniClone = miniClone;

    return Mini_;

})();

