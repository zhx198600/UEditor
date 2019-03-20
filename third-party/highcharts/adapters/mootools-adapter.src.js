
(function () {

var win = window,
	doc = document,
	mooVersion = win.MooTools.version.substring(0, 3), 
	legacy = mooVersion === '1.2' || mooVersion === '1.1', 
	legacyEvent = legacy || mooVersion === '1.3', 
	$extend = win.$extend || function () {
		return Object.append.apply(Object, arguments);
	};

win.HighchartsAdapter = {
	



	init: function (pathAnim) {
		var fxProto = Fx.prototype,
			fxStart = fxProto.start,
			morphProto = Fx.Morph.prototype,
			morphCompute = morphProto.compute;

		
		
		fxProto.start = function (from, to) {
			var fx = this,
				elem = fx.element;

			
			if (from.d) {
				
				fx.paths = pathAnim.init(
					elem,
					elem.d,
					fx.toD
				);
			}
			fxStart.apply(fx, arguments);

			return this; 
		};

		
		morphProto.compute = function (from, to, delta) {
			var fx = this,
				paths = fx.paths;

			if (paths) {
				fx.element.attr(
					'd',
					pathAnim.step(paths[0], paths[1], delta, fx.toD)
				);
			} else {
				return morphCompute.apply(fx, arguments);
			}
		};
		
	},
	
	




	adapterRun: function (el, method) {
		
		
		
		if (method === 'width' || method === 'height') {
			return parseInt($(el).getStyle(method), 10);
		}
	},

	




	getScript: function (scriptLocation, callback) {
		
		var head = doc.getElementsByTagName('head')[0];
		var script = doc.createElement('script');

		script.type = 'text/javascript';
		script.src = scriptLocation;
		script.onload = callback;

		head.appendChild(script);
	},

	





	animate: function (el, params, options) {
		var isSVGElement = el.attr,
			effect,
			complete = options && options.complete;

		if (isSVGElement && !el.setStyle) {
			
			el.getStyle = el.attr;
			el.setStyle = function () { 
				var args = arguments;
				this.attr.call(this, args[0], args[1][0]);
			};
			
			el.$family = function () { return true; };
		}

		
		win.HighchartsAdapter.stop(el);

		
		effect = new Fx.Morph(
			isSVGElement ? el : $(el),
			$extend({
				transition: Fx.Transitions.Quad.easeInOut
			}, options)
		);

		
		if (isSVGElement) {
			effect.element = el;
		}

		
		if (params.d) {
			effect.toD = params.d;
		}

		
		if (complete) {
			effect.addEvent('complete', complete);
		}

		
		effect.start(params);

		
		el.fx = effect;
	},

	



	each: function (arr, fn) {
		return legacy ?
			$each(arr, fn) :
			Array.each(arr, fn);
	},

	




	map: function (arr, fn) {
		return arr.map(fn);
	},

	




	grep: function (arr, fn) {
		return arr.filter(fn);
	},
	
	


	inArray: function (item, arr, from) {
		return arr ? arr.indexOf(item, from) : -1;
	},

	


	offset: function (el) {
		var offsets = el.getPosition(); 
		return {
			left: offsets.x,
			top: offsets.y
		};
	},

	


	extendWithEvents: function (el) {
		
		
		if (!el.addEvent) {
			if (el.nodeName) {
				el = $(el); 
			} else {
				$extend(el, new Events()); 
			}
		}
	},

	





	addEvent: function (el, type, fn) {
		if (typeof type === 'string') { 

			if (type === 'unload') { 
				type = 'beforeunload';
			}

			win.HighchartsAdapter.extendWithEvents(el);

			el.addEvent(type, fn);
		}
	},

	removeEvent: function (el, type, fn) {
		if (typeof el === 'string') {
			
			return;
		}
		
		if (el.addEvent) { 
			if (type) {
				if (type === 'unload') { 
					type = 'beforeunload';
				}
	
				if (fn) {
					el.removeEvent(type, fn);
				} else if (el.removeEvents) { 
					el.removeEvents(type);
				}
			} else {
				el.removeEvents();
			}
		}
	},

	fireEvent: function (el, event, eventArguments, defaultFunction) {
		var eventArgs = {
			type: event,
			target: el
		};
		
		event = legacyEvent ? new Event(eventArgs) : new DOMEvent(eventArgs);
		event = $extend(event, eventArguments);

		
		if (!event.target && event.event) {
			event.target = event.event.target;
		}

		
		
		event.preventDefault = function () {
			defaultFunction = null;
		};
		
		
		if (el.fireEvent) {
			el.fireEvent(event.type, event);
		}

		
		if (defaultFunction) {
			defaultFunction(event);
		}
	},
	
	


	washMouseEvent: function (e) {
		if (e.page) {
			e.pageX = e.page.x;
			e.pageY = e.page.y;
		}
		return e;
	},

	


	stop: function (el) {
		if (el.fx) {
			el.fx.cancel();
		}
	}
};

}());
