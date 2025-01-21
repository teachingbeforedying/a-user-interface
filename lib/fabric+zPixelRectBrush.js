function installFabricZPixelRectBrush(fabricCanvas) {
  logger.log("logFabric", "installFabricZPixelRectBrush");

  // fabricCanvas._onMouseMoveInDrawingMode = (function(e) {
  //   var pointer = this.getPointer(e);
  //   if (this._isCurrentlyDrawing) {
  //     this.freeDrawingBrush.onMouseMove(pointer, { e: e, pointer: pointer });
  //   } else {
  //     // logger.log("logPreview", "_onMouseMoveInDrawingMode", e, this.freeDrawingBrush);
  //     if("onMouseMove__preview" in this.freeDrawingBrush) {
  //       this.freeDrawingBrush.onMouseMove__preview(pointer, { e: e, pointer: pointer });
  //     }
  //   }
  //   this.setCursor(this.freeDrawingCursor);
  //   this._handleEvent(e, 'move');
  // }).bind(fabricCanvas);

}

(function () {
  
  class ZPixelRectBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {

    //force brush width to be 1
    width: DecorationUtils.overrideProperty({
      get: function () { return 1; }, 
      set: function (width__new) { /*ignore*/ },
    }),

    _setBrushStyles: function(ctx) {
      // logger.log("logZPixelBrush", "_setBrushStyles", this);
      // logger.log("logZPixelBrush", "_setBrushStyles", "this.width:", this.width);

      DecorationUtils.getWrappedObj(this)._setBrushStyles(ctx);

      ctx.fillStyle = this.color;
    },



    //preview funcs {

    getOpacity__preview: function() {
      return 0.32;
    },

    getColor__preview: function() {
      // logger.log("logPreview", this.debug__name, "this.color", this.color);
      const fColor__clone   = new fabric.Color(this.color);
  
      const opacity__preview = this.getOpacity__preview();
      const fColor__preview  = fColor__clone.setAlpha(opacity__preview);
  
      const color__preview   = fColor__preview.toRgba();
  
      return color__preview;
    },

    _setBrushStyles__preview: function(ctx) {
      // logger.log("ZPixelRectBrush", "_setBrushStyles__preview", this);
      this._setBrushStyles(ctx);
        
      ctx.strokeStyle = "black";
      ctx.fillStyle   = this.getColor__preview();
    },

    onMouseMove__preview: function(pointer, options) {
      // logger.log("ZPixelRectBrush", "onMouseMove__preview", this, pointer, options);
      var p = new fabric.Point(pointer.x, pointer.y);
  
      // const ctx = this.canvas.contextContainer;
      const ctx = this.canvas.contextTop;
  
      if(this.parentBrush == null) {
        this.canvas.clearContext(ctx);
      }
  
      // ctx.save();
  
      this._setBrushStyles__preview(ctx);

      const dict_zPixel = this.getDict_zPixel(pointer);
      // logger.log("logZPixelRectFD", "onMouseMove__preview", "dict_zPixel:", dict_zPixel);

      const screenRect__zPixel = dict_zPixel.screenRect;
      // const homeScale__zPixel  = dict_zPixel.homeScale;
      
      ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
      ctx.strokeRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);

      // ctx.restore();
    },

    clearPreview: function() {
      const ctx = this.canvas.contextTop;
      if(this.parentBrush == null) {
        this.canvas.clearContext(ctx);
      }
    },

    // } preview funcs 

    


    // the "rect" part
    // {
    __dict_zPixel__start: null,
    __dict_zPixel__end:   null,

    dict_zPixelRect:      null,

    /**
     * __dict_zPixel__start is writeOnce
     */
    /*get*/ getDict_zPixel__start: function() {
      return this.__dict_zPixel__start;
    },
    /*set*/ setDict_zPixel__start: function(dict_zPixel) {
      var outBool;
      if(this.__dict_zPixel__start == null) {
        this.__dict_zPixel__start = dict_zPixel;
        outBool = true;
      } else {
        outBool = false;
      }
      return outBool;
    },

    /**
     * __dict_zPixel__end is "writeDistinct"
     */
    /*get*/ getDict_zPixel__end: function() {
      return this.__dict_zPixel__end;
    },
    /*set*/ setDict_zPixel__end: function(dict_zPixel) {
      var outBool;

      if(this.__dict_zPixel__end == null) {
        this.__dict_zPixel__end = dict_zPixel;
        this.updateDict_zPixelRect();
        outBool = true;
      } else {
        const isSameZPixel = this.isSameZPixel(dict_zPixel, this.__dict_zPixel__end);
        if(isSameZPixel) {
          outBool = false;
        } else {
          this.__dict_zPixel__end = dict_zPixel;
          this.updateDict_zPixelRect();
          outBool = true;
        }
      }

      return outBool;      
    },

    updateDict_zPixelRect: function() {
      const dict_zPixel__start = this.getDict_zPixel__start();
      const dict_zPixel__end   = this.getDict_zPixel__end();

      const arr_zPixel = [dict_zPixel__start, dict_zPixel__end];
      // logger.log("logZPixelRect", "updateDict_zPixelRect", "arr_zPixel:", arr_zPixel);

      const [dict_zPixel__L, dict_zPixel__R] = arr_zPixel.toSorted((dict_zPixel1, dict_zPixel2) => {
        return dict_zPixel1.zPixelCoords.ix - dict_zPixel2.zPixelCoords.ix;     //beware: compareFn wants negative/zero/positive output (don't use lt or gt)
      });
      const [dict_zPixel__T, dict_zPixel__B] = arr_zPixel.toSorted((dict_zPixel1, dict_zPixel2) => {
        return dict_zPixel1.zPixelCoords.iy - dict_zPixel2.zPixelCoords.iy;     //beware: compareFn wants negative/zero/positive output (don't use lt or gt)
      });

      const screenSize__zPixel = {width: dict_zPixel__start.screenRect.width, height: dict_zPixel__start.screenRect.height};
      const trueSize__zPixel   = {width: dict_zPixel__start.trueRect.width,   height: dict_zPixel__start.trueRect.height};
      // logger.log("logZPixelRect", "trueSize__zPixel:", trueSize__zPixel);
      const zLevel__zPixel     = dict_zPixel__start.zPixelCoords.zLevel;
      const homeScale__zPixel  = dict_zPixel__start.homeScale;

      const dict_zPixel__TL = {
        //
        screenRect:   Object.assign({x: dict_zPixel__L.screenRect.x, y: dict_zPixel__T.screenRect.y}, screenSize__zPixel),

        // screenPoint:  {x: dict_zPixel__L.screenPoint.x, y: dict_zPixel__T.screenPoint.y},
        truePoint:    {x: dict_zPixel__L.truePoint.x,   y: dict_zPixel__T.truePoint.y},

        //
        zPixelCoords: {zLevel: zLevel__zPixel, ix: dict_zPixel__L.zPixelCoords.ix, iy: dict_zPixel__T.zPixelCoords.iy},

        trueRect:     Object.assign({x: dict_zPixel__L.trueRect.x, y: dict_zPixel__T.trueRect.y}, trueSize__zPixel),
        homeScale:    homeScale__zPixel,
      };

      const dict_zPixel__BR = {
        //
        screenRect:   Object.assign({
          x: dict_zPixel__R.screenRect.x + screenSize__zPixel.width,  //because it's BR
          y: dict_zPixel__B.screenRect.y + screenSize__zPixel.height, //because it's BR
        }, screenSize__zPixel),

        // screenPoint:  {x: dict_zPixel__R.screenPoint.x, y: dict_zPixel__B.screenPoint.y},
        truePoint:    {x: dict_zPixel__R.truePoint.x,   y: dict_zPixel__B.truePoint.y},

        //
        zPixelCoords: {
          zLevel: zLevel__zPixel, 
          ix: dict_zPixel__R.zPixelCoords.ix + 1,                     //because it's BR
          iy: dict_zPixel__B.zPixelCoords.iy + 1,                     //because it's BR
        },

        trueRect:     Object.assign({
          x: dict_zPixel__R.trueRect.x + trueSize__zPixel.width,      //because it's BR
          y: dict_zPixel__B.trueRect.y + trueSize__zPixel.height,     //because it's BR
        }, trueSize__zPixel),
        homeScale:    homeScale__zPixel,
      };

      this.dict_zPixelRect = this.createDict_zPixelRect(dict_zPixel__TL, dict_zPixel__BR);
    },

    createDict_zPixelRect: function(dict_zPixel__TL, dict_zPixel__BR) {
      // logger.log("logZPixelRect", "createDict_zPixelRect", {
      //   dict_zPixel__TL: dict_zPixel__TL,
      //   dict_zPixel__BR: dict_zPixel__BR,
      // });

      const screenSize__zPixelRect = {
        width:  (dict_zPixel__BR.screenRect.x - dict_zPixel__TL.screenRect.x), 
        height: (dict_zPixel__BR.screenRect.y - dict_zPixel__TL.screenRect.y), 
      };
      const trueSize__zPixelRect   = {
        width:  (dict_zPixel__BR.trueRect.x - dict_zPixel__TL.trueRect.x), 
        height: (dict_zPixel__BR.trueRect.y - dict_zPixel__TL.trueRect.y), 
      };
      const zPixelSize__zPixelRect = {   
        iwidth:  (dict_zPixel__BR.zPixelCoords.ix - dict_zPixel__TL.zPixelCoords.ix),
        iheight: (dict_zPixel__BR.zPixelCoords.iy - dict_zPixel__TL.zPixelCoords.iy),
      };
      const homeScale__zPixelRect  = dict_zPixel__TL.homeScale;

      const zPixelRectCoords = Object.assign({}, dict_zPixel__TL.zPixelCoords, zPixelSize__zPixelRect); //SHU: safeAssign would be nice (throw error when overwriting something)

      const dict_zPixelRect = {
        //
        screenRect: Object.assign({x: dict_zPixel__TL.screenRect.x, y: dict_zPixel__TL.screenRect.y}, screenSize__zPixelRect),

        //screenPoint__TL:  dict_zPixel__TL.screenPoint,
        //truePoint__TL:    dict_zPixel__TL.truePoint,

        //screenPoint__BR:  dict_zPixel__BR.screenPoint,
        //truePoint__BR:    dict_zPixel__BR.truePoint,

        //
        zPixelRectCoords: zPixelRectCoords,

        trueRect:     Object.assign({x: dict_zPixel__TL.trueRect.x, y: dict_zPixel__TL.trueRect.y}, trueSize__zPixelRect),

        homeScale:    homeScale__zPixelRect,
      };


      //add color prop
      if(!dict_zPixelRect.color) {
        dict_zPixelRect.color = this.color;
      }


      return dict_zPixelRect;
    },
   
    // }



    // "zPixel engine"
    // {
    
    getDict_zPixel: function(pointer) {
      const dict_zPixel = this.drawingBout.createDict__zPixel__forZPixelBrushPointer(pointer);

      //add color prop
      if(!dict_zPixel.color) {
        dict_zPixel.color = this.color;
      }

      return dict_zPixel;
    },

    // /*
    //  *  Same principle as for _addPoint,
    //  *  i.e. we have to check that incoming zPixel is different from last added zPixel
    //  */
    // _addZPixel: function(dict_zPixel) {
    //   var outBool;

    //   if (this.arr_dict_zPixel.length > 0 && this.isSameZPixel(dict_zPixel, this.arr_dict_zPixel[this.arr_dict_zPixel.length - 1])) {
    //     outBool = false;
    //   } else {
    //     this.arr_dict_zPixel.push(dict_zPixel);
    //     outBool = true;
    //   }

    //   logger.log("logZPixelBrush", "_addZPixel", "dict_zPixel:", dict_zPixel, "this.arr_dict_zPixel:", this.arr_dict_zPixel, "outBool:", outBool);

    //   return outBool;
    // },

    isSameZPixelRect: function(dict_zPixelRect1, dict_zPixelRect2) {
      var outBool;

      const zPixelRectCoords1 = dict_zPixelRect1.zPixelRectCoords;
      const zPixelRectCoords2 = dict_zPixelRect2.zPixelRectCoords;

      const isSameZLevel = (zPixelRectCoords1.zLevel == zPixelRectCoords2.zLevel);
      outBool = isSameZLevel;

      if(outBool) {
        const isSameIx = (zPixelRectCoords1.ix == zPixelRectCoords2.ix); 
        const isSameIy = (zPixelRectCoords1.iy == zPixelRectCoords2.iy);
        outBool = isSameIx && isSameIy; 
      }

      if(outBool) {
        const isSameIwidth  = (zPixelRectCoords1.iwidth  == zPixelRectCoords2.iwidth); 
        const isSameIheight = (zPixelRectCoords1.iheight == zPixelRectCoords2.iheight);
        outBool = isSameIwidth && isSameIheight; 
      }

      return outBool;
    },

    isSameZPixel: function(dict_zPixel1, dict_zPixel2) {
      var outBool;

      const zPixelCoords1 = dict_zPixel1.zPixelCoords;
      const zPixelCoords2 = dict_zPixel2.zPixelCoords;

      const isSameZLevel = (zPixelCoords1.zLevel == zPixelCoords2.zLevel);
      if(!isSameZLevel) {
        outBool = false;
      } else {
        const isSameIx = (zPixelCoords1.ix == zPixelCoords2.ix); 
        const isSameIy = (zPixelCoords1.iy == zPixelCoords2.iy);
        outBool = isSameIx && isSameIy; 
      }

      return outBool;
    },

    // createFZPixelRect: function(dict_zPixelRect) {
    //   // logger.log("logZPixelRectBrush", "createFZPixelRect", "dict_zPixelRect:", dict_zPixelRect);

    //   const fZPixelRect = new fabric.ZPixelRect({
    //     x:      dict_zPixelRect.screenRect.x,
    //     y:      dict_zPixelRect.screenRect.y,

    //     width:  dict_zPixelRect.zPixelRectCoords.iwidth,
    //     height: dict_zPixelRect.zPixelRectCoords.iheight,

    //     // zLevel:  dict_zPixelRect.zPixelRectCoords.zLevel,
    //     // ix:      dict_zPixelRect.zPixelRectCoords.ix,
    //     // iy:      dict_zPixelRect.zPixelRectCoords.iy,
    //     // iwidth:  dict_zPixelRect.zPixelRectCoords.iwidth,
    //     // iheight: dict_zPixelRect.zPixelRectCoords.iheight,

    //     // color:  dict_zPixel.color,

    //     //strokeWidth: 12, //this is enforced to 0 in fabric.ZPixel (otherwise, zPixels have a little shift)
    //     // borderScaleFactor: 0,

    //       //sharp rect
    //     rx: 0,
    //     ry: 0,

    //     fill: dict_zPixelRect.color,

    //     originX: 'left',
    //     originY: 'top',
        
    //   });
      
    //   //set zIndex
    //   fZPixelRect.zIndex = this.zIndex;

    //   fZPixelRect.__brush = this;
      
    //   fZPixelRect.__dict_zPixelRect = dict_zPixelRect;

    //   return fZPixelRect;
    // },

    createFZPixelRect_p: function(dict_zPixelRect) {
      const fObj_p = this.drawingBout.createFabricZPixelRectWith__dict_zPixelRect_p(dict_zPixelRect);
      
      return fObj_p.then((fObj__zPixelRect) => {

        //set zIndex
        fObj__zPixelRect.zIndex = this.zIndex;

        fObj__zPixelRect.__brush = this;
        
        fObj__zPixelRect.__dict_zPixelRect = dict_zPixelRect;

        return fObj__zPixelRect;

      });

    },

    



    _captureDrawingZPixelPath: function(pointer) {
      // logger.log("logZPixelRect", "_captureDrawingZPixelPath", "pointer:", pointer);

      const dict_zPixel = this.getDict_zPixel(pointer);
      // logger.log("logZPixelRect", "_captureDrawingZPixelPath", "dict_zPixel:", dict_zPixel);

      if(!this.dict_zPixel__start) {
        this.setDict_zPixel__start(dict_zPixel);
      }
      return this.setDict_zPixel__end(dict_zPixel);
    },

    // _drawZPixel: function(ctx, dict_zPixel) {
    //   const screenRect__zPixel = dict_zPixel.screenRect;
    //   ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
    // },

    _drawZPixelRect: function(ctx, dict_zPixelRect) {
      const screenRect__zPixelRect = dict_zPixelRect.screenRect;
      ctx.fillRect(screenRect__zPixelRect.x, screenRect__zPixelRect.y, screenRect__zPixelRect.width, screenRect__zPixelRect.height);
    },

    // _finalizeAndAddPath: async function () {
    _finalizeAndAddZPixelRect: async function () {
      return await this._finalizeAndAddZPixelRect_p();
    },

    _finalizeAndAddZPixelRect_p: async function () {
      // logger.log("logFD", "ZPixelRectBrush", "_finalizeAndAddZPixelRect", this);
      const brush = this;

      var ctx = this.canvas.contextContainer;
      // ctx.closePath();

      // var fObj__zPixelRect = this.createFZPixelRect(this.dict_zPixelRect);

      const fObj__zPixelRect = await this.createFZPixelRect_p(this.dict_zPixelRect);

      this.canvas.clearContext(ctx);
      // this.canvas.fire('before:zPixelRect:created', { zPixelRect: fObj__zPixelRect, brush: brush });
      this.canvas.add(fObj__zPixelRect);
      this.canvas.requestRenderAll();
      fObj__zPixelRect.setCoords();
      this._resetShadow();
      
      // fire event 'zPixelRect' created
      // this.canvas.fire('zPixelRect:created', { zPixelRect: fObj__zPixelRect, brush: brush });

      const dict__atomic = { zPixelRect: fObj__zPixelRect, brush: brush };
      return dict__atomic;
    },

    // }






    // zIndex: 0,

    zIndexWrapAround: function(ctx, dict_brushAndFunc) {
      const fabricCanvas = this.canvas;

      const brush           = dict_brushAndFunc.brush;
      const func_in_between = dict_brushAndFunc.func;
    
      fabricCanvas.clearContext(ctx);
      fabricCanvas._renderBackground(ctx);
      fabricCanvas.render_below_zIndex(ctx, brush.zIndex);
      brush._setBrushStyles(ctx);
      func_in_between(ctx, brush);
      fabricCanvas.render_above_zIndex(ctx, brush.zIndex);
    },



    onMouseDown: function (pointer, options) {
      const brush = this;

      const ctx = brush.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          // DecorationUtils.getWrappedObj(brush).onMouseDown(pointer, options);

          if (!brush.canvas._isMainEvent(options.e)) {
            return;
          }
          // brush.drawStraightLine = options.e[this.straightLineKey];
          
          brush._prepareForDrawing(pointer);
          
          // capture coordinates immediately
          // this allows to draw dots (when movement never occurs)
          brush._captureDrawingZPixelPath(pointer);
          brush._render();

        },
      });

      //bugfix: remove little dots on contextTop
      brush.canvas.clearContext(brush.canvas.contextTop);
    },

    onMouseMove: function (pointer, options) {

      //brush.canvas.contextTop has been replaced with brush.canvas.contextContainer
      
      function onMouseMove__old(brush, pointer, options) { 
        if (!brush.canvas._isMainEvent(options.e)) {
          return;
        }
        brush.drawStraightLine = options.e[brush.straightLineKey];
        if (brush.limitedToCanvasSize === true && brush._isOutSideCanvas(pointer)) {
            return;
        }
        // if (brush._captureDrawingPath(pointer) && brush._points.length > 1) {
        //   // clear bottom canvas
        //   brush.canvas.clearContext(brush.canvas.contextContainer); 
        //   brush._render();
        // }
        if (brush._captureDrawingZPixelPath(pointer) /*&& brush.arr_dict_zPixel.length > 1*/) {
          // clear bottom canvas
          brush.canvas.clearContext(brush.canvas.contextContainer); 
          brush._render();
        } 
        else {
          brush._render();
        }

      }

      //new routine
      const brush = this;
      const ctx = brush.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          onMouseMove__old(brush, pointer, options);
        },
      });

    },

    onMouseUp: function(options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return true;
      }
      // this.drawStraightLine = false;
      // this.oldEnd = undefined;
      this._finalizeAndAddZPixelRect();
      return false;
    },




    _prepareForDrawing: function (pointer) {
      const ctx = this.canvas.contextContainer;
      // logger.trace("logZPixelBrush", "_prepareForDrawing", "pointer:", pointer);   //SHU: warning: pointer is broken

      this._reset();
    },




    _reset: function() {
      const brush = this;

      function func_reset(ctx, brush) {

        brush.__dict_zPixel__start = null;
        brush.__dict_zPixel__end   = null;
        brush.dict_zPixelRect      = null;

        brush._setBrushStyles(ctx);
        brush._setShadow();
        brush._hasStraightLine = false;
      }

      const ctx = this.canvas.contextContainer;
      brush.clearPreview();
      func_reset(ctx, this);
    },

    
    _render: function (ctx_ignored) {
      const brush = this;
      const ctx = this.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          // DecorationUtils.getWrappedObj(brush)._render(ctx);

          brush._saveAndTransform(ctx);

          if(brush.dict_zPixelRect != null) {
            brush._drawZPixelRect(ctx, brush.dict_zPixelRect);
          }

          ctx.restore();

        },
      });
    },

  }) {}

  ZPixelRectBrush.createInstance = function(fabricCanvas) {
    const brush__pencil = new fabric.PencilBrush(fabricCanvas);
    const brush__zPixel = ZPixelRectBrush.decorate(brush__pencil);
    return brush__zPixel;
  };

  fabric.ZPixelRectBrush = ZPixelRectBrush;

})();