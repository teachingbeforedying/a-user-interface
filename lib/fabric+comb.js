function installFabricCombUpgrade(fabricCanvas) {


}

(function () {
  /**
   * OffsettedBrush class (decorator)
   */
  class OffsettedBrush {
    static decorate(brush__src) {

      class OffsettedXBrush extends DecorationUtils.createDecoratorClass(brush__src.constructor, {

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
          // logger.log("logComb", "offset_wrt_pointer__noOr:", offset_wrt_pointer__noOr);
      
          const [dx__noOr, dy__noOr]     = [offset_wrt_pointer__noOr.dx, offset_wrt_pointer__noOr.dy];
          
          const [dx__oriented, dy__oriented] = math.rotate([dx__noOr, dy__noOr], this.orientation__of_brush);
          const offset_wrt_pointer__oriented = {
            dx: dx__oriented,
            dy: dy__oriented,
          };
          // logger.log("logComb", "offset_wrt_pointer__oriented:", offset_wrt_pointer__oriented);
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
  
  
  

  
        onMouseDown: function(pointer, options) {
          const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this).onMouseDown(pointer__offsetted, options);
        },
  
        onMouseMove: function(pointer, options) {
          // logger.log("logComb", "OffsettedBrush::onMouseMove");
          const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this).onMouseMove(pointer__offsetted, options);
        },
  
        onMouseUp: function(options) {
          // logger.log("logComb", "OffsettedBrush::onMouseUp");
          // const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this).onMouseUp(options);
        },
  
        
        _prepareForDrawing: function(pointer) {
          const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this)._prepareForDrawing(pointer__offsetted);
        },
  
        _captureDrawingPath: function(pointer) {
          const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this)._captureDrawingPath(pointer__offsetted);
        },
  
  
  
  
        onMouseMove__preview: function(pointer, options) {
          const pointer__offsetted = this.createOffsettedPointer(pointer);
          DecorationUtils.getWrappedObj(this).onMouseMove__preview(pointer__offsetted, options);
        },
  
      }, OffsettedBrush) {}

      const brush__offsetted = OffsettedXBrush.decorate(brush__src);
      return brush__offsetted;

    }
  }
  fabric.OffsettedBrush = OffsettedBrush;

})();

(function () {
  /**
   * CassandraBrush class (decorator)
   */

  class CassandraBrush {

    static decorate(brush__src) {

      class CassandraXBrush extends DecorationUtils.createDecoratorClass(brush__src.constructor, {

        _drawSegment__old: function (ctx, p1, p2) {
          var midPoint = p1.midPointFrom(p2);
          ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          return midPoint;
        },
  
        _drawSegment: function (ctx, p1, p2) {
          // logger.log("logComb", "CassandraBrush::_drawSegment", this.debug__name, ctx, p1, p2);
          var midPoint = p1.midPointFrom(p2);
          // ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);   //commented _on purpose_
          return midPoint;
        },
  
        _render: function(ctx) {
  
        },
  
      }, CassandraBrush) {}

      const brush__cassandrated = CassandraXBrush.decorate(brush__src);

      // const isDecoratedWith__CassandraBrush = DecorationUtils.isOfficiallyDecorated_with_class__ideal(brush__cassandrated, CassandraBrush);
      // logger.log("logDeco", "isDecoratedWith__CassandraBrush:", isDecoratedWith__CassandraBrush);

      return brush__cassandrated;

    }

  }
  fabric.CassandraBrush = CassandraBrush; 

})();



