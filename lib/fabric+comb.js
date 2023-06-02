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

// (function () {
//   /**
//    * OrientedBrushMixin class
//    * @class fabric.OrientedBrush
//    * @extends Object
//    * 
//    */
//   fabric.OrientedBrushMixin = fabric.util.createClass(Object, /** @lends fabric.OrientedBrushMixin.prototype */ {

//       /**
//       * Contains the previous pointer
//       * @type Object
//       * @private
//       */
//       pointer__prev: null,

//       /**
//       * Contains the orientation vector
//       * @type fabric.BaseBrush
//       * @private
//       */
//       v: {
//         dx: 0,
//         dy: 0
//       },

//       getVector__orientation: function() {
//         return this.v;
//       },


//       onMouseDown: function(pointer, options) {
//         this.pointer__prev = Object.assign({}, pointer);

//         this.brush_raw.onMouseDown(pointer, options);
//       },

//       onMouseMove: function(pointer, options) {
//         this.v = {
//           dx: pointer.x - this.pointer__prev.x,
//           dy: pointer.y - this.pointer__prev.y,
//         };
//         this.pointer__prev = Object.assign({}, pointer);
//         logger.log("logComb", "this.getVector__orientation()", this.getVector__orientation());

//         this.brush_raw.onMouseMove(pointer, options);
//       },

//       // _prepareForDrawing: function(pointer) {
//       //   var p = new fabric.Point(pointer.x, pointer.y);
  
//       //   this._reset();
//       //   this._addPoint(p);
//       //   this.canvas.contextTop.moveTo(p.x, p.y);
//       // },

//       // drawArrow: function(pointA, pointB) {

//       // },

//   });

// })();


(function () {
  /**
   * CombPencilBrush class
   * @class fabric.CombPencilBrush
   * @extends fabric.PencilBrush
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
      spacing: 100,

      /**
      * Contains the circular buffer of pointers
      * @type Object
      * @private
      */
      cbuf_pointer:     new CircularBuffer(2),

      /**
      * Contains the circular buffer of velocity vectors
      * @type Object
      * @private
      */
      cbuf_v:           new CircularBuffer(2),

      /**
      * Contains the circular buffer of orientation angles
      * @type Object
      * @private
      */
      cbuf_orientation: new CircularBuffer(2),


      setSpacing: function(spacing__new_in) {
        logger.log("logComb", "setSpacing:", spacing__new_in);
        var spacing__new; 
        if(spacing__new_in < 0) {
          spacing__new = 0;
        } else {
          spacing__new = spacing__new_in;
        }
        this.spacing = spacing__new;
        this.updateOffsets_to_spacing(spacing__new);     
      },

      updateOffsets_to_spacing: function(spacing) {
        logger.log("logComb", "updateOffsets_to_spacing:", spacing);

        this.arr_brush.forEach((brush, i) => {
          const [dx, dy] = [brush.offset_wrt_pointer.dx, brush.offset_wrt_pointer.dy]; 
          const norm = math.norm([dx,dy]);
          const offset_wrt_pointer__new = {
            dx: dx / norm * spacing,
            dy: dy / norm * spacing,
          };
          logger.log("logComb", "offset_wrt_pointer__new:", offset_wrt_pointer__new);
          brush.offset_wrt_pointer = offset_wrt_pointer__new; 
        });
         
      },

      updateOffsets_to_current_orientation: function() {
      // updateOffsets_to_orientation(orientation): function() {

        const orientation__1 = this.cbuf_orientation.peek(1);
        const orientation__0 = this.cbuf_orientation.peek(0);

        if(orientation__1 != null) {
          const dOrientation = orientation__0 - orientation__1;
          logger.log("logComb", "dOrientation:", dOrientation);

          this.arr_brush.forEach((brush, i) => {
            const [dx__new, dy__new] = math.rotate([brush.offset_wrt_pointer.dx, brush.offset_wrt_pointer.dy], -dOrientation);
            const offset_wrt_pointer__new = {
              dx: dx__new,
              dy: dy__new,
            };
            logger.log("logComb", "offset_wrt_pointer__new:", offset_wrt_pointer__new);
            brush.offset_wrt_pointer = offset_wrt_pointer__new; 
          });
        }
         
      },


      /**
      * Constructor
      * @param {fabric.Canvas} canvas
      * @return {fabric.PencilBrush} Instance of a pencil brush
      */
      initialize: function(canvas, arr_brush_raw = []) {
        this.callSuper("initialize", canvas);
        
        arr_brush_raw.forEach((brush_raw) => {
          this.addBrush(brush_raw);
        });
        logger.log("logComb", "CombPencilBrush::initialize", this);
        
        //batch decoration
        const combBrush = this;

        const arr_funcName__forwarded = [
          "_drawSegment",
          // "onMouseDown",
          // "onMouseMove",
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

      wrappedBrush: function(brush_raw) {
        var offsettedBrush;
        if(brush_raw instanceof fabric.OffsettedBrush) {
          //already decorated
          offsettedBrush = brush_raw; 
        } else {
          //decorate
          offsettedBrush = new fabric.OffsettedBrush(brush_raw);
        }
        return offsettedBrush;
      },

      addBrush: function(brush_raw) {
        const brush__wrapped = this.wrappedBrush(brush_raw);
        this.arr_brush.push(brush__wrapped);
      },

      removeBrush: function(brush_wrapped) {
        this.arr_brush.pop(brush__wrapped);
      },

      removeBrushWithId: function(id__brush) {
        const brush__wrapped = this.arr_brush.find(e => e.id == id__brush); 
        this.removeBrush(brush__wrapped);
      },


      onMouseDown: function(pointer, options) {
        this.cbuf_pointer.push(Object.assign({}, pointer));

        this.arr_brush.forEach((brush, i) => {
          (brush["onMouseDown"])(pointer, options);
        });
      },

      onMouseMove: function(pointer, options) {
        this.cbuf_pointer.push(Object.assign({}, pointer));
        logger.log("logComb", "this.cbuf_pointer:", this.cbuf_pointer);

        const pointer__1 = this.cbuf_pointer.peek(1);
        const pointer__0 = this.cbuf_pointer.peek(0);
        
        if(pointer__1 != null) {

          const v = {
            dx: pointer__0.x - pointer__1.x,
            dy: pointer__0.y - pointer__1.y,
          };
          this.cbuf_v.push(v);

          const orientation = Math.atan2(v.dy, v.dx);
          this.cbuf_orientation.push(orientation);
          
          logger.log("logComb", "this.cbuf_orientation:", this.cbuf_orientation);
        }
        
        //update child brushes' offsets
        this.updateOffsets_to_current_orientation();

        this.arr_brush.forEach((brush, i) => {
          (brush["onMouseMove"])(pointer, options);
        });
      },
      

  });




})();