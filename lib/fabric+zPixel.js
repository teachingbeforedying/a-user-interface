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

    /**
     * zLevel of this zPixel
     * @type Number
     * @default
     */
    zLevel: 0,

    cacheProperties: fabric.Rect.prototype.cacheProperties.concat('ix','iy','zLevel'),

    /**
     * Constructor
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      this._initStrokeWidth();
    },

    /**
     * Initializes strokeWidth attribute
     * @private
     */
    _initStrokeWidth: function() {
      this.strokeWidth = 0; 
    },

    /**
     * @private
     * @param {String} key
     * @param {*} value
     * @return {fabric.ZPixel} thisArg
     */
    _set: function(key, value) {
      this.callSuper('_set', key, value);

      if (key === 'ix') {
        this.setIx(value);
      }
      if (key === 'iy') {
        this.setIy(value);
      }
      if (key === 'zLevel') {
        this.setZLevel(value);
      }

      return this;
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['ix','iy','zLevel'].concat(propertiesToInclude));
    },

    /* _TO_SVG_START_ */

    /**
     * Returns svg representation of an instance
     * @return {Array} an array of strings with the specific svg representation
     * of the instance
     */
    _toSVG: function() {
      var svgString = "";

      throw new Error("zPixel._toSVG", "not implemented yet (TODO)"); 

      return svgString;
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
     * Sets zLevel of an object
     * @return {fabric.ZPixel} thisArg
     */
    setZLevel: function(value) {
      this.zLevel = value;
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
   * List of attribute names to account for when parsing SVG element (used by {@link fabric.ZPixel.fromElement})
   * @static
   * @memberOf fabric.ZPixel
   */
  fabric.ZPixel.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat('cx cy r'.split(' '));

  /**
   * Returns {@link fabric.ZPixel} instance from an SVG element
   * @static
   * @memberOf fabric.ZPixel
   * @param {SVGElement} element Element to parse
   * @param {Function} [callback] Options callback invoked after parsing is finished
   * @param {Object} [options] Options object
   * @throws {Error} If value of `r` attribute is missing or invalid
   */
  fabric.ZPixel.fromElement = function(element, callback) {
    var parsedAttributes = fabric.parseAttributes(element, fabric.ZPixel.ATTRIBUTE_NAMES);

    if (!isValidRadius(parsedAttributes)) {
      throw new Error('value of `r` attribute is required and can not be negative');
    }

    parsedAttributes.left = (parsedAttributes.left || 0) - parsedAttributes.radius;
    parsedAttributes.top = (parsedAttributes.top || 0) - parsedAttributes.radius;
    callback(new fabric.ZPixel(parsedAttributes));
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