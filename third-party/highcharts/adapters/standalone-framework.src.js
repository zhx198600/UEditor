var HighchartsAdapter = (function () {

var UNDEFINED,
	doc = document,
	emptyArray = [],
	timers = [],
	timerId,
	Fx;

Math.easeInOutSine = function (t, b, c, d) {
	return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};






function augment(obj) {
	function removeOneEvent(el, type, fn) {
		el.removeEventListener(type, fn, false);
	}

	function IERemoveOneEvent(el, type, fn) {
		fn = el.HCProxiedMethods[fn.toString()];
		el.detachEvent('on' + type, fn);
	}

	function removeAllEvents(el, type) {
		var events = el.HCEvents,
			remove,
			types,
			len,
			n;

		if (el.removeEventListener) {
			remove = removeOneEvent;
		} else if (el.attachEvent) {
			remove = IERemoveOneEvent;
		} else {
			return; 
		}


		if (type) {
			types = {};
			types[type] = true;
		} else {
			types = events;
		}

		for (n in types) {
			if (events[n]) {
				len = events[n].length;
				while (len--) {
					remove(el, n, events[n][len]);
				}
			}
		}
	}

	if (!obj.HCExtended) {
		Highcharts.extend(obj, {
			HCExtended: true,

			HCEvents: {},

			bind: function (name, fn) {
				var el = this,
					events = this.HCEvents,
					wrappedFn;

				
				if (el.addEventListener) {
					el.addEventListener(name, fn, false);

				
				} else if (el.attachEvent) {
					
					wrappedFn = function (e) {
						fn.call(el, e);
					};

					if (!el.HCProxiedMethods) {
						el.HCProxiedMethods = {};
					}

					
					el.HCProxiedMethods[fn.toString()] = wrappedFn;

					el.attachEvent('on' + name, wrappedFn);
				}


				if (events[name] === UNDEFINED) {
					events[name] = [];
				}

				events[name].push(fn);
			},

			unbind: function (name, fn) {
				var events,
					index;

				if (name) {
					events = this.HCEvents[name] || [];
					if (fn) {
						index = HighchartsAdapter.inArray(fn, events);
						if (index > -1) {
							events.splice(index, 1);
							this.HCEvents[name] = events;
						}
						if (this.removeEventListener) {
							removeOneEvent(this, name, fn);
						} else if (this.attachEvent) {
							IERemoveOneEvent(this, name, fn);
						}
					} else {
						removeAllEvents(this, name);
						this.HCEvents[name] = [];
					}
				} else {
					removeAllEvents(this);
					this.HCEvents = {};
				}
			},

			trigger: function (name, args) {
				var events = this.HCEvents[name] || [],
					target = this,
					len = events.length,
					i,
					preventDefault,
					fn;

				
				preventDefault = function () {
					args.defaultPrevented = true;
				};
				
				for (i = 0; i < len; i++) {
					fn = events[i];

					
					if (args.stopped) {
						return;
					}

					args.preventDefault = preventDefault;
					args.target = target;
					args.type = name; 
					
					
					if (fn.call(this, args) === false) {
						args.preventDefault();
					}
				}
			}
		});
	}

	return obj;
}


return {
	


	init: function (pathAnim) {

		



		if (!doc.defaultView) {
			this._getStyle = function (el, prop) {
				var val;
				if (el.style[prop]) {
					return el.style[prop];
				} else {
					if (prop === 'opacity') {
						prop = 'filter';
					}
					
					val = el.currentStyle[prop.replace(/\-(\w)/g, function (a, b) { return b.toUpperCase(); })];
					if (prop === 'filter') {
						val = val.replace(
							/alpha\(opacity=([0-9]+)\)/, 
							function (a, b) { 
								return b / 100; 
							}
						);
					}
					
					return val === '' ? 1 : val;
				} 
			};
			this.adapterRun = function (elem, method) {
				var alias = { width: 'clientWidth', height: 'clientHeight' }[method];

				if (alias) {
					elem.style.zoom = 1;
					return elem[alias] - 2 * parseInt(HighchartsAdapter._getStyle(elem, 'padding'), 10);
				}
			};
		}

		if (!Array.prototype.forEach) {
			this.each = function (arr, fn) { 
				var i = 0, 
					len = arr.length;
				for (; i < len; i++) {
					if (fn.call(arr[i], arr[i], i, arr) === false) {
						return i;
					}
				}
			};
		}

		if (!Array.prototype.indexOf) {
			this.inArray = function (item, arr) {
				var len, 
					i = 0;

				if (arr) {
					len = arr.length;
					
					for (; i < len; i++) {
						if (arr[i] === item) {
							return i;
						}
					}
				}

				return -1;
			};
		}

		if (!Array.prototype.filter) {
			this.grep = function (elements, callback) {
				var ret = [],
					i = 0,
					length = elements.length;

				for (; i < length; i++) {
					if (!!callback(elements[i], i)) {
						ret.push(elements[i]);
					}
				}

				return ret;
			};
		}

		


		


		Fx = function (elem, options, prop) {
			this.options = options;
			this.elem = elem;
			this.prop = prop;
		};
		Fx.prototype = {
			
			update: function () {
				var styles,
					paths = this.paths,
					elem = this.elem,
					elemelem = elem.element; 

				
				if (paths && elemelem) {
					elem.attr('d', pathAnim.step(paths[0], paths[1], this.now, this.toD));
				
				
				} else if (elem.attr) {
					if (elemelem) {
						elem.attr(this.prop, this.now);
					}

				
				} else {
					styles = {};
					styles[elem] = this.now + this.unit;
					Highcharts.css(elem, styles);
				}
				
				if (this.options.step) {
					this.options.step.call(this.elem, this.now, this);
				}

			},
			custom: function (from, to, unit) {
				var self = this,
					t = function (gotoEnd) {
						return self.step(gotoEnd);
					},
					i;

				this.startTime = +new Date();
				this.start = from;
				this.end = to;
				this.unit = unit;
				this.now = this.start;
				this.pos = this.state = 0;

				t.elem = this.elem;

				if (t() && timers.push(t) === 1) {
					timerId = setInterval(function () {
						
						for (i = 0; i < timers.length; i++) {
							if (!timers[i]()) {
								timers.splice(i--, 1);
							}
						}

						if (!timers.length) {
							clearInterval(timerId);
						}
					}, 13);
				}
			},
			
			step: function (gotoEnd) {
				var t = +new Date(),
					ret,
					done,
					options = this.options,
					i;

				if (this.elem.stopAnimation) {
					ret = false;

				} else if (gotoEnd || t >= options.duration + this.startTime) {
					this.now = this.end;
					this.pos = this.state = 1;
					this.update();

					this.options.curAnim[this.prop] = true;

					done = true;
					for (i in options.curAnim) {
						if (options.curAnim[i] !== true) {
							done = false;
						}
					}

					if (done) {
						if (options.complete) {
							options.complete.call(this.elem);
						}
					}
					ret = false;

				} else {
					var n = t - this.startTime;
					this.state = n / options.duration;
					this.pos = options.easing(n, 0, 1, options.duration);
					this.now = this.start + ((this.end - this.start) * this.pos);
					this.update();
					ret = true;
				}
				return ret;
			}
		};

		


		this.animate = function (el, prop, opt) {
			var start,
				unit = '',
				end,
				fx,
				args,
				name;

			el.stopAnimation = false; 

			if (typeof opt !== 'object' || opt === null) {
				args = arguments;
				opt = {
					duration: args[2],
					easing: args[3],
					complete: args[4]
				};
			}
			if (typeof opt.duration !== 'number') {
				opt.duration = 400;
			}
			opt.easing = Math[opt.easing] || Math.easeInOutSine;
			opt.curAnim = Highcharts.extend({}, prop);
			
			for (name in prop) {
				fx = new Fx(el, opt, name);
				end = null;
				
				if (name === 'd') {
					fx.paths = pathAnim.init(
						el,
						el.d,
						prop.d
					);
					fx.toD = prop.d;
					start = 0;
					end = 1;
				} else if (el.attr) {
					start = el.attr(name);
				} else {
					start = parseFloat(HighchartsAdapter._getStyle(el, name)) || 0;
					if (name !== 'opacity') {
						unit = 'px';
					}
				}
	
				if (!end) {
					end = parseFloat(prop[name]);
				}
				fx.custom(start, end, unit);
			}	
		};
	},

	


	_getStyle: function (el, prop) {
		return window.getComputedStyle(el).getPropertyValue(prop);
	},

	




	getScript: function (scriptLocation, callback) {
		
		var head = doc.getElementsByTagName('head')[0],
			script = doc.createElement('script');

		script.type = 'text/javascript';
		script.src = scriptLocation;
		script.onload = callback;

		head.appendChild(script);
	},

	


	inArray: function (item, arr) {
		return arr.indexOf ? arr.indexOf(item) : emptyArray.indexOf.call(arr, item);
	},


	


	adapterRun: function (elem, method) {
		return parseInt(HighchartsAdapter._getStyle(elem, method), 10);
	},

	


	grep: function (elements, callback) {
		return emptyArray.filter.call(elements, callback);
	},

	


	map: function (arr, fn) {
		var results = [], i = 0, len = arr.length;

		for (; i < len; i++) {
			results[i] = fn.call(arr[i], arr[i], i, arr);
		}

		return results;
	},

	offset: function (el) {
		var left = 0,
			top = 0;

		while (el) {
			left += el.offsetLeft;
			top += el.offsetTop;
			el = el.offsetParent;
		}

		return {
			left: left,
			top: top
		};
	},

	


	addEvent: function (el, type, fn) {
		augment(el).bind(type, fn);
	},

	


	removeEvent: function (el, type, fn) {
		augment(el).unbind(type, fn);
	},

	


	fireEvent: function (el, type, eventArguments, defaultFunction) {
		var e;

		if (doc.createEvent && (el.dispatchEvent || el.fireEvent)) {
			e = doc.createEvent('Events');
			e.initEvent(type, true, true);
			e.target = el;

			Highcharts.extend(e, eventArguments);

			if (el.dispatchEvent) {
				el.dispatchEvent(e);
			} else {
				el.fireEvent(type, e);
			}

		} else if (el.HCExtended === true) {
			eventArguments = eventArguments || {};
			el.trigger(type, eventArguments);
		}

		if (eventArguments && eventArguments.defaultPrevented) {
			defaultFunction = null;
		}

		if (defaultFunction) {
			defaultFunction(eventArguments);
		}
	},

	washMouseEvent: function (e) {
		return e;
	},


	


	stop: function (el) {
		el.stopAnimation = true;
	},

	




	each: function (arr, fn) { 
		return Array.prototype.forEach.call(arr, fn);
	}
};
}());
