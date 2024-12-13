function installFabricZPixelRectSelectionBrush(fabricCanvas) {
  logger.log("logFabric", "installFabricZPixelRectSelectionBrush");

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
  
  class ZPixelRectSelectionBrush extends DecorationUtils.createDecoratorClass(fabric.ZPixelRectBrush, {

    //   //some preview funcs

    // _setBrushStyles__preview: function(ctx) {
    //   // logger.log("ZPixelRectBrush", "_setBrushStyles__preview", this);
    //   this._setBrushStyles(ctx);
        
    //   ctx.strokeStyle = "black";
    //   ctx.fillStyle   = this.getColor__preview();
    // },

    // onMouseMove__preview: function(pointer, options) {
    //   // logger.log("ZPixelRectBrush", "onMouseMove__preview", this, pointer, options);
    //   var p = new fabric.Point(pointer.x, pointer.y);
  
    //   // const ctx = this.canvas.contextContainer;
    //   const ctx = this.canvas.contextTop;
  
    //   if(this.parentBrush == null) {
    //     this.canvas.clearContext(ctx);
    //   }
  
    //   // ctx.save();
  
    //   this._setBrushStyles__preview(ctx);

    //   const dict_zPixel = this.getDict_zPixel(pointer);
    //   // logger.log("logZPixelRectFD", "onMouseMove__preview", "dict_zPixel:", dict_zPixel);

    //   const screenRect__zPixel = dict_zPixel.screenRect;
    //   // const homeScale__zPixel  = dict_zPixel.homeScale;
      
    //   ctx.fillRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);
    //   ctx.strokeRect(screenRect__zPixel.x, screenRect__zPixel.y, screenRect__zPixel.width, screenRect__zPixel.height);

    //   // ctx.restore();
    // },


    //"selection engine"
    // {

    arr_listener: [],

    onSelect: function(listener) {
      if(!this.arr_listener.includes(listener)) {
        this.arr_listener.push(listener);
      }
    },

    offSelect: function(listener) {
      if(this.arr_listener.includes(listener)) {
        this.arr_listener = Utils.arrayByRemovingElement(this.arr_listener, listener);
      }
    },

    // }


    onMouseUp: function(options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return true;
      }
      // this.drawStraightLine = false;
      // this.oldEnd = undefined;
      this._finalizeAndSelect();
      return false;
    },

    _finalizeAndSelect: function(options) {
      const brush = this;

      const dict_zPixelRect = Object.assign({}, this.dict_zPixelRect);

      brush._reset();   //forget zPixelRect
      brush._render();  //=> render nothing
      
      brush.arr_listener.forEach((listener) => {
        listener(dict_zPixelRect);
      });

    },

  }) {}

  ZPixelRectSelectionBrush.createInstance = function(fabricCanvas) {
    const brush__zPixelRect = fabric.ZPixelRectBrush.createInstance(fabricCanvas);
    brushUpgrade__preview(brush__zPixelRect);     //SHU: a bit ugly (mais que voulez-vous ma petite dame...) 
    const selectionBrush__zPixelRect = ZPixelRectSelectionBrush.decorate(brush__zPixelRect);
    return selectionBrush__zPixelRect;
  };

  fabric.ZPixelRectSelectionBrush = ZPixelRectSelectionBrush;

})();