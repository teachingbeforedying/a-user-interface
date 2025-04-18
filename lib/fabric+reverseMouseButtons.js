function installFabricUpgrade_fabricXreverseMouseButtons(fabric) {
  //logger.log("logFabric", "installFabricUpgrade_fabricXreverseMouseButtons");

  //if not asked to, reverse LEFT_CLICK and RIGHT_CLICK
  //  i.e.: replace LEFT_CLICK with inputProperties.LEFT_CLICK, etc. (inputProperties manages the button swap)
  //        replace magic e.button !== 1 check with checkClick(e, inputProperties.LEFT_CLICK)
  
  //to do so, we have to update 
      //checkClick(),
      //fabric.Canvas.prototype.__onMouseDown  
      //fabric.Canvas.prototype.__onMouseUp
      //fabric.Canvas.prototype._handleEvent
      //fabric.IText.prototype._mouseDownHandlerBefore  
      //fabric.IText.prototype._mouseDownHandler
      //fabric.IText.prototype.mouseUpHandler

  function checkClick(e, value) {
    //---
    // return e.button && (button__effective === (value - 1));
    //---
    //+++
    return (e.button != null) && (e.button === (value - 1));
    //+++
  }

  fabric.Canvas.prototype.__onMouseDown = function (e) {
    this._cacheTransformEventData(e);
    this._handleEvent(e, 'down:before');
    var target = this._target;
    // if right click just fire events
    if (checkClick(e, inputProperties.RIGHT_CLICK)) {
      logger.log("logFabricRMB", "__onMouseDown", "RIGHT_CLICK");
      if (this.fireRightClick) {
        this._handleEvent(e, 'down', inputProperties.RIGHT_CLICK);
      }
      return;
    }

    if (checkClick(e, inputProperties.MIDDLE_CLICK)) {
      if (this.fireMiddleClick) {
        this._handleEvent(e, 'down', inputProperties.MIDDLE_CLICK);
      }
      return;
    }

    if (this.isDrawingMode) {
      this._onMouseDownInDrawingMode(e);
      return;
    }

    if (!this._isMainEvent(e)) {
      return;
    }

    // ignore if some object is being transformed at this moment
    if (this._currentTransform) {
      return;
    }

    var pointer = this._pointer;
    // save pointer for check in __onMouseUp event
    this._previousPointer = pointer;
    var shouldRender = this._shouldRender(target),
        shouldGroup = this._shouldGroup(e, target);
    if (this._shouldClearSelection(e, target)) {
      this.discardActiveObject(e);
    }
    else if (shouldGroup) {
      this._handleGrouping(e, target);
      target = this._activeObject;
    }

    if (this.selection && (!target ||
      (!target.selectable && !target.isEditing && target !== this._activeObject))) {
      this._groupSelector = {
        ex: this._absolutePointer.x,
        ey: this._absolutePointer.y,
        top: 0,
        left: 0
      };
    }

    if (target) {
      var alreadySelected = target === this._activeObject;
      if (target.selectable && target.activeOn === 'down') {
        this.setActiveObject(target, e);
      }
      var corner = target._findTargetCorner(
        this.getPointer(e, true),
        fabric.util.isTouchEvent(e)
      );
      target.__corner = corner;
      if (target === this._activeObject && (corner || !shouldGroup)) {
        this._setupCurrentTransform(e, target, alreadySelected);
        var control = target.controls[corner],
            pointer = this.getPointer(e),
            mouseDownHandler = control && control.getMouseDownHandler(e, target, control);
        if (mouseDownHandler) {
          mouseDownHandler(e, this._currentTransform, pointer.x, pointer.y);
        }
      }
    }
    this._handleEvent(e, 'down');
    // we must renderAll so that we update the visuals
    (shouldRender || shouldGroup) && this.requestRenderAll();
  };


  fabric.Canvas.prototype.__onMouseUp = function (e) {
    var target, transform = this._currentTransform,
        groupSelector = this._groupSelector, shouldRender = false,
        isClick = (!groupSelector || (groupSelector.left === 0 && groupSelector.top === 0));
    this._cacheTransformEventData(e);
    target = this._target;
    this._handleEvent(e, 'up:before');
    // if right/middle click just fire events and return
    // target undefined will make the _handleEvent search the target
    if (checkClick(e, inputProperties.RIGHT_CLICK)) {
      logger.log("logFabricRMB", "__onMouseUp", "RIGHT_CLICK");
      if (this.fireRightClick) {
        this._handleEvent(e, 'up', inputProperties.RIGHT_CLICK, isClick);
      }
      return;
    }

    if (checkClick(e, inputProperties.MIDDLE_CLICK)) {
      if (this.fireMiddleClick) {
        this._handleEvent(e, 'up', inputProperties.MIDDLE_CLICK, isClick);
      }
      this._resetTransformEventData();
      return;
    }

    if (this.isDrawingMode && this._isCurrentlyDrawing) {
      this._onMouseUpInDrawingMode(e);
      return;
    }

    if (!this._isMainEvent(e)) {
      return;
    }
    if (transform) {
      this._finalizeCurrentTransform(e);
      shouldRender = transform.actionPerformed;
    }
    if (!isClick) {
      var targetWasActive = target === this._activeObject;
      this._maybeGroupObjects(e);
      if (!shouldRender) {
        shouldRender = (
          this._shouldRender(target) ||
          (!targetWasActive && target === this._activeObject)
        );
      }
    }
    var corner, pointer;
    if (target) {
      corner = target._findTargetCorner(
        this.getPointer(e, true),
        fabric.util.isTouchEvent(e)
      );
      if (target.selectable && target !== this._activeObject && target.activeOn === 'up') {
        this.setActiveObject(target, e);
        shouldRender = true;
      }
      else {
        var control = target.controls[corner],
            mouseUpHandler = control && control.getMouseUpHandler(e, target, control);
        if (mouseUpHandler) {
          pointer = this.getPointer(e);
          mouseUpHandler(e, transform, pointer.x, pointer.y);
        }
      }
      target.isMoving = false;
    }
    // if we are ending up a transform on a different control or a new object
    // fire the original mouse up from the corner that started the transform
    if (transform && (transform.target !== target || transform.corner !== corner)) {
      var originalControl = transform.target && transform.target.controls[transform.corner],
          originalMouseUpHandler = originalControl && originalControl.getMouseUpHandler(e, target, control);
      pointer = pointer || this.getPointer(e);
      originalMouseUpHandler && originalMouseUpHandler(e, transform, pointer.x, pointer.y);
    }
    this._setCursorFromEvent(e, target);
    this._handleEvent(e, 'up', inputProperties.LEFT_CLICK, isClick);
    this._groupSelector = null;
    this._currentTransform = null;
    // reset the target information about which corner is selected
    target && (target.__corner = 0);
    if (shouldRender) {
      this.requestRenderAll();
    }
    else if (!isClick) {
      this.renderTop();
    }
  };

  fabric.Canvas.prototype._handleEvent = function(e, eventType, button, isClick) {
    var target = this._target,
        targets = this.targets || [],
        options = {
          e: e,
          target: target,
          subTargets: targets,
          button: button || inputProperties.LEFT_CLICK,
          isClick: isClick || false,
          pointer: this._pointer,
          absolutePointer: this._absolutePointer,
          transform: this._currentTransform
        };
    if (eventType === 'up') {
      options.currentTarget = this.findTarget(e);
      options.currentSubTargets = this.targets;
    }
    this.fire('mouse:' + eventType, options);
    target && target.fire('mouse' + eventType, options);
    for (var i = 0; i < targets.length; i++) {
      targets[i].fire('mouse' + eventType, options);
    }
  };







  fabric.IText.prototype._mouseDownHandlerBefore = function(options) {
    if (!this.canvas || !this.editable || !checkClick(options.e, inputProperties.LEFT_CLICK)) {
      return;
    }
    // we want to avoid that an object that was selected and then becomes unselectable,
    // may trigger editing mode in some way.
    this.selected = this === this.canvas._activeObject;
  };


  fabric.IText.prototype._mouseDownHandler = function(options) {
    if (!this.canvas || !this.editable || !checkClick(options.e, inputProperties.LEFT_CLICK)) {
      return;
    }

    this.__isMousedown = true;

    if (this.selected) {
      this.inCompositionMode = false;
      this.setCursorByClick(options.e);
    }

    if (this.isEditing) {
      this.__selectionStartOnMouseDown = this.selectionStart;
      if (this.selectionStart === this.selectionEnd) {
        this.abortCursorAnimation();
      }
      this.renderCursorOrSelection();
    }
  };


  fabric.IText.prototype.mouseUpHandler = function(options) {
    logger.log("logFabricRMB", "fabric.IText.prototype.mouseUpHandler", "options:", options);

    this.__isMousedown = false;
    if (!this.editable || this.group ||
      (options.transform && options.transform.actionPerformed) ||
      !checkClick(options.e, inputProperties.LEFT_CLICK)) {
      return;
    }

    if (this.canvas) {
      var currentActive = this.canvas._activeObject;
      if (currentActive && currentActive !== this) {
        // avoid running this logic when there is an active object
        // this because is possible with shift click and fast clicks,
        // to rapidly deselect and reselect this object and trigger an enterEdit
        return;
      }
    }

    if (this.__lastSelected && !this.__corner) {
      this.selected = false;
      this.__lastSelected = false;
      this.enterEditing(options.e);
      if (this.selectionStart === this.selectionEnd) {
        this.initDelayedCursor(true);
      }
      else {
        this.renderCursorOrSelection();
      }
    }
    else {
      this.selected = true;
    }
  };


}
