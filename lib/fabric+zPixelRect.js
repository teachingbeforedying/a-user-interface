(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.ZPixelRect) {
    fabric.warn('fabric.ZPixelRect is already defined.');
    return;
  }

  /**
   * ZPixelRect class
   * @class fabric.ZPixelRect
   * @extends fabric.Rect
   * @see {@link fabric.ZPixelRect#initialize} for constructor definition
   */
  fabric.ZPixelRect = fabric.util.createClass(fabric.Rect, /** @lends fabric.ZPixelRect.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'zPixelRect',

    /**
     * zLevel of this zPixelRect
     * @type Number
     * @default
     */
    zLevel: 0,

    /**
     * ix of this zPixelRect
     * @type Number
     * @default
     */
    ix: 0,

    /**
     * iy of this zPixelRect
     * @type Number
     * @default
     */
    iy: 0,

    /**
     * iwidth of this zPixelRect
     * @type Number
     * @default
     */
    iwidth: 0,

    /**
     * iheight of this zPixelRect
     * @type Number
     * @default
     */
    iheight: 0,



    cacheProperties: fabric.Rect.prototype.cacheProperties.concat('zLevel', 'ix','iy', 'iwidth', 'iheight'),

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
     * @return {fabric.ZPixelRect} thisArg
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
      if (key === 'iwidth') {
        this.setIwidth(value);
      }
      if (key === 'iheight') {
        this.setIheight(value);
      }

      return this;
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['zLevel','ix','iy','iwidth','iheight'].concat(propertiesToInclude));
    },

    /* _TO_SVG_START_ */

    /**
     * Returns svg representation of an instance
     * @return {Array} an array of strings with the specific svg representation
     * of the instance
     */
    _toSVG: function() {
      var svgString = "";

      throw new Error("zPixelRect._toSVG", "not implemented yet (TODO)"); 

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
     * Sets zLevel of an object
     * @return {fabric.ZPixelRect} thisArg
     */
    setZLevel: function(value) {
      this.zLevel = value;
      return true;
    },

    /**
     * Sets ix of an object
     * @return {fabric.ZPixelRect} thisArg
     */
    setIx: function(value) {
      this.ix = value;
      return true;
    },

    /**
     * Sets iy of an object
     * @return {fabric.ZPixelRect} thisArg
     */
    setIy: function(value) {
      this.iy = value;
      return true;
    },

    /**
     * Sets iwidth of an object
     * @return {fabric.ZPixelRect} thisArg
     */
    setIwidth: function(value) {
      this.iwidth = value;
      return true;
    },

    /**
     * Sets iheight of an object
     * @return {fabric.ZPixelRect} thisArg
     */
    setIheight: function(value) {
      this.iheight = value;
      return true;
    },

    /**
     * prevents strokeWidth from being changed
     * @return {fabric.ZPixelRect} thisArg
     */
    setStrokeWidth: function(value) {
      //ignore
      return false;
    },

  });

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link fabric.ZPixelRect.fromElement})
   * @static
   * @memberOf fabric.ZPixelRect
   */
  fabric.ZPixelRect.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat('cx cy r'.split(' '));

  /**
   * Returns {@link fabric.ZPixelRect} instance from an SVG element
   * @static
   * @memberOf fabric.ZPixelRect
   * @param {SVGElement} element Element to parse
   * @param {Function} [callback] Options callback invoked after parsing is finished
   * @param {Object} [options] Options object
   * @throws {Error} If value of `r` attribute is missing or invalid
   */
  fabric.ZPixelRect.fromElement = function(element, callback) {
    var parsedAttributes = fabric.parseAttributes(element, fabric.ZPixelRect.ATTRIBUTE_NAMES);

    if (!isValidRadius(parsedAttributes)) {
      throw new Error('value of `r` attribute is required and can not be negative');
    }

    parsedAttributes.left = (parsedAttributes.left || 0) - parsedAttributes.radius;
    parsedAttributes.top = (parsedAttributes.top || 0) - parsedAttributes.radius;
    callback(new fabric.ZPixelRect(parsedAttributes));
  };
  /* _FROM_SVG_END_ */

  /**
   * Returns {@link fabric.ZPixelRect} instance from an object representation
   * @static
   * @memberOf fabric.ZPixelRect
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] invoked with new instance as first argument
   * @return {void}
   */
  fabric.ZPixelRect.fromObject = function(object, callback) {
    fabric.Object._fromObject('ZPixelRect', object, callback);
  };

})(typeof exports !== 'undefined' ? exports : this);