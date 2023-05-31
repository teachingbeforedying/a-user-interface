function installFabricCombUpgrade(fabricCanvas) {
  // logger.log("logFabric", "fabricCombUpgrade");

  // fabricCanvas.zIndexWrapAround = (function(zIndex, func_in_between) {
  //   const ctx = this.contextContainer;
    
  //   this.clearContext(ctx);
  //   this._renderBackground(ctx);
  //   this.render_below_zIndex(ctx, zIndex);
  //   func_in_between();
  //   this.render_above_zIndex(ctx, zIndex);

  // }).bind(fabricCanvas);

  // fabricCanvas.render_below_zIndex = (function(ctx, zIndex) {
  //   // logger.log("logFabric", "fabricCanvas.render_below_zIndex", ctx, zIndex);
    
  //   const arr_fObj = this._objects;

  //   arr_fObj.slice(0,zIndex).forEach((fObj) => {
  //     fObj.render(ctx);
  //   });

  // }).bind(fabricCanvas);

  // fabricCanvas.render_above_zIndex = (function(ctx, zIndex) {
  //   // logger.log("logFabric", "fabricCanvas.render_above_zIndex", ctx, zIndex);

  //   const arr_fObj = this._objects;
    
  //   arr_fObj.slice(zIndex).forEach((fObj) => {
  //     fObj.render(ctx);
  //   });

  // }).bind(fabricCanvas);

}

(function () {
  /**
   * OffsettedBrush class (decorator)
   * @class fabric.OffsettedBrush
   * @extends fabric.BaseBrush
   * 
   */
  fabric.OffsettedBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.OffsettedBrush.prototype */ {

      /**
      * Contains the raw brush
      * @type fabric.BaseBrush
      * @private
      */
      brush_raw: null,

      /**
      * Contains the offset of the brush wrt pointer
      * @type dict
      * @private
      */
      offset_wrt_pointer: {
        dx: 0,
        dy: 0
      },

      createOffsettedPointer: function(pointer) {
        const pointer__clone = Object.assign({}, pointer);
        pointer__clone.x = pointer__clone.x + this.offset_wrt_pointer.dx;
        pointer__clone.y = pointer__clone.y + this.offset_wrt_pointer.dy;
        return pointer__clone;
      },



      /**
      * Constructor
      * @param {fabric.BaseBrush} brush to decorate
      * @return {fabric.BaseBrush} decorated brush
      */
      initialize: function(brush_raw, offset_wrt_pointer__in = null) {
        this.callSuper("initialize", brush_raw.canvas);
        
        this.brush_raw = brush_raw;

        if(offset_wrt_pointer__in != null) {
          this.offset_wrt_pointer = offset_wrt_pointer__in;
        }

        logger.log("logComb", "OffsettedBrush::initialize", this);
        
        const offsetted_brush = this;
        const arr_funcName__forwarded = [
          "_drawSegment",
          // "onMouseDown",
          // "onMouseMove",
          "onMouseUp",
          // "_prepareForDrawing",
          "_addPoint",
          "_reset",
          // "_captureDrawingPath",
          "_render",
          "convertPointsToSVGPath",
          "_isEmptySVGPath",
          "createPath",
          "decimatePoints",
          "_finalizeAndAddPath",
        ];
        arr_funcName__forwarded.forEach((funcName) => {
          function func_decorated(...args) {
            (offsetted_brush.brush_raw[funcName])(...args);
          };
          offsetted_brush[funcName] = func_decorated;
        });
      },

      onMouseDown: function(pointer, options) {
        const pointer__offsetted = this.createOffsettedPointer(pointer);
        this.brush_raw.onMouseDown(pointer__offsetted, options);
      },

      onMouseMove: function(pointer, options) {
        const pointer__offsetted = this.createOffsettedPointer(pointer);
        this.brush_raw.onMouseMove(pointer__offsetted, options);
      },

      _prepareForDrawing: function(pointer) {
        const pointer__offsetted = this.createOffsettedPointer(pointer);
        this.brush_raw._prepareForDrawing(pointer__offsetted);
      },

      _captureDrawingPath: function(pointer) {
        const pointer__offsetted = this.createOffsettedPointer(pointer);
        this.brush_raw._captureDrawingPath(pointer__offsetted);
      },

  });

})();

(function () {
  /**
   * CombPencilBrush class
   * @class fabric.CombPencilBrush
   * @extends fabric.CombPencilBrush
   */
  fabric.CombPencilBrush = fabric.util.createClass(fabric.PencilBrush, /** @lends fabric.CombPencilBrush.prototype */ {

      /**
      * Contains the array of decorated freeDrawing brushes which the drawing task is forwarded to
      * @type array
      * @private
      */
      arr_brush: [],

      /**
      * Contains the spacing between the different child brushes
      * @type number
      * @private
      */
      spacing: 0,

      /**
      * Constructor
      * @param {fabric.Canvas} canvas
      * @return {fabric.PencilBrush} Instance of a pencil brush
      */
      initialize: function(canvas, arr_brush_raw = []) {
        this.callSuper("initialize", canvas);
        this.arr_brush = arr_brush_raw.map((brush_raw) => {
          var offsettedBrush;
          if(brush_raw instanceof fabric.OffsettedBrush) {
            //already decorated
            offsettedBrush = brush_raw; 
          } else {
            //decorate
            offsettedBrush = new fabric.OffsettedBrush(brush_raw);
          }
          return offsettedBrush;
        });

        logger.log("logComb", "CombPencilBrush::initialize", this);
        
        //batch decoration
        const combBrush = this;

        const arr_funcName__forwarded = [
          "_drawSegment",
          "onMouseDown",
          "onMouseMove",
          "onMouseUp",
          "_prepareForDrawing",
          "_addPoint",
          "_reset",
          "_captureDrawingPath",
          "_render",
          "convertPointsToSVGPath",
          "_isEmptySVGPath",
          "createPath",
          "decimatePoints",
          "_finalizeAndAddPath",
        ];
        arr_funcName__forwarded.forEach((funcName) => {
          // const func_old = this[funcName];
          function func_decorated(...args) {
            combBrush.arr_brush.forEach((brush, i) => {
              (brush[funcName])(...args);
            });
          };
          combBrush[funcName] = func_decorated;
        });
      },

  });




})();