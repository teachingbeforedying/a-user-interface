function installFabricStraightStrokeUpgrade(fabricCanvas) {


}

(function () {
  /**
   * StraightStrokePencilBrush class (decorator)
   * @class fabric.StraightStrokePencilBrush
   * @extends fabric.PencilBrush
   * 
   */
  class StraightStrokePencilBrush extends DecorationUtils.createDecoratorClass(fabric.PencilBrush, {


      // drawStraightLine: true,
      // straightLineKey: "shiftKey",

      createMouseEvent__masquerade: function(eType, mouseEvent) {
        // logger.log("logSSPencilBrush", "createMouseEvent__masquerade", eType, mouseEvent);

        const straightLineKey = DecorationUtils.getWrappedObj(this).straightLineKey;
        // logger.log("logSSPencilBrush", "straightLineKey:", straightLineKey);

        //------DOES NOT WORK--------
        // const dict__masquerade = Object.entries(mouseEvent).reduce((acc, [k, v]) => {
        //   logger.log("logSSPencilBrush", "[k, v]:", [k, v]);
          
        //   if(k == straightLineKey) {
        //     logger.log("logSSPencilBrush", "k == straightLineKey");
        //     acc[k] = true;
        //   } else {
        //     acc[k] = v;
        //   }

        //   return acc;
        // }, {});

        // const mouseEvent__masquerade = new MouseEvent(eType, dict__masquerade);
        // logger.log("logSSPencilBrush", "mouseEvent__masquerade:", mouseEvent__masquerade);
        //----------------------------

        //WORKS
        const mouseEvent__masquerade = new MouseEvent(eType, {
          // isTrusted: false,
          isTrusted: true,

          altKey :              mouseEvent.altKey, 
          bubbles :             mouseEvent.bubbles,
          button :              mouseEvent.button,
          buttons :             mouseEvent.buttons,
          cancelBubble :        mouseEvent.cancelBubble,
          cancelable :          mouseEvent.cancelable,
          clientX:              mouseEvent.clientX,
          clientY:              mouseEvent.clientY,
          composed:             mouseEvent.composed,
          ctrlKey:              mouseEvent.ctrlKey,
          currentTarget:        mouseEvent.currentTarget,
          defaultPrevented:     mouseEvent.defaultPrevented,
          detail:               mouseEvent.detail,
          eventPhase:           mouseEvent.eventPhase,
          fromElement:          mouseEvent.fromElement,
          layerX:               mouseEvent.layerX,
          layerY:               mouseEvent.layerY,
          metaKey:              mouseEvent.metaKey,
          movementX:            mouseEvent.movementX,
          movementY:            mouseEvent.movementY,
          offsetX:              mouseEvent.offsetX,
          offsetY:              mouseEvent.offsetY,
          pageX:                mouseEvent.pageX,
          pageY:                mouseEvent.pageY,
          relatedTarget:        mouseEvent.relatedTarget,
          returnValue:          mouseEvent.returnValue,
          screenX:              mouseEvent.screenX,
          screenY:              mouseEvent.screenY,
          shiftKey:             mouseEvent.shiftKey,
          sourceCapabilities:   mouseEvent.sourceCapabilities,
          srcElement:           mouseEvent.srcElement,
          target:               mouseEvent.target,
          timeStamp:            mouseEvent.timeStamp,
          toElement:            mouseEvent.toElement,
          view:                 mouseEvent.view,
          which:                mouseEvent.which,
          x:                    mouseEvent.x,
          y:                    mouseEvent.y,

          //injection
          [straightLineKey]:    true,
        });

        return mouseEvent__masquerade;
      },


      onMouseDown: function(pointer, options) {
        // logger.log("logSSPencilBrush", "onMouseDown:", pointer, options);

        //force options.e[this.straightLineKey]:true
        const mouseEvent__src        = options.e;
        const mouseEvent__masquerade = this.createMouseEvent__masquerade(mouseEvent__src.type, mouseEvent__src);

        const options__masquerade = Object.assign({}, options);
        options__masquerade.e = mouseEvent__masquerade;

        DecorationUtils.getWrappedObj(this).onMouseDown(pointer, options__masquerade);
      },

      onMouseMove: function(pointer, options) {

        //force options.e[this.straightLineKey]:true
        const mouseEvent__src        = options.e;
        const mouseEvent__masquerade = this.createMouseEvent__masquerade(mouseEvent__src.type, mouseEvent__src);

        const options__masquerade = Object.assign({}, options);
        options__masquerade.e = mouseEvent__masquerade;
        
        DecorationUtils.getWrappedObj(this).onMouseMove(pointer, options__masquerade);
      },

      // onMouseUp: function(options) {
      //   DecorationUtils.getWrappedObj(this).onMouseUp(options);
      // },


  }) {}

  StraightStrokePencilBrush.createInstance = function(fabricCanvas) {
    const brush__pencil   = new fabric.PencilBrush(fabricCanvas);
    
    const brush__ssPencil = StraightStrokePencilBrush.decorate(brush__pencil, DecorationUtils.createInitializationDict({}));

    return brush__ssPencil;
  };

  fabric.StraightStrokePencilBrush = StraightStrokePencilBrush; 

})();