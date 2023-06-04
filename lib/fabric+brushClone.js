fabric.BaseBrush.prototype.deepClone = function() {

  const brush__src = this;

  //remove circular dependencies before serializing
  const canvas      = this.canvas;
  brush__src.canvas = null;

  const parentBrush      = brush__src.parentBrush; 
  brush__src.parentBrush = null;

  var dict_infiltration = {};
  if("setInfiltration" in brush__src) {
    dict_infiltration = Object.assign({}, brush__src.dict_infiltration); //SHU TODO: deep copy here too
    Object.entries(dict_infiltration).forEach(([k,v]) => {
      brush__src.removeInfiltration(k);
    });
  }

  // logger.log("logComb", "deepClone", "before JSON(JSON())", "brush__src:", brush__src);

  //deep clone
  const proto        = Object.getPrototypeOf(brush__src);
  const brush__clone = Object.create(proto);
  Object.assign(brush__clone, JSON.parse(JSON.stringify(brush__src)));

  const arr_method = Utils.getMethods(brush__clone);
  const arr_native = Object.entries(new Object()).filter(([k,v]) => {
    return !(v instanceof Function);
  });
  arr_method.filter(funcName => {
    return arr_native.includes(funcName);
  }).forEach(funcName => {
    const func = brush__src[funcName];
    brush__clone[funcName] = deserialize(serialize(func));
  });

  if("setInfiltration" in brush__src) {
    DecoratorUtils.upgrade_decorator__with_infiltration(brush__clone);
  }



  //restore circular dependencies
  Object.entries(dict_infiltration).forEach(([k,v]) => {
    brush__src.setInfiltration(k,v);
    brush__clone.setInfiltration(k,v);
  });

  brush__clone.canvas = canvas;
  brush__src.canvas   = canvas;

  brush__clone.parentBrush = parentBrush;
  brush__src.parentBrush   = parentBrush;


  return brush__clone;
};