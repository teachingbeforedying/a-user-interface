class DecorationUtils {

    static isDecorator(obj) {
        return ("propName__decorated" in obj) /*&& (this.getWrappedObj(obj) != null)*/;
    }

    static getWrappedObj(decoratorObj) {
        const propName = decoratorObj.propName__decorated;
        return decoratorObj[propName];
    }

    static upgrade_decorator__with_infiltration(decoratorObj) {

        if(!DecorationUtils.isDecorator(decoratorObj)) {
            throw new Error("trying to upgrade non-decorator obj: " + decoratorObj);
        }

        decoratorObj.dict__infiltration = {};

        decoratorObj.setInfiltration = (function(propName, prop) {
            const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
            this[propName] = prop;
            this.dict__infiltration[propName] = prop;
            if(DecorationUtils.isDecorator(wrappedObj)) {
                if(!("setInfiltration" in wrappedObj)) {
                    DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
                }
                wrappedObj._setInfiltration(propName, prop);
            } else {
                wrappedObj[propName] = prop;
            }
        }).bind(decoratorObj);
          
        decoratorObj.removeInfiltration = (function(propName) {
            const wrappedObj = DecorationUtils.getWrappedObj(decoratorObj);
            if(DecorationUtils.isDecorator(wrappedObj)) {
                // if(!("removeInfiltration" in wrappedObj)) {
                //     DecorationUtils.upgrade_decorator__with_infiltration(wrappedObj);
                // }
                wrappedObj._removeInfiltration(propName);
            } else {
                delete wrappedObj[propName];
            }
            delete this.dict__infiltration[propName];
            delete this[propName];
        }).bind(decoratorObj);
    
    }

}