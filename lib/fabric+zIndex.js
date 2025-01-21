function installFabricZIndexUpgrade(fabricCanvas) {
  // logger.log("logFabric", "fabricZIndexUpgrade");

  fabricCanvas.render_below_zIndex = (function(ctx, zIndex__fabric) {
    // logger.trace("logFDZ", "fabricCanvas.render_below_zIndex", ctx, zIndex__fabric);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(0,zIndex__fabric).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_above_zIndex = (function(ctx, zIndex__fabric) {
    // logger.trace("logFDZ", "fabricCanvas.render_above_zIndex", ctx, zIndex__fabric);

    const arr_fObj = this._objects;
    
    arr_fObj.slice(zIndex__fabric).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_between_zIndexes = (function(ctx, zIndex__fabric__1, zIndex__fabric__2) {
    // logger.trace("logFDZ", "fabricCanvas.render_between_zIndexes", ctx, zIndex__fabric__1, zIndex__fabric__2);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(zIndex__fabric__1,zIndex__fabric__2).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

}

(function () {
  
  class ZPencilBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {

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
          DecorationUtils.getWrappedObj(brush).onMouseDown(pointer, options);
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
        if (brush._captureDrawingPath(pointer) && brush._points.length > 1) {
            if (brush.needsFullRender()) {
                //redraw curve
                //clear bottom canvas
                brush.canvas.clearContext(brush.canvas.contextContainer); 
                brush._render();
            }
            else {
                var points = brush._points, length = points.length, ctx = brush.canvas.contextContainer;
                // draw the curve update
                brush._saveAndTransform(ctx);
                if (brush.oldEnd) {
                    ctx.beginPath();
                    ctx.moveTo(brush.oldEnd.x, brush.oldEnd.y);
                }
                brush.oldEnd = brush._drawSegment(ctx, points[length - 2], points[length - 1], true);
                ctx.stroke();
                ctx.restore();
            }
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

    needsFullRender: function() {
      return true;
    },

    //same as fabric.PencilBrush but with a different ctx
    _prepareForDrawing: function (pointer) {
      logger.log("logZPencilBrush", "_prepareForDrawing", pointer);
      const ctx = this.canvas.contextContainer;

      var p = new fabric.Point(pointer.x, pointer.y);
      this._reset();
      this._addPoint(p);
      ctx.moveTo(p.x, p.y);
    },


    _reset: function() {
      function func_reset(ctx, brush) {
        brush._points = [];
        brush._setBrushStyles(ctx);
        brush._setShadow();
        brush._hasStraightLine = false;
      }

      const ctx = this.canvas.contextContainer;
      func_reset(ctx, this);
    },

    
    _render: function (ctx_ignored) {
      logger.log("logFD", "ZPencilBrush::_render");
      
      const brush = this;
      const ctx = this.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          brush._saveAndTransform(ctx);
          DecorationUtils.getWrappedObj(brush)._render(ctx);
          ctx.restore();
        },
      });
    },
    

    _finalizeAndAddPath: function () {
      logger.trace("logFD", "ZPencilBrush", "_finalizeAndAddPath");
      const brush = this;

      if(brush.drawingBout != null) {
        logger.log("logComb", "Brush__DrawingBout__raw__freeDrawing::_finalizeAndAddPath:", "(", brush.drawingBout.session.id, ",", brush.drawingBout.id,")");
      }

      var ctx = this.canvas.contextContainer;
      ctx.closePath();
      if (this.decimate) {
          this._points = this.decimatePoints(this._points, this.decimate);
      }

      var pathData = this.convertPointsToSVGPath(this._points);
      if (this._isEmptySVGPath(pathData)) {
          // do not create 0 width/height paths, as they are
          // rendered inconsistently across browsers
          // Firefox 4, for example, renders a dot,
          // whereas Chrome 10 renders nothing
          this.canvas.requestRenderAll();
          return;
      }

      var path = this.createPath(pathData);
      this.canvas.clearContext(ctx);
      // this.canvas.fire('before:path:created', { path: path, brush: brush, });
      this.canvas.add(path);
      this.canvas.requestRenderAll();
      path.setCoords();
      this._resetShadow();

      // fire event 'path' created
      // this.canvas.fire('path:created', { path:  path, brush: brush, });

      const dict__atomic = { path: path, brush: brush, };
      return dict__atomic;
    },







    _addPoint: function(point) {
      logger.log("logFD", "ZPencilBrush::_addPoint");

      const result = DecorationUtils.getWrappedObj(this)._addPoint(point);
      if(result) {
        this.storeLatestPoint(point);
      }
      return result;
    },

    storeLatestPoint: function(point) {
      logger.log("logFD", "ZPencilBrush::storeLatestPoint");
      this.__point__latest = point; 
    },




  }) {}

  ZPencilBrush.createInstance = function(fabricCanvas) {
    const brush__pencil  = new fabric.PencilBrush(fabricCanvas);
    const brush__zPencil = ZPencilBrush.decorate(brush__pencil);
    return brush__zPencil;
  };

  fabric.ZPencilBrush = ZPencilBrush;

})();