function installFabricUpgrade_fabricXrenderZones(fabric) {
  //logger.log("logFabric", "installFabricUpgrade_fabricXrenderZones");

  //selection X renderZones:
  //  give top priority to current zLevel
  //  if nothing at current zLevel, search in neighboring zLevels
  //  but don't go too deep or too high

  fabric.Canvas.prototype.findTarget = function (e, skipGroup) {
    if (this.skipTargetFind) {
      return;
    }

    var ignoreZoom = true,
        pointer = this.getPointer(e, ignoreZoom),
        activeObject = this._activeObject,
        aObjects = this.getActiveObjects(),
        activeTarget, activeTargetSubs,
        isTouch = fabric.util.isTouchEvent(e),
        shouldLookForActive = (aObjects.length > 1 && !skipGroup) || aObjects.length === 1;

    // first check current group (if one exists)
    // active group does not check sub targets like normal groups.
    // if active group just exits.
    this.targets = [];

    // if we hit the corner of an activeObject, let's return that.
    if (shouldLookForActive && activeObject._findTargetCorner(pointer, isTouch)) {
      return activeObject;
    }
    if (aObjects.length > 1 && !skipGroup && activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      return activeObject;
    }
    if (aObjects.length === 1 &&
      activeObject === this._searchPossibleTargets([activeObject], pointer)) {
      if (!this.preserveObjectStacking) {
        return activeObject;
      }
      else {
        activeTarget = activeObject;
        activeTargetSubs = this.targets;
        this.targets = [];
      }
    }
    //---
    // var target = this._searchPossibleTargets(this._objects, pointer);
    //---
    //+++
    const arr_fObj__candidateSelectable = this.getArr_fObj__candidateSelectable();
    var target = this._searchPossibleTargets(arr_fObj__candidateSelectable, pointer);
    //+++
    if (e[this.altSelectionKey] && target && activeTarget && target !== activeTarget) {
      target = activeTarget;
      this.targets = activeTargetSubs;
    }
    return target;
  };

  fabric.Canvas.prototype.getArr_fObj__candidateSelectable = function () {
    var outArr;

    const dZLevel_number__deep = 3;
    const dZLevel_number__high = 5;

    if(fabricIntegration) {   //SHU: /!\ global var 

      const infiniteCanvas         = fabricIntegration.infiniteCanvas;
      const zLevel_number__current = infiniteCanvas.range__zLevel_number__existing.current;
      
      const zLevel_number__min = zLevel_number__current - dZLevel_number__deep;
      const zLevel_number__max = zLevel_number__current + dZLevel_number__high;

      const arr_dict_zPixel__existing = Object.values(infiniteCanvas.dict_dict_zPixel__existing);

      const arr_dict_zPixel__filtered = arr_dict_zPixel__existing.filter((dict_zPixel) => {
        const zPixelCoords  = dict_zPixel.zPixelCoords;
        const zLevel_number = zPixelCoords.zLevel.toNumber();
        
        const isInteresting = (zLevel_number__min < zLevel_number) && (zLevel_number < zLevel_number__max); 
        return isInteresting;
      });

      const dict_icObj__candidateSelectable = arr_dict_zPixel__filtered.reduce((acc, dict_zPixel) => {
        const zPixelCoords      = dict_zPixel.zPixelCoords;
        const key__zPixelCoords = zPixelUtils.createKeyForZPixelCoords(zPixelCoords);
        const dict_icObj = infiniteCanvas.dict_renderZone[key__zPixelCoords];
        Object.assign(acc, dict_icObj);
        return acc;
      }, {});

      const arr_icObj__candidateSelectable = Object.values(dict_icObj__candidateSelectable)
                                              //bugfix: rectangle selection breaks zChallenge (temporary)
                                              .filter((icObj) => !icObj.isLocked);

      // const arr_icObj__perfect             = Object.values(infiniteCanvas.dict_icObj__perfect);
      // const arr_icObj__candidateSelectable = [...Object.values(dict_icObj__candidateSelectable) , ...arr_icObj__perfect];

      const arr_fObj__candidateSelectable = arr_icObj__candidateSelectable.map((id__icObj) => {
        const fObj = fabricIntegration.getFObjFor_id__icObj(id__icObj);
        return fObj;
      }).filter((fObj) => (fObj != null));

      outArr = arr_fObj__candidateSelectable;

    } else {
      outArr = this._objects;
    }

    return outArr;
  };


  // fabric.Canvas.prototype._searchPossibleTargets = function(objects, pointer) {
  //   // Cache all targets where their bounding box contains point.
  //   var target, i = objects.length, subTarget;
  //   // Do not check for currently grouped objects, since we check the parent group itself.
  //   // until we call this function specifically to search inside the activeGroup
  //   while (i--) {
  //   var objToCheck = objects[i];
  //   var pointerToUse = objToCheck.group ?
  //     this._normalizePointer(objToCheck.group, pointer) : pointer;
  //   if (this._checkTarget(pointerToUse, objToCheck, pointer)) {
  //     target = objects[i];
  //     if (target.subTargetCheck && target instanceof fabric.Group) {
  //     subTarget = this._searchPossibleTargets(target._objects, pointer);
  //     subTarget && this.targets.push(subTarget);
  //     }
  //     break;
  //   }
  //   }
  //   return target;
  // };

  // /**
  //    * Checks point is inside the object.
  //    * @param {Object} [pointer] x,y object of point coordinates we want to check.
  //    * @param {fabric.Object} obj Object to test against
  //    * @param {Object} [globalPointer] x,y object of point coordinates relative to canvas used to search per pixel target.
  //    * @return {Boolean} true if point is contained within an area of given object
  //    * @private
  //    */
  // _checkTarget: function(pointer, obj, globalPointer) {
  //   if (obj &&
  //       obj.visible &&
  //       obj.evented &&
  //       // http://www.geog.ubc.ca/courses/klink/gis.notes/ncgia/u32.html
  //       // http://idav.ucdavis.edu/~okreylos/TAship/Spring2000/PointInPolygon.html
  //       obj.containsPoint(pointer)
  //   ) {
  //     if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
  //       var isTransparent = this.isTargetTransparent(obj, globalPointer.x, globalPointer.y);
  //       if (!isTransparent) {
  //         return true;
  //       }
  //     }
  //     else {
  //       return true;
  //     }
  //   }
  // },

}
