function brushUpgrade__pathWithBrushProperty(brush) {
  logger.log("logFabric", "brushUpgrade__pathWithBrushProperty", brush);

  brush.createPath__old = brush.createPath.bind(brush);
  brush.createPath = (function(pathData) {
    var path = brush.createPath__old(pathData);

    path.__brush = this;

    return path;
  }).bind(brush);

}