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
			width = settings.width,
			height = settings.height,
			size = this.fixImage(settings, { width: img.width, height: img.height }),
			canvas = $.createElement('canvas', {
				cursor: 'default'
			}, {
				width: width,
				height: height
			}),
			temp = $.createElement('canvas', {}, {
				width: width,
				height: height
			}),
			tctx = temp.getContext('2d'),
			scaleX = size.width / img.width, 
			scaleY =  size.height / img.height,
			ctx = canvas.getContext('2d');
		
		tctx.scale(scaleX, scaleY);
		if(width >= size.width && height >= size.height) {
			tctx.drawImage(img, (width - size.width) / 2, (height - size.height) / 2)
		}else if(width >= size.width) {
			tctx.drawImage(img, (width - size.width) / 2, 0)
		}else {
			tctx.drawImage(img, 0, (height - size.height) / 2)
		}
		ctx.drawImage(temp, 0, 0);
		// tctx.drawImage(img, 0, 0);
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
			if(size.width < ow && size.height < oh) {
				return { height: oh, width: ow };
			}
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
			selectWidth: 80,
			selectHeight: 80,
			file: ''
		}, settings);
		if(!el || !settings.file || settings.file.constructor.toString().indexOf('File') == -1) { return; }
		
		this.settings = settings;
		this.el = typeof el === 'string' ? $.g(el) : el;
		this.selectCanvas = $.createElement('canvas', {}, {
			height: settings.height,
			width: settings.width
		}),
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
		this.selectPos
		this.cutImgInfo = { sx: 0, sy: 0 };
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
	        		me.paintSelectArea(10, 10);
	        	}
	        	img.src = this.result;
	        }
		},
		exportImage: function() {
			return this.drawImage.canvas.toDataURL();
		},
		done: function() {
			var settings = this.settings,
				info = this.cutImgInfo,
				width = settings.selectWidth,
				height = settings.selectHeight,
				cutter = $.createElement('canvas', {}, {
					width: width,
					height: height
				}),
				cutCtx = cutter.getContext('2d'),
				canvas = this.drawImage.canvas;
			cutCtx.drawImage(canvas, info.sx, info.sy, width, height, 0, 0, width, height);
			return cutter.toDataURL();
		},
		paintSelectArea: function(x, y) {
			var settings = this.settings,
				octx = this.drawImage.canvas.getContext('2d'),
				selectCanvas = this.selectCanvas,
				ctx = selectCanvas.getContext('2d');
			ctx.strokeStyle = "white";
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.fillRect(0, 0, settings.width, settings.height);
			ctx.strokeRect(x, y, settings.selectWidth, settings.selectHeight);
			ctx.clearRect(x + 1, y + 1, settings.selectWidth - 2, settings.selectHeight - 2);
			octx.drawImage(selectCanvas, 0, 0);
			this.cutImgInfo = { sx: x, sy: y };
		},
		bind: function() {
			var canvas = this.drawImage.canvas;
			
			canvas.addEventListener('mousemove', function() {}, false);
		}
	}
})();
