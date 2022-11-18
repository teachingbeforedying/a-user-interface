/*
 * FloodFill for fabric.js
 * @author Arjan Haverkamp (av01d)
 * @date October 2018
 */
 
var FloodFill = {

	// Compare subsection of array1's values to array2's values, with an optional tolerance
	withinTolerance: function(array1, offset, array2, tolerance)
	{
		var length = array2.length,
			start = offset + length;
		tolerance = tolerance || 0;

		// Iterate (in reverse) the items being compared in each array, checking their values are
		// within tolerance of each other
		while(start-- && length--) {
			if(Math.abs(array1[start] - array2[length]) > tolerance) {
				return false;
			}
		}

		return true;
	},

	// The actual flood fill implementation
	fill: function(imageData, getPointOffsetFn, point, color, target, tolerance, width, height)
	{
	    var directions = [[1, 0], [0, 1], [0, -1], [-1, 0]],
			coords = [],
			points = [point],
			seen = {},
			key,
			x,
			y,
			offset,
			i,
			x2,
			y2,
			minX = -1,
			maxX = -1,
			minY = -1,
			maxY = -1;

		// Keep going while we have points to walk
		while (!!(point = points.pop())) {
			x = point.x;
			y = point.y;
			offset = getPointOffsetFn(x, y);

			// Move to next point if this pixel isn't within tolerance of the color being filled
			if (!FloodFill.withinTolerance(imageData, offset, target, tolerance)) {
				continue;
			}

			if (x > maxX) { maxX = x; }
			if (y > maxY) { maxY = y; }
			if (x < minX || minX == -1) { minX = x; }
			if (y < minY || minY == -1) { minY = y; }

			// Update the pixel to the fill color and add neighbours onto stack to traverse
			// the fill area
			i = directions.length;
			while (i--) {
				// Use the same loop for setting RGBA as for checking the neighbouring pixels
				if (i < 4) {
					imageData[offset + i] = color[i];
					coords[offset+i] = color[i];
				}

				// Get the new coordinate by adjusting x and y based on current step
				x2 = x + directions[i][0];
				y2 = y + directions[i][1];
				key = x2 + ',' + y2;

				// If new coordinate is out of bounds, or we've already added it, then skip to
				// trying the next neighbour without adding this one
				if (x2 < 0 || y2 < 0 || x2 >= width || y2 >= height || seen[key]) {
					continue;
				}

				// Push neighbour onto points array to be processed, and tag as seen
				points.push({ x: x2, y: y2 });
				seen[key] = true;
			}
		}

		return {
			x: minX,
			y: minY,
			width: maxX-minX,
			height: maxY-minY,
			coords: coords
		}
	}

}; // End FloodFill


// var fcanvas; // Fabric Canvas
// var fillColor = '#f00';
// var fillTolerance = 2;

// function hexToRgb(hex, opacity) {
// 	opacity = Math.round(opacity * 255) || 255;
// 	hex = hex.replace('#', '');
// 	var rgb = [], re = new RegExp('(.{' + hex.length/3 + '})', 'g');
// 	hex.match(re).map(function(l) {
// 		rgb.push(parseInt(hex.length % 2 ? l+l : l, 16));
// 	});
// 	return rgb.concat(opacity);
// }

// function floodFill(enable) {
// 	if (!enable) {
// 		fcanvas.off('mouse:down');
// 		fcanvas.selection = true;
// 		fcanvas.forEachObject(function(object){
// 			object.selectable = true;
// 		});
// 		return;
// 	}
  
// 	fcanvas.deactivateAll().renderAll(); // Hide object handles!
// 	fcanvas.selection = false;
// 	fcanvas.forEachObject(function(object){
// 		object.selectable = false;
// 	});

// 	fcanvas.on({
// 		'mouse:down': function(e) {
// 			var mouse = fcanvas.getPointer(e.e),
// 				mouseX = Math.round(mouse.x), mouseY = Math.round(mouse.y),
// 				canvas = fcanvas.lowerCanvasEl,
// 				context = canvas.getContext('2d'),
// 				parsedColor = hexToRgb(fillColor),
// 				imageData = context.getImageData(0, 0, canvas.width, canvas.height),
// 				getPointOffset = function(x,y) {
// 					return 4 * (y * imageData.width + x)
// 				},
// 				targetOffset = getPointOffset(mouseX, mouseY),
// 				target = imageData.data.slice(targetOffset, targetOffset + 4);