(function () {

  // fabric.DebugPencilBrush = fabric.util.createClass(fabric.PencilBrush, /** @lends fabric.DebugPencilBrush.prototype */ {
  
  //   sayBanana() {
  //     return "banana";
  //   },
  
  // });

  /**
   * CombPencilBrush (decorator)
   * @class fabric.CombPencilBrush
   * @extends fabric.PencilBrush
   */
  class CombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {
  // class CombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.DebugPencilBrush, {

    //new props

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
    spacing: 1e-8,

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




    //overridden props
    color: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.color);
      }, 
      set: function (color__new) {
        this.arr_brush.forEach((brush) => {
          brush.color = color__new;
        });
      },
    }), 

    width: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.width);
      }, 
      set: function (width__new) {
        this.arr_brush.forEach((brush) => {
          brush.width = width__new;
        });
      },
    }), 
    
    homeScale: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.homeScale);
      }, 
      set: function (homeScale__new) {
        this.arr_brush.forEach((brush) => {
          brush.homeScale = homeScale__new;
        });
      },
    }),

    // zIndex__ic: DecorationUtils.overrideProperty({
    //   get: function () {
    //     return this.arr_brush.map((brush) => brush.zIndex__ic);
    //   }, 
    //   set: function (zIndex__ic__new) {
    //     this.arr_brush.forEach((brush) => {
    //       brush.zIndex__ic = zIndex__ic__new;
    //     });
    //   },
    // }),


    




    //new and overridden methods

    setSpacing: function(spacing__new_in) {
      // logger.log("logComb", "setSpacing:", spacing__new_in);
      var spacing__new; 
      if(spacing__new_in < 0) {
        // spacing__new = 0;
        spacing__new = 1e8;
      } else {
        spacing__new = spacing__new_in;
      }
      this.spacing = spacing__new;
      this.updateOffsets_to_spacing(spacing__new);
      this.updateOffsets_to_current_orientation();
    },

    updateOffsets_to_spacing: function(spacing) {
      // logger.log("logComb", "updateOffsets_to_spacing:", spacing);

      this.arr_brush.forEach((brush, i) => {
        const [dx, dy] = [brush.offset_wrt_pointer__noOr.dx, brush.offset_wrt_pointer__noOr.dy];
        const norm = math.norm([dx,dy]);

        var offset_wrt_pointer__new;
        if(norm == 0) {
          if(i == 0) {
            offset_wrt_pointer__new = {
              dx: 0,
              // dy: -10,
              dy: -1e-8,
            };
          } else if (i == 1) {
            offset_wrt_pointer__new = {
              dx: 0,
              // dy: 10,
              dy: +1e-8,
            };
          } else {
            offset_wrt_pointer__new = {
              // dx: 10,
              dx: 0,
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




    // createDecoratedChildBrush: function(brush_in) {
    //   var outBrush;

    //   var cassandraBrush; 
    //   // if(brush_in instanceof fabric.CassandraBrush) {
    //   if(DecorationUtils.isOfficiallyDecorated_with_class__ideal(brush_in, fabric.CassandraBrush)) {
    //     //already decorated
    //     cassandraBrush = brush_in; 
    //   } else {
    //     //decorate
    //     cassandraBrush = fabric.CassandraBrush.decorate(brush_in);
    //   }

    //   const offsettedBrush = fabric.OffsettedBrush.decorate(cassandraBrush);
    //   outBrush = offsettedBrush;

    //   return outBrush;
    // },

    createDecoratedChildBrush: function(brush_in) {
      var outBrush;

      // var cassandraBrush; 
      // // if(brush_in instanceof fabric.CassandraBrush) {
      // if(DecorationUtils.isOfficiallyDecorated_with_class__ideal(brush_in, fabric.CassandraBrush)) {
      //   //already decorated
      //   cassandraBrush = brush_in; 
      // } else {
      //   //decorate
      //   cassandraBrush = fabric.CassandraBrush.decorate(brush_in);
      // }

      const offsettedBrush = fabric.OffsettedBrush.decorate(brush_in);
      outBrush = offsettedBrush;

      return outBrush;
    },

    addBrush: function(brush_in) {
      // logger.log("logComb", "addBrush:", "this:", this, "brush_in:", brush_in);
      const brush__decorated = this.createDecoratedChildBrush(brush_in);

      // brush__decorated._setInfiltration("parentBrush", this);      //SHU: what was that used for ?
      
      // logger.log("logComb", "addBrush", "this.arr_brush.length", this.arr_brush.length);
      this.arr_brush.push(brush__decorated);

      return brush__decorated;
    },


    removeBrush: function(brush__decorated) {
      this.arr_brush.pop(brush__decorated);
    },

    removeBrushWithId: function(id__brush) {
      const brush__decorated = this.arr_brush.find(e => e.id == id__brush); 
      this.removeBrush(brush__decorated);
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
      logger.log("logComb", "CombPencilBrush::onMouseDown", "this.debug__name:", this.debug__name);
      this.drawStraightLine = options.e[this.straightLineKey];

      this.cbuf_pointer.push(Object.assign({}, pointer));

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseDown(pointer, options);
      });

      const ctx = this.canvas.contextContainer;

      this._render(ctx);
    },

    onMouseMove: function(pointer, options) {
      logger.log("logComb", "CombPencilBrush::onMouseMove", "this.debug__name:", this.debug__name);
      this.drawStraightLine = options.e[this.straightLineKey];
      
      this.managePointerMove(pointer, options);

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseMove(pointer, options);
      });

      const myFabricCanvas = this.canvas;
      if(myFabricCanvas == null) {
        logger.log("logComb", "myFabricCanvas == null", this);
      }
      const ctx = this.canvas.contextContainer;

      this._render(ctx);
    },

    onMouseUp: function(options) {
      logger.log("logComb", "CombPencilBrush::onMouseUp", "this.debug__name:", this.debug__name);

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseUp(options);
      });
      this.drawStraightLine = false;
    },


    _reset: function() {
      this.arr_brush.forEach((brush, i) => {
        brush._reset();
      });
    },

    _render: function(ctx) {
      // const ctx = this.canvas.contextContainer;
      logger.log("logFDZ", "CombPencilBrush::_render", ctx);

      function func__brush(ctx, brush) {
        var i, len,
          p1 = brush._points[0],
          p2 = brush._points[1];

        logger.log("logComb", "CombPencilBrush::_render", "brush.color", brush.color);
        brush._setBrushStyles(ctx);
          
        ctx.beginPath();
        //if we only have 2 points in the path and they are the same
        //it means that the user only clicked the canvas without moving the mouse
        //then we should be drawing a dot. A path isn't drawn between two identical dots
        //that's why we set them apart a bit
        if (brush._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
          var width = brush.width / 1000;
          p1 = new fabric.Point(p1.x, p1.y);
          p2 = new fabric.Point(p2.x, p2.y);
          p1.x -= width;
          p2.x += width;
        }
        ctx.moveTo(p1.x, p1.y);
  
        for (i = 1, len = brush._points.length; i < len; i++) {
          // we pick the point between pi + 1 & pi + 2 as the
          // end point and p1 as our control point.
          brush._drawSegment__old(ctx, p1, p2);
          p1 = brush._points[i];
          p2 = brush._points[i + 1];
        }
        // Draw last line as a straight line while
        // we wait for the next point to be able to calculate
        // the bezier control point
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }




      this._saveAndTransform(ctx);

      this.arr_brush.forEach((brush, i) => {
        func__brush(ctx, brush);
      });

      ctx.restore();
    },




    // _setBrushStyles__preview: function(ctx) {
    //   this.arr_brush.forEach((brush, i) => {
    //     (brush["_setBrushStyles__preview"])(ctx);
    //   });
    // },

    clearPreview: function() {
      this.canvas.clearContext(this.canvas.contextTop);
    },

    onMouseMove__preview: function(pointer, options) {
      // logger.log("logComb", "combBrush", "onMouseMove__preview", pointer, options);
      this.managePointerMove(pointer, options);

      this.clearPreview();

      // ctx.save();
      this.arr_brush.forEach((brush, i) => {
        brush.onMouseMove__preview(pointer, options);
      });
      // ctx.restore();

    },

    
  }) {}

  CombPencilBrush.createInstance = function(fabricCanvas, arr_brush_in = []) {
    const brush__pencil = new fabric.PencilBrush(fabricCanvas);
    // const brush__pencil = new fabric.DebugPencilBrush(fabricCanvas);
    
    const brush__comb   = CombPencilBrush.decorate(brush__pencil, DecorationUtils.createInitializationDict({
      arr_brush: [],
    }));
    arr_brush_in?.forEach((brush_raw) => {
      brush__comb.addBrush(brush_raw);
    });

    return brush__comb;
  };

  fabric.CombPencilBrush = CombPencilBrush; 

})();


