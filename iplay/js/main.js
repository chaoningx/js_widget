var Widget = {};
(function(){
Widget.Iplay = function(el, settings) {
	if(!el) return;
	this.el = typeof el === 'string' ? $.g(el) : el;
	settings = $.merge({
		poster: 'onload.jpg',
		width: 600,
		height: 450,
		loop: true,
		/**
		 * auto - 当页面加载后载入整个视频
		 * meta - 当页面加载后只载入元数据
		 * none - 当页面加载后不载入视频
		 */
		preload: 'auto',  
		controls: true,
		autoplay: false,
		icontrolHeight: 35,
		icontrolCss: '',
		boxCss: 'iplay-box',
		shotWidth: false,
		shotHeight: false,
		shotCallback: false
	}, settings);
	
	this.currentTimeBox = null;
	this.processBox = null;
	this.process = null;
	this.buffer = null;
	this.duration = 0;
	this.volume = 0.9;
	this.scaleWidth = 0;
	this.scaleHeight = 0;
	
	var me = this,
		box = $.createElement('div', {
			position: 'relative',
			width: settings.width + 'px',
			height: settings.height + settings.icontrolHeight + 'px',
			display: 'none',
			overflow: 'hidden'
		}),
		height = height = settings.icontrolHeight - 30;
	$.addClass(box, settings.boxCss);
	this.settings = settings;
	this.box = box;
	this.video = document.createElement('video');
	this.el.appendChild(this.box);
	this.iconTop = parseInt(height / 2 + height % 2) + 'px';
};
Widget.Iplay.prototype = {
	render: function(src) {
		var me = this,
			settings = this.settings,
			v = this.video;
			
		$.setAttrs(v, {
			'src': src,
			'height': settings.height,
			'width': settings.width,
			'preload': settings.preload,
			'volume': me.volume
		});
		
		settings.controls && v.setAttribute('controls', 'controls');
		settings.autoplay && v.setAttribute('autoplay', 'autoplay');
		settings.loop && v.setAttribute('loop', 'loop');
		settings.poster && v.setAttribute('poster', settings.poster);
		
		this.box.style.display = 'block';
		this.box.innerHTML = '';
		this.box.appendChild(v);
	},
	bind: function() {
		if(this.settings.controls) { return; }
		var me = this,
			settings = this.settings,
			v = this.video;
			
		v.addEventListener('loadedmetadata',function() {
			var box = me.box;
			me.duration = this.duration;
			box.appendChild(me.controlView());
			box.appendChild(me.processView());
			box.addEventListener('mouseover', function() {
				me.process.style.bottom = settings.icontrolHeight + 'px';
			});
			box.addEventListener('mouseout', function() {
				me.process.style.bottom = settings.icontrolHeight - 4 + 'px';
			});
			this.addEventListener('timeupdate', function(){
				var ct = this.currentTime;
				me.currentTimeBox.innerHTML = $.secondFormat(ct);
				me.processBox.style.width = parseInt(ct / me.duration * settings.width) + 'px';
				me.buffer.style.width = parseInt(this.buffered.end(0) / me.duration * settings.width) + 'px';
			});
		}, false);
	},
	controlView: function() {
		var settings = this.settings,
			bar = $.createElement('div', {
				width: settings.width + 'px',
				height: settings.icontrolHeight + 'px',
				lineHeight: settings.icontrolHeight + 'px',
			}, {
				'class': 'iplay-bar' + (settings.icontrolCss && ' ' + settings.icontrolCss)
			});
		$.append(
			bar, 
			this.playBtn(), 
			this.durationView(), 
			this.voiceView(),
			this.operaView(),
			this.shotView()
		);
		return bar;
	},
	durationView: function() {
		var settings = this.settings,
			box = $.createElement('div', {
				position: 'absolute',
				left: '60px',
				top: 0,
				height: settings.icontrolHeight + 'px',
				lineHeight: settings.icontrolHeight + 'px'
			}),
			done = document.createElement('div'),
			splitLine = document.createElement('div'),
			totalTime = document.createElement('div');
			
		$.addClass(box, 'iplay-duration');	
		$.addClass(done, 'iplay-duration-time');
		$.addClass(splitLine, 'iplay-duration-line');
		$.addClass(totalTime, 'iplay-duration-time');
		
		totalTime.innerHTML = $.secondFormat(this.duration);
		splitLine.innerHTML = '/';
		done.innerHTML = '00:00:00';
		$.addClass(box, 'iplay-duration');
		$.append(box, done, splitLine, totalTime);
		this.currentTimeBox = done;
		return box;
	},
	processView: function() {
		var me = this,
			settings = this.settings,
			box = $.createElement('div', {
				bottom: settings.icontrolHeight - 4 + 'px',
				width: settings.width + 'px',
			}, {
				'class': 'iplay-process-box'
			}),
			warp = $.createElement('div', {
				position: 'relative'
			}),
			buffer = document.createElement('div'),
			pro = document.createElement('div');
			
		$.addClass(pro, 'iplay-process-moving');
		$.addClass(buffer, 'iplay-process-buffer');
		box.addEventListener('click', function(e) {
			me.video.currentTime = parseInt(e.offsetX * me.duration / settings.width);
			pro.style.width = e.offsetX + 'px';
		}, false);
		$.append(warp, buffer, pro);
		box.appendChild(warp);
		this.processBox = pro;
		this.process = box;
		this.buffer = buffer;
		return box;
	},
	playBtn: function() {
		var me = this,
			settings = this.settings,
			play = $.createElement('div', {
				position: 'absolute',
				top: me.iconTop
			}),
			i = 0,
			toggle = function() {
				if(i % 2 == 0) {
					me.video.play();
					i++;
					$.replaceClass(play, 'iplay-play', 'iplay-pause');
				}else {
					me.video.pause();
					i--;
					$.replaceClass(play, 'iplay-pause', 'iplay-play');
				}
			};
		$.addClass(play, 'iplay-png', 'iplay-play'); //iplay-pause
		play.addEventListener('click', function() {
			if(i % 2 == 0) {
				me.video.play();
				$.replaceClass(play, 'iplay-play', 'iplay-pause');
				i++;
			}else {
				me.video.pause();
				$.replaceClass(play, 'iplay-pause', 'iplay-play');
				i--;
			}
		});
		return play;
	},
	iconBuilder: function(css, pros, className) {
		if(typeof css === 'string') {
			className = css;
			css = {};
			pros = {};
		}
		var me = this,
			css = $.merge({ 
				"float": 'right',	
				margin: me.iconTop +' 0 0 0',
				display: 'inline'
			}, css);
			box = $.createElement('div', css, pros);
		$.addClass(box, 'iplay-png', className);
		return box;
	},
	shotView: function() {
		var me = this,
			settings = this.settings,
			box = this.iconBuilder({}, { title: '截图分享' }, 'iplay-shot');
			
		this.scaleWidth = settings.shotWidth ? settings.shotWidth / settings.width : 1,
		this.scaleHeight = settings.shotHeight ? settings.shotHeight / settings.height : 1;
		
		box.addEventListener('click', function() {
			me.shotImg();
		}, false);
		return box;
	},
	shotImg: function() {
		var settings = this.settings,
			canvas = $.createElement('canvas', {
			}, {
				width: settings.shotWidth,
				height: settings.shotHeight
			}),
			ctx = canvas.getContext('2d');
		ctx.scale(this.scaleWidth, this.scaleHeight);
		ctx.drawImage(this.video, 0, 0, settings.width, settings.height);
		settings.shotCallback && settings.shotCallback(canvas);
	},
	operaView: function() {
		return this.iconBuilder({}, { title: '功能设置' }, 'iplay-opera');
	},
	voiceView: function() {
		var box = $.createElement('div', {
				"float": "right",
				margin: this.iconTop +' 0 0 0',
				display: 'inline',
				height: '30px'
			}),
			canvas = this.voiceProcess(),
			video = this.video,
			icon = this.iconBuilder( { margin: '', display: '' }, {}, ''),
			volume = video.volume,
			i = 0,
			getCssByMute = function(mute) {
				mute = mute.toFixed(2);
				if(mute < 0.01) {
					return 'iplay-voice0';
				}
				if(mute > 0.01 && mute <= 0.3) {
					return 'iplay-voice1';
				}
				if(mute > 0.3 && mute <= 0.7) {
					return 'iplay-voice2';
				}
				return 'iplay-voice3';
			},
			setCss = function(css) {
				$.replaceClass(icon, /(iplay-voice0)|(iplay-voice1)|(iplay-voice2)|(iplay-voice3)/, css);
			};
		$.addClass(icon, getCssByMute(volume));
		icon.addEventListener('click', function() {
			if(i % 2 == 0) {
				video.volume = 0;
				setCss('iplay-voice0');
				i++;
			}else {
				video.volume = volume;
				setCss(getCssByMute(volume));
				i--;
			}
		}, false);
		box.appendChild(canvas);
		box.appendChild(icon);
		return box;
	},
	voiceProcess: function() {
		var box = $.createElement('div', {
				'float': 'right',
				height: '30px',
				position: 'relative'
			}, {
				onselectstart: 'return false;'
			}),
			container = $.createElement('div', {
				position: 'relative',
				height: '100%',
				width: '100%'
			}),
			pro = $.createElement('div', {
				cursor: 'default'
			}),
			range = { left: 8, right: 68 };
		box.appendChild(container);
		return box;
	}
};
})();









