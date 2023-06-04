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
      * Contains the propName to access the object being decorated
      * @type string
      * @private
      */
      propName__decorated: "brush_raw",

      /**
      * Contains the raw brush
      * @type fabric.BaseBrush
      * @private
      */
      brush_raw: null,

      /**
      * Contains the offset of the brush wrt pointer (without orientation)
      * @type dict
      * @private
      */
      offset_wrt_pointer__noOr: {
        dx: 0,
        dy: 0
      },

      /**
      * Contains the orientation of the brush
      * @type number
      * @private
      */
      orientation__of_brush: 0,

      getOffset_wrt_pointer__oriented: function() {
        const offset_wrt_pointer__noOr = this.offset_wrt_pointer__noOr;
        logger.log("logComb", "offset_wrt_pointer__noOr:", offset_wrt_pointer__noOr);
    
        const [dx__noOr, dy__noOr]     = [offset_wrt_pointer__noOr.dx, offset_wrt_pointer__noOr.dy];
        
        const [dx__oriented, dy__oriented] = math.rotate([dx__noOr, dy__noOr], this.orientation__of_brush);
        const offset_wrt_pointer__oriented = {
          dx: dx__oriented,
          dy: dy__oriented,
        };
        logger.log("logComb", "offset_wrt_pointer__oriented:", offset_wrt_pointer__oriented);
        return offset_wrt_pointer__oriented;
      },

      createOffsettedPointer: function(pointer) {
        const pointer__clone = Object.assign({}, pointer);
        
        // pointer__clone.x = pointer__clone.x + this.offset_wrt_pointer__oriented.dx;
        // pointer__clone.y = pointer__clone.y + this.offset_wrt_pointer__oriented.dy;

        const offset_wrt_pointer__oriented = this.getOffset_wrt_pointer__oriented();
        pointer__clone.x = pointer__clone.x + offset_wrt_pointer__oriented.dx;
        pointer__clone.y = pointer__clone.y + offset_wrt_pointer__oriented.dy;
        
        return pointer__clone;
      },



      /**
      * Constructor
      * @param {fabric.BaseBrush} brush to decorate
      * @return {fabric.BaseBrush} decorated brush
      */
      initialize: function(brush_raw, offset_wrt_pointer__noOr__in = null) {
        this.callSuper("initialize", brush_raw.canvas);

        // previewBrush__upgrade(this);
        
        this.brush_raw = brush_raw;

        if(offset_wrt_pointer__noOr__in != null) {
          this.offset_wrt_pointer__noOr = offset_wrt_pointer__noOr__in;
        }


        // this.canvas = this.brush_raw.canvas;    //SHU: ...

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


          "_setBrushStyles__preview",
          // "onMouseMove__preview",


          "_setBrushStyles",
        ];
        arr_funcName__forwarded.forEach((funcName) => {
          const brush_raw = offsetted_brush.brush_raw;
          if(funcName in brush_raw) {
            function func_decorated(...args) {
              (brush_raw[funcName])(...args);
            };
            offsetted_brush[funcName] = func_decorated;
          }
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




      onMouseMove__preview: function(pointer, options) {
        const pointer__offsetted = this.createOffsettedPointer(pointer);
        this.brush_raw.onMouseMove__preview(pointer__offsetted, options);
      },

  });

})();

// const orientedBrushMixin = {
//   setOrientation(orientation) {
//     this.orientation__brush = orientation;
//   },
//   getOffset_wrt_pointer__oriented() {
//     const offset_wrt_pointer__noOr = this.offset_wrt_pointer__noOr;
//     logger.log("logComb", "offset_wrt_pointer__noOr:", offset_wrt_pointer__noOr);

//     const [dx__noOr, dy__noOr]     = [offset_wrt_pointer__noOr.dx, offset_wrt_pointer__noOr.dy];
    
