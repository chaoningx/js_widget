/**
 * @author xiechaoning
 */
var Widget = {},
	UI = {};
(function() {
	UI.Button = function(settings) {
		settings = $.merge({
			css: '',
			text: 'seasontop',
			click: false
		}, settings);
		var container = $.createElement('a', {}, {
			herf: 'javascript:;'
		});
		container.innerHTML = settings.text;
		container.className = 'ui-button' + (settings.css && ' ' + settings.css);
		container.addEventListener('click', function() {
			settings.click && settings.click();
		});
		this.container = container;
		this.settings = settings;
	};
	
	UI.Button.prototype = {
		appendTo: function(el) {
			el.appendChild(this.container);
		}
	};
	
	Widget.Magician = function() {
		
	};
	Widget.Magician.prototype = {
		
	};
})();
