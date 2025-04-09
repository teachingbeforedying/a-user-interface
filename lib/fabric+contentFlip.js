function installFabricUpgrade_fabricXcontentFlip(fabric) {
  //logger.log("logFabric", "installFabricUpgrade_fabricXcontentFlip");

  //contentFlip: flip what is inside object, don't change object's transform

  fabric.Object.prototype.transform = function(ctx) {
    var needFullTransform = (this.group && !this.group._transformDone) ||
        (this.group && this.canvas && ctx === this.canvas.contextTop);
    var m = this.calcTransformMatrix(!needFullTransform);

    //+++
    if(this.contentFlipX) {
      const m__contentFlipX = [-1, 0 , 0 , 1 , 0, 0];
      m = fabric.util.multiplyTransformMatrices(m, m__contentFlipX);
    } 
    if(this.contentFlipY) {
      const m__contentFlipY = [1, 0 , 0 , -1 , 0, 0];
      m = fabric.util.multiplyTransformMatrices(m, m__contentFlipY);
    } 
    //+++

    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  };


}
