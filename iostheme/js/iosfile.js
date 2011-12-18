
var appMock = [
    { type: 'folder', title: '社交', css: 'folder-icon' },
    { type: 'folder', title: '游戏', css: 'folder-icon' }
];

var IOS = {};
$(function() {
	var g = function(id) {
		return document.getElementById(id);
	};
	IOS.Data = (function() {
		var data = {};
		return function() {
			var handle = {
				get: function(key) {
					return data[key];
				},
				set: function(key, value) {
					var target = data[key];
					if(!target) {
						data[key] = value;
					}else {
						return false;
					}
				},
				update: function(key, value) {
					data[key] = value;
				}
			};
			return handle;
		};
	}());
	
	IOS.Util = {
		templateParse: function(str, data) {
	        var reg = new RegExp('\{(.*?)\}', 'gmi'), seg = '', result = [], pos = 0;
	        while ((seg = reg.exec(str)) != null) {
	            var end = reg.lastIndex - seg[0].length, key = seg[1], val = data[key];
	            result.push(str.slice(pos, end));
	            result.push(val);
	            pos = reg.lastIndex;
	        }
	        if (pos < str.length) {
	            result.push(str.slice(pos));
	        }
	        return result.join('');
	    }
	};
	
	IOS.Icon = {
		create: (function() {
			var tpl = '<dl data-type={type} class="icon" style="top: {top}px; left: {left}px;"><dd class="{css}"></dd><dt class="icon-text">{title}</dt></dl>';
			return function(info, left, top) {
				info.top = top;
				info.left = left;
				return IOS.Util.templateParse(tpl, info);
			};
		}())
	};
	
	IOS.Action = {
		initialize: function() {
			var i = 0, data = appMock, len = data.length,
				temp = [], target,
				column = 0,
				row = 0,
				top = 0,
				left = 0,
				docWidth = document.body.scrollWidth,
		        docHeight = document.body.scrollHeight;
//	        暂时不做分辨率适配了；
			for(i; i < len; i++) {
				target = data[i];
				if(column * 198 + 55 + 88 > docWidth) {
					column = 0;
					row += 1;
				}
				left = column * 198 + 55;
				top = row * 220 + 55;
				column++;
				temp.push(IOS.Icon.create(target, left, top));
			};
			$('#icon-list').css({
		    	width: docWidth,
		    	height: docHeight
		    }).append(temp.join(''));
		},
		bind: function() {
			var flag = true,
		        done = true,
		        currentActiveIcon = null,
		        folderOpen = function(pos, title, callback) {
			        $('#mask').fadeIn('slow');
			        g('corner').style.left = pos.left + 18 + 'px';
			        g('corner-inner').style.left = pos.left + 20 + 'px';
			        g('dark-title').innerHTML = title;
			        $('#dark').css('top', pos.top + 115).fadeIn('normal', function() {
			            $('#app-container').slideDown('normal', function() {
			                done = true;
			                flag = false;
			            });
			            $('#corner-inner').fadeOut('fast');
			        });
			        currentActiveIcon.style.zIndex = 3;
			        callback && callback();
		    	},
		        folderClose = function(callback) {
			    	$('#app-container').slideUp('normal', function() {
			            $('#dark').fadeOut('normal', function() {
			                done = true;
			                flag = true;
			                currentActiveIcon.style.zIndex = 1;
			                callback && callback();
			            });
			            $('#mask').fadeOut('fast');
			        });
			        $('#corner-inner').fadeIn('normal');
		    	};
		    
		    $(".icon").click(function() {
		        if(this.getAttribute('data-type') == 'icon') { return; }
		        if(!done) { return; }
		        done = false;
		        if(flag) {
		        	var offset = $(this).offset(),
		        		title = $('.icon-text', this).html();
		        	currentActiveIcon = this;
		        	folderOpen(offset, title);
		        }else {
		        	folderClose();
		        }
		    });
		}
	};
	IOS.Action.initialize();
	IOS.Action.bind();
});






























