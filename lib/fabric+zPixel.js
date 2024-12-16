(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.ZPixel) {
    fabric.warn('fabric.ZPixel is already defined.');
    return;
  }

  // /**
  //  * ZPixel class
  //  * @class fabric.ZPixel
  //  * @extends fabric.Object
  //  * @see {@link fabric.ZPixel#initialize} for constructor definition
  //  */
  // fabric.ZPixel = fabric.util.createClass(fabric.Object, /** @lends fabric.ZPixel.prototype */ {

  //   /**
  //    * Type of an object
  //    * @type String
  //    * @default
  //    */
  //   type: 'zPixel',

  //   /**
  //    * ix of this zPixel
  //    * @type Number
  //    * @default
  //    */
  //   ix: 0,

  //   /**
  //    * iy of this zPixel
  //    * @type Number
  //    * @default
  //    */
  //   iy: 0,

  //   /**
  //    * zLevel of this zPixel
  //    * @type Number
  //    * @default
  //    */
  //   zLevel: 0,

  //   cacheProperties: fabric.Object.prototype.cacheProperties.concat('ix','iy','zLevel'),

  //   /**
  //    * @private
  //    * @param {String} key
  //    * @param {*} value
  //    * @return {fabric.ZPixel} thisArg
  //    */
  //   _set: function(key, value) {
  //     this.callSuper('_set', key, value);

  //     if (key === 'ix') {
  //       this.setIx(value);
  //     }
  //     if (key === 'iy') {
  //       this.setIy(value);
  //     }
  //     if (key === 'zLevel') {
  //       this.setZLevel(value);
  //     }

  //     return this;
  //   },

  //   /**
  //    * Returns object representation of an instance
  //    * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
  //    * @return {Object} object representation of an instance
  //    */
  //   toObject: function(propertiesToInclude) {
  //     return this.callSuper('toObject', ['ix','iy','zLevel'].concat(propertiesToInclude));
  //   },

  //   /* _TO_SVG_START_ */

  //   /**
  //    * Returns svg representation of an instance
  //    * @return {Array} an array of strings with the specific svg representation
  //    * of the instance
  //    */
  //   _toSVG: function() {
  //     var svgString = "";

  //     throw new Error("zPixel._toSVG", "not implemented yet (TODO)"); 

  //     return svgString;
  //   },
  //   /* _TO_SVG_END_ */

  //   /**
  //    * @private
  //    * @param {CanvasRenderingContext2D} ctx context to render on
  //    */
  //   _render: function(ctx) {
  //     ctx.fillRect(this.x, this.y, this.width, this.height);
  //     this._renderPaintInOrder(ctx);
  //   },

  //   /**
  //    * Sets ix of an object
  //    * @return {fabric.ZPixel} thisArg
  //    */
  //   setIx: function(value) {
  //     this.ix = value;
  //     return true;
  //   },

  //   /**
  //    * Sets iy of an object
  //    * @return {fabric.ZPixel} thisArg
  //    */
  //   setIy: function(value) {
  //     this.iy = value;
  //     return true;
  //   },

  //   /**
  //    * Sets zLevel of an object
  //    * @return {fabric.ZPixel} thisArg
  //    */
  //   setZLevel: function(value) {
  //     this.zLevel = value;
  //     return true;
  //   },

  // });

  /**
   * ZPixel class
   * @class fabric.ZPixel
   * @extends fabric.Rect
   * @see {@link fabric.ZPixel#initialize} for constructor definition
   */
  fabric.ZPixel = fabric.util.createClass(fabric.Rect, /** @lends fabric.ZPixel.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'zPixel',

    /**
     * zLevel of this zPixel
     * @type Number
     * @default
     */
    zLevel: 0,

    /**
     * ix of this zPixel
     * @type Number
     * @default
     */
    ix: 0,

    /**
     * iy of this zPixel
     * @type Number
     * @default
     */
    iy: 0,



    cacheProperties: fabric.Rect.prototype.cacheProperties.concat('zLevel', 'ix','iy'),

    /**
     * Constructor
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      this._initStrokeWidth();
      this._initRxRy();
    },

    /**
     * Initializes strokeWidth attribute
     * @private
     */
    _initStrokeWidth: function() {
      this.strokeWidth = 0; 
    },

    /**
     * Initializes rx ry attributes
     * @private
     */
    _initRxRy: function() {
      this.rx = 0;
      this.ry = 0;
    },


    /**
     * @private
     * @param {String} key
     * @param {*} value
     * @return {fabric.ZPixel} thisArg
     */
    _set: function(key, value) {
      this.callSuper('_set', key, value);

      if (key === 'zLevel') {
        this.setZLevel(value);
      }
      if (key === 'ix') {
        this.setIx(value);
      }
      if (key === 'iy') {
        this.setIy(value);
      }

      return this;
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['zLevel', 'ix','iy'].concat(propertiesToInclude));
    },

    /* _TO_SVG_START_ */

    /**
     * Returns svg representation of an instance
     * @return {Array} an array of strings with the specific svg representation
     * of the instance
     */
    // _toSVG: function() {
    //   var svgString = "";

    //   // throw new Error("zPixel._toSVG", "not implemented yet (TODO)"); 

    //   var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
    //   textBgRects.push(
    //     '\t\t<rect ',
    //     this._getFillAttributes(this.backgroundColor),
    //     ' x="',
    //     toFixed(-this.width / 2, NUM_FRACTION_DIGITS),
    //     '" y="',
    //     toFixed(-this.height / 2, NUM_FRACTION_DIGITS),
    //     '" width="',
    //     toFixed(this.width, NUM_FRACTION_DIGITS),
    //     '" height="',
    //     toFixed(this.height, NUM_FRACTION_DIGITS),
    //     '"></rect>\n');

    //   return svgString;
    // },

    _toSVG: function() {
      var x = -this.width / 2, y = -this.height / 2;
      return [
        '<rect ', 'COMMON_PARTS',
        'x="', x, '" y="', y,
        '" rx="', this.rx, '" ry="', this.ry,
        '" width="', this.width, '" height="', this.height,

        '" zLevel="', this.zLevel, '" ix="', this.ix, '" iy="', this.iy,

        '" />\n'
      ];
    },


    /* _TO_SVG_END_ */

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx context to render on
     */
    _render: function(ctx) {
      // ctx.fillRect(this.x, this.y, this.width, this.height);
      // this._renderPaintInOrder(ctx);

      this.callSuper('_render', ctx);
    },

    /**
     * Sets zLevel of an object
     * @return {fabric.ZPixel} thisArg
     */
    setZLevel: function(value) {
      this.zLevel = value;
      return true;
    },

    /**
     * Sets ix of an object
     * @return {fabric.ZPixel} thisArg
     */
    setIx: function(value) {
      this.ix = value;
      return true;
    },

    /**
     * Sets iy of an object
     * @return {fabric.ZPixel} thisArg
     */
    setIy: function(value) {
      this.iy = value;
      return true;
    },



    /**
     * prevents strokeWidth from being changed
     * @return {fabric.ZPixel} thisArg
     */
    setStrokeWidth: function(value) {
      //ignore
      return false;
    },

  });

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by `fabric.Rect.fromElement`)
   * @static
   * @memberOf fabric.Rect
   * @see: http://www.w3.org/TR/SVG/shapes.html#RectElement
   */
  fabric.ZPixel.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat('x y width height'.split(' '));

  /**
   * Returns {@link fabric.ZPixel} instance from an SVG element
   * @static
   * @memberOf fabric.Rect
   * @param {SVGElement} element Element to parse
   * @param {Function} callback callback function invoked after parsing
   * @param {Object} [options] Options object
   */
  fabric.ZPixel.fromElement = function(element, callback, options) {
    if (!element) {
      return callback(null);
    }
    options = options || { };

    var parsedAttributes = fabric.parseAttributes(element, fabric.ZPixel.ATTRIBUTE_NAMES);
    parsedAttributes.left   = parsedAttributes.left   || 0;
    parsedAttributes.top    = parsedAttributes.top    || 0;
    parsedAttributes.height = parsedAttributes.height || 0;
    parsedAttributes.width  = parsedAttributes.width  || 0;
    
    var zPixel = new fabric.ZPixel(extend((options ? fabric.util.object.clone(options) : { }), parsedAttributes));
    zPixel.visible = zPixel.visible && zPixel.width > 0 && zPixel.height > 0;
    callback(zPixel);
  };
  /* _FROM_SVG_END_ */

  /**
   * Returns {@link fabric.ZPixel} instance from an object representation
   * @static
   * @memberOf fabric.ZPixel
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] invoked with new instance as first argument
   * @return {void}
   */
  fabric.ZPixel.fromObject = function(object, callback) {
    fabric.Object._fromObject('ZPixel', object, callback);
  };

})(typeof exports !== 'undefined' ? exports : this);