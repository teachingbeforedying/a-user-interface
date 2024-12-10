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
  
  class ZPixelBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {

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

    onMouseMove__preview: function(pointer, options) {
      // logger.log("logPreview", "onMouseMove__preview", this, pointer, options);
      var p = new fabric.Point(pointer.x, pointer.y);
  
      // const ctx = this.canvas.contextContainer;
      const ctx = this.canvas.contextTop;
  
      if(this.parentBrush == null) {
        this.canvas.clearContext(ctx);
      }
  
      // ctx.save();
  
      this._setBrushStyles__preview(ctx);

      const fRect__zPixel = this.fabricIntegration.getZPixelFRect(pointer);
      logger.log("logZPixelFD", "onMouseMove__preview", "fRect__zPixel:", fRect__zPixel);
      
      // ctx.beginPath();
      // ctx.moveTo(p.x, p.y);
      // ctx.lineTo(p.x, p.y);
      // ctx.stroke();

      // ctx.beginPath();
      // ctx.strokeRect(fRect__zPixel.x, fRect__zPixel.y, fRect__zPixel.width, fRect__zPixel.height);

      ctx.fillStyle = "green";
      ctx.fillRect(fRect__zPixel.x, fRect__zPixel.y, fRect__zPixel.width, fRect__zPixel.height);
      // ctx.fillRect(fRect__zPixel.x, fRect__zPixel.y, 200, 200);


      // ctx.restore();
  
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


    // createPath: function(pathData) {
    //   const path = DecorationUtils.getWrappedObj(this).createPath(pathData);
      
    //   //set zIndex
    //   path.zIndex = this.zIndex;

    //   return path;
    // },

    createZPixel: function(pathData) {
      const path = DecorationUtils.getWrappedObj(this).createPath(pathData);
      
      //set zIndex
      path.zIndex = this.zIndex;

      return path;
    },

  }) {}

  ZPixelBrush.createInstance = function(fabricCanvas) {
    const brush__pencil  = new fabric.PencilBrush(fabricCanvas);
    const brush__zPixel = ZPixelBrush.decorate(brush__pencil);
    return brush__zPixel;
  };

  fabric.ZPixelBrush = ZPixelBrush;

})();