(function () {

  class SideCombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.CombPencilBrush, {
    
    pushBrush(brush_in) {
      this.addBrush(brush_in);
    },

    popBrush() {
      this.arr_brush.pop();
    },


    setSpacing: function(spacing__new_in) {
      logger.log("logSideComb", "setSpacing:", spacing__new_in);
      this.spacing = spacing__new_in;
      this.updateOffsets_to_spacing(this.spacing);
      this.updateOffsets_to_current_orientation();      
    },

    updateOffsets_to_spacing: function(spacing) {
      logger.log("logSideComb", "updateOffsets_to_spacing:", spacing);

      this.arr_brush.forEach((brush, i) => {
        const [dx, dy] = [0, -i];
        const offset_wrt_pointer__new = {
          dx: 0,
          dy: dy * spacing,
        };
        logger.log("logSideComb", "offset_wrt_pointer__new:", offset_wrt_pointer__new);
        brush.offset_wrt_pointer__noOr = offset_wrt_pointer__new; 
      });
        
    },

    updateOffsets_to_current_orientation() {
      const isOrientationLocked = this.drawStraightLine;
      if(isOrientationLocked) {
        //do nothing
        logger.log("logSideComb", "isOrientationLocked => ignore");
      } else {
        DecorationUtils.getWrappedObj(this).updateOffsets_to_current_orientation();
      }
    },

  }) {}

  SideCombPencilBrush.createInstance = function(fabricCanvas, arr_brush_in = []) {
    const brush__comb     = fabric.CombPencilBrush.createInstance(fabricCanvas, arr_brush_in); 
    const brush__sideComb = SideCombPencilBrush.decorate(brush__comb);
    return brush__sideComb;
  };

  fabric.SideCombPencilBrush = SideCombPencilBrush; 

})();


