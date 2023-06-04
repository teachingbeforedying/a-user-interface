fabric.BaseBrush.prototype.deepClone = function() {

  const canvas = this.canvas;

  const brush__src = this;

  //remove circular dependency before serializing
  brush__src.canvas = null; 

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

  //restore circular dependency
  brush__clone.canvas = canvas;
  brush__src.canvas   = canvas; 

  return brush__clone;
};