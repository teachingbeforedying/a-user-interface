function installFabricCanvasActiveSelectionTLUpgrade(fabricCanvas) {
  logger.log("logFabric", "installFabricCanvasActiveSelectionTLUpgrade");

  fabricCanvas.__dict_activeSelectionTL = { 
    // centerPoint: {     //SHU: this won't break group origin's mystic spells
    //   x: 0,
    //   y: 0,
    // },
    // originX: "left",
    // originY: "top",
  };

  // fabricCanvas._createActiveSelection = (function(target, e) {
  //   var currentActives = this.getActiveObjects(), group = this._createGroup(target);
  //   this._hoveredTarget = group;
  //   // ISSUE 4115: should we consider subTargets here?
  //   // this._hoveredTargets = [];
  //   // this._hoveredTargets = this.targets.concat();
  //   this._setActiveObject(group, e);
  //   this._fireSelectionEvents(currentActives, e);
  // }).bind(fabricCanvas);

  fabricCanvas._createGroup = (function(target) {
    logger.log("logFabric", "_createGroup");

    var objects = this._objects,
        isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target),
        groupObjects = isActiveLower
          ? [this._activeObject, target]
          : [target, this._activeObject];
    this._activeObject.isEditing && this._activeObject.exitEditing();

    const options = Object.assign({canvas: this}, this.__dict_activeSelectionTL);
    return new fabric.ActiveSelection(groupObjects, options);
    // return new fabric.ActiveSelectionTL(groupObjects, options);
  }).bind(fabricCanvas);

  fabricCanvas._groupSelectedObjects = (function(e) {
    logger.log("logFabric", "_groupSelectedObjects");

    var group = this._collectObjects(e),
        aGroup;

    // do not create group for 1 element only
    if (group.length === 1) {
      this.setActiveObject(group[0], e);
    }
    else if (group.length > 1) {
      const options = Object.assign({canvas: this}, this.__dict_activeSelectionTL);
      aGroup = new fabric.ActiveSelection(group.reverse(), options);
      // aGroup = new fabric.ActiveSelectionTL(group.reverse(), options);
      this.setActiveObject(aGroup, e);
    }
  }).bind(fabricCanvas);





  
  //easy
  fabricCanvas.createEasyActiveSelectionTL = (function(arr_fObj) {
    logger.log("logFabric", "createEasyActiveSelectionTL");

    const options = Object.assign({canvas: this}, this.__dict_activeSelectionTL);
    return new fabric.ActiveSelection(arr_fObj, options);
    // return new fabric.ActiveSelectionTL(arr_fObj, options);

  }).bind(fabricCanvas);

}