(function () {

  /**
   * ZCombPencilBrush (decorator)
   * @class fabric.ZCombPencilBrush
   * @extends fabric.CombPencilBrush
   */
  class ZCombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.CombPencilBrush, {

    zIndex__ic: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.zIndex__ic);
      }, 
      set: function (zIndex__ic__new) {
        this.arr_brush.forEach((brush) => {
          brush.zIndex__ic = zIndex__ic__new;
        });
      },
    }),

    zIndex: DecorationUtils.overrideProperty({
      get: function () {
        // return this.arr_brush.map((brush) => brush.zIndex);
        return this._zIndex;
      }, 
      set: function (zIndex__new) {
        this._zIndex = zIndex__new;

        this.arr_brush.forEach((brush) => {
          brush.zIndex = zIndex__new;
        });
      },
    }),

    _zIndex: null,


    addBrush: function(brush_in) {
      // logger.trace("logZComb", "addBrush:", "this:", this, "brush_in:", brush_in);
      const zCombPencilBrush = this;

      //deactivate some of ZPencilBrush decoration
      const isZPencilBrush = DecorationUtils.isOfficiallyDecorated_with_class(brush_in, fabric.ZPencilBrush);
      // logger.log("logZComb", "isZPencilBrush:", isZPencilBrush);
      if(isZPencilBrush) {
        DecorationUtils.setIsDecorationActive__updateDecorationConfig_in_decorator(brush_in, fabric.ZPencilBrush, {
          onMouseDown: false,
          onMouseMove: false,
        });
      }

      //debug
      if(brush_in.zIndex == null) {
        brush_in.zIndex = 0;
      }

      //debug
      // logger.log("logFDZ", "getDecorationConfigDict__for_decorator", DecorationUtils.getDecorationConfigDict__for_decorator(brush_in, fabric.ZPencilBrush));

      //call "super" 
      DecorationUtils.getWrappedObj(this).addBrush(brush_in);
      // DecorationUtils.getDecoratorObj__with_class(fabric.CombPencilBrush).addBrush(brush_in);

      // const wrappedObj = DecorationUtils.getWrappedObj(this);
      // const wrappedObj = DecorationUtils.getWrappedObj(zCombPencilBrush);
      // logger.log("logZComb", 'call "super"', {
      //   zCombPencilBrush:      zCombPencilBrush,
      //   wrappedObj:            wrappedObj,
      //   "wrappedObj._go_down": wrappedObj._go_down,
      // });
      // wrappedObj.addBrush(brush_in);
    },


    zIndexWrapAround: function(ctx, arr_dict_brushAndFunc) {
      logger.log("logFDZ", "ZCombPencilBrush", "zIndexWrapAround", "this.debug__name:", this.debug__name, arr_dict_brushAndFunc);

      const fabricCanvas = this.canvas;

      if(arr_dict_brushAndFunc.length > 0) {

        const arr_zIndex = arr_dict_brushAndFunc.map((dict_brushAndFunc) => dict_brushAndFunc.brush.zIndex);
        // logger.log("logFDZ", "arr_zIndex:", arr_zIndex);
  
        const zIndex__child__min = math.min(arr_zIndex);
        const zIndex__child__max = math.max(arr_zIndex);
  
        fabricCanvas.clearContext(ctx);
        fabricCanvas._renderBackground(ctx);
        fabricCanvas.render_below_zIndex(ctx, zIndex__child__min);
        
        {
          const arr_dict_brushAndFunc__sorted = arr_dict_brushAndFunc.toSorted((dict1, dict2) => {return dict1.zIndex < dict2.zIndex});
  
          const arr_from      = arr_dict_brushAndFunc__sorted.slice(0, -1);
          const arr_to        = arr_dict_brushAndFunc__sorted.slice(1);
          const arr_interval  = Utils.zip(arr_from, arr_to);
          // logger.log("logFDZ", "arr_interval:", arr_interval);
          
          arr_interval.forEach(([dict_from, dict_to]) => {
            //call brush func
            dict_from.func(ctx, dict_from.brush);
            //render fObjs till next brush zIndex
            fabricCanvas.render_between_zIndexes(ctx, dict_from.brush.zIndex, dict_to.brush.zIndex);
          });
          //call last brush func
          const dict_brushAndFunc__last = arr_dict_brushAndFunc__sorted[arr_dict_brushAndFunc__sorted.length - 1];
          // logger.log("logComb", "dict_brushAndFunc__last:", dict_brushAndFunc__last); 
          dict_brushAndFunc__last.func(ctx, dict_brushAndFunc__last.brush);
        }
  
        fabricCanvas.render_above_zIndex(ctx, zIndex__child__max);

      } else {
        //do nothing
      }

    },

    _render: function(ctx_ignored) {
      logger.log("logFDZ", "ZCombPencilBrush::_render", "this.debug__name:", this.debug__name, "this.arr_brush:", this.arr_brush);

      const ctx = this.canvas.contextContainer;
      // logger.log("logFDZ", "ZCombPencilBrush::_render", ctx);
      
      const combBrush = this;

      // function func__brush(ctx, brush) {
      //   logger.log("logComb", "ZCombPencilBrush::_render", brush);

      //   //debug ?
      //   if(brush._points.length < 2) {
      //     return;
      //   }

      //   var i, len,
      //     p1 = brush._points[0],
      //     p2 = brush._points[1];

      //   brush._setBrushStyles(ctx);
          
      //   ctx.beginPath();
      //   //if we only have 2 points in the path and they are the same
      //   //it means that the user only clicked the canvas without moving the mouse
      //   //then we should be drawing a dot. A path isn't drawn between two identical dots
      //   //that's why we set them apart a bit
      //   if (brush._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
      //     var width = brush.width / 1000;
      //     p1 = new fabric.Point(p1.x, p1.y);
      //     p2 = new fabric.Point(p2.x, p2.y);
      //     p1.x -= width;
      //     p2.x += width;
      //   }
      //   ctx.moveTo(p1.x, p1.y);
  
      //   for (i = 1, len = brush._points.length; i < len; i++) {
      //     // we pick the point between pi + 1 & pi + 2 as the
      //     // end point and p1 as our control point.
      //     brush._drawSegment__old(ctx, p1, p2);
      //     p1 = brush._points[i];
      //     p2 = brush._points[i + 1];
      //   }
      //   // Draw last line as a straight line while
      //   // we wait for the next point to be able to calculate
      //   // the bezier control point
      //   ctx.lineTo(p1.x, p1.y);
      //   ctx.stroke();
      // }

      function func__brush(ctx, brush) {
        brush._render(ctx_ignored);
      }


      //bugfix? erase marks
      this.canvas.clearContext(this.canvas.contextTop);

      this._saveAndTransform(ctx);

      // const arr_dict_brushAndFunc = this.arr_brush.map((brush) => {
      //   return {
      //     brush: brush,
      //     func: func__brush,
      //   };
      // });

      //flatten all brushes
      function flattenBrush(brush__any) {
        var outArr = [];

        const isBrushACombBrush = (brush__any.arr_brush != null);
        if(isBrushACombBrush) {
          const brush__comb = brush__any;
          outArr = brush__comb.arr_brush.reduce((acc,x) => {
            acc.push(...flattenBrush(x));
            return acc;
          }, []);
        } else {
          outArr = [brush__any];
        }

        return outArr;
      }

      function create_dict_brushAndFunc(brush) {
        return {
          brush: brush,
          func: func__brush,
        };
      }

      // const arr_dict_brushAndFunc = flattenBrush(combBrush).map(create_dict_brushAndFunc);
      const arr_dict_brushAndFunc = combBrush.arr_brush.map(create_dict_brushAndFunc);

      this.zIndexWrapAround(ctx, arr_dict_brushAndFunc);

      ctx.restore();
    },



    // // _setBrushStyles__preview: function(ctx) {
    // //   this.arr_brush.forEach((brush, i) => {
    // //     (brush["_setBrushStyles__preview"])(ctx);
    // //   });
    // // },

    // clearPreview: function() {
    //   this.canvas.clearContext(this.canvas.contextContainer);
    // },

    // onMouseMove__preview: function(pointer, options) {
    //   // logger.log("logComb", "combBrush", "onMouseMove__preview", pointer, options);
    //   this.managePointerMove(pointer, options);

    //   this.clearPreview();

    //   // ctx.save();
    //   this.arr_brush.forEach((brush, i) => {
    //     brush.onMouseMove__preview(pointer, options);
    //   });
    //   // ctx.restore();
    // 
    // },


  }) {}

  ZCombPencilBrush.createInstance = function(fabricCanvas, arr_brush_in = []) {
    const brush__comb  = fabric.CombPencilBrush.createInstance(fabricCanvas, []);
    const brush__zComb = ZCombPencilBrush.decorate(brush__comb);
    arr_brush_in?.forEach((brush_raw) => {
      brush__zComb.addBrush(brush_raw);
    });
    return brush__zComb;
  };

  fabric.ZCombPencilBrush = ZCombPencilBrush;


})();







