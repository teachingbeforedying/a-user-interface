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

    zIndexWrapAround: function(dict_brushAndFunc) {
      const fabricCanvas = this.canvas;
      const ctx = fabricCanvas.contextContainer;

      const brush           = dict_brushAndFunc.brush;
      const func_in_between = dict_brushAndFunc.func;
    
      fabricCanvas.clearContext(ctx);
      fabricCanvas._renderBackground(ctx);
      fabricCanvas.render_below_zIndex(ctx, brush.zIndex);
      func_in_between(brush);
      fabricCanvas.render_above_zIndex(ctx, brush.zIndex);
    },

    onMouseDown: function (pointer, options) {
      const brush = this;
      brush.zIndexWrapAround({
        brush: brush,
        func: function(brush) {
          DecorationUtils.getWrappedObj(brush).onMouseDown(pointer, options);
        },
      });
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
      brush.zIndexWrapAround({
        brush: brush,
        func: function(brush) {
          onMouseMove__old(brush, pointer, options);
        },
      });

    },

    _prepareForDrawing: function (pointer) {
        const ctx = this.canvas.contextContainer;

        var p = new fabric.Point(pointer.x, pointer.y);
        this._reset();
        this._addPoint(p);
        ctx.moveTo(p.x, p.y);
    },


    _reset: function() {
      const ctx = this.canvas.contextContainer;

      this._points = [];
      this._setBrushStyles(ctx);
      this._setShadow();
      this._hasStraightLine = false;
    },

    
    _render: function (ctx_ignored) {
      const brush = this;
      const ctx = this.canvas.contextContainer;
      brush.zIndexWrapAround({
        brush: brush,
        func: function(brush) {
          DecorationUtils.getWrappedObj(brush)._render(ctx);
        },
      });
    },
    

    _finalizeAndAddPath: function () {
        logger.log("logFD", "ZPencilBrush", "_finalizeAndAddPath");
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
        this.canvas.fire('before:path:created', { path: path });
        this.canvas.add(path);
        this.canvas.requestRenderAll();
        path.setCoords();
        this._resetShadow();


        // fire event 'path' created
        this.canvas.fire('path:created', { path: path });
    },


    createPath: function(pathData) {
      const path = DecorationUtils.getWrappedObj(this).createPath(pathData);
      
      //set zIndex
      path.zIndex = this.zIndex;

      return path;
    },

  }) {}

  ZPencilBrush.createInstance = function(fabricCanvas) {
    const brush__pencil  = new fabric.PencilBrush(fabricCanvas);
    const brush__zPencil = ZPencilBrush.decorate(brush__pencil);
    return brush__zPencil;
  };

  fabric.ZPencilBrush = ZPencilBrush;

})();