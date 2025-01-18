function installFabricZPixelBrush(fabricCanvas) {
  logger.log("logFabric", "installFabricZPixelBrush");

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
  
  // class ZPixelBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {
  class ZPixelBrush extends DecorationUtils.createDecoratorClass(fabric.ZPencilBrush, {

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
      // logger.log("logZPixelBrush", "_setBrushStyles__preview", this);
      this._setBrushStyles(ctx);
        
      ctx.strokeStyle = "black";
      ctx.fillStyle   = this.getColor__preview();
    },

    onMouseMove__preview: function(pointer, options) {
      // logger.log("logZPixelBrush", "onMouseMove__preview", this, pointer, options);
      var p = new fabric.Point(pointer.x, pointer.y);
  
      // const ctx = this.canvas.contextContainer;
      const ctx = this.canvas.contextTop;
  
      if(this.parentBrush == null) {
        this.canvas.clearContext(ctx);
      }
  
      // ctx.save();
  
      this._setBrushStyles__preview(ctx);

      const dict_zPixel = this.getDict_zPixel(pointer);
      // logger.log("logZPixelFD", "onMouseMove__preview", "dict_zPixel:", dict_zPixel);

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




    // "zPixel engine"
    // {
    arr_dict_zPixel: [],
    
    getDict_zPixel: function(pointer) {
      // const dict_zPixel = this.fabricIntegration.createDict__zPixel__forZPixelBrushPointer(pointer);
      // const dict_zPixel = this.__drawingMode.createDict__zPixel__forZPixelBrushPointer(pointer);
      const dict_zPixel = this.drawingBout.createDict__zPixel__forZPixelBrushPointer(pointer);

      //add color prop
      if(!dict_zPixel.color) {
        dict_zPixel.color = this.color;
      }

      return dict_zPixel;
    },

    /*
     *  Same principle as for _addPoint,
     *  i.e. we have to check that incoming zPixel is different from last added zPixel
     */
    _addZPixel: function(dict_zPixel) {
      logger.log("logZPixelFD", "ZPixelBrush::_addZPixel");

      var outBool;

      if (this.arr_dict_zPixel.length > 0 && this.isSameZPixel(dict_zPixel, this.arr_dict_zPixel[this.arr_dict_zPixel.length - 1])) {
        outBool = false;
      } else {
        this.arr_dict_zPixel.push(dict_zPixel);
        outBool = true;
      }

      logger.log("logZPixelBrush", "_addZPixel", "dict_zPixel:", dict_zPixel, "this.arr_dict_zPixel:", this.arr_dict_zPixel, "outBool:", outBool);

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

    // createFZPixel: function(dict_zPixel) {
    //   // logger.log("logZPixelBrush", "createFZPixel", "dict_zPixel:", dict_zPixel);

    //   const fZPixel = new fabric.ZPixel({
    //     x:      dict_zPixel.screenRect.x,
    //     y:      dict_zPixel.screenRect.y,

    //     // width:  dict_zPixel.screenRect.width,
    //     // height: dict_zPixel.screenRect.height,
    //       //bugFix: homeScale must be applied at fObj's birth
    //     width:  1,
    //     height: 1,
    //     // scaleX: dict_zPixel.homeScale.X,
    //     // scaleY: dict_zPixel.homeScale.Y,

    //     // zLevel:  dict_zPixelRect.zPixelCoords.zLevel,
    //     // ix:      dict_zPixelRect.zPixelCoords.ix,
    //     // iy:      dict_zPixelRect.zPixelCoords.iy,

    //     // color:  dict_zPixel.color,

    //     //strokeWidth: 12, //this is enforced to 0 in fabric.ZPixel (otherwise, zPixels have a little shift)
    //     // borderScaleFactor: 0,

    //       //sharp rect
    //     rx: 0,
    //     ry: 0,

    //     fill: dict_zPixel.color,

    //     originX: 'left',
    //     originY: 'top',
        
    //   });
      
    //   //set zIndex
    //   fZPixel.zIndex = this.zIndex;

    //   fZPixel.__brush = this;
      
    //   fZPixel.__dict_zPixel = dict_zPixel;

    //   return fZPixel;
    // },

    createFZPixel_p: function(dict_zPixel) {
      // logger.log("logZPixelBrush", "createFZPixel", "dict_zPixel:", dict_zPixel);

      const fObj_p = this.fabricIntegration.createFabricZPixelWith__dict_zPixel_p(dict_zPixel);
      
      return fObj_p.then((fObj__zPixel) => {

        //set zIndex
        fObj__zPixel.zIndex = this.zIndex;

        fObj__zPixel.__brush = this;
        
        fObj__zPixel.__dict_zPixel = dict_zPixel;

        return fObj__zPixel;

      });
    },

    createFZPixelPath: function(arr_dict_zPixel) {
      const fZPixelPath = new fabric.ZPixelPath(arr_dict_zPixel, {
      
      });

      fZPixelPath.arr_dict_zPixel = arr_dict_zPixel;

      fZPixelPath.zIndex = this.zIndex;

      fZPixelPath.__brush = this;

      return fZPixelPath;
    },

    createFZPixelGroup_p: async function(arr_dict_zPixel) {
      logger.log("logZPixel", "createFZPixelGroup", arr_dict_zPixel);

      //la misère comme d'habitude avec les groupes

      //check if all have same zLevel
      const dict_zLevel = arr_dict_zPixel.reduce((acc, x) => {
        const zLevel = x.zPixelCoords.zLevel;
        if(acc[zLevel] == null) {
          acc[zLevel] = true;
        } 
        return acc;
      }, {});
      logger.log("logZPixel", "createFZPixelGroup", "dict_zLevel:", dict_zLevel);

      const isEmpty = (arr_dict_zPixel.length == 0);
      if(isEmpty) {
        throw new Error("arr_dict_zPixel.length == 0");
      }


      const isSameZLevel = (Object.keys(dict_zLevel).length == 1);
      if(!isSameZLevel) {
        logger.log("logZPixel", "createFZPixelGroup", "!isSameZLevel", "dict_zLevel:", dict_zLevel);
        throw new Error("logZPixel", "createFZPixelGroup", "!isSameZLevel", "dict_zLevel:", dict_zLevel);
      } else {
        logger.log("logZPixel", "createFZPixelGroup", "isSameZLevel", "dict_zLevel:", dict_zLevel);
      }


      // const arr_fZPixel_p = arr_dict_zPixel.map((dict_zPixel) => {
      //   return this.createFZPixel_p(dict_zPixel);
      // });

      var arr_fZPixel = [];
      for(var i=0 ; i<arr_dict_zPixel.length ; i++) {
        const dict_zPixel = arr_dict_zPixel[i];
        const fZPixel = await this.createFZPixel_p(dict_zPixel);
        arr_fZPixel.push(fZPixel); 
      };


      const arr_screenPointTL = arr_dict_zPixel.map((dict_zPixel) => {
        return {x: dict_zPixel.screenRect.x, y: dict_zPixel.screenRect.y};
      });
      const arr_screenPointBR = arr_screenPointTL.map((pointTL) => {
        return {x: pointTL.x + 1, y: pointTL.y + 1};
      });  

      const screenRect__enveloppe = Geometry.getEnveloppeRect([...arr_screenPointTL, ...arr_screenPointBR]);
      logger.log("logZPixel", "createFZPixelGroup", "screenRect__enveloppe:", screenRect__enveloppe);

      const arr_zPixelIPointTL = arr_dict_zPixel.map((dict_zPixel) => {
        return {x: dict_zPixel.zPixelCoords.ix, y: dict_zPixel.zPixelCoords.iy};
      });
      const arr_zPixelIPointBR = arr_zPixelIPointTL.map((zPixelIPointTL) => {
        return {x: zPixelIPointTL.x + 1, y: zPixelIPointTL.y + 1};
      });  

      const zPixelIRect__enveloppe = Geometry.getEnveloppeRect([...arr_zPixelIPointTL, ...arr_zPixelIPointBR]);
      logger.log("logZPixel", "createFZPixelGroup", "zPixelIRect__enveloppe:", zPixelIRect__enveloppe);

      const dict_zPixel = arr_dict_zPixel[0];

      const fObj_group_zPixel = new fabric.Group(arr_fZPixel, {
        x: screenRect__enveloppe.x,
        y: screenRect__enveloppe.y,

        width:  zPixelIRect__enveloppe.width,
        height: zPixelIRect__enveloppe.height,

        scaleX: dict_zPixel.homeScale.X,
        scaleY: dict_zPixel.homeScale.Y,

        originX: 'left',
        originY: 'top',
      });

      //reposition everything wrt top left corner, 
      //and reset scaleX and scaleY since group will now handle it 
      Utils.zip(arr_dict_zPixel, arr_fZPixel).forEach(([dict_zPixel, fZPixel]) => {
        fZPixel.set({
          left: dict_zPixel.zPixelCoords.ix - zPixelIRect__enveloppe.x - (fObj_group_zPixel.width  / 2.0),
          top:  dict_zPixel.zPixelCoords.iy - zPixelIRect__enveloppe.y - (fObj_group_zPixel.height / 2.0),
          
          scaleX: 1.0,
          scaleY: 1.0,
        });
        fZPixel.setCoords();
      });
      logger.log("logZPixel", "createFZPixelGroup", "fObj_group_zPixel:", Object.assign({}, fObj_group_zPixel));


      fObj_group_zPixel.arr_dict_zPixel = arr_dict_zPixel;

      fObj_group_zPixel.zIndex = this.zIndex;

      fObj_group_zPixel.__brush = this;

      return fObj_group_zPixel;

    },




    _captureDrawingZPixelPath: function(pointer) {
      const dict_zPixel = this.getDict_zPixel(pointer);

      return this._addZPixel(dict_zPixel);
    },

    _drawZPixel: function(ctx, dict_zPixel) {
      const screenRect__zPixel = dict_zPixel.screenRect;
      ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
    },

    // _finalizeAndAddZPixelPath: function () {
    //   // logger.log("logZPixelBrush", "ZPixelBrush", "_finalizeAndAddZPixelPath");
    //   const brush = this;

    //   if(this.arr_dict_zPixel.length == 0) {
    //     throw new Error("this.arr_dict_zPixel.length == 0");
    //   }

    //   var ctx = this.canvas.contextContainer;
    //   // ctx.closePath();

    //   // {
    //   //   var fObj_zPixelPath = this.createFZPixelPath(this.arr_dict_zPixel);
    //   //   this.canvas.clearContext(ctx);
    //   //   this.canvas.fire('before:zPixelPath:created', { zPixelPath: fObj_zPixelPath });
    //   //   this.canvas.add(fObj_zPixelPath);
    //   //   this.canvas.requestRenderAll();
    //   //   fObj_zPixelPath.setCoords();
    //   //   this._resetShadow();
        
    //   //   // fire event 'zPixelPath' created
    //   //   this.canvas.fire('zPixelPath:created', { zPixelPath: fObj_zPixelPath });
    //   // }

    //   // if(this.arr_dict_zPixel.length > 0)
    //   {
    //     this.createFZPixelGroup_p(this.arr_dict_zPixel).then((fObj_group_zPixel) => {

    //       // setTimeout(() => {

    //         this.canvas.clearContext(ctx);
    //         // this.canvas.fire('before:zPixelGroup:created', { zPixelGroup: fObj_group_zPixel, brush: brush, });
    //         this.canvas.add(fObj_group_zPixel);
    //         this.canvas.requestRenderAll();
    //         fObj_group_zPixel.setCoords();
    //         this._resetShadow();
            
    //         // fire event 'zPixelGroup' created
    //         // this.canvas.fire('zPixelGroup:created', { zPixelGroup: fObj_group_zPixel, brush: brush, });

    //       // }, 0);

    //     });
    //   }

    //   // {
    //   //   this.createFZPixel_p(this.arr_dict_zPixel[0]).then((fObj__zPixel) => {

    //   //     this.canvas.clearContext(ctx);
    //   //     this.canvas.fire('before:zPixel:created', { zPixel: fObj__zPixel });
    //   //     this.canvas.add(fObj__zPixel);
    //   //     this.canvas.requestRenderAll();
    //   //     fObj__zPixel.setCoords();
    //   //     this._resetShadow();
  
    //   //     // fire event 'zPixel' created
    //   //     this.canvas.fire('zPixel:created', { zPixel: fObj__zPixel });

    //   //   });
    //   // }

    //   // {
    //   //   this.arr_dict_zPixel.forEach((dict_zPixel) => {
    //   //     var fObj__zPixel = this.createFZPixel(dict_zPixel);
    //   //     this.canvas.clearContext(ctx);
    //   //     this.canvas.fire('before:zPixel:created', { zPixel: fObj__zPixel });
    //   //     this.canvas.add(fObj__zPixel);
    //   //     this.canvas.requestRenderAll();
    //   //     fObj__zPixel.setCoords();
    //   //     this._resetShadow();
    
    //   //     // fire event 'zPixel' created
    //   //     this.canvas.fire('zPixel:created', { zPixel: fObj__zPixel });
    //   //   });
    //   // }

    // },

    _finalizeAndAddZPixelPath_p: async function () {
      // logger.log("logZPixelBrush", "ZPixelBrush", "_finalizeAndAddZPixelPath_p");
      var out_p;

      if(this.arr_dict_zPixel.length == 0) {
        throw new Error("this.arr_dict_zPixel.length == 0");
      }

      const brush = this;

      var ctx = this.canvas.contextContainer;

      const fObj_group_zPixel = await this.createFZPixelGroup_p(this.arr_dict_zPixel);
      logger.log("logZPixelBrush", "ZPixelBrush::_finalizeAndAddZPixelPath_p", "fObj_group_zPixel:", fObj_group_zPixel);

      this.canvas.clearContext(ctx);
      // this.canvas.fire('before:zPixelGroup:created', { zPixelGroup: fObj_group_zPixel, brush: brush, });
      this.canvas.add(fObj_group_zPixel);
      this.canvas.requestRenderAll();
      fObj_group_zPixel.setCoords();
      this._resetShadow();
      
      // fire event 'zPixelGroup' created
      // this.canvas.fire('zPixelGroup:created', { zPixelGroup: fObj_group_zPixel, brush: brush, });

      const dict__atomic = { zPixelGroup: fObj_group_zPixel, brush: brush, };
      return dict__atomic;
    },





    // zIndex: 0,

    // zIndexWrapAround: function(ctx, dict_brushAndFunc) {
    //   const fabricCanvas = this.canvas;

    //   const brush           = dict_brushAndFunc.brush;
    //   const func_in_between = dict_brushAndFunc.func;
    
    //   fabricCanvas.clearContext(ctx);
    //   fabricCanvas._renderBackground(ctx);
    //   fabricCanvas.render_below_zIndex(ctx, brush.zIndex);
    //   brush._setBrushStyles(ctx);
    //   func_in_between(ctx, brush);
    //   fabricCanvas.render_above_zIndex(ctx, brush.zIndex);
    // },

    _setBrushStyles: function (ctx) {
      // logger.log("logZPixelBrush", "_setBrushStyles", "ctx:", ctx, "this:", this);
      ctx.fillStyle = this.color;
    },

    // onMouseDown: function (pointer, options) {
    //   const brush = this;

    //   const ctx = brush.canvas.contextContainer;
    //   brush.zIndexWrapAround(ctx, {
    //     brush: brush,
    //     func: function(ctx, brush) {
    //       // DecorationUtils.getWrappedObj(brush).onMouseDown(pointer, options);

    //       if (!brush.canvas._isMainEvent(options.e)) {
    //         return;
    //       }
    //       // brush.drawStraightLine = options.e[this.straightLineKey];
          
    //       brush._prepareForDrawing(pointer);
          
    //       // capture coordinates immediately
    //       // this allows to draw dots (when movement never occurs)
    //       brush._captureDrawingZPixelPath(pointer);
    //       brush._render();

    //     },
    //   });

    //   //bugfix: remove little dots on contextTop
    //   brush.canvas.clearContext(brush.canvas.contextTop);
    // },

    // onMouseMove: function (pointer, options) {

    //   //brush.canvas.contextTop has been replaced with brush.canvas.contextContainer
      
    //   function onMouseMove__old(brush, pointer, options) { 
    //     if (!brush.canvas._isMainEvent(options.e)) {
    //       return;
    //     }
    //     brush.drawStraightLine = options.e[brush.straightLineKey];
    //     if (brush.limitedToCanvasSize === true && brush._isOutSideCanvas(pointer)) {
    //         return;
    //     }
    //     // if (brush._captureDrawingPath(pointer) && brush._points.length > 1) {
    //     //   // clear bottom canvas
    //     //   brush.canvas.clearContext(brush.canvas.contextContainer); 
    //     //   brush._render();
    //     // }
    //     if (brush._captureDrawingZPixelPath(pointer) && brush.arr_dict_zPixel.length > 1) {
    //       // clear bottom canvas
    //       brush.canvas.clearContext(brush.canvas.contextContainer); 
    //       brush._render();
    //     }
    //     else {
    //       brush._render();
    //     }
        
    //   }

    //   //new routine
    //   const brush = this;
    //   const ctx = brush.canvas.contextContainer;
    //   brush.zIndexWrapAround(ctx, {
    //     brush: brush,
    //     func: function(ctx, brush) {
    //       onMouseMove__old(brush, pointer, options);
    //     },
    //   });

    // },

    // onMouseUp: function(options) {
    //   if (!this.canvas._isMainEvent(options.e)) {
    //     return true;
    //   }
    //   // this.drawStraightLine = false;
    //   // this.oldEnd = undefined;

    //   // this._finalizeAndAddZPixelPath();
    //   return false;
    // },




    // _prepareForDrawing: function (pointer) {
    //   const ctx = this.canvas.contextContainer;
    //   // logger.trace("logZPixelBrush", "_prepareForDrawing", "pointer:", pointer);   //SHU: warning: pointer is broken

    //   // this._reset();

    //   var p = new fabric.Point(pointer.x, pointer.y);
    //   this._reset();
    //   this._addPoint(p);
    // },


    _captureDrawingPath: function(pointer) {
      const result__wrapped = DecorationUtils.getWrappedObj(this)._captureDrawingPath(pointer);

      return this._captureDrawingZPixelPath(pointer);
    },

    _finalizeAndAddPath: async function () {
      return await this._finalizeAndAddZPixelPath_p();
    },



    _reset: function() {
      const brush = this;
      
      function func_reset(ctx, brush) {
        brush._points = [];
        brush._setBrushStyles(ctx);
        brush._setShadow();
        brush._hasStraightLine = false;

        brush.arr_dict_zPixel = [];
      }

      const ctx = this.canvas.contextContainer;
      brush.clearPreview();
      func_reset(ctx, this);
    },

    
    _render: function (ctx_ignored) {
      logger.log("logZPixelFD", "ZPixelBrush::_render");
      
      const brush = this;
      const ctx = this.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          // DecorationUtils.getWrappedObj(brush)._render(ctx);

          brush._saveAndTransform(ctx);

          // logger.log("logZPixelBrush", "_render", "brush.arr_dict_zPixel:", brush.arr_dict_zPixel);
          
          brush.arr_dict_zPixel.forEach((dict_zPixel) => {
            brush._drawZPixel(ctx, dict_zPixel);
          });

          ctx.restore();

        },
      });
    },

    // _render: function(ctx) {
    //   var i, len,
    //       p1 = this._points[0],
    //       p2 = this._points[1];
    //   ctx = ctx || this.canvas.contextTop;
    //   this._saveAndTransform(ctx);
    //   ctx.beginPath();
    //   //if we only have 2 points in the path and they are the same
    //   //it means that the user only clicked the canvas without moving the mouse
    //   //then we should be drawing a dot. A path isn't drawn between two identical dots
    //   //that's why we set them apart a bit
    //   if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
    //     var width = this.width / 1000;
    //     p1 = new fabric.Point(p1.x, p1.y);
    //     p2 = new fabric.Point(p2.x, p2.y);
    //     p1.x -= width;
    //     p2.x += width;
    //   }
    //   ctx.moveTo(p1.x, p1.y);

    //   for (i = 1, len = this._points.length; i < len; i++) {
    //     // we pick the point between pi + 1 & pi + 2 as the
    //     // end point and p1 as our control point.
    //     this._drawSegment(ctx, p1, p2);
    //     p1 = this._points[i];
    //     p2 = this._points[i + 1];
    //   }
    //   // Draw last line as a straight line while
    //   // we wait for the next point to be able to calculate
    //   // the bezier control point
    //   ctx.lineTo(p1.x, p1.y);
    //   ctx.stroke();
    //   ctx.restore();
    // },
    

    // _finalizeAndAddPath: function () {
    //   logger.log("logFD", "ZPencilBrush", "_finalizeAndAddPath");
    //   var ctx = this.canvas.contextContainer;
    //   ctx.closePath();
    //   if (this.decimate) {
    //       this._points = this.decimatePoints(this._points, this.decimate);
    //   }
    //   var pathData = this.convertPointsToSVGPath(this._points);
    //   if (this._isEmptySVGPath(pathData)) {
    //       // do not create 0 width/height paths, as they are
    //       // rendered inconsistently across browsers
    //       // Firefox 4, for example, renders a dot,
    //       // whereas Chrome 10 renders nothing
    //       this.canvas.requestRenderAll();
    //       return;
    //   }

    //   var path = this.createPath(pathData);
    //   this.canvas.clearContext(ctx);
    //   this.canvas.fire('before:path:created', { path: path });
    //   this.canvas.add(path);
    //   this.canvas.requestRenderAll();
    //   path.setCoords();
    //   this._resetShadow();


    //   // fire event 'path' created
    //   this.canvas.fire('path:created', { path: path });
    // },







    //debug

    // _addPoint: function(point) {
    //   logger.log("logZPixelFD", "ZPixelBrush::_addPoint");
    //   return DecorationUtils.getWrappedObj(this)._addPoint(point);
    // },

  }) {}

  ZPixelBrush.createInstance = function(fabricCanvas) {
    // const brush__pencil = new fabric.PencilBrush(fabricCanvas);
    // const brush__zPixel = ZPixelBrush.decorate(brush__pencil);
    const brush__zPencil = fabric.ZPencilBrush.createInstance(fabricCanvas);
    const brush__zPixel = ZPixelBrush.decorate(brush__zPencil);
    return brush__zPixel;
  };

  fabric.ZPixelBrush = ZPixelBrush;

})();