//     const [dx__oriented, dy__oriented] = math.rotate([dx__noOr, dy__noOr], -this.orientation__brush);
//     const offset_wrt_pointer__oriented = {
//       dx: dx__oriented,
//       dy: dy__oriented,
//     };
//     logger.log("logComb", "offset_wrt_pointer__oriented:", offset_wrt_pointer__oriented);
//     return offset_wrt_pointer__oriented;
//   }
// };
// Object.assign(fabric.OffsettedBrush.prototype, orientedBrushMixin);



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
      // cbuf_v:           new CircularBuffer(2),
      cbuf_v:           new CircularBuffer(10),

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
        this.updateOffsets_to_current_orientation();
      },

      updateOffsets_to_spacing: function(spacing) {
        logger.log("logComb", "updateOffsets_to_spacing:", spacing);

        this.arr_brush.forEach((brush, i) => {
          const [dx, dy] = [brush.offset_wrt_pointer__noOr.dx, brush.offset_wrt_pointer__noOr.dy];
          const norm = math.norm([dx,dy]);

          var offset_wrt_pointer__new;
          if(norm == 0) {
            if(i == 0) {
              offset_wrt_pointer__new = {
                dx: 0,
                dy: -10,
              };
            } else if (i == 1) {
              offset_wrt_pointer__new = {
                dx: 0,
                dy: 10,
              };
            } else {
              offset_wrt_pointer__new = {
                dx: 10,
                dy: 0,
              };
            }
          } else {
            offset_wrt_pointer__new = {
              dx: dx / norm * spacing,
              dy: dy / norm * spacing,
            };
          }
          logger.log("logComb", "offset_wrt_pointer__new:", offset_wrt_pointer__new);
          brush.offset_wrt_pointer__noOr = offset_wrt_pointer__new; 
        });
         
      },

      updateOffsets_to_current_orientation: function() {
      // updateOffsets_to_orientation(orientation): function() {

        const orientation__1 = this.cbuf_orientation.peek(1);
        const orientation__0 = this.cbuf_orientation.peek(0);

        if(orientation__1 != null) {
          
          this.arr_brush.forEach((brush, i) => {
            if("orientation__of_brush" in brush) {
              brush.orientation__of_brush = orientation__1;
            }
          });
          
        }
         
      },


      /**
      * Constructor
      * @param {fabric.Canvas} canvas
      * @return {fabric.PencilBrush} Instance of a CombPencilBrush
      */
      initialize: function(canvas, arr_brush_raw = []) {
        this.callSuper("initialize", canvas);

        // previewBrush__upgrade(this);
        
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


          "_setBrushStyles__preview",
          // "onMouseMove__preview",
        ];
        arr_funcName__forwarded.forEach((funcName) => {
          // const func_old = this[funcName];
            function func_decorated(...args) {
              combBrush.arr_brush.forEach((brush, i) => {
                if(funcName in brush) {
                  (brush[funcName])(...args);
                }
              });
            }
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
        logger.log("logComb", "addBrush:", brush_raw);
        const brush__wrapped = this.wrappedBrush(brush_raw);

        DecorationUtils.upgrade_decorator__with_infiltration(brush__wrapped);
        brush__wrapped.setInfiltration("parentBrush", this);
        
        this.arr_brush.push(brush__wrapped);
      },

      removeBrush: function(brush_wrapped) {
        this.arr_brush.pop(brush__wrapped);
      },

      removeBrushWithId: function(id__brush) {
        const brush__wrapped = this.arr_brush.find(e => e.id == id__brush); 
        this.removeBrush(brush__wrapped);
      },



      managePointerMove: function(pointer, options) {
        this.cbuf_pointer.push(Object.assign({}, pointer));

        const pointer__1 = this.cbuf_pointer.peek(1);
        const pointer__0 = this.cbuf_pointer.peek(0);
        
        if(pointer__0 != null && pointer__1 != null) {

          const v = {
            dx: pointer__0.x - pointer__1.x,
            dy: pointer__0.y - pointer__1.y,
          };
          this.cbuf_v.push(v);

          const arr_v = [...this.cbuf_v._buffer.filter(v => v != null)];
          const [arr_dx, arr_dy] = arr_v.reduce((acc,x) => {
            acc[0].push(x.dx);
            acc[1].push(x.dy);
            return acc;
          }, [[],[]]);

          const v__avg = {
            dx: Math.avg(...arr_dx),
            dy: Math.avg(...arr_dy),
          };

          // const orientation = Math.atan2(v.dy, v.dx);
          const orientation = Math.atan2(v__avg.dy, v__avg.dx);
          this.cbuf_orientation.push(orientation);
        }
        
        //update child brushes' offsets
        this.updateOffsets_to_current_orientation();
      },





      onMouseDown: function(pointer, options) {
        this.cbuf_pointer.push(Object.assign({}, pointer));

        this.arr_brush.forEach((brush, i) => {
          brush.onMouseDown(pointer, options);
        });
      },

      onMouseMove: function(pointer, options) {
        this.managePointerMove(pointer, options);

        const ctx = this.canvas.contextContainer;
        // const ctx = this.canvas.contextTop;

        this.arr_brush.forEach((brush, i) => {
          brush._setBrushStyles(ctx);
          brush.onMouseMove(pointer, options);
        });
      },



      // _setBrushStyles__preview: function(ctx) {
      //   this.arr_brush.forEach((brush, i) => {
      //     (brush["_setBrushStyles__preview"])(ctx);
      //   });
      // },

      onMouseMove__preview: function(pointer, options) {
        // logger.log("logComb", "combBrush", "onMouseMove__preview", pointer, options);
        this.managePointerMove(pointer, options);

        const ctx = this.canvas.contextTop;
        if(this.parentBrush == null) {
          this.canvas.clearContext(ctx);
        }

        // ctx.save();
        this.arr_brush.forEach((brush, i) => {
          brush.onMouseMove__preview(pointer, options);
        });
        // ctx.restore();

      },
      

  });




})();