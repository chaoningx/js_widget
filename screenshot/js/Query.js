(function(window) {  
var Query = (function() {
	var htmlTag = /^(?:[^<]*(^<[\w\W]+>$)[^>]*$)/,
	Query = function(select) {
        return new Query.fn.init(select);
	};
    Query.fn = Query.prototype = {
        constructor: Query,
        init: function(select) {
        	if(Query.isFunction(select)) {
        		return this.ready(select);
        	}
			if (select.nodeType) {
				this[0] = select;
				this.length = 1;
				return this;
			}
			if(htmlTag.test(select)) {
				var temp = document.createElement('div');
				temp.innerHTML = select;
				var i = 0, nodes = temp.childNodes, len = nodes.length;
				for(i; i < len; i++) {
					this[i] = nodes[i];
				}
				this.length = len;
				return this;
			}
            try {
                var ele = document.querySelectorAll(select);
                this.length = ele.length;
            }catch(e) {
                ele = [];
            }
            return this.merge(this, ele);
        },
        each: function(callback) {
			var len = this.length, i = 0;
			if(len < 2) {
				callback(0, this[0]);
			}else {
				for(i; i < len; i++) {
					callback(i, this[i]);
				}
			}
		},
        merge: function(s, t) {
            var i = 0, tlen = t.length;
            for(i; i < tlen; i++) {
                s[i] = t[i];
            }
            return s;
        },
        length: 0,
        push: Array.prototype.push,
        sort: [].sort,
        splice : [].splice
    };
    Query.fn.init.prototype = Query.fn;
    Query.extend = Query.fn.extend = function() {
        var arg0 = arguments[0];
        for(var i in arg0) {
            var isExist = this[i];
            if(isExist) { continue; }
            var o = arg0[i];
            this[i] = o;
        }
    };
return Query;
})();

Query.fn.extend({
	ready: function(callback) {
		document.onreadystatechange = function() {
			if (document.readyState == 'complete') {
				document.onreadystatechange = null;
				callback();
			}
		};
	},
	onload: function(target, callback) {
		if(Query.isFunction(target)) {
			target = document;
		}
		target.onload = target.onreadystatechange = function() {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				callback && callback();
				target.onload = target.onreadystatechange = null;
			}
		};
	}
});

/**
 * dom部分
 */
Query.fn.extend({
	remove: function() {
		this.each(function(i, n){
			n.parentNode.removeChild(n);
		});
	},
	empty: function() {
		this.each(function(i, n) {
			var j = 0, list = n.childNodes, len = list.length;
			for(j; j < len; j++) {
				n.removeChild(list[j]);
			}
		});
	},
	attr: function() {
		var target = this[0];
		if(!target) { return this; }
		if(arguments.length < 2) {
			return target.getAttribute(arguments[0]);
		}else{
			target.setAttribute(arguments[0], arguments[1]);
		}
		return this;
	},
    removeAttrs: function() {
        var attrs = arguments, j, len = attrs.length, target;
        this.each(function(i,n) {
            for(j = 0; j < len; j++) {
                target = attrs[j];
                if(n.hasAttribute(target)) {
                    n.removeAttribute(target);
                }
            }
        });
        return this;
    },
	html: function(str) {
		var target = this[0];
        if(!target) { return this; }
		if(!str) {
			return target.innerHTML;
		}else{
			target.innerHTML = str;
		}
		return this;
	},
	val: function(v) {
		var target = this[0];
        if(!target) { return this; }
		if(!v) {
			return target.value;
		}else{
			target.value = v;
		}
		return this;
	},
    offset: function() {
        if(!this[0]) { return; }
        var elem = this[0],
            pos = { left: elem.offsetLeft, top: elem.offsetTop },
            offsetParent = elem.offsetParent,
            endReg = /^(?:body|html)$/i;
        while(offsetParent && (!endReg.test(offsetParent.nodeName))) {
            pos.left += offsetParent.offsetLeft;
            pos.top += offsetParent.offsetTop;
            offsetParent = offsetParent.offsetParent;
        } 
        return pos;
    },
    position: function() {
        if(!this[0]) { return; }
        var elem = this[0];
        return { left: elem.offsetLeft, top: elem.offsetTop };
    }
});

/**
 * css部分
 */
Query.fn.extend({
	addClass: function(className) {
        var names;
		this.each(function(i, n) {
			names = n.className;
			n.className = names == '' ? className : names + ' ' + className; 
		});
		return this;
	},
    removeClass: function(name) {
        var className, j, names = (name || '').split(' '), len = names.length;
        try{
	        this.each(function(i, n) {
	            if(n.nodeType === 1 && n.className) {
                    if(name) {
                        className = " " + n.className + " ";
                        for(j = 0; j < len; j++) {
                            className = className.replace(' ' + names[j] + ' ', ' ');
                        }
                        n.className = Query.trim(className);
                    }else {
                        n.className = '';
                    }
	            }
	        });
        }catch(e) {
        }finally{
            return this;
        }
    },
    replaceClass: function(origin, target) {
       if(arguments.length < 2 || !origin) { return this; }
       var className, target = !target ? ' ' : ' ' + target + ' ';
       try{
            this.each(function(i, n) {
                if(n.className) {
                    className = " " + n.className + " ";
                    
                    className = className.replace(' ' + origin + ' ', target);
                    n.className = Query.trim(className);
                }
            });
        }catch(e) {
        }finally{
            return this;
        }
    },
    hasClass: function(name) {
        var o = this[0];
        if(!o) { return; }
        return new RegExp(RegExp("(\\s|^)" + name + "(\\s|$)")).test(o.className);
    },
	css: function(kv) {
        var o, cssText, reg, newCss;
		this.each(function(i, n) {
            cssText = " " + n.style.cssText;
            try{
                for(o in kv) {
                    newCss = o + ": " + kv[o] + "; ";
	                if(cssText.indexOf(o) != -1) {
                        reg = new RegExp("\\s" + o + ":[^;]\+;");
	                    cssText = cssText.replace(reg, " " + newCss);
	                }else {
	                    cssText += newCss;
	                }
	            }
                n.style.cssText = cssText;
            }catch(e) {
            }
		});
		return this;
	}
});

var class2type = {
	    "[object Boolean]":"boolean",
	    "[object Number]":"number",
	    "[object String]":"string",
	    "[object Function]":"function",
	    "[object Array]":"array",
	    "[object Date]":"date",
	    "[object RegExp]":"regexp",
	    "[object Object]":"object"
	},
    toString = Object.prototype.toString;

Query.extend({
    parseJSON: function(str) {
	    return (new Function("return " + str))();
	},
    trim: function(str) {
	    return str == null ? '' : str.toString().replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '');
	},
    isFunction: function(fn) {
	    return Query.type(fn) === 'function';
	},
    type: function(obj) {
	    return obj == null ? String( obj ) : class2type[ toString.call(obj) ] || "object";
	},
    escapeHTML: function(str) {
	    var div = document.createElement('div'),
	            text = document.createTextNode(str);
	        div.appendChild(text);
	        return div.innerHTML;
	},
    merge: function(source, target) {
	    var len = arguments.length;
	    if(len < 1) { return; }
	    if(len < 2 || !arguments[1]) { return arguments[0]; }
	    var r = {};
	    for(var i in source) {
	        r[i] = typeof target[i] == 'undefined' ? source[i] : target[i];
	    }
	    return r;
	},
	browser: function() {
		var b = {}, a = navigator.userAgent.toLowerCase();
		b.IE = /msie/.test(a);
		b.OPERA = /opera/.test(a);
		b.MOZ = /gecko/.test(a);
		b.IE6 = /msie 6/.test(a);
		b.IE7 = /msie 7/.test(a);
		b.IE8 = /msie 8/.test(a);
		b.SAFARI = /safari/.test(a);
		b.CHROME = /chrome/.test(a);
		b.IPHONE = /iphone os/.test(a);
		return b;
	},
    /**
     * 秒转换为hh:mm:ss时间格式
     * @param {String || Number} seconds 需要转换的秒数
     */
    secondToDate: function(seconds) {
        var hh,mm,ss;
        if(!seconds || seconds < 0) {
            return;
        }
        hh = seconds / 3600 | 0;
        seconds = parseInt(seconds) - hh * 3600;
        if(parseInt(hh) < 10) {
            hh = "0" + hh;
        }
        mm = seconds / 60| 0;
        ss = parseInt(seconds) - mm * 60;
        if(parseInt(mm) < 10) {
            mm = "0" + mm;   
        }
        if(ss < 10){
            ss = "0" + ss;     
        }
        return hh != "00" ? hh + ":"+ mm +":" + ss : mm +":" + ss;
    },
    /**
     * 日期格式化方法
     * <p>
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
     * (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
     * </p>
     * @param {Date} date 需要格式化的时间对象
     * @param {String} format 日期格式
     * @return {String} 格式化后的日期
     */
    format: function(date, format) {
        var _ = date,
            o = {
	            "M+": _.getMonth() + 1,
	            "d+": _.getDate(),
	            "h+": _.getHours(),
	            "m+": _.getMinutes(),
	            "s+": _.getSeconds(),
	            "q+": Math.floor((_.getMonth() + 3) / 3),  //quarter
	            "S": _.getMilliseconds() //millisecond
	        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (_.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 把指定时间转换为timeZone指向的时区时长
     * @param {Date} date 需要转换的时间对象
     * @param {Number} TimeZone 时区
     * @return {Date} 转化后的时间对象
     */
    convertTimeByZone: function(date, TimeZone) {
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000 + (3600000 * TimeZone));
    }
});

/**
 *　ajax部分
 */
Query.extend({
	/**
	 * @param {Element} form 表单元素对象
	 * @param {Function} callback 回调函数
	 */
	form: function(form, callback) {
		var iframeName = 'iframe_' + new Date().getTime(),
			iframe = document.createElement('iframe');
		iframe.setAttribute('width', 0);
		iframe.setAttribute('height', 0);
		iframe.setAttribute('frameborder', 0);
		iframe.setAttribute('name', iframeName);
		form.setAttribute('target', iframeName);
		iframe.onload = function() {
			callback && callback(iframe);
		};
		document.body.appendChild(iframe);
		return form;
	},
	ajax: function(params) {
		params = Query.merge({
			url: '',
			data: '',
			type: 'GET', //GET, POST
			async: true,
			success: '',
			error: '',
			complete: '',
			beforeSend: false,
			dataType: 'json', // json html
			timeout: 10000,
			contentType: 'application/x-www-form-urlencoded',
			user: '',
			password: ''
		}, params);
		var readyState = '',
			timer = '',
			xhr = new XMLRequest();
		params.url = encodeURIComponent(params.url);
		xhr.setRequestHeader('User-Agent', 'XMLHTTP');
		xhr.open(params.type, params.url, params.async, params.user, params.password);
		xhr.onreadystatechange = function() {
			try{
				if(xhr.readyState == 4) {
					if(xhr.status == 200 || xhr.status == 0) {
						clearTimeout(timer);
						var data = xhr.responseText;
						if(params.dataType === 'json') {
							data = Query.parseJSON(data);
						}
						params.success && params.success(data);
					}
				};
			}catch(e) {
				params.error && params.error(e);
			}finally{
				params.complete && params.complete();
			}
		};
		params.beforeSend && params.beforeSend();
		if(type === 'GET') {
			xhr.send(null);
		}else {
			xhr.setRequestHeader('Content-type', params.contentType);
			xhr.send(Query.param(params.data));
		}
		timer = setTimeout(function(){
			xhr.abort();
		}, params.timeout);
	},
	post: function(url, data, callback, dataType) {
		Query.ajax({
			url: url,
			data: data,
			type: 'POST',
			dataType: !dataType ? 'json' : dataType,
			success: callback
		});
	},
	get: function(url, params, callback, dataType) {
		Query.ajax({
			url: url + '?' + Query.param(params),
			type: 'GET',
			dataType: !dataType ? 'json' : dataType,
			success: callback
		});
	},
	param: function(json) {
		var str = JSON.stringify(json);
		return encodeURIComponent(str.substring(2, str.length - 1).replace(/"/g, '').replace(/:/g, "=").replace(/,/g, "&"));
	},
	 /**
     * 异步加载脚本
     * @param pros {String||Object} 如果只有一个属性那么为src, 如果为多属性，请使用JSON格式 
     * @param callback {Function} 回调函数
     */
    getScript: function() {
	    var script = document.createElement('script'),
            pros = arguments[0],
            callback = arguments[1];
        script.onload = script.onreadystatechange = function() {
            if (!this.readyState || this.readyState === "loaded"
                    || this.readyState === "complete") {
                callback && callback();
                script.onload = script.onreadystatechange = null;
            }
        };
        if(Query.type(pros) === 'string') {
            script.src = pros;
        }else {
            for(var name in pros) {
                script.setAttribute(name, pros[name]);
            }
        }
        document.getElementsByTagName('head')[0].appendChild(script);
	}
});

Query.extend({
    /**
     * 创建元素
     * <p>
     * $.createElement('div', { height: '20px', width: '30px' }, { id: 'xiecn' });
     * </p>
     * @param {String} tag 元素类型
     * @param {Object} css kv样式值
     * @param {Object} pros kv属性值
     * @return {Element} 新元素对象
     */
	createElement: function(tag, css, pros) {
		var t = document.createElement(tag),
			str = JSON.stringify(css),
			i;
		if(str.length > 2) {
			str = str.substring(2, str.length - 1).replace(/"/g, '').replace(/,/g, "; ");
			t.style.cssText = str;
		}
		for(i in pros) {
			t.setAttribute(i, pros[i]);
		}
		return t;
	},
    /**
     * 获取元素的css样式，包括外部样式表里的内容
     * <p>
     * $.css('xiecn', 'height');
     * </p>
     * @param {String|Element} el 元素对象或元素id
     * @param {cssName} 样式名
     * @returns {String|Object} 对应样式的值 如果传入的是多值，那么值会JSON格式返回
     */
    css: function(el, cssName) {
        var len = arguments.length;
        if(len < 2) { return; }
        var el = typeof el === 'string' ? document.getElementById(el) : el,
            style = document.defaultView.getComputedStyle(el, null),
            checkPX = function(st) {
                return st.indexOf('px') != -1 ? Number(st.replace('px', '')) : st;
            };
        if(len == 2) {
            return checkPX(style[cssName]);
        }
        var i = 1, res = {}, cur;
        for(i; i < len; i++) {
            cur = arguments[i];
            res[cur] = checkPX(style[cur]);
        }
        return res;
    },
    g: function(id) {
    	return document.getElementById(id);
    },
    eval: function(str){
        return (new Function(str))();
    },
    cloneJSON: function(obj) {
        var o = {}, i;
        for(i in obj) {
            o[i] = obj[i];
        }
        return o;
    }
});

/**
 * 动画部分
 */
Query.extend({
    animate: function(el, pos, duration, callback) {
        if(!el) { return; }
        pos = Query.merge({ 
            left: '', //+=50
            top: '',
            opacity: ''
        }, pos);
        
        var rate = 25,
            speed = ({ slow: 600, normal: 400, fast: 200 })[duration];
        speed = speed ? speed : duration;
        var count = speed / rate + speed % rate,
            timerId,
            merge = function(s, t) {
                s = s ? s : 0;
        		if(t.indexOf('=') != -1) {
                    var arr = t.split('='), n = Number(arr[1]);
                    return arr[0] === '-' ? s - n : s + n;
        		}else {
                    return t;
                }
            },
            runTime = function (fn) {
                 timerId = setInterval(function() {
                    if(count-- < 1) {
                        clearInterval(timerId);
                        callback && callback();
                        return ;
                    }
                    fn();
                }, 25);
            },
            target = {},
            runMathod = {};
        
        if(pos.opacity !== '') {
            target.opacity = parseFloat(pos.opacity);
            target.originOpacity = parseFloat(Query.css(el, 'opacity'));
            target.opacitySpeedUp = Math.abs(target.opacity - target.originOpacity) / count;
            var high = function() {
                    target.originOpacity += target.opacitySpeedUp;
	            },
	            low = function() {
                    target.originOpacity -= target.opacitySpeedUp;
                },
                fn = target.opacity > target.originOpacity ? high : low;
            runMathod.opacityFn = function() {
                fn();
                el.style.opacity = target.originOpacity;
            };
        };
        
        if(pos.left) {
            target.left = merge(target.left, pos.left);
            var left = Query.css(el, 'left');
            target.originLeft = parseFloat(left === "auto" ? 0 : left);
            target.leftSpeedUp = Math.abs(target.left - target.originLeft) / count;
            var high = function() {
                    target.originLeft += target.leftSpeedUp;
                },
                low = function() {
                    target.originLeft -= target.leftSpeedUp;
                },
                fn = target.left > target.originLeft ? high : low;
            runMathod.leftFn = function() {
                fn();
                el.style.left = target.originLeft;
            };
        }
//        pos.left && merge('target.left', 'pos.left');
//        pos.top && merge('target.top', 'pos.top');
        
        runTime(function() {
            for(var i in runMathod) {
                runMathod[i]();
            }
        });
//            if(target.opacity > opacity) {
//				runTime(function() {
//                    opacity += speedUp;
//                    el.style.opacity = opacity;
//				});
//            }else {
//                runTime(function() {
//                   opacity -= speedUp;
//                    el.style.opacity = opacity;
//                });
//            }
    }
});
	
window.$ = window.Q = Query;
})(window);

