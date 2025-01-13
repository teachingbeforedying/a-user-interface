function installFabricZIndexUpgrade(fabricCanvas) {
  // logger.log("logFabric", "fabricZIndexUpgrade");

  fabricCanvas.render_below_zIndex = (function(ctx, zIndex) {
    // logger.trace("logFDZ", "fabricCanvas.render_below_zIndex", ctx, zIndex);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(0,zIndex).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_above_zIndex = (function(ctx, zIndex) {
    // logger.trace("logFDZ", "fabricCanvas.render_above_zIndex", ctx, zIndex);

    const arr_fObj = this._objects;
    
    arr_fObj.slice(zIndex).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_between_zIndexes = (function(ctx, zIndex1, zIndex2) {
    // logger.trace("logFDZ", "fabricCanvas.render_between_zIndexes", ctx, zIndex1, zIndex2);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(zIndex1,zIndex2).forEach((fObj) => {
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


      // const infiniteCanvas            = brush.fabricIntegration.infiniteCanvas;
      // const homeScale__atDrawingStart = infiniteCanvas.scale;
      // logger.log("logZIndexBrush", "homeScale__atDrawingStart:", homeScale__atDrawingStart);
      // if(brush.__homeScale__atDrawingStart != null) {
      //   throw new Error("brush.__homeScale__atDrawingStart != null");
      // } else {
      //   brush.__homeScale__atDrawingStart = Object.assign({}, homeScale__atDrawingStart);
      // }

      // const truePoint__cursor__atDrawingStart = infiniteCanvas.getTrueCursor();
      // if(brush.__truePoint__cursor__atDrawingStart != null) {
      //   throw new Error("brush.__truePoint__cursor__atDrawingStart != null");
      // } else {
      //   brush.__truePoint__cursor__atDrawingStart = Object.assign({}, truePoint__cursor__atDrawingStart);
      // }




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
            // if (brush.needsFullRender()) {
                // redraw curve
                // clear bottom canvas
                brush.canvas.clearContext(brush.canvas.contextContainer); 
                brush._render();
            // }
            // else {
            //     var points = brush._points, length = points.length, ctx = brush.canvas.contextContainer;
            //     // draw the curve update
            //     brush._saveAndTransform(ctx);
            //     if (brush.oldEnd) {
            //         ctx.beginPath();
            //         ctx.moveTo(brush.oldEnd.x, brush.oldEnd.y);
            //     }
            //     brush.oldEnd = brush._drawSegment(ctx, points[length - 2], points[length - 1], true);
            //     ctx.stroke();
            //     ctx.restore();
            // }
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

    _prepareForDrawing: function (pointer) {
      logger.log("logZPencilBrush", "_prepareForDrawing", pointer);
      const ctx = this.canvas.contextContainer;

      var p = new fabric.Point(pointer.x, pointer.y);
      this._reset();
      this._addPoint(p);
      ctx.moveTo(p.x, p.y);

      // this.storeLastPoint();
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
      const brush = this;
      const ctx = this.canvas.contextContainer;
      brush.zIndexWrapAround(ctx, {
        brush: brush,
        func: function(ctx, brush) {
          DecorationUtils.getWrappedObj(brush)._render(ctx);
        },
      });
    },
    

    _finalizeAndAddPath: function () {
        // logger.log("logFD", "ZPencilBrush", "_finalizeAndAddPath");
        const brush = this;

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
        this.canvas.fire('before:path:created', { path: path, brush: brush, });
        this.canvas.add(path);
        this.canvas.requestRenderAll();
        path.setCoords();
        this._resetShadow();


        // fire event 'path' created
        this.canvas.fire('path:created', { path:  path, brush: brush, });
    },

    _finalizeAndAddPath_p: function () {
      logger.log("logFD", "ZPencilBrush", "_finalizeAndAddPath_p");
      const brush = this;

      if(brush._points.length == 0) {
        const error = new Error("ZPencilBrush " + " _finalizeAndAddPath_p " + " brush._points.length == 0");
        return Promise.reject(error);
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
      return Promise.resolve(dict__atomic);
    },


    createPath: function(pathData) {
      const brush = this;

      const path = DecorationUtils.getWrappedObj(this).createPath(pathData);

      //set brush
      path.__brush = brush;
      
      //set zIndex
      path.zIndex = this.zIndex;

      // //set homeScale
      // const homeScale = Object.assign({}, brush.__homeScale__atDrawingStart);
      // logger.trace("logZIndexBrush", "homeScale:", homeScale);

      // path.__homeScale = homeScale;
      // brush.__homeScale__atDrawingStart = null;

      // //set truePoint
      // const truePoint = Object.assign({}, brush.__truePoint__cursor__atDrawingStart);
      // logger.trace("logZIndexBrush", "truePoint:", truePoint);

      // path.__truePoint = truePoint;
      // brush.__truePoint__cursor__atDrawingStart = null;

      return path;
    },



    _addPoint(point) {
      const result = DecorationUtils.getWrappedObj(this)._addPoint(point);
      if(result) {
        this.storeLatestPoint(point);
      }
      return result;
    },

    storeLatestPoint(point) {
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