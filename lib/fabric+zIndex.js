function installFabricCanvasUpgrade__zIndex(fabricCanvas) {
  // logger.log("logFabric", "installFabricCanvasUpgrade__zIndex");

  fabricCanvas.render_below_zIndex = (function(ctx, zIndex__fabric) {
    // logger.trace("logFDZ", "fabricCanvas.render_below_zIndex", ctx, zIndex__fabric);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(0,zIndex__fabric).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_above_zIndex = (function(ctx, zIndex__fabric) {
    // logger.trace("logFDZ", "fabricCanvas.render_above_zIndex", ctx, zIndex__fabric);

    const arr_fObj = this._objects;
    
    arr_fObj.slice(zIndex__fabric).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

  fabricCanvas.render_between_zIndexes = (function(ctx, zIndex__fabric__1, zIndex__fabric__2) {
    // logger.trace("logFDZ", "fabricCanvas.render_between_zIndexes", ctx, zIndex__fabric__1, zIndex__fabric__2);
    
    const arr_fObj = this._objects;

    arr_fObj.slice(zIndex__fabric__1,zIndex__fabric__2).forEach((fObj) => {
      fObj.render(ctx);
    });

  }).bind(fabricCanvas);

}