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
		var imgWidth = settings.img.width,
			imgHeight = settings.img.height,
			size = this.fixImage(settings, { width: imgWidth, height: imgHeight }),
			canvas = $.createElement('canvas', {
				cursor: 'default'
			}, {
				onselectstart: "return false;",
				width: settings.width,
				height: settings.height
			}),
			canvasHelper = $.createElement('canvas', {}, {
				width: settings.width,
				height: settings.height
			}),
			hctx = canvasHelper.getContext('2d'),
			padding = { x: (settings.width - size.width) / 2, y: (settings.height - size.height) / 2 },
			range = null;
		
		if(settings.width >= size.width && settings.height >= size.height) {
			range = { x: padding.x, y: padding.y };
		}else if(settings.width >= size.width) {
			range = { x: padding.x, y: 0 };
		}else {
			range = { x: 0, y: padding.y };
		}
		hctx.translate(range.x, range.y);
		hctx.scale(size.width / imgWidth, size.height / imgHeight);
		hctx.drawImage(settings.img, 0, 0);
		
		range.ex = range.x + settings.width - 2 * range.x;
		range.ey = range.y + settings.height - 2 * range.y;
		
		this.range = range;
		this.canvas = canvas;
		this.canvasHelper = canvasHelper;
		this.ctx = canvas.getContext('2d');
		this.settings = settings;
		this.paint();
	};
	Widget.DrawImage.prototype = {
		paint: function() {
			this.clearCanvas();
			this.ctx.drawImage(this.canvasHelper, 0, 0);
		},
		getCtx: function() {
			return this.ctx;
		},
		clearCanvas: function() {
			var settings = this.settings;
			this.ctx.clearRect(0, 0, settings.width, settings.height);
		},
		getRange: function() {
			return this.range;
		},
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
			height: 400,
			width: 400,
			selectWidth: 80,
			selectHeight: 80,
			selectMaxWidth: 160,
			selectMaxHeight: 160,
			file: '',
			isZoomByRect: true,
			coverBgColor: 'rgba(0,0,0,0.4)',
			selectBorderColor: 'white'
		}, settings);
		if(!el || !settings.file || settings.file.constructor.toString().indexOf('File') == -1) { return; }
		
		this.settings = settings;
		this.el = typeof el === 'string' ? $.g(el) : el;
		var selectCanvas = $.createElement('canvas', {}, {
					height: settings.height,
					width: settings.width
			}),
			sctx = selectCanvas.getContext('2d');
			
		sctx.strokeStyle = settings.selectBorderColor;
		sctx.fillStyle = settings.coverBgColor;
		
		this.drawImage = null;
		/**
		 * 选区原点坐标
		 * <p>
		 * selectPos = {
		 *     x: 1, // 开始点X坐标
		 *     y: 1, // 开始点Y坐标
		 * }
		 * </p>
		 * @param {Object} imgInfo 截图信息
		 */
		this.selectPos = { x: 0, y: 0 };
		this.selectCanvas = selectCanvas;
		this.range = null;
		this.sctx = sctx;
		this.zoomRect = this.zoom();
		this.selectMinSise = { width: settings.selectWidth, height: settings.selectHeight };
	};
	
	Widget.ScreenShot.prototype = {
		init: function() {
			var file = this.settings.file;
			if(!/image\/\w+/.test(file.type)){
	             alert("请确保文件为图像类型");
	             return false;
	        }
	        var me = this,
	        	el = this.el,
	        	settings = me.settings,
	        	centerPoint = { x: (settings.width - settings.selectWidth) / 2, y: (settings.height - settings.selectHeight) / 2 },
	        	reader = new FileReader();
	        	
	        reader.readAsDataURL(file);
	        reader.onload = function() {
	        	var img = new Image();
	        	img.onload = function() {
	        		var drawImage = new Widget.DrawImage({
	        			img: img,
	        			height: me.settings.height,
	        			width: me.settings.width
	        		}),
	        		range = drawImage.getRange();
	        		el.innerHTML = '';
	        		drawImage.appendTo(el);
	        		me.drawImage = drawImage;
	        		me.range = range;
	        		me.paintSelectArea(centerPoint.x, centerPoint.y, true);
	        		me.bind();
	        	}
	        	img.src = this.result;
	        }
		},
		exportImage: function() {
			return this.drawImage.canvas.toDataURL();
		},
		clip: function() {
			var settings = this.settings,
				info = this.selectPos,
				cutter = $.createElement('canvas', {}, {
					width: settings.selectWidth,
					height: settings.selectHeight
				}),
				canvas = this.drawImage.canvas;
			this.paintSelectArea(info.x, info.y, false);
			cutter.getContext('2d').drawImage(canvas, info.x, info.y, settings.selectWidth, settings.selectHeight, 0, 0, settings.selectWidth, settings.selectHeight);
			this.paintSelectArea(info.x, info.y, true);
			return cutter.toDataURL();
		},
		paintSelectArea: function(x, y, isAddZoom) {
			var settings = this.settings,
				drawImage = this.drawImage,
				selectCanvas = this.selectCanvas,
				sctx = this.sctx;
				
			drawImage.paint();
			sctx.clearRect(0, 0, settings.width, settings.height);
			sctx.fillRect(0, 0, settings.width, settings.height);
			sctx.strokeRect(x, y, settings.selectWidth, settings.selectHeight);
			sctx.clearRect(x + 1, y + 1, settings.selectWidth - 2, settings.selectHeight - 2);
			isAddZoom && sctx.drawImage(this.zoomRect, x + settings.selectWidth - 11, y + settings.selectHeight - 11);
			drawImage.getCtx().drawImage(selectCanvas, 0, 0);
			this.selectPos = { x: x, y: y };
		},
		zoom: function() {
			var canvas = $.createElement('canvas', {}, {
					width: 10,
					height: 10
				}),
				ctx = canvas.getContext('2d');
			ctx.strokeStyle = '#000';
			ctx.beginPath();
			ctx.moveTo(0, 10);
			ctx.lineTo(10, 0);
			ctx.moveTo(5, 10);
			ctx.lineTo(10, 5);
			ctx.stroke();
			return canvas;
		},
		zoomByRect: function(x, y) {
			var settings = this.settings,
				selectMinSise = this.selectMinSise;
				
			if(x < selectMinSise.width) {
				x = settings.selectWidth;
			}else if(x > settings.selectMaxWidth) {
				x = settings.selectMaxWidth
			}
					
			this.settings.selectWidth = x;
			this.settings.selectHeight = x;
		},
		zoomByFree: function(x, y) {
			var settings = this.settings,
				selectMinSise = this.selectMinSise;
				
			if(x < selectMinSise.width) {
				x = settings.selectWidth;
			}else if(x > settings.selectMaxWidth) {
				x = settings.selectMaxWidth
			}
					
			if(y < selectMinSise.height) {
				y = settings.selectHeight;
			}else if(y > settings.selectMaxHeight) {
				y = settings.selectMaxHeight
			}
			this.settings.selectWidth = x;
			this.settings.selectHeight = y;
		},
		bind: function() {
			var me = this,
				settings = this.settings,
				selectMinSise = this.selectMinSise,
				canvas = this.drawImage.canvas,
				imageArea = this.range,
				selectBoxRange = null,
				moveRange = null,
				selectPos = null,
				clickPos = 0,
				timerId = 0,
				isInRange = function(x, y, range) {
					if(x >= range.x && x <= range.ex && y >= range.y && y <= range.ey) {
						return true;
					}
					return false;
				},
				updateMoveRange = function() {
					moveRange = { x: imageArea.x, y: imageArea.y, ex: imageArea.ex - settings.selectWidth, ey: imageArea.ey - settings.selectHeight };
				},
				move = function(e) {
					var x = e.offsetX, y = e.offsetY;
					x = x - clickPos.x + selectPos.x;
					y = y - clickPos.y + selectPos.y;
					if(x < moveRange.x) {
						x = moveRange.x
					}else if(x > moveRange.ex) {
						x = moveRange.ex;
					}
					if(y < moveRange.y) {
						y = moveRange.y
					}else if(y > moveRange.ey) {
						y = moveRange.ey
					}
					me.paintSelectArea(x, y, true);
				},
				stop = function() {
					clearTimeout(timerId);
					canvas.removeEventListener('mousemove', move, false);
					canvas.removeEventListener('mousemove', zoomUpdate, false);
					updateMoveRange();
				},
				zoomUpdate = function(e) {
					var x = e.offsetX, y = e.offsetY;
					if(!isInRange(x, y, imageArea)) {
						return false;
					}
					x = x - clickPos.x + clickPos.currentSelectWidth;
					y = y - clickPos.y + clickPos.currentSelectHeight;
					if(settings.isZoomByRect) {
						me.zoomByRect(x, y);
					}else {
						me.zoomByFree(x, y);
					}
					me.paintSelectArea(selectPos.x, selectPos.y, true);
				},
				flag = false;
				
			updateMoveRange();
			canvas.addEventListener('mousedown', function(e) {
				timerId = setTimeout(function() {
					flag = true;
					selectPos = me.selectPos;
					var	selectBoxRange = { x: selectPos.x, y: selectPos.y, ex: selectPos.x + settings.selectWidth, ey: selectPos.y + settings.selectHeight },
						zoomRange = { x: selectPos.x + settings.selectWidth - 10, y: selectPos.y + settings.selectHeight - 10, ex: selectPos.x + settings.selectWidth, ey: selectPos.y + settings.selectHeight };
					console.log(e);
					if(isInRange(e.offsetX, e.offsetY, zoomRange)) {
						clickPos = { x: e.offsetX, y: e.offsetY, currentSelectWidth: me.settings.selectWidth, currentSelectHeight: me.settings.selectHeight };
						canvas.addEventListener('mousemove', zoomUpdate, false);
					}else if(isInRange(e.offsetX, e.offsetY, selectBoxRange)) {
						clickPos = { x: e.offsetX, y: e.offsetY};
						canvas.addEventListener('mousemove', move, false);
					}
				}, 50);
			}, false);
			
			canvas.addEventListener('mouseup', function(e) {
				if(!flag) { return; }
				stop();
			}, false);
			
			canvas.addEventListener('mouseout', function() {
				stop();
			}, false);
		}
	}
})();