//NoOffsetCombs:

(function () {

  /**
   * NoOffsetCombPencilBrush (decorator)
   * @class fabric.NoOffsetCombPencilBrush
   * @extends fabric.PencilBrush
   */
  class NoOffsetCombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {

    //new props

    /**
    * Contains the array of decorated freeDrawing brushes which the drawing task is forwarded to
    * @type array
    * @private
    */
    arr_brush: [],


    //overridden props
    color: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.color);
      }, 
      set: function (color__new) {
        this.arr_brush.forEach((brush) => {
          brush.color = color__new;
        });
      },
    }), 

    width: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.width);
      }, 
      set: function (width__new) {
        this.arr_brush.forEach((brush) => {
          brush.width = width__new;
        });
      },
    }), 
    
    homeScale: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.homeScale);
      }, 
      set: function (homeScale__new) {
        this.arr_brush.forEach((brush) => {
          brush.homeScale = homeScale__new;
        });
      },
    }),

    // zIndex__ic: DecorationUtils.overrideProperty({
    //   get: function () {
    //     return this.arr_brush.map((brush) => brush.zIndex__ic);
    //   }, 
    //   set: function (zIndex__ic__new) {
    //     this.arr_brush.forEach((brush) => {
    //       brush.zIndex__ic = zIndex__ic__new;
    //     });
    //   },
    // }),


    







    addBrush: function(brush_in) {
      logger.log("logComb", "NoOffsetCombPencilBrush::addBrush:", "this.debug__name", this.debug__name, "brush_in:", brush_in);

      if(brush_in.drawingBout != null) {
        logger.log("logComb", "NoOffsetCombPencilBrush::addBrush:", "(", brush_in.drawingBout.session.id, ",", brush_in.drawingBout.id,")");
      }

      this.arr_brush.push(brush_in);

      return brush_in;
    },

    removeBrush: function(brush_in) {
      logger.log("logComb", "NoOffsetCombPencilBrush::removeBrush:", "this.debug__name", this.debug__name);

      if(brush_in != null) {

        if(brush_in.drawingBout != null) {
          logger.log("logComb", "NoOffsetCombPencilBrush::removeBrush:", "(", brush_in.drawingBout.session.id, ",", brush_in.drawingBout.id,")");
        }

        if(this.arr_brush.includes(brush_in)) {
          this.arr_brush.pop(brush_in);
        } else {
          throw new Error("!this.arr_brush.includes(brush_in)");
        }
      } else {
        throw new Error("brush_in == null");
      }
    },

    removeBrushWithId: function(id__brush) {
      logger.log("logComb", "NoOffsetCombPencilBrush::removeBrushWithId:", "this.debug__name", this.debug__name, "id__brush:", id__brush);

      const brush__child = this.arr_brush.find(e => e.id == id__brush); 
      this.removeBrush(brush__child);
    },





    onMouseDown: function(pointer, options) {
      logger.log("logComb", "NoOffsetCombPencilBrush::onMouseDown", "this.debug__name:", this.debug__name);
      this.drawStraightLine = options.e[this.straightLineKey];

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseDown(pointer, options);
      });

      const ctx = this.canvas.contextContainer;

      this._render(ctx);
    },

    onMouseMove: function(pointer, options) {
      logger.log("logComb", "NoOffsetCombPencilBrush::onMouseMove", "this.debug__name:", this.debug__name);
      this.drawStraightLine = options.e[this.straightLineKey];

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseMove(pointer, options);
      });

      const myFabricCanvas = this.canvas;
      if(myFabricCanvas == null) {
        logger.log("logComb", "myFabricCanvas == null", this);
      }
      const ctx = this.canvas.contextContainer;

      // this._render(ctx);
    },

    onMouseUp: function(options) {
      logger.log("logComb", "NoOffsetCombPencilBrush::onMouseUp", "this.debug__name:", this.debug__name, "this.arr_brush:", this.arr_brush);

      this.arr_brush.forEach((brush, i) => {
        brush.onMouseUp(options);
      });
      this.drawStraightLine = false;
    },


    _reset: function() {
      this.arr_brush.forEach((brush, i) => {
        brush._reset();
      });
    },

    _render: function(ctx) {
      // const ctx = this.canvas.contextContainer;
      logger.log("logComb", "NoOffsetCombPencilBrush::_render", "this.debug__name", this.debug__name, "ctx:", ctx);

      this._saveAndTransform(ctx);

      this.arr_brush.forEach((brush, i) => {
        brush._render(ctx);
      });

      ctx.restore();
    },




    // _setBrushStyles__preview: function(ctx) {
    //   this.arr_brush.forEach((brush, i) => {
    //     (brush["_setBrushStyles__preview"])(ctx);
    //   });
    // },

    clearPreview: function() {
      this.canvas.clearContext(this.canvas.contextTop);
    },

    onMouseMove__preview: function(pointer, options) {
      logger.log("logComb", "NoOffsetCombPencilBrush::onMouseMove__preview", "this.debug__name", this.debug__name, "pointer:", pointer, "options:", options);

      this.clearPreview();

      // ctx.save();
      this.arr_brush.forEach((brush, i) => {
        brush.onMouseMove__preview(pointer, options);
      });
      // ctx.restore();

    },

  }) {}

  NoOffsetCombPencilBrush.createInstance = function(fabricCanvas, arr_brush_in = []) {
    const brush__pencil       = new fabric.PencilBrush(fabricCanvas);
    const brush__noOffsetComb = NoOffsetCombPencilBrush.decorate(brush__pencil, DecorationUtils.createInitializationDict({
      arr_brush: [],
    }));
    arr_brush_in?.forEach((brush_raw) => {
      brush__noOffsetComb.addBrush(brush_raw);
    });

    return brush__noOffsetComb;
  };

  fabric.NoOffsetCombPencilBrush = NoOffsetCombPencilBrush; 

})();