// 			if (FloodFill.withinTolerance(target, 0, parsedColor, fillTolerance)) {
// 				// Trying to fill something which is (essentially) the fill color
// 				console.log('Ignore... same color')
// 				return;
// 			}

// 			// Perform flood fill
// 			var data = FloodFill.fill(
// 				imageData.data,
// 				getPointOffset,
// 				{ x: mouseX, y: mouseY },
// 				parsedColor,
// 				target,
// 				fillTolerance,
// 				imageData.width,
// 				imageData.height
// 			);

// 			if (0 == data.width || 0 == data.height) {
// 				return;
// 			}

// 			var tmpCanvas = document.createElement('canvas'), tmpCtx = tmpCanvas.getContext('2d');
// 			tmpCanvas.width = canvas.width;
// 			tmpCanvas.height = canvas.height;

// 			var palette = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height); // x, y, w, h
// 			palette.data.set(new Uint8ClampedArray(data.coords)); // Assuming values 0..255, RGBA
// 			tmpCtx.putImageData(palette, 0, 0); // Repost the data.
// 			var imgData = tmpCtx.getImageData(data.x, data.y, data.width, data.height); // Get cropped image

// 			tmpCanvas.width = data.width;
// 			tmpCanvas.height = data.height;
// 			tmpCtx.putImageData(imgData,0,0);

// 			// Convert canvas back to image:
// 			var img = new Image();
// 			img.onload = function() {
// 				fcanvas.add(new fabric.Image(img, {
// 					left: data.x,
// 					top: data.y,
// 					selectable: false
// 				}))
// 			};
// 			img.src = tmpCanvas.toDataURL('image/png');      

// 			fcanvas.add(new fabric.Image(tmpCanvas, {
// 				left: data.x,
// 				top: data.y,
//         selectable: false
// 			}))
// 		}
// 	});
// }

// $(function() {
//   // Init UI:
// 	$('#removeObject').on('click', function() {
// 		var obj = fcanvas.getActiveObject();
// 		fcanvas.remove(obj);
//   });

// 	$('div.color')
// 	.on('click', function() {
// 		$('div.color').removeClass('selected');
// 		$(this).addClass('selected');
// 		fillColor = $(this).data('color'); // Set in global var
// 	})
// 	.each(function() {
// 		$(this).css('backgroundColor', $(this).data('color'));
// 	});

// 	$('#tolerance').on('input', function() {
// 		fillTolerance = this.value; // Set in global var
// 	});

// 	$("input[name='mode']").on('click', function() {
// 		floodFill(this.value == 'floodFill');
// 	})

//   // Init Fabric Canvas:
// 	fcanvas = new fabric.Canvas('c', {
// 		backgroundColor:'#fff',
// 		enableRetinaScaling: false
// 	});

// 	// Add some demo-shapes:
// 	fcanvas.add(new fabric.Circle({
// 		radius: 80,
// 		fill: false,
// 		left: 100,
// 		top: 100,
// 		stroke: '#000',
// 		strokeWidth: 2
// 	}));
// 	fcanvas.add(new fabric.Triangle({
// 		width: 120,
// 		height: 160,
// 		left: 50,
// 		top: 50,
// 		stroke: '#000',
// 		fill: '#00f',
// 		strokeWidth: 2
// 	}));
// 	fcanvas.add(new fabric.Rect({
// 		width: 120,
// 		height: 160,
// 		left: 150,
// 		top: 50,
// 		fill: 'red',
// 		stroke: '#000',
// 		strokeWidth: 2
// 	}));
// 	fcanvas.add(new fabric.Rect({
// 		width: 200,
// 		height: 120,
// 		left: 200,
// 		top: 120,
// 		fill: 'green',
// 		stroke: '#000',
// 		strokeWidth: 2
// 	}));

//   /* Images work very well too. Make sure they're CORS
//      enabled though! */
// 	var img = new Image();
// 	img.crossOrigin = 'anonymous';
//   img.onload = function() {
// 		fcanvas.add(new fabric.Image(img, {
// 			left: 300,
// 			top: 100,
// 			angle: 30,
// 		}));  
//   }
// 	img.src = 'http://misc.avoid.org/chip.png';
// });