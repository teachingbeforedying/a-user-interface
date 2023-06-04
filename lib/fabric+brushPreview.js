function installFabricBrushPreviewUpgrade(fabricCanvas) {
  logger.log("logFabric", "installFabricBrushPreviewUpgrade");

  fabricCanvas._onMouseMoveInDrawingMode = (function(e) {
    var pointer = this.getPointer(e);
    if (this._isCurrentlyDrawing) {
      this.freeDrawingBrush.onMouseMove(pointer, { e: e, pointer: pointer });
    } else {
      logger.log("logPreview", "_onMouseMoveInDrawingMode", e, this.freeDrawingBrush);
      if("onMouseMove__preview" in this.freeDrawingBrush) {
        this.freeDrawingBrush.onMouseMove__preview(pointer, { e: e, pointer: pointer });
      }
    }
    this.setCursor(this.freeDrawingCursor);
    this._handleEvent(e, 'move');
  }).bind(fabricCanvas);

}

function previewBrush__upgrade(brush) {

  brush.getOpacity__preview = (function() {
    return 0.32;
  }).bind(brush);

  brush.getColor__preview = (function() {
    // logger.log("logPreview", "this.color", this.color);
    const fColor__clone   = new fabric.Color(this.color);

    const opacity__preview = this.getOpacity__preview();
    const fColor__preview  = fColor__clone.setAlpha(opacity__preview);

    const color__preview   = fColor__preview.toRgba();

    return color__preview;
  }).bind(brush);

  brush.onMouseMove__preview = (function(pointer, options) {
    logger.log("logPreview", "onMouseMove__preview", brush, pointer, options);
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

  }).bind(brush);


  brush._setBrushStyles__preview = (function(ctx) {
    logger.log("logComb", "_setBrushStyles__preview", this);
    this._setBrushStyles(ctx);
      
    ctx.strokeStyle = this.getColor__preview();
  }).bind(brush);

  brush.clearPreview = (function() {
    const ctx = this.canvas.contextTop;
    if(this.parentBrush == null) {
      this.canvas.clearContext(ctx);
    }
  }).bind(brush);


  brush._prepareForDrawing__old = brush._prepareForDrawing.bind(brush);
  brush._prepareForDrawing = (function(pointer) {
    logger.log("logPreview", "_prepareForDrawing", pointer);
    brush.clearPreview();
    brush._prepareForDrawing__old(pointer);
  }).bind(brush);

  

}