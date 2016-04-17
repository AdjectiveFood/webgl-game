const VisualObject = (function(){
	const Transform = function(data){
		const translate = function(x, y){
			data.x += x;
			data.y += y;
		}

		return {
			getWorldPosition: () => ({x: data.x, y: data.y}),
			getLayer: () => data.layer,
			getScale: () => ({x: data.scaleX, y: data.scaleY}),
			getRotation: () => data.rotation,
			traslate: translate
		}
	}

	const Drawable = function(data){
		return {
			getColor: () => data.color,
			getShape: () => data.shape
		}
	}

	const createDrawable = function(shape, color, x, y, layer, scaleX, scaleY, rotation){
		var data = {
			shape: shape || ShapeFactory.hexagon,
			color: color || [255,255,255,1],
			x: x || 0,
			y: y || 0,
			layer: layer || 1,
			scaleX: scaleX || 1,
			scaleY: scaleY || 1,
			rotation: rotation || 0
		}

		return Utils.assign({}, Drawable(data), Transform(data));
	}

	const createTransform = function(x, y, layer, scaleX, scaleY, rotation){

		var data = {
			x: x || 0,
			y: y || 0,
			layer: layer || 1,
			scaleX: scaleX || 1,
			scaleY: scaleY || 1,
			rotation: rotation || 0
		}

		return Transform(data);
	}

	return {
		createDrawable: createDrawable,
		createTransform: createTransform
	}
})();