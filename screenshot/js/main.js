/**
 * @author xiechaoning
 */
var Widget = {};
(function() {
	
	Widget.DrawImage = function(settings) {
		settings = $.merge({
			img: '',
			height: 400,
			width: 400
		}, settings);
		if(!settings.img || !settings.height || !settings.width) { return; }
		var img = settings.img,
			size = this.fixImage(settings, { width: img.width, height: img.height }),
			width = settings.width === 'auto' ? size.width : settings.width,
			height = settings.height === 'auto' ? size.height : settings.height,
			canvas = $.createElement('canvas', {
				cursor: 'default'
			}, {
				width: width,
				height: height
			}),
			ctx = canvas.getContext('2d'),
			heightScale = size.height / img.height,
			widthScale = size.width / img.width;
			ctx.scale(widthScale, heightScale);
			
		if(width >= size.width && height >= size.height) {
			ctx.drawImage(img, (width - size.width) / 2, (height - size.height) / 2)
		}else if(width >= size.width) {
			ctx.drawImage(img, (width - size.width) / 2, 0)
		}else {
			ctx.drawImage(img, 0, (height - size.height) / 2)
		}
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
				size = { height: target.height, width: target.width };
			if(size.width > ow) {
				size = this.scale(size, ow, true);
			}
			if(size.height > oh) {
				size = this.scale(size, oh, false);
			}
			return size;
		},
		appendTo: function(el) {
			el.appendChild(this.canvas);
		}
	}
	
	Widget.ScreenShot = function(el, settings) {
		settings = $.merge({
			height: 'auto',
			width: 'auto',
			screenWidth: 400,
			screenHeight: 350,
			file: ''
		}, settings);
		if(!el || !settings.file || settings.file.constructor.toString().indexOf('File') == -1) { return; }
		this.settings = settings;
		this.el = typeof el === 'string' ? $.g(el) : el;
		this.drawImage = null;
		/**
		 * 截图
		 * <p>
		 * imgInfo = {
		 *     sx: 1, // 开始点X坐标
		 *     sy: 1, // 开始点Y坐标
		 *     sh: 20, // 截图宽度
		 *     sw: 20 // 截图高度
		 * }
		 * </p>
		 * @param {Object} imgInfo 截图信息
		 */
		this.cutImgInfo = { sx: 0, sy: 0, sw: settings.screenWidth, sh: settings.screenHeight };
	};
	
	Widget.ScreenShot.prototype = {
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
		cut: function() {
			var settings = this.settings,
				info = this.cutImgInfo,
				width = settings.screenWidth,
				height = settings.screenHeight,
				cutter = $.createElement('canvas', {}, {
					width: width,
					height: height
				}),
				cutCtx = cutter.getContext('2d'),
				canvas = this.drawImage.canvas;
			cutCtx.drawImage(canvas, info.sx, info.sy, info.sw, info.sh, 0, 0, width, height);
			return cutter.toDataURL();
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
