function installFabricZIndexUpgrade(fabricCanvas) {
  // logger.log("logFabric", "fabricZIndexUpgrade");

  fabricCanvas.zIndexWrapAround = (function(zIndex, func_in_between) {
    const ctx = this.contextContainer;
    
    this.clearContext(ctx);
    this._renderBackground(ctx);
    this.render_below_zIndex(ctx, zIndex);
    func_in_between();
    this.render_above_zIndex(ctx, zIndex);

  }).bind(fabricCanvas);

  fabricCanvas.render_below_zIndex = (function(ctx, zIndex) {
    // logger.log("logFabric", "fabricCanvas.render_below_zIndex", ctx, zIndex);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(0,zIndex).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_above_zIndex = (function(ctx, zIndex) {
    // logger.log("logFabric", "fabricCanvas.render_above_zIndex", ctx, zIndex);

    const arr_fObj = this._objects;
    
    arr_fObj.slice(zIndex).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

}

(function () {
  /**
   * ZPencilBrush class
   * @class fabric.ZPencilBrush
   * @extends fabric.PencilBrush
   * 
   * 1. replaced ctx = contextTop with ctx = contextContainer  (contextContainer is "contextBottom")
   * 2. replaced drawing routine with:
   *      1. ctx.render objects under brush
   *      2. render brush
   *      3. ctx.render objects above brush
   */
  fabric.ZPencilBrush = fabric.util.createClass(fabric.PencilBrush, /** @lends fabric.ZPencilBrush.prototype */ {

      /**
      * Invoked inside on mouse down and mouse move
      * @param {Object} pointer
      */
      _drawSegment: function (ctx, p1, p2) {
          var midPoint = p1.midPointFrom(p2);
          ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          return midPoint;
      },

      /**
       * Invoked on mouse down
       * @param {Object} pointer
       */
      onMouseDown: function (pointer, options) {
        const brush = this;
        brush.canvas.zIndexWrapAround(brush.zIndex, () => {
          brush.callSuper('onMouseDown', pointer, options);
        });
      },

      /**
       * Invoked on mouse move
       * @param {Object} pointer
       */
      onMouseMove: function (pointer, options) {

        //this.canvas.contextTop has been replaced with this.canvas.contextContainer
        function onMouseMove__old(pointer, options) { 
          if (!this.canvas._isMainEvent(options.e)) {
            return;
          }
          this.drawStraightLine = options.e[this.straightLineKey];
          if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
              return;
          }
          if (this._captureDrawingPath(pointer) && this._points.length > 1) {
              // if (this.needsFullRender()) {
                  // redraw curve
                  // clear bottom canvas
                  this.canvas.clearContext(this.canvas.contextContainer); 
                  this._render();
              // }
              // else {
              //     var points = this._points, length = points.length, ctx = this.canvas.contextContainer;
              //     // draw the curve update
              //     this._saveAndTransform(ctx);
              //     if (this.oldEnd) {
              //         ctx.beginPath();
              //         ctx.moveTo(this.oldEnd.x, this.oldEnd.y);
              //     }
              //     this.oldEnd = this._drawSegment(ctx, points[length - 2], points[length - 1], true);
              //     ctx.stroke();
              //     ctx.restore();
              // }
          }
        }

        //new routine
        const brush = this;
        brush.canvas.zIndexWrapAround(brush.zIndex, () => {
          (onMouseMove__old.bind(brush))(pointer, options);
        });

      },


      /**
       * @private
       * @param {Object} pointer Actual mouse position related to the canvas.
       */
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

      

      /**
       * Draw a smooth path on the topCanvas using quadraticCurveTo
       * @private
       * @param {CanvasRenderingContext2D} [ctx_ignored]
       */
      _render: function (ctx_ignored) {
        const brush = this;
        brush.canvas.zIndexWrapAround(brush.zIndex, () => {
          const ctx = this.canvas.contextContainer;
          brush.callSuper('_render', ctx);
        });
      },
      

      /**
       * On mouseup after drawing the path on contextContainer canvas
       * we use the points captured to create an new fabric path object
       * and add it to the fabric canvas.
       */
      _finalizeAndAddPath: function () {
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
        const path = this.callSuper('createPath', pathData);
        
        //set zIndex
        path.zIndex = this.zIndex;

        return path;
      },
  });
})();