function installFabricBrushPreviewUpgrade(fabricCanvas) {
  logger.log("logFabric", "installFabricBrushPreviewUpgrade");

  fabricCanvas._onMouseMoveInDrawingMode = (function(e) {
    // logger.log("logBrushPreview", "_onMouseMoveInDrawingMode", "this:", this, "e:", e);

    const fabricCanvas = this;

    var pointer = this.getPointer(e);
    if (fabricCanvas._isCurrentlyDrawing) {
      fabricCanvas.freeDrawingBrush.onMouseMove(pointer, { e: e, pointer: pointer });
    } else {
      // logger.log("logPreview", "_onMouseMoveInDrawingMode", e, this.freeDrawingBrush);
      if("onMouseMove__preview" in fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.onMouseMove__preview(pointer, { e: e, pointer: pointer });
      }
    }
    fabricCanvas.setCursor(fabricCanvas.freeDrawingCursor);
    fabricCanvas._handleEvent(e, 'move');
  }).bind(fabricCanvas);

}

class BrushPreview {

  static decorate(brush__src) {

    //get class of brush
    const class__src = brush__src.constructor;
    // logger.log("logBrushUpgrade", "class__src:", class__src);
  
    class PreviewXBrush extends DecorationUtils.createDecoratorClass(class__src, {
  
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
        // logger.log("logComb", "_setBrushStyles__preview", this);
        this._setBrushStyles(ctx);
          
        ctx.strokeStyle = this.getColor__preview();
        // ctx.fillStyle   = this.getColor__preview();
      },
  
      onMouseMove__preview: function(pointer, options) {
        // logger.log("logPreview", "onMouseMove__preview", brush, pointer, options);
  
        if(DecorationUtils.getWrappedObj(this).onMouseMove__preview != null) {
          DecorationUtils.getWrappedObj(this).onMouseMove__preview(pointer, options);
        } else {
          var p = new fabric.Point(pointer.x, pointer.y);
    
          // const ctx = this.canvas.contextContainer;
          const ctx = this.canvas.contextTop;
      
          if(this.parentBrush == null) {
            this.canvas.clearContext(ctx);
          }
      
          // ctx.save();
      
          this._setBrushStyles__preview(ctx);
          
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          
          // ctx.restore();
        }
  
      },
  
      clearPreview: function() {
        const ctx = this.canvas.contextTop;
        if(this.parentBrush == null) {
          this.canvas.clearContext(ctx);
        }
      },
  
      _prepareForDrawing: function(pointer) {
        // logger.log("logPreview", "_prepareForDrawing", pointer);
        const brush = this;
        
        brush.clearPreview();
        DecorationUtils.getWrappedObj(brush)._prepareForDrawing(pointer);
      },
  
    }) {}
  
    const brush__preview = PreviewXBrush.decorate(brush__src);
    return brush__preview;
  }

}