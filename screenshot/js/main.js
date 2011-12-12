/**
 * @author xiechaoning
 */
var Widget = {};
(function() {
	
	Widget.DrawImage = function(settings) {
		settings = $.merge({
			img: '',
			height: 'auto',
			width: 'auto'
		}, settings);
		if(!settings.img) { return; }
		var img = settings.img,
			size = this.fixImage(settings, { width: img.width, height: img.height }),
			canvas = $.createElement('canvas', {
				cursor: 'default'
			}, {
				width: size.width,
				height: size.height
			}),
			ctx = canvas.getContext('2d'),
			heightScale = size.height / img.height,
			widthScale = size.width / img.width;
		if(heightScale < 1 && widthScale < 1) {
			ctx.scale(widthScale, heightScale);
		}else if(heightScale < 1){
			ctx.scale(1, heightScale);
		}else if(widthScale < 1) {
			ctx.scale(widthScale, 1);
		}
		ctx.drawImage(img, 0, 0);
		this.canvas = canvas;
		this.ctx = ctx;
	};
	
	Widget.DrawImage.prototype = {
		scale: function(originSize, target, isWidth) {
			var size = {};
			if(isWidth) {
				size.width = target;
				size.height = parseInt(target * originSize.height / originSize.width);
			}else {
				size.height = target;
				size.width = parseInt(target * originSize.width / originSize.height);
			}
			return size;
		},
		fixImage: function(origin, target) {
			var ow = origin.width,
				oh = origin.height,
				tw = target.width,
				th = target.height,
				size = {};
			if(oh !== 'auto' && ow !== 'auto') {
				if(oh < th && ow < tw) {
					size = this.scale({ height: th, width: tw }, ow, true);
					if(size.height > oh) {
						size = this.scale(size, oh, false);
					}
				}else if(oh < th){
					size = this.scale({ height: th, width: tw }, oh, false);
				}else{
					size = this.scale({ height: th, width: tw }, ow, true);
				}
			}else if(oh !== 'auto'){
				if(oh < th) {
					size = this.scale({ height: th, width: tw }, oh, false);
				}else {
					size = { height: th, width: tw };
				}
			}else if(ow !== 'auto'){
				if(ow < tw) {
					size = this.scale({ height: th, width: tw }, ow, true);
				}else {
					size = { height: th, width: tw };
				}
			}else {
				size = { height: th, width: tw }	
			}
			return size;
		},
		appendTo: function(el) {
			el.appendChild(this.canvas);
		}
	}
	
	Widget.FaceCut = function(el, settings) {
		settings = $.merge({
			height: 'auto',
			width: 'auto',
			file: ''
		}, settings);
		if(!el || !settings.file || settings.file.constructor.toString().indexOf('File') == -1) { return; }
		this.settings = settings;
		this.el = typeof el === 'string' ? $.g(el) : el;
		this.drawImage = null;
	};
	
	Widget.FaceCut.prototype = {
		fileRead: function() {
			var file = this.settings.file;
			if(!/image\/\w+/.test(file.type)){
	            return "请确保文件为图像类型";
	        }
	        var me = this,
	        	reader = new FileReader(),
	        	el = this.el;
	        	
	        reader.readAsDataURL(file);
	        reader.onload = function() {
	        	var img = new Image();
	        	img.onload = function() {
	        		var drawImage = new Widget.DrawImage({
	        			img: img,
	        			height: me.settings.height,
	        			width: me.settings.width
	        		});
	        		el.innerHTML = '';
	        		drawImage.appendTo(el);
	        		me.drawImage = drawImage;
	        	}
	        	img.src = this.result;
	        }
		},
		exportImage: function() {
			return this.drawImage.canvas.toDataURL();
		},
		clip: function() {
			var ctx = this.drawImage.canvas.getContext('2d');
			ctx.beginPath();
			ctx.arc(0,0,60,0,Math.PI*2,true);
			ctx.clip();
			var lingrad = ctx.createLinearGradient(0,-75,0,75);
			lingrad.addColorStop(0, '#232256');
			lingrad.addColorStop(1, '#143778');
			ctx.fillStyle = lingrad;
			ctx.fillRect(0,0,150,150);
			ctx.restore();
		}
	}
})();
