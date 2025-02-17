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

    //force brush width to be 1
    width: DecorationUtils.overrideProperty({
      get: function () { return 1; }, 
      set: function (width__new) { /*ignore*/ },
    }),

    _setBrushStyles: function(ctx) {
      // logger.log("logZPixelBrush", "_setBrushStyles", this);
      // logger.log("logZPixelBrush", "_setBrushStyles", "this.width:", this.width);

      DecorationUtils.getWrappedObj(this)._setBrushStyles(ctx);

      ctx.fillStyle = this.color;
    },



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

      // const screenRect__zPixel = dict_zPixel.screenRect;
      // // const homeScale__zPixel  = dict_zPixel.homeScale;
      
      // ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
      // ctx.strokeRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);

      const dict_screenPoint = dict_zPixel.dict_screenPoint;
      logger.log("logZPixelFD", "onMouseMove__preview", "dict_screenPoint:", ICUtils.stringify__dict(dict_screenPoint));

      {
        const arr_point = [
          dict_screenPoint.tl,
          dict_screenPoint.tr,
          dict_screenPoint.br,
          dict_screenPoint.bl,
        ];

        const x = 0;
        const y = 0;

        ctx.beginPath();
        ctx.moveTo(arr_point[0].x - x, arr_point[0].y - y);
        for (var i = 0; i < arr_point.length; i++) {
          const point = arr_point[i];
          ctx.lineTo(point.x - x, point.y - y);
        }
        ctx.closePath();


        ctx.save();

        ctx.fill();
        ctx.stroke();

        ctx.restore();

      }

      //debug
      // {
      //   const screenRect__zPixel = {
      //     x:      dict_screenPoint.tl.x.toNumber(),
      //     y:      dict_screenPoint.tl.y.toNumber(),
      //     width:  Decimal.sub( dict_screenPoint.br.x , dict_screenPoint.tl.x ).toNumber(),
      //     height: Decimal.sub( dict_screenPoint.br.y , dict_screenPoint.tl.y ).toNumber(),
      //   };
      //   logger.log("logZPixelFD", "onMouseMove__preview", "screenRect__zPixel:", screenRect__zPixel);

      //   ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
      //   ctx.strokeRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
      // }



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
        // this.arr_dict_zPixel.push(dict_zPixel);
        // outBool = true;
        const dict_zPixel__new = dict_zPixel;
        this.addNewZPixel(dict_zPixel__new);
        outBool = true;
      }

      logger.log("logZPixelBrush", "_addZPixel", "dict_zPixel:", dict_zPixel, "this.arr_dict_zPixel:", this.arr_dict_zPixel, "outBool:", outBool);

      return outBool;
    },

    isSameZPixel: function(dict_zPixel1, dict_zPixel2) {
      var outBool;

      const zPixelCoords1 = dict_zPixel1.zPixelCoords;
      const zPixelCoords2 = dict_zPixel2.zPixelCoords;

      const isSameZLevel = (zPixelCoords1.zLevel.equals(zPixelCoords2.zLevel));
      if(!isSameZLevel) {
        outBool = false;
      } else {
        const isSameIx = (zPixelCoords1.ix.equals(zPixelCoords2.ix)); 
        const isSameIy = (zPixelCoords1.iy.equals(zPixelCoords2.iy));
        outBool = isSameIx && isSameIy; 
      }

      return outBool;
    },



    addNewZPixel: function(dict_zPixel__new) {

      var arr_zPixel__toAdd = [];

      // if(this.arr_dict_zPixel.length > 1) {
      //
      // } else 
      if(this.arr_dict_zPixel.length > 0) {

        //we check if with missed some zPixels on the curve between 

        const dict_zPixel__previous = this.arr_dict_zPixel[this.arr_dict_zPixel.length - 1];

        const screenPoint__new      = dict_zPixel__new.screenPoint;
        const screenPoint__previous = dict_zPixel__previous.screenPoint;

        const p1 = new fabric.Point(screenPoint__previous.x, screenPoint__previous.y);
        const p2 = new fabric.Point(screenPoint__new.x,      screenPoint__new.y);
        const curve = this.createCurve__segment(p1,p2);
        logger.log("logZPixelBrush", "curve:", curve);

        const arr_zPixel = this.getArrZPixelInCurve(curve);
        // logger.log("logZPixelBrush", "arr_zPixel:", arr_zPixel);

        // const map_dict_zPixel__distinct = arr_zPixel.reduce((acc, x) => {

        // }, new Map());
        // const arr_zPixel__distinct = map_dict_zPixel__distinct.values();

        var arr_zPixel__distinct = [arr_zPixel[0]];
        const arr_zip = Utils.zip(arr_zPixel, arr_zPixel.slice(1));
        arr_zip.forEach(([dict_zPixel__previous, dict_zPixel]) => {

          if(dict_zPixel != null && !this.isSameZPixel(dict_zPixel, dict_zPixel__previous)) {
            arr_zPixel__distinct.push(dict_zPixel);
          }

        });
        logger.log("logZPixelBrush", "arr_zPixel__distinct:", arr_zPixel__distinct);

        arr_zPixel__toAdd = arr_zPixel__distinct;

      } else {
        arr_zPixel__toAdd = [dict_zPixel__new];
      }

      this.arr_dict_zPixel.push(...arr_zPixel__toAdd);

    },
    // addNewZPixel: function(dict_zPixel__new) {
    //   this.arr_dict_zPixel.push(dict_zPixel__new);
    // },

    createCurve__segment: function(p1,p2) {
      var midPoint = p1.midPointFrom(p2);
      const curve__quadratic = Bezier.quadraticFromPoints(p1, midPoint, p2);
      return curve__quadratic;
    },

    // createCurve__quadratic: function(p1,p2,p3) {
    //   const curve__quadratic = Bezier.quadraticFromPoints(p1, p2, p3);
    //   return curve__quadratic;
    // },

    getArrZPixelInCurve: function(curve) {  //SHU: this could be more precise, more elegant, etc. (if I only add a brain)
      var outArr;

      const nb_points = 10;
      const arr_point = curve.getLUT(nb_points - 1);
      // logger.log("logZPixelBrush", "getZPixelsInCurve", "arr_point:", arr_point);

      outArr = arr_point.map((point) => {
        return this.getDict_zPixel(point);
      });

      return outArr;
    },



    

    createFZPixel_p: async function(dict_zPixel) {
      // logger.log("logZPixelBrush", "createFZPixel", "dict_zPixel:", dict_zPixel);

      return await this.drawingBout.createFabricZPixelWith__dict_zPixel_p(dict_zPixel);
    },

    // createFZPixelPath: function(arr_dict_zPixel) {
    //   const fZPixelPath = new fabric.ZPixelPath(arr_dict_zPixel, {
      
    //   });

    //   return fZPixelPath;
    // },

    createFZPixelGroup_p: async function(arr_dict_zPixel) {
      logger.log("logZPixel", "createFZPixelGroup", arr_dict_zPixel);

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

      /*
      // const arr_fZPixel_p = arr_dict_zPixel.map((dict_zPixel) => {
      //   return this.createFZPixel_p(dict_zPixel);
      // });

      // var arr_fZPixel = [];
      // for(var i=0 ; i<arr_dict_zPixel.length ; i++) {
      //   const dict_zPixel = arr_dict_zPixel[i];
      //   const fZPixel = await this.createFZPixel_p(dict_zPixel);
      //   arr_fZPixel.push(fZPixel); 
      // };

      // const fObj_group_zPixel = new fabric.Group(arr_fZPixel);
      // fObj_group_zPixel.arr_dict_zPixel = arr_dict_zPixel;
      */

      const fObj_group_zPixel = new fabric.Group([]);
      fObj_group_zPixel.arr_dict_zPixel = arr_dict_zPixel;

      //compute dict_truePoint__group
      function createDict_zPixelRect__group(arr_dict_zPixel) {

        const ix__min = Decimal.min(...arr_dict_zPixel.map((dict_zPixel) => dict_zPixel.zPixelCoords.ix)); 
        const ix__max = Decimal.max(...arr_dict_zPixel.map((dict_zPixel) => dict_zPixel.zPixelCoords.ix));
        const iy__min = Decimal.min(...arr_dict_zPixel.map((dict_zPixel) => dict_zPixel.zPixelCoords.iy)); 
        const iy__max = Decimal.max(...arr_dict_zPixel.map((dict_zPixel) => dict_zPixel.zPixelCoords.iy));
        // logger.log("logZPixel", "createFZPixelGroup", {
        //   ix__min: ix__min.toString(),
        //   ix__max: ix__max.toString(),
        //   iy__min: iy__min.toString(),
        //   iy__max: iy__max.toString(),
        // });

        const truePoint__group__TL = {
          x: arr_dict_zPixel.find((dict_zPixel) => (dict_zPixel.zPixelCoords.ix.equals(ix__min))).dict_truePoint.tl.x,
          y: arr_dict_zPixel.find((dict_zPixel) => (dict_zPixel.zPixelCoords.iy.equals(iy__min))).dict_truePoint.tl.y,
        };
  
        const iwidth  = Decimal.add( Decimal.sub(ix__max, ix__min) , new Decimal(1) );
        const iheight = Decimal.add( Decimal.sub(iy__max, iy__min) , new Decimal(1) );


        //create zPixelUnit
        const dict_zPixel__first    = arr_dict_zPixel[0];
        const dict_truePoint__first = dict_zPixel__first.dict_truePoint;

        const t__toUnitSquare__TL__first = ICUtils.createTransform__parallelogramToUnitSquare__TL(dict_truePoint__first);

        const t__translation1 = ICUtils.calcTranslateMatrix({
          translateX: Decimal.sub( ix__min , dict_zPixel__first.zPixelCoords.ix ),
          translateY: Decimal.sub( iy__min , dict_zPixel__first.zPixelCoords.iy ),
        });
        const t_ic__toZPixelUnit = ICUtils.transferTransform(t__translation1, ICUtils.invertTransform(t__toUnitSquare__TL__first));

        const dict_truePoint__zPixelUnit = ICUtils.transformDict_parallelogram(dict_truePoint__first, t_ic__toZPixelUnit);



        //scale
        const t__toUnitSquare__TL = ICUtils.createTransform__parallelogramToUnitSquare__TL(dict_truePoint__zPixelUnit);

        const t__scale = ICUtils.calcScaleMatrix({
          scaleX: iwidth,
          scaleY: iheight,
        });

        const t_ic = ICUtils.transferTransform(t__scale, ICUtils.invertTransform(t__toUnitSquare__TL));

        const dict_truePoint__group = ICUtils.transformDict_parallelogram(dict_truePoint__zPixelUnit, t_ic);

        const dict_zPixelRect__group = {
          zPixelRectCoords: {
            zLevel:   dict_truePoint__zPixelUnit.zLevel,
            ix:       ix__min,
            iy:       iy__min,
            iwidth:   iwidth,
            iheight:  iheight,
          },
          dict_truePoint:   dict_truePoint__group,
          dict_screenPoint: null,  //can be computed using dict_truePoint
        };

        return dict_zPixelRect__group;
      }

      fObj_group_zPixel.dict_zPixelRect = createDict_zPixelRect__group(arr_dict_zPixel);

      return fObj_group_zPixel;
    },




    _captureDrawingZPixelPath: function(pointer) {
      const dict_zPixel = this.getDict_zPixel(pointer);

      return this._addZPixel(dict_zPixel);
    },

    _drawZPixel: function(ctx, dict_zPixel) {
      // const screenRect__zPixel = dict_zPixel.screenRect;
      // ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);

      const dict_screenPoint = dict_zPixel.dict_screenPoint;
      {
        const arr_point = [
          dict_screenPoint.tl,
          dict_screenPoint.tr,
          dict_screenPoint.br,
          dict_screenPoint.bl,
        ];

        const x = 0;
        const y = 0;

        ctx.beginPath();
        ctx.moveTo(arr_point[0].x - x, arr_point[0].y - y);
        for (var i = 0; i < arr_point.length; i++) {
          const point = arr_point[i];
          ctx.lineTo(point.x - x, point.y - y);
        }
        ctx.closePath();

        ctx.save();
        ctx.fill();
        ctx.restore();

      }

    },

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