(function () {

  /**
   * ZNoOffsetCombPencilBrush (decorator)
   * @class fabric.ZNoOffsetCombPencilBrush
   * @extends fabric.NoOffsetCombPencilBrush
   */
  class ZNoOffsetCombPencilBrush extends DecorationUtils.createDecoratorClass(fabric.NoOffsetCombPencilBrush, {

    zIndex__ic: DecorationUtils.overrideProperty({
      get: function () {
        return this.arr_brush.map((brush) => brush.zIndex__ic);
      }, 
      set: function (zIndex__ic__new) {
        this.arr_brush.forEach((brush) => {
          brush.zIndex__ic = zIndex__ic__new;
        });
      },
    }),

    zIndex: DecorationUtils.overrideProperty({
      get: function () {
        // return this.arr_brush.map((brush) => brush.zIndex);
        return this._zIndex;
      }, 
      set: function (zIndex__new) {
        this._zIndex = zIndex__new;

        this.arr_brush.forEach((brush) => {
          brush.zIndex = zIndex__new;
        });
      },
    }),

    _zIndex: null,


    addBrush: function(brush_in) {
      logger.log("logComb", "ZNoOffsetCombPencilBrush::addBrush:", "this.debug__name", this.debug__name, "brush_in:", brush_in);
      const zNoOffsetCombPencilBrush = this;

      //deactivate some of ZPencilBrush decoration
      const isZPencilBrush = DecorationUtils.isOfficiallyDecorated_with_class(brush_in, fabric.ZPencilBrush);
      // logger.log("logZComb", "isZPencilBrush:", isZPencilBrush);
      if(isZPencilBrush) {
        DecorationUtils.setIsDecorationActive__updateDecorationConfig_in_decorator(brush_in, fabric.ZPencilBrush, {
          onMouseDown: false,
          onMouseMove: false,
        });
      }

      //debug
      if(brush_in.zIndex == null) {
        brush_in.zIndex = 0;
      }

      //debug
      // logger.log("logFDZ", "getDecorationConfigDict__for_decorator", DecorationUtils.getDecorationConfigDict__for_decorator(brush_in, fabric.ZPencilBrush));

      //call "super" 
      const brush__maybeDecorated = DecorationUtils.getWrappedObj(this).addBrush(brush_in);

      return brush__maybeDecorated;
    },


    zIndexWrapAround: function(ctx, arr_dict_brushAndFunc) {
      logger.log("logFDZ", "ZNoOffsetCombPencilBrush::zIndexWrapAround", "this.debug__name:", this.debug__name, arr_dict_brushAndFunc);

      const fabricCanvas = this.canvas;

      if(arr_dict_brushAndFunc.length > 0) {

        const arr_zIndex = arr_dict_brushAndFunc.map((dict_brushAndFunc) => dict_brushAndFunc.brush.zIndex);
        // logger.log("logFDZ", "arr_zIndex:", arr_zIndex);
  
        const zIndex__child__min = math.min(arr_zIndex);
        const zIndex__child__max = math.max(arr_zIndex);
  
        fabricCanvas.clearContext(ctx);
        fabricCanvas._renderBackground(ctx);
        fabricCanvas.render_below_zIndex(ctx, zIndex__child__min);
        
        {
          const arr_dict_brushAndFunc__sorted = arr_dict_brushAndFunc.toSorted((dict1, dict2) => {return dict1.zIndex < dict2.zIndex});
  
          const arr_from      = arr_dict_brushAndFunc__sorted.slice(0, -1);
          const arr_to        = arr_dict_brushAndFunc__sorted.slice(1);
          const arr_interval  = Utils.zip(arr_from, arr_to);
          // logger.log("logFDZ", "arr_interval:", arr_interval);
          
          arr_interval.forEach(([dict_from, dict_to]) => {
            //call brush func
            dict_from.func(ctx, dict_from.brush);
            //render fObjs till next brush zIndex
            fabricCanvas.render_between_zIndexes(ctx, dict_from.brush.zIndex, dict_to.brush.zIndex);
          });
          //call last brush func
          const dict_brushAndFunc__last = arr_dict_brushAndFunc__sorted[arr_dict_brushAndFunc__sorted.length - 1];
          // logger.log("logComb", "dict_brushAndFunc__last:", dict_brushAndFunc__last); 
          dict_brushAndFunc__last.func(ctx, dict_brushAndFunc__last.brush);
        }
  
        fabricCanvas.render_above_zIndex(ctx, zIndex__child__max);

      } else {
        //do nothing
      }

    },

    _render: function(ctx_ignored) {
      logger.log("logFDZ", "ZCombPencilBrush::_render", "this.debug__name:", this.debug__name, "this.arr_brush:", this.arr_brush);

      const ctx = this.canvas.contextContainer;
      // logger.log("logFDZ", "ZCombPencilBrush::_render", ctx);
      
      const combBrush = this;

      function func__brush(ctx, brush) {
        brush._render(ctx_ignored);
      }

      //bugfix? erase marks
      this.canvas.clearContext(this.canvas.contextTop);

      this._saveAndTransform(ctx);

      function create_dict_brushAndFunc(brush) {
        return {
          brush: brush,
          func: func__brush,
        };
      }

      // const arr_dict_brushAndFunc = flattenBrush(combBrush).map(create_dict_brushAndFunc);
      const arr_dict_brushAndFunc = combBrush.arr_brush.map(create_dict_brushAndFunc);

      this.zIndexWrapAround(ctx, arr_dict_brushAndFunc);

      ctx.restore();
    },

  }) {}

  ZNoOffsetCombPencilBrush.createInstance = function(fabricCanvas, arr_brush_in = []) {
    const brush__noOffsetComb  = fabric.NoOffsetCombPencilBrush.createInstance(fabricCanvas, []);
    const brush__zNoOffsetComb = ZNoOffsetCombPencilBrush.decorate(brush__noOffsetComb);
    arr_brush_in?.forEach((brush_raw) => {
      brush__zNoOffsetComb.addBrush(brush_raw);
    });
    return brush__zNoOffsetComb;
  };

  fabric.ZNoOffsetCombPencilBrush = ZNoOffsetCombPencilBrush;



  

})();