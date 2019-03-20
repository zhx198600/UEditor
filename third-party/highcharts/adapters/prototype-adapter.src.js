var HighchartsAdapter = (function () {

var hasEffect = typeof Effect !== 'undefined';

return {

	



	init: function (pathAnim) {
		if (hasEffect) {
			






			Effect.HighchartsTransition = Class.create(Effect.Base, {
				initialize: function (element, attr, to, options) {
					var from,
						opts;

					this.element = element;
					this.key = attr;
					from = element.attr ? element.attr(attr) : $(element).getStyle(attr);

					
					if (attr === 'd') {
						this.paths = pathAnim.init(
							element,
							element.d,
							to
						);
						this.toD = to;


						
						from = 0;
						to = 1;
					}

					opts = Object.extend((options || {}), {
						from: from,
						to: to,
						attribute: attr
					});
					this.start(opts);
				},
				setup: function () {
					HighchartsAdapter._extend(this.element);
					
					
					if (!this.element._highchart_animation) {
						this.element._highchart_animation = {};
					}

					
					this.element._highchart_animation[this.key] = this;
				},
				update: function (position) {
					var paths = this.paths,
						element = this.element,
						obj;

					if (paths) {
						position = pathAnim.step(paths[0], paths[1], position, this.toD);
					}

					if (element.attr) { 
						
						if (element.element) { 
							element.attr(this.options.attribute, position);
						}
					
					} else { 
						obj = {};
						obj[this.options.attribute] = position;
						$(element).setStyle(obj);
					}
					
				},
				finish: function () {
					
					
					if (this.element && this.element._highchart_animation) { 
						delete this.element._highchart_animation[this.key];
					}
				}
			});
		}
	},
	
	




	adapterRun: function (el, method) {
		
		
		
		return parseInt($(el).getStyle(method), 10);
		
	},

	




	getScript: function (scriptLocation, callback) {
		var head = $$('head')[0]; 
		if (head) {
			
			head.appendChild(new Element('script', { type: 'text/javascript', src: scriptLocation}).observe('load', callback));
		}
	},

	



	addNS: function (eventName) {
		var HTMLEvents = /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
			MouseEvents = /^(?:click|mouse(?:down|up|over|move|out))$/;
		return (HTMLEvents.test(eventName) || MouseEvents.test(eventName)) ?
			eventName :
			'h:' + eventName;
	},

	
	addEvent: function (el, event, fn) {
		if (el.addEventListener || el.attachEvent) {
			Event.observe($(el), HighchartsAdapter.addNS(event), fn);

		} else {
			HighchartsAdapter._extend(el);
			el._highcharts_observe(event, fn);
		}
	},

	
	animate: function (el, params, options) {
		var key,
			fx;

		
		options = options || {};
		options.delay = 0;
		options.duration = (options.duration || 500) / 1000;
		options.afterFinish = options.complete;

		
		if (hasEffect) {
			for (key in params) {
				
				
				fx = new Effect.HighchartsTransition($(el), key, params[key], options);
			}
		} else {
			if (el.attr) { 
				for (key in params) {
					el.attr(key, params[key]);
				}
			}
			if (options.complete) {
				options.complete();
			}
		}

		if (!el.attr) { 
			$(el).setStyle(params);
		}
	},

	
	stop: function (el) {
		var key;
		if (el._highcharts_extended && el._highchart_animation) {
			for (key in el._highchart_animation) {
				
				
				el._highchart_animation[key].cancel();
			}
		}
	},

	
	each: function (arr, fn) {
		$A(arr).each(fn);
	},
	
	inArray: function (item, arr, from) {
		return arr ? arr.indexOf(item, from) : -1;
	},

	




	offset: function (el) {
		return $(el).cumulativeOffset();
	},

	
	
	fireEvent: function (el, event, eventArguments, defaultFunction) {
		if (el.fire) {
			el.fire(HighchartsAdapter.addNS(event), eventArguments);
		} else if (el._highcharts_extended) {
			eventArguments = eventArguments || {};
			el._highcharts_fire(event, eventArguments);
		}

		if (eventArguments && eventArguments.defaultPrevented) {
			defaultFunction = null;
		}

		if (defaultFunction) {
			defaultFunction(eventArguments);
		}
	},

	removeEvent: function (el, event, handler) {
		if ($(el).stopObserving) {
			if (event) {
				event = HighchartsAdapter.addNS(event);
			}
			$(el).stopObserving(event, handler);
		} if (window === el) {
			Event.stopObserving(el, event, handler);
		} else {
			HighchartsAdapter._extend(el);
			el._highcharts_stop_observing(event, handler);
		}
	},
	
	washMouseEvent: function (e) {
		return e;
	},

	
	grep: function (arr, fn) {
		return arr.findAll(fn);
	},

	
	map: function (arr, fn) {
		return arr.map(fn);
	},

	
	
	_extend: function (object) {
		if (!object._highcharts_extended) {
			Object.extend(object, {
				_highchart_events: {},
				_highchart_animation: null,
				_highcharts_extended: true,
				_highcharts_observe: function (name, fn) {
					this._highchart_events[name] = [this._highchart_events[name], fn].compact().flatten();
				},
				_highcharts_stop_observing: function (name, fn) {
					if (name) {
						if (fn) {
							this._highchart_events[name] = [this._highchart_events[name]].compact().flatten().without(fn);
						} else {
							delete this._highchart_events[name];
						}
					} else {
						this._highchart_events = {};
					}
				},
				_highcharts_fire: function (name, args) {
					var target = this;
					(this._highchart_events[name] || []).each(function (fn) {
						
						if (args.stopped) {
							return; 
						}

						
						args.preventDefault = function () {
							args.defaultPrevented = true;
						};
						args.target = target;

						
						if (fn.bind(this)(args) === false) {
							args.preventDefault();
						}
					}
.bind(this));
				}
			});
		}
	}
};
}());
