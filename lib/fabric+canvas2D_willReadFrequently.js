function installFabricUpgrade_Canvas2DWillReadFrequently(fabric) {
  //logger.log("logFabric", "installFabricUpgrade_Canvas2DWillReadFrequently");

  //rewrite all initial calls to getContext(...) to getContext(..., { willReadFrequently: true })

  fabric.StaticCanvas.prototype._createLowerCanvas = function (canvasEl) {
    // canvasEl === 'HTMLCanvasElement' does not work on jsdom/node
    if (canvasEl && canvasEl.getContext) {
      this.lowerCanvasEl = canvasEl;
    }
    else {
      this.lowerCanvasEl = fabric.util.getById(canvasEl) || this._createCanvasElement();
    }

    fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');
    this._originalCanvasStyle = this.lowerCanvasEl.style;
    if (this.interactive) {
      this._applyCanvasStyle(this.lowerCanvasEl);
    }

    //---
    // this.contextContainer = this.lowerCanvasEl.getContext('2d'); 
    //---
    //+++
    this.contextContainer = this.lowerCanvasEl.getContext('2d', { willReadFrequently: true });
    //+++
  };

  fabric.Canvas.prototype._createUpperCanvas = function () {
    var lowerCanvasClass = this.lowerCanvasEl.className.replace(/\s*lower-canvas\s*/, ''),
        lowerCanvasEl = this.lowerCanvasEl, upperCanvasEl = this.upperCanvasEl;

    // there is no need to create a new upperCanvas element if we have already one.
    if (upperCanvasEl) {
      upperCanvasEl.className = '';
    }
    else {
      upperCanvasEl = this._createCanvasElement();
      this.upperCanvasEl = upperCanvasEl;
    }
    fabric.util.addClass(upperCanvasEl, 'upper-canvas ' + lowerCanvasClass);

    this.wrapperEl.appendChild(upperCanvasEl);

    this._copyCanvasStyle(lowerCanvasEl, upperCanvasEl);
    this._applyCanvasStyle(upperCanvasEl);
    
    //---
    // this.contextTop = upperCanvasEl.getContext('2d'); 
    //---
    //+++
    this.contextTop = upperCanvasEl.getContext('2d', { willReadFrequently: true });
    //+++
  };

  fabric.Canvas.prototype._createCacheCanvas = function () {
    this.cacheCanvasEl = this._createCanvasElement();
    this.cacheCanvasEl.setAttribute('width', this.width);
    this.cacheCanvasEl.setAttribute('height', this.height);

    //---
    // this.contextCache = this.cacheCanvasEl.getContext('2d'); 
    //---
    //+++
    this.contextCache = this.cacheCanvasEl.getContext('2d', { desynchronized: true, willReadFrequently: true });
    //+++
  };

    //a fabric object 'is' a cached canvas
  fabric.Object.prototype._createCacheCanvas = function() {
    this._cacheProperties = {};
    this._cacheCanvas = fabric.util.createCanvasElement();

    //---
    // this._cacheContext = this._cacheCanvas.getContext('2d'); 
    //---
    //+++
    this._cacheContext = this._cacheCanvas.getContext('2d', { desynchronized: true, willReadFrequently: true });
    //+++

    this._updateCacheCanvas();
    // if canvas gets created, is empty, so dirty.
    this.dirty = true;
  };

  //debug
  // const isTransparent__orig = fabric.util.isTransparent;
  // fabric.util.isTransparent = function(ctx, x, y, tolerance) {
  //   // logger.log("logFabricUtil", "isTransparent", "ctx:", ctx);

  //   const isContextContainer = (ctx == fabricIntegration.fabricCanvas.contextContainer); 
  //   const isContextTop       = (ctx == fabricIntegration.fabricCanvas.contextTop); 
  //   const isContextCache     = (ctx == fabricIntegration.fabricCanvas.contextCache); 
  //   logger.log("logFabricUtil", "isTransparent", "isContextContainer:", isContextContainer);
  //   logger.log("logFabricUtil", "isTransparent", "isContextTop:", isContextTop);
  //   logger.log("logFabricUtil", "isTransparent", "isContextCache:", isContextCache);

  //   if(!isContextContainer && !isContextTop && !isContextCache) {
  //     logger.trace("logFabricUtil", "isTransparent", "ctx:", ctx);
  //   }

  //   isTransparent__orig(ctx, x, y, tolerance);
  // };


  /*
  fabric.WebglFilterBackend.prototype.createWebGLCanvas = function(width, height) {
    var canvas = fabric.util.createCanvasElement();
    canvas.width = width;
    canvas.height = height;
    var glOptions = {
          alpha: true,
          premultipliedAlpha: false,
          depth: false,
          stencil: false,
          antialias: false
        },
        gl = canvas.getContext('webgl', glOptions);
    if (!gl) {
      gl = canvas.getContext('experimental-webgl', glOptions);
    }
    if (!gl) {
      return;
    }
    gl.clearColor(0, 0, 0, 0);
    // this canvas can fire webglcontextlost and webglcontextrestored
    this.canvas = canvas;
    this.gl = gl;
  };
  */


}

