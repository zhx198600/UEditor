
(function (Highcharts, UNDEFINED) {
var arrayMin = Highcharts.arrayMin,
	arrayMax = Highcharts.arrayMax,
	each = Highcharts.each,
	extend = Highcharts.extend,
	merge = Highcharts.merge,
	map = Highcharts.map,
	pick = Highcharts.pick,
	pInt = Highcharts.pInt,
	defaultPlotOptions = Highcharts.getOptions().plotOptions,
	seriesTypes = Highcharts.seriesTypes,
	extendClass = Highcharts.extendClass,
	splat = Highcharts.splat,
	wrap = Highcharts.wrap,
	Axis = Highcharts.Axis,
	Tick = Highcharts.Tick,
	Series = Highcharts.Series,
	colProto = seriesTypes.column.prototype,
	math = Math,
	mathRound = math.round,
	mathFloor = math.floor,
	mathMax = math.max,
	noop = function () {};
function Pane(options, chart, firstAxis) {
	this.init.call(this, options, chart, firstAxis);
}


extend(Pane.prototype, {
	
	


	init: function (options, chart, firstAxis) {
		var pane = this,
			backgroundOption,
			defaultOptions = pane.defaultOptions;
		
		pane.chart = chart;
		
		
		if (chart.angular) { 
			defaultOptions.background = {}; 
		}
		pane.options = options = merge(defaultOptions, options);
		
		backgroundOption = options.background;
		
		
		
		if (backgroundOption) {
			each([].concat(splat(backgroundOption)).reverse(), function (config) {
				var backgroundColor = config.backgroundColor; 
				config = merge(pane.defaultBackgroundOptions, config);
				if (backgroundColor) {
					config.backgroundColor = backgroundColor;
				}
				config.color = config.backgroundColor; 
				firstAxis.options.plotBands.unshift(config);
			});
		}
	},
	
	


	defaultOptions: {
		
		center: ['50%', '50%'],
		size: '85%',
		startAngle: 0
		
	},	
	
	


	defaultBackgroundOptions: {
		shape: 'circle',
		borderWidth: 1,
		borderColor: 'silver',
		backgroundColor: {
			linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
			stops: [
				[0, '#FFF'],
				[1, '#DDD']
			]
		},
		from: Number.MIN_VALUE, 
		innerRadius: 0,
		to: Number.MAX_VALUE, 
		outerRadius: '105%'
	}
	
});
var axisProto = Axis.prototype,
	tickProto = Tick.prototype;
	



var hiddenAxisMixin = {
	getOffset: noop,
	redraw: function () {
		this.isDirty = false; 
	},
	render: function () {
		this.isDirty = false; 
	},
	setScale: noop,
	setCategories: noop,
	setTitle: noop
};





var radialAxisMixin = {
	isRadial: true,
	
	


	defaultRadialGaugeOptions: {
		labels: {
			align: 'center',
			x: 0,
			y: null 
		},
		minorGridLineWidth: 0,
		minorTickInterval: 'auto',
		minorTickLength: 10,
		minorTickPosition: 'inside',
		minorTickWidth: 1,
		plotBands: [],
		tickLength: 10,
		tickPosition: 'inside',
		tickWidth: 2,
		title: {
			rotation: 0
		},
		zIndex: 2 
	},
	
	
	defaultRadialXOptions: {
		gridLineWidth: 1, 
		labels: {
			align: null, 
			distance: 15,
			x: 0,
			y: null 
		},
		maxPadding: 0,
		minPadding: 0,
		plotBands: [],
		showLastLabel: false, 
		tickLength: 0
	},
	
	
	defaultRadialYOptions: {
		gridLineInterpolation: 'circle',
		labels: {
			align: 'right',
			x: -3,
			y: -2
		},
		plotBands: [],
		showLastLabel: false,
		title: {
			x: 4,
			text: null,
			rotation: 90
		}
	},
	
	


	setOptions: function (userOptions) {
		
		this.options = merge(
			this.defaultOptions,
			this.defaultRadialOptions,
			userOptions
		);
		
	},
	
	



	getOffset: function () {
		
		axisProto.getOffset.call(this);
		
		
		this.chart.axisOffset[this.side] = 0;
	},


	



	getLinePath: function (lineWidth, radius) {
		var center = this.center;
		radius = pick(radius, center[2] / 2 - this.offset);
		
		return this.chart.renderer.symbols.arc(
			this.left + center[0],
			this.top + center[1],
			radius,
			radius, 
			{
				start: this.startAngleRad,
				end: this.endAngleRad,
				open: true,
				innerR: 0
			}
		);
	},

	




	setAxisTranslation: function () {
		
		
		axisProto.setAxisTranslation.call(this);
			
		
		if (this.center) { 
			if (this.isCircular) {
				
				this.transA = (this.endAngleRad - this.startAngleRad) / 
					((this.max - this.min) || 1);
					
				
			} else { 
				this.transA = (this.center[2] / 2) / ((this.max - this.min) || 1);
			}
			
			if (this.isXAxis) {
				this.minPixelPadding = this.transA * this.minPointOffset +
					(this.reversed ? (this.endAngleRad - this.startAngleRad) / 4 : 0); 
			}
		}
	},
	
	



	beforeSetTickPositions: function () {
		if (this.autoConnect) {
			this.max += (this.categories && 1) || this.pointRange || this.closestPointRange || 0; 
		}
	},
	
	



	setAxisSize: function () {
		
		axisProto.setAxisSize.call(this);

		if (this.isRadial) {

			
			this.center = this.pane.center = seriesTypes.pie.prototype.getCenter.call(this.pane);
			
			this.len = this.width = this.height = this.isCircular ?
				this.center[2] * (this.endAngleRad - this.startAngleRad) / 2 :
				this.center[2] / 2;
		}
	},
	
	



	getPosition: function (value, length) {
		if (!this.isCircular) {
			length = this.translate(value);
			value = this.min;	
		}
		
		return this.postTranslate(
			this.translate(value),
			pick(length, this.center[2] / 2) - this.offset
		);		
	},
	
	


	postTranslate: function (angle, radius) {
		
		var chart = this.chart,
			center = this.center;
			
		angle = this.startAngleRad + angle;
		
		return {
			x: chart.plotLeft + center[0] + Math.cos(angle) * radius,
			y: chart.plotTop + center[1] + Math.sin(angle) * radius
		}; 
		
	},
	
	


	getPlotBandPath: function (from, to, options) {
		var center = this.center,
			startAngleRad = this.startAngleRad,
			fullRadius = center[2] / 2,
			radii = [
				pick(options.outerRadius, '100%'),
				options.innerRadius,
				pick(options.thickness, 10)
			],
			percentRegex = /%$/,
			start,
			end,
			open,
			isCircular = this.isCircular, 
			ret;
			
		
		if (this.options.gridLineInterpolation === 'polygon') {
			ret = this.getPlotLinePath(from).concat(this.getPlotLinePath(to, true));
		
		
		} else {
			
			
			if (!isCircular) {
				radii[0] = this.translate(from);
				radii[1] = this.translate(to);
			}
			
			
			radii = map(radii, function (radius) {
				if (percentRegex.test(radius)) {
					radius = (pInt(radius, 10) * fullRadius) / 100;
				}
				return radius;
			});
			
			
			if (options.shape === 'circle' || !isCircular) {
				start = -Math.PI / 2;
				end = Math.PI * 1.5;
				open = true;
			} else {
				start = startAngleRad + this.translate(from);
				end = startAngleRad + this.translate(to);
			}
		
		
			ret = this.chart.renderer.symbols.arc(
				this.left + center[0],
				this.top + center[1],
				radii[0],
				radii[0],
				{
					start: start,
					end: end,
					innerR: pick(radii[1], radii[0] - radii[2]),
					open: open
				}
			);
		}
		 
		return ret;
	},
	
	


	getPlotLinePath: function (value, reverse) {
		var axis = this,
			center = axis.center,
			chart = axis.chart,
			end = axis.getPosition(value),
			xAxis,
			xy,
			tickPositions,
			ret;
		
		
		if (axis.isCircular) {
			ret = ['M', center[0] + chart.plotLeft, center[1] + chart.plotTop, 'L', end.x, end.y];
		
		
		} else if (axis.options.gridLineInterpolation === 'circle') {
			value = axis.translate(value);
			if (value) { 
				ret = axis.getLinePath(0, value);
			}
		
		} else {
			xAxis = chart.xAxis[0];
			ret = [];
			value = axis.translate(value);
			tickPositions = xAxis.tickPositions;
			if (xAxis.autoConnect) {
				tickPositions = tickPositions.concat([tickPositions[0]]);
			}
			
			if (reverse) {
				tickPositions = [].concat(tickPositions).reverse();
			}
				
			each(tickPositions, function (pos, i) {
				xy = xAxis.getPosition(pos, value);
				ret.push(i ? 'L' : 'M', xy.x, xy.y);
			});
			
		}
		return ret;
	},
	
	


	getTitlePosition: function () {
		var center = this.center,
			chart = this.chart,
			titleOptions = this.options.title;
		
		return { 
			x: chart.plotLeft + center[0] + (titleOptions.x || 0), 
			y: chart.plotTop + center[1] - ({ high: 0.5, middle: 0.25, low: 0 }[titleOptions.align] * 
				center[2]) + (titleOptions.y || 0)  
		};
	}
	
};





wrap(axisProto, 'init', function (proceed, chart, userOptions) {
	var axis = this,
		angular = chart.angular,
		polar = chart.polar,
		isX = userOptions.isX,
		isHidden = angular && isX,
		isCircular,
		startAngleRad,
		endAngleRad,
		options,
		chartOptions = chart.options,
		paneIndex = userOptions.pane || 0,
		pane,
		paneOptions;
		
	
	if (angular) {
		extend(this, isHidden ? hiddenAxisMixin : radialAxisMixin);
		isCircular =  !isX;
		if (isCircular) {
			this.defaultRadialOptions = this.defaultRadialGaugeOptions;
		}
		
	} else if (polar) {
		
		extend(this, radialAxisMixin);
		isCircular = isX;
		this.defaultRadialOptions = isX ? this.defaultRadialXOptions : merge(this.defaultYAxisOptions, this.defaultRadialYOptions);
		
	}
	
	
	proceed.call(this, chart, userOptions);
	
	if (!isHidden && (angular || polar)) {
		options = this.options;
		
		
		if (!chart.panes) {
			chart.panes = [];
		}
		this.pane = pane = chart.panes[paneIndex] = chart.panes[paneIndex] || new Pane(
			splat(chartOptions.pane)[paneIndex],
			chart,
			axis
		);
		paneOptions = pane.options;
		
			
		
		chart.inverted = false;
		chartOptions.chart.zoomType = null;
		
		
		
		
		this.startAngleRad = startAngleRad = (paneOptions.startAngle - 90) * Math.PI / 180;
		this.endAngleRad = endAngleRad = (pick(paneOptions.endAngle, paneOptions.startAngle + 360)  - 90) * Math.PI / 180;
		this.offset = options.offset || 0;
		
		this.isCircular = isCircular;
		
		
		if (isCircular && userOptions.max === UNDEFINED && endAngleRad - startAngleRad === 2 * Math.PI) {
			this.autoConnect = true;
		}
	}
	
});



	
wrap(tickProto, 'getPosition', function (proceed, horiz, pos, tickmarkOffset, old) {
	var axis = this.axis;
	
	return axis.getPosition ? 
		axis.getPosition(pos) :
		proceed.call(this, horiz, pos, tickmarkOffset, old);	
});




	
wrap(tickProto, 'getLabelPosition', function (proceed, x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
	var axis = this.axis,
		optionsY = labelOptions.y,
		ret,
		align = labelOptions.align,
		angle = ((axis.translate(this.pos) + axis.startAngleRad + Math.PI / 2) / Math.PI * 180) % 360;
	
	if (axis.isRadial) {
		ret = axis.getPosition(this.pos, (axis.center[2] / 2) + pick(labelOptions.distance, -25));
		
		
		if (labelOptions.rotation === 'auto') {
			label.attr({ 
				rotation: angle
			});
		
		
		} else if (optionsY === null) {
			optionsY = pInt(label.styles.lineHeight) * 0.9 - label.getBBox().height / 2;
		
		}
		
		
		if (align === null) {
			if (axis.isCircular) {
				if (angle > 20 && angle < 160) {
					align = 'left'; 
				} else if (angle > 200 && angle < 340) {
					align = 'right'; 
				} else {
					align = 'center'; 
				}
			} else {
				align = 'center';
			}
			label.attr({
				align: align
			});
		}
		
		ret.x += labelOptions.x;
		ret.y += optionsY;
		
	} else {
		ret = proceed.call(this, x, y, label, horiz, labelOptions, tickmarkOffset, index, step);
	}
	return ret;
});




wrap(tickProto, 'getMarkPath', function (proceed, x, y, tickLength, tickWidth, horiz, renderer) {
	var axis = this.axis,
		endPoint,
		ret;
		
	if (axis.isRadial) {
		endPoint = axis.getPosition(this.pos, axis.center[2] / 2 + tickLength);
		ret = [
			'M',
			x,
			y,
			'L',
			endPoint.x,
			endPoint.y
		];
	} else {
		ret = proceed.call(this, x, y, tickLength, tickWidth, horiz, renderer);
	}
	return ret;
});







defaultPlotOptions.arearange = merge(defaultPlotOptions.area, {
	lineWidth: 1,
	marker: null,
	threshold: null,
	tooltip: {
		pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.low}</b> - <b>{point.high}</b><br/>' 
	},
	trackByArea: true,
	dataLabels: {
		verticalAlign: null,
		xLow: 0,
		xHigh: 0,
		yLow: 0,
		yHigh: 0	
	}
});




seriesTypes.arearange = Highcharts.extendClass(seriesTypes.area, {
	type: 'arearange',
	pointArrayMap: ['low', 'high'],
	toYData: function (point) {
		return [point.low, point.high];
	},
	pointValKey: 'low',
	
	


	getSegments: function () {
		var series = this;

		each(series.points, function (point) {
			if (!series.options.connectNulls && (point.low === null || point.high === null)) {
				point.y = null;
			} else if (point.low === null && point.high !== null) {
				point.y = point.high;
			}
		});
		Series.prototype.getSegments.call(this);
	},
	
	


	translate: function () {
		var series = this,
			yAxis = series.yAxis;

		seriesTypes.area.prototype.translate.apply(series);

		
		each(series.points, function (point) {

			var low = point.low,
				high = point.high,
				plotY = point.plotY;

			if (high === null && low === null) {
				point.y = null;
			} else if (low === null) {
				point.plotLow = point.plotY = null;
				point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
			} else if (high === null) {
				point.plotLow = plotY;
				point.plotHigh = null;
			} else {
				point.plotLow = plotY;
				point.plotHigh = yAxis.translate(high, 0, 1, 0, 1);
			}
		});
	},
	
	



	getSegmentPath: function (segment) {
		
		var lowSegment,
			highSegment = [],
			i = segment.length,
			baseGetSegmentPath = Series.prototype.getSegmentPath,
			point,
			linePath,
			lowerPath,
			options = this.options,
			step = options.step,
			higherPath;
			
		
		lowSegment = HighchartsAdapter.grep(segment, function (point) {
			return point.plotLow !== null;
		});
		
		
		while (i--) {
			point = segment[i];
			if (point.plotHigh !== null) {
				highSegment.push({
					plotX: point.plotX,
					plotY: point.plotHigh
				});
			}
		}
		
		
		lowerPath = baseGetSegmentPath.call(this, lowSegment);
		if (step) {
			if (step === true) {
				step = 'left';
			}
			options.step = { left: 'right', center: 'center', right: 'left' }[step]; 
		}
		higherPath = baseGetSegmentPath.call(this, highSegment);
		options.step = step;
		
		
		linePath = [].concat(lowerPath, higherPath);
		
		
		higherPath[0] = 'L'; 
		this.areaPath = this.areaPath.concat(lowerPath, higherPath);
		
		return linePath;
	},
	
	



	drawDataLabels: function () {
		
		var data = this.data,
			length = data.length,
			i,
			originalDataLabels = [],
			seriesProto = Series.prototype,
			dataLabelOptions = this.options.dataLabels,
			point,
			inverted = this.chart.inverted;
			
		if (dataLabelOptions.enabled || this._hasPointLabels) {
			
			
			i = length;
			while (i--) {
				point = data[i];
				
				
				point.y = point.high;
				point.plotY = point.plotHigh;
				
				
				
				originalDataLabels[i] = point.dataLabel;
				point.dataLabel = point.dataLabelUpper;
				
				
				point.below = false;
				if (inverted) {
					dataLabelOptions.align = 'left';
					dataLabelOptions.x = dataLabelOptions.xHigh;								
				} else {
					dataLabelOptions.y = dataLabelOptions.yHigh;
				}
			}
			seriesProto.drawDataLabels.apply(this, arguments); 
			
			
			i = length;
			while (i--) {
				point = data[i];
				
				
				point.dataLabelUpper = point.dataLabel;
				point.dataLabel = originalDataLabels[i];
				
				
				point.y = point.low;
				point.plotY = point.plotLow;
				
				
				point.below = true;
				if (inverted) {
					dataLabelOptions.align = 'right';
					dataLabelOptions.x = dataLabelOptions.xLow;
				} else {
					dataLabelOptions.y = dataLabelOptions.yLow;
				}
			}
			seriesProto.drawDataLabels.apply(this, arguments);
		}
	
	},
	
	alignDataLabel: seriesTypes.column.prototype.alignDataLabel,
	
	getSymbol: seriesTypes.column.prototype.getSymbol,
	
	drawPoints: noop
});



defaultPlotOptions.areasplinerange = merge(defaultPlotOptions.arearange);




seriesTypes.areasplinerange = extendClass(seriesTypes.arearange, {
	type: 'areasplinerange',
	getPointSpline: seriesTypes.spline.prototype.getPointSpline
});


defaultPlotOptions.columnrange = merge(defaultPlotOptions.column, defaultPlotOptions.arearange, {
	lineWidth: 1,
	pointRange: null
});




seriesTypes.columnrange = extendClass(seriesTypes.arearange, {
	type: 'columnrange',
	


	translate: function () {
		var series = this,
			yAxis = series.yAxis,
			plotHigh;

		colProto.translate.apply(series);

		
		each(series.points, function (point) {
			var shapeArgs = point.shapeArgs,
				minPointLength = series.options.minPointLength,
				heightDifference,
				height,
				y;

			point.plotHigh = plotHigh = yAxis.translate(point.high, 0, 1, 0, 1);
			point.plotLow = point.plotY;

			
			y = plotHigh;
			height = point.plotY - plotHigh;

			if (height < minPointLength) {
				heightDifference = (minPointLength - height);
				height += heightDifference;
				y -= heightDifference / 2;
			}
			shapeArgs.height = height;
			shapeArgs.y = y;
		});
	},
	trackerGroups: ['group', 'dataLabels'],
	drawGraph: noop,
	pointAttrToOptions: colProto.pointAttrToOptions,
	drawPoints: colProto.drawPoints,
	drawTracker: colProto.drawTracker,
	animate: colProto.animate,
	getColumnMetrics: colProto.getColumnMetrics
});









defaultPlotOptions.gauge = merge(defaultPlotOptions.line, {
	dataLabels: {
		enabled: true,
		y: 15,
		borderWidth: 1,
		borderColor: 'silver',
		borderRadius: 3,
		style: {
			fontWeight: 'bold'
		},
		verticalAlign: 'top',
		zIndex: 2
	},
	dial: {
		
		
		
		
		
		
		
		
	},
	pivot: {
		
		
		
		
	},
	tooltip: {
		headerFormat: ''
	},
	showInLegend: false
});




var GaugePoint = Highcharts.extendClass(Highcharts.Point, {
	


	setState: function (state) {
		this.state = state;
	}
});





var GaugeSeries = {
	type: 'gauge',
	pointClass: GaugePoint,
	
	
	
	angular: true, 
	drawGraph: noop,
	fixedBox: true,
	trackerGroups: ['group', 'dataLabels'],
	
	


	translate: function () {
		
		var series = this,
			yAxis = series.yAxis,
			options = series.options,
			center = yAxis.center;
			
		series.generatePoints();
		
		each(series.points, function (point) {
			
			var dialOptions = merge(options.dial, point.dial),
				radius = (pInt(pick(dialOptions.radius, 80)) * center[2]) / 200,
				baseLength = (pInt(pick(dialOptions.baseLength, 70)) * radius) / 100,
				rearLength = (pInt(pick(dialOptions.rearLength, 10)) * radius) / 100,
				baseWidth = dialOptions.baseWidth || 3,
				topWidth = dialOptions.topWidth || 1,
				rotation = yAxis.startAngleRad + yAxis.translate(point.y, null, null, null, true);

			
			if (options.wrap === false) {
				rotation = Math.max(yAxis.startAngleRad, Math.min(yAxis.endAngleRad, rotation));
			}
			rotation = rotation * 180 / Math.PI;
				
			point.shapeType = 'path';
			point.shapeArgs = {
				d: dialOptions.path || [
					'M', 
					-rearLength, -baseWidth / 2, 
					'L', 
					baseLength, -baseWidth / 2,
					radius, -topWidth / 2,
					radius, topWidth / 2,
					baseLength, baseWidth / 2,
					-rearLength, baseWidth / 2,
					'z'
				],
				translateX: center[0],
				translateY: center[1],
				rotation: rotation
			};
			
			
			point.plotX = center[0];
			point.plotY = center[1];
		});
	},
	
	


	drawPoints: function () {
		
		var series = this,
			center = series.yAxis.center,
			pivot = series.pivot,
			options = series.options,
			pivotOptions = options.pivot,
			renderer = series.chart.renderer;
		
		each(series.points, function (point) {
			
			var graphic = point.graphic,
				shapeArgs = point.shapeArgs,
				d = shapeArgs.d,
				dialOptions = merge(options.dial, point.dial); 
			
			if (graphic) {
				graphic.animate(shapeArgs);
				shapeArgs.d = d; 
			} else {
				point.graphic = renderer[point.shapeType](shapeArgs)
					.attr({
						stroke: dialOptions.borderColor || 'none',
						'stroke-width': dialOptions.borderWidth || 0,
						fill: dialOptions.backgroundColor || 'black',
						rotation: shapeArgs.rotation 
					})
					.add(series.group);
			}
		});
		
		
		if (pivot) {
			pivot.animate({ 
				translateX: center[0],
				translateY: center[1]
			});
		} else {
			series.pivot = renderer.circle(0, 0, pick(pivotOptions.radius, 5))
				.attr({
					'stroke-width': pivotOptions.borderWidth || 0,
					stroke: pivotOptions.borderColor || 'silver',
					fill: pivotOptions.backgroundColor || 'black'
				})
				.translate(center[0], center[1])
				.add(series.group);
		}
	},
	
	


	animate: function (init) {
		var series = this;

		if (!init) {
			each(series.points, function (point) {
				var graphic = point.graphic;

				if (graphic) {
					
					graphic.attr({
						rotation: series.yAxis.startAngleRad * 180 / Math.PI
					});

					
					graphic.animate({
						rotation: point.shapeArgs.rotation
					}, series.options.animation);
				}
			});

			
			series.animate = null;
		}
	},
	
	render: function () {
		this.group = this.plotGroup(
			'group', 
			'series', 
			this.visible ? 'visible' : 'hidden', 
			this.options.zIndex, 
			this.chart.seriesGroup
		);
		seriesTypes.pie.prototype.render.call(this);
		this.group.clip(this.chart.clipRect);
	},
	
	setData: seriesTypes.pie.prototype.setData,
	drawTracker: seriesTypes.column.prototype.drawTracker
};
seriesTypes.gauge = Highcharts.extendClass(seriesTypes.line, GaugeSeries);




defaultPlotOptions.boxplot = merge(defaultPlotOptions.column, {
	fillColor: '#FFFFFF',
	lineWidth: 1,
	
	medianWidth: 2,
	states: {
		hover: {
			brightness: -0.3
		}
	},
	
	
	
	threshold: null,
	tooltip: {
		pointFormat: '<span style="color:{series.color};font-weight:bold">{series.name}</span><br/>' +
			'Maximum: {point.high}<br/>' +
			'Upper quartile: {point.q3}<br/>' +
			'Median: {point.median}<br/>' +
			'Lower quartile: {point.q1}<br/>' +
			'Minimum: {point.low}<br/>'
			
	},
	
	whiskerLength: '50%',
	whiskerWidth: 2
});


seriesTypes.boxplot = extendClass(seriesTypes.column, {
	type: 'boxplot',
	pointArrayMap: ['low', 'q1', 'median', 'q3', 'high'], 
	toYData: function (point) { 
		return [point.low, point.q1, point.median, point.q3, point.high];
	},
	pointValKey: 'high', 
	
	


	pointAttrToOptions: { 
		fill: 'fillColor',
		stroke: 'color',
		'stroke-width': 'lineWidth'
	},
	
	


	drawDataLabels: noop,

	


	translate: function () {
		var series = this,
			yAxis = series.yAxis,
			pointArrayMap = series.pointArrayMap;

		seriesTypes.column.prototype.translate.apply(series);

		
		each(series.points, function (point) {
			each(pointArrayMap, function (key) {
				if (point[key] !== null) {
					point[key + 'Plot'] = yAxis.translate(point[key], 0, 1, 0, 1);
				}
			});
		});
	},

	


	drawPoints: function () {
		var series = this,  
			points = series.points,
			options = series.options,
			chart = series.chart,
			renderer = chart.renderer,
			pointAttr,
			q1Plot,
			q3Plot,
			highPlot,
			lowPlot,
			medianPlot,
			crispCorr,
			crispX,
			graphic,
			stemPath,
			stemAttr,
			boxPath,
			whiskersPath,
			whiskersAttr,
			medianPath,
			medianAttr,
			width,
			left,
			right,
			halfWidth,
			shapeArgs,
			color,
			doQuartiles = series.doQuartiles !== false, 
			whiskerLength = parseInt(series.options.whiskerLength, 10) / 100;


		each(points, function (point) {

			graphic = point.graphic;
			shapeArgs = point.shapeArgs; 
			stemAttr = {};
			whiskersAttr = {};
			medianAttr = {};
			color = point.color || series.color;
			
			if (point.plotY !== UNDEFINED) {

				pointAttr = point.pointAttr[point.selected ? 'selected' : ''];

				
				width = shapeArgs.width;
				left = mathFloor(shapeArgs.x);
				right = left + width;
				halfWidth = mathRound(width / 2);
				
				q1Plot = mathFloor(doQuartiles ? point.q1Plot : point.lowPlot);
				q3Plot = mathFloor(doQuartiles ? point.q3Plot : point.lowPlot);
				highPlot = mathFloor(point.highPlot);
				lowPlot = mathFloor(point.lowPlot);
				
				
				stemAttr.stroke = point.stemColor || options.stemColor || color;
				stemAttr['stroke-width'] = pick(point.stemWidth, options.stemWidth, options.lineWidth);
				stemAttr.dashstyle = point.stemDashStyle || options.stemDashStyle;
				
				
				whiskersAttr.stroke = point.whiskerColor || options.whiskerColor || color;
				whiskersAttr['stroke-width'] = pick(point.whiskerWidth, options.whiskerWidth, options.lineWidth);
				
				
				medianAttr.stroke = point.medianColor || options.medianColor || color;
				medianAttr['stroke-width'] = pick(point.medianWidth, options.medianWidth, options.lineWidth);
				
				
				
				crispCorr = (stemAttr['stroke-width'] % 2) / 2;
				crispX = left + halfWidth + crispCorr;				
				stemPath = [
					
					'M',
					crispX, q3Plot,
					'L',
					crispX, highPlot,
					
					
					'M',
					crispX, q1Plot,
					'L',
					crispX, lowPlot,
					'z'
				];
				
				
				if (doQuartiles) {
					crispCorr = (pointAttr['stroke-width'] % 2) / 2;
					crispX = mathFloor(crispX) + crispCorr;
					q1Plot = mathFloor(q1Plot) + crispCorr;
					q3Plot = mathFloor(q3Plot) + crispCorr;
					left += crispCorr;
					right += crispCorr;
					boxPath = [
						'M',
						left, q3Plot,
						'L',
						left, q1Plot,
						'L',
						right, q1Plot,
						'L',
						right, q3Plot,
						'L',
						left, q3Plot,
						'z'
					];
				}
				
				
				if (whiskerLength) {
					crispCorr = (whiskersAttr['stroke-width'] % 2) / 2;
					highPlot = highPlot + crispCorr;
					lowPlot = lowPlot + crispCorr;
					whiskersPath = [
						
						'M',
						crispX - halfWidth * whiskerLength, 
						highPlot,
						'L',
						crispX + halfWidth * whiskerLength, 
						highPlot,
						
						
						'M',
						crispX - halfWidth * whiskerLength, 
						lowPlot,
						'L',
						crispX + halfWidth * whiskerLength, 
						lowPlot
					];
				}
				
				
				crispCorr = (medianAttr['stroke-width'] % 2) / 2;				
				medianPlot = mathRound(point.medianPlot) + crispCorr;
				medianPath = [
					'M',
					left, 
					medianPlot,
					'L',
					right, 
					medianPlot,
					'z'
				];
				
				
				if (graphic) { 
					
					point.stem.animate({ d: stemPath });
					if (whiskerLength) {
						point.whiskers.animate({ d: whiskersPath });
					}
					if (doQuartiles) {
						point.box.animate({ d: boxPath });
					}
					point.medianShape.animate({ d: medianPath });
					
				} else { 
					point.graphic = graphic = renderer.g()
						.add(series.group);
					
					point.stem = renderer.path(stemPath)
						.attr(stemAttr)
						.add(graphic);
						
					if (whiskerLength) {
						point.whiskers = renderer.path(whiskersPath) 
							.attr(whiskersAttr)
							.add(graphic);
					}
					if (doQuartiles) {
						point.box = renderer.path(boxPath)
							.attr(pointAttr)
							.add(graphic);
					}	
					point.medianShape = renderer.path(medianPath)
						.attr(medianAttr)
						.add(graphic);
				}
			}
		});

	}


});









defaultPlotOptions.errorbar = merge(defaultPlotOptions.boxplot, {
	color: '#000000',
	grouping: false,
	linkedTo: ':previous',
	tooltip: {
		pointFormat: defaultPlotOptions.arearange.tooltip.pointFormat
	},
	whiskerWidth: null
});


seriesTypes.errorbar = extendClass(seriesTypes.boxplot, {
	type: 'errorbar',
	pointArrayMap: ['low', 'high'], 
	toYData: function (point) { 
		return [point.low, point.high];
	},
	pointValKey: 'high', 
	doQuartiles: false,

	



	getColumnMetrics: function () {
		return (this.linkedParent && this.linkedParent.columnMetrics) || 
			seriesTypes.column.prototype.getColumnMetrics.call(this);
	}
});









defaultPlotOptions.waterfall = merge(defaultPlotOptions.column, {
	lineWidth: 1,
	lineColor: '#333',
	dashStyle: 'dot',
	borderColor: '#333'
});



seriesTypes.waterfall = extendClass(seriesTypes.column, {
	type: 'waterfall',

	upColorProp: 'fill',

	pointArrayMap: ['low', 'y'],

	pointValKey: 'y',

	


	init: function (chart, options) {
		
		options.stacking = true;

		seriesTypes.column.prototype.init.call(this, chart, options);
	},


	


	translate: function () {
		var series = this,
			options = series.options,
			axis = series.yAxis,
			len,
			i,
			points,
			point,
			shapeArgs,
			stack,
			y,
			previousY,
			stackPoint,
			threshold = options.threshold,
			crispCorr = (options.borderWidth % 2) / 2;

		
		seriesTypes.column.prototype.translate.apply(this);

		previousY = threshold;
		points = series.points;

		for (i = 0, len = points.length; i < len; i++) {
			
			point = points[i];
			shapeArgs = point.shapeArgs;

			
			stack = series.getStack(i);
			stackPoint = stack.points[series.index];

			
			if (isNaN(point.y)) {
				point.y = series.yData[i];
			}

			
			y = mathMax(previousY, previousY + point.y) + stackPoint[0];
			shapeArgs.y = axis.translate(y, 0, 1);


			
			if (point.isSum || point.isIntermediateSum) {
				shapeArgs.y = axis.translate(stackPoint[1], 0, 1);
				shapeArgs.height = axis.translate(stackPoint[0], 0, 1) - shapeArgs.y;

			
			} else {
				previousY += stack.total;
			}

			
			if (shapeArgs.height < 0) {
				shapeArgs.y += shapeArgs.height;
				shapeArgs.height *= -1;
			}

			point.plotY = shapeArgs.y = mathRound(shapeArgs.y) - crispCorr;
			shapeArgs.height = mathRound(shapeArgs.height);
			point.yBottom = shapeArgs.y + shapeArgs.height;
		}
	},

	


	processData: function (force) {
		var series = this,
			options = series.options,
			yData = series.yData,
			points = series.points,
			point,
			dataLength = yData.length,
			threshold = options.threshold || 0,
			subSum,
			sum,
			dataMin,
			dataMax,
			y,
			i;

		sum = subSum = dataMin = dataMax = threshold;

		for (i = 0; i < dataLength; i++) {
			y = yData[i];
			point = points && points[i] ? points[i] : {};

			if (y === "sum" || point.isSum) {
				yData[i] = sum;
			} else if (y === "intermediateSum" || point.isIntermediateSum) {
				yData[i] = subSum;
				subSum = threshold;
			} else {
				sum += y;
				subSum += y;
			}
			dataMin = Math.min(sum, dataMin);
			dataMax = Math.max(sum, dataMax);
		}

		Series.prototype.processData.call(this, force);

		
		series.dataMin = dataMin;
		series.dataMax = dataMax;
	},

	


	toYData: function (pt) {
		if (pt.isSum) {
			return "sum";
		} else if (pt.isIntermediateSum) {
			return "intermediateSum";
		}

		return pt.y;
	},

	


	getAttribs: function () {
		seriesTypes.column.prototype.getAttribs.apply(this, arguments);

		var series = this,
			options = series.options,
			stateOptions = options.states,
			upColor = options.upColor || series.color,
			hoverColor = Highcharts.Color(upColor).brighten(0.1).get(),
			seriesDownPointAttr = merge(series.pointAttr),
			upColorProp = series.upColorProp;

		seriesDownPointAttr[''][upColorProp] = upColor;
		seriesDownPointAttr.hover[upColorProp] = stateOptions.hover.upColor || hoverColor;
		seriesDownPointAttr.select[upColorProp] = stateOptions.select.upColor || upColor;

		each(series.points, function (point) {
			if (point.y > 0 && !point.color) {
				point.pointAttr = seriesDownPointAttr;
				point.color = upColor;
			}
		});
	},

	


	getGraphPath: function () {

		var data = this.data,
			length = data.length,
			lineWidth = this.options.lineWidth + this.options.borderWidth,
			normalizer = mathRound(lineWidth) % 2 / 2,
			path = [],
			M = 'M',
			L = 'L',
			prevArgs,
			pointArgs,
			i,
			d;

		for (i = 1; i < length; i++) {
			pointArgs = data[i].shapeArgs;
			prevArgs = data[i - 1].shapeArgs;

			d = [
				M,
				prevArgs.x + prevArgs.width, prevArgs.y + normalizer,
				L,
				pointArgs.x, prevArgs.y + normalizer
			];

			if (data[i - 1].y < 0) {
				d[2] += prevArgs.height;
				d[5] += prevArgs.height;
			}

			path = path.concat(d);
		}

		return path;
	},

	


	getExtremes: noop,

	


	getStack: function (i) {
		var axis = this.yAxis,
			stacks = axis.stacks,
			key = this.stackKey;

		if (this.processedYData[i] < this.options.threshold) {
			key = '-' + key;
		}

		return stacks[key][i];
	},

	drawGraph: Series.prototype.drawGraph
});









defaultPlotOptions.bubble = merge(defaultPlotOptions.scatter, {
	dataLabels: {
		inside: true,
		style: {
			color: 'white',
			textShadow: '0px 0px 3px black'
		},
		verticalAlign: 'middle'
	},
	
	marker: {
		
		lineColor: null, 
		lineWidth: 1
	},
	minSize: 8,
	maxSize: '20%',
	
	tooltip: {
		pointFormat: '({point.x}, {point.y}), Size: {point.z}'
	},
	turboThreshold: 0,
	zThreshold: 0
});


seriesTypes.bubble = extendClass(seriesTypes.scatter, {
	type: 'bubble',
	pointArrayMap: ['y', 'z'],
	trackerGroups: ['group', 'dataLabelsGroup'],
	
	


	pointAttrToOptions: { 
		stroke: 'lineColor',
		'stroke-width': 'lineWidth',
		fill: 'fillColor'
	},
	
	


	applyOpacity: function (fill) {
		var markerOptions = this.options.marker,
			fillOpacity = pick(markerOptions.fillOpacity, 0.5);
		
		
		fill = fill || markerOptions.fillColor || this.color; 
		
		if (fillOpacity !== 1) {
			fill = Highcharts.Color(fill).setOpacity(fillOpacity).get('rgba');
		}
		return fill;
	},
	
	


	convertAttribs: function () {
		var obj = Series.prototype.convertAttribs.apply(this, arguments);
		
		obj.fill = this.applyOpacity(obj.fill);
		
		return obj;
	},

	




	getRadii: function (zMin, zMax, minSize, maxSize) {
		var len,
			i,
			pos,
			zData = this.zData,
			radii = [],
			zRange;
		
		
		for (i = 0, len = zData.length; i < len; i++) {
			zRange = zMax - zMin;
			pos = zRange > 0 ? 
				(zData[i] - zMin) / (zMax - zMin) : 
				0.5;
			radii.push(math.ceil(minSize + pos * (maxSize - minSize)) / 2);
		}
		this.radii = radii;
	},
	
	


	animate: function (init) {
		var animation = this.options.animation;
		
		if (!init) { 
			each(this.points, function (point) {
				var graphic = point.graphic,
					shapeArgs = point.shapeArgs;

				if (graphic && shapeArgs) {
					
					graphic.attr('r', 1);

					
					graphic.animate({
						r: shapeArgs.r
					}, animation);
				}
			});

			
			this.animate = null;
		}
	},
	
	


	translate: function () {
		
		var i,
			data = this.data,
			point,
			radius,
			radii = this.radii;
		
		
		seriesTypes.scatter.prototype.translate.call(this);
		
		
		i = data.length;
		
		while (i--) {
			point = data[i];
			radius = radii ? radii[i] : 0; 

			
			point.negative = point.z < (this.options.zThreshold || 0);
			
			if (radius >= this.minPxSize / 2) {
				
				point.shapeType = 'circle';
				point.shapeArgs = {
					x: point.plotX,
					y: point.plotY,
					r: radius
				};
				
				
				point.dlBox = {
					x: point.plotX - radius,
					y: point.plotY - radius,
					width: 2 * radius,
					height: 2 * radius
				};
			} else { 
				point.shapeArgs = point.plotY = point.dlBox = UNDEFINED; 
			}
		}
	},
	
	





	drawLegendSymbol: function (legend, item) {
		var radius = pInt(legend.itemStyle.fontSize) / 2;
		
		item.legendSymbol = this.chart.renderer.circle(
			radius,
			legend.baseline - radius,
			radius
		).attr({
			zIndex: 3
		}).add(item.legendGroup);
		item.legendSymbol.isMarker = true;	
		
	},
	
	drawPoints: seriesTypes.column.prototype.drawPoints,
	alignDataLabel: seriesTypes.column.prototype.alignDataLabel
});





Axis.prototype.beforePadding = function () {
	var axis = this,
		axisLength = this.len,
		chart = this.chart,
		pxMin = 0, 
		pxMax = axisLength,
		isXAxis = this.isXAxis,
		dataKey = isXAxis ? 'xData' : 'yData',
		min = this.min,
		extremes = {},
		smallestSize = math.min(chart.plotWidth, chart.plotHeight),
		zMin = Number.MAX_VALUE,
		zMax = -Number.MAX_VALUE,
		range = this.max - min,
		transA = axisLength / range,
		activeSeries = [];

	
	if (this.tickPositions) {
		each(this.series, function (series) {

			var seriesOptions = series.options,
				zData;

			if (series.type === 'bubble' && series.visible) {

				
				axis.allowZoomOutside = true;

				
				activeSeries.push(series);

				if (isXAxis) { 
				
					
					each(['minSize', 'maxSize'], function (prop) {
						var length = seriesOptions[prop],
							isPercent = /%$/.test(length);
						
						length = pInt(length);
						extremes[prop] = isPercent ?
							smallestSize * length / 100 :
							length;
						
					});
					series.minPxSize = extremes.minSize;
					
					
					zData = series.zData;
					if (zData.length) { 
						zMin = math.min(
							zMin,
							math.max(
								arrayMin(zData), 
								seriesOptions.displayNegative === false ? seriesOptions.zThreshold : -Number.MAX_VALUE
							)
						);
						zMax = math.max(zMax, arrayMax(zData));
					}
				}
			}
		});

		each(activeSeries, function (series) {

			var data = series[dataKey],
				i = data.length,
				radius;

			if (isXAxis) {
				series.getRadii(zMin, zMax, extremes.minSize, extremes.maxSize);
			}
			
			if (range > 0) {
				while (i--) {
					radius = series.radii[i];
					pxMin = Math.min(((data[i] - min) * transA) - radius, pxMin);
					pxMax = Math.max(((data[i] - min) * transA) + radius, pxMax);
				}
			}
		});
		
		if (activeSeries.length && range > 0 && pick(this.options.min, this.userMin) === UNDEFINED && pick(this.options.max, this.userMax) === UNDEFINED) {
			pxMax -= axisLength;
			transA *= (axisLength + pxMin - pxMax) / axisLength;
			this.min += pxMin / transA;
			this.max += pxMax / transA;
		}
	}
};










var seriesProto = Series.prototype,
	pointerProto = Highcharts.Pointer.prototype;







seriesProto.toXY = function (point) {
	var xy,
		chart = this.chart,
		plotX = point.plotX,
		plotY = point.plotY;
	
	
	point.rectPlotX = plotX;
	point.rectPlotY = plotY;
	
	
	point.clientX = ((plotX / Math.PI * 180) + this.xAxis.pane.options.startAngle) % 360;
	
	
	xy = this.xAxis.postTranslate(point.plotX, this.yAxis.len - plotY);
	point.plotX = point.polarPlotX = xy.x - chart.plotLeft;
	point.plotY = point.polarPlotY = xy.y - chart.plotTop;
};




seriesProto.orderTooltipPoints = function (points) {
	if (this.chart.polar) {
		points.sort(function (a, b) {
			return a.clientX - b.clientX;
		});

		
		
		if (points[0]) {
			points[0].wrappedClientX = points[0].clientX + 360;
			points.push(points[0]);
		}
	}
};





function initArea(proceed, chart, options) {
	proceed.call(this, chart, options);
	if (this.chart.polar) {
		
		



		this.closeSegment = function (path) {
			var center = this.xAxis.center;
			path.push(
				'L',
				center[0],
				center[1]
			);			
		};
		
		
		
		this.closedStacks = true;
	}
}
wrap(seriesTypes.area.prototype, 'init', initArea);
wrap(seriesTypes.areaspline.prototype, 'init', initArea);
		




wrap(seriesTypes.spline.prototype, 'getPointSpline', function (proceed, segment, point, i) {
	
	var ret,
		smoothing = 1.5, 
		denom = smoothing + 1,
		plotX, 
		plotY,
		lastPoint,
		nextPoint,
		lastX,
		lastY,
		nextX,
		nextY,
		leftContX,
		leftContY,
		rightContX,
		rightContY,
		distanceLeftControlPoint,
		distanceRightControlPoint,
		leftContAngle,
		rightContAngle,
		jointAngle;
		
		
	if (this.chart.polar) {
		
		plotX = point.plotX;
		plotY = point.plotY;
		lastPoint = segment[i - 1];
		nextPoint = segment[i + 1];
			
		
		if (this.connectEnds) {
			if (!lastPoint) {
				lastPoint = segment[segment.length - 2]; 
			}
			if (!nextPoint) {
				nextPoint = segment[1];
			}	
		}

		
		if (lastPoint && nextPoint) {
		
			lastX = lastPoint.plotX;
			lastY = lastPoint.plotY;
			nextX = nextPoint.plotX;
			nextY = nextPoint.plotY;
			leftContX = (smoothing * plotX + lastX) / denom;
			leftContY = (smoothing * plotY + lastY) / denom;
			rightContX = (smoothing * plotX + nextX) / denom;
			rightContY = (smoothing * plotY + nextY) / denom;
			distanceLeftControlPoint = Math.sqrt(Math.pow(leftContX - plotX, 2) + Math.pow(leftContY - plotY, 2));
			distanceRightControlPoint = Math.sqrt(Math.pow(rightContX - plotX, 2) + Math.pow(rightContY - plotY, 2));
			leftContAngle = Math.atan2(leftContY - plotY, leftContX - plotX);
			rightContAngle = Math.atan2(rightContY - plotY, rightContX - plotX);
			jointAngle = (Math.PI / 2) + ((leftContAngle + rightContAngle) / 2);
				
				
			
			if (Math.abs(leftContAngle - jointAngle) > Math.PI / 2) {
				jointAngle -= Math.PI;
			}
			
			
			leftContX = plotX + Math.cos(jointAngle) * distanceLeftControlPoint;
			leftContY = plotY + Math.sin(jointAngle) * distanceLeftControlPoint;
			rightContX = plotX + Math.cos(Math.PI + jointAngle) * distanceRightControlPoint;
			rightContY = plotY + Math.sin(Math.PI + jointAngle) * distanceRightControlPoint;
			
			
			point.rightContX = rightContX;
			point.rightContY = rightContY;

		}
		
		
		
		if (!i) {
			ret = ['M', plotX, plotY];
		} else { 
			ret = [
				'C',
				lastPoint.rightContX || lastPoint.plotX,
				lastPoint.rightContY || lastPoint.plotY,
				leftContX || plotX,
				leftContY || plotY,
				plotX,
				plotY
			];
			lastPoint.rightContX = lastPoint.rightContY = null; 
		}
		
		
	} else {
		ret = proceed.call(this, segment, point, i);
	}
	return ret;
});






wrap(seriesProto, 'translate', function (proceed) {
		
	
	proceed.call(this);
	
	
	if (this.chart.polar && !this.preventPostTranslate) {
		var points = this.points,
			i = points.length;
		while (i--) {
			
			this.toXY(points[i]);
		}
	}
});





wrap(seriesProto, 'getSegmentPath', function (proceed, segment) {
		
	var points = this.points;
	
	
	if (this.chart.polar && this.options.connectEnds !== false && 
			segment[segment.length - 1] === points[points.length - 1] && points[0].y !== null) {
		this.connectEnds = true; 
		segment = [].concat(segment, [points[0]]);
	}
	
	
	return proceed.call(this, segment);
	
});


function polarAnimate(proceed, init) {
	var chart = this.chart,
		animation = this.options.animation,
		group = this.group,
		markerGroup = this.markerGroup,
		center = this.xAxis.center,
		plotLeft = chart.plotLeft,
		plotTop = chart.plotTop,
		attribs;

	
	if (chart.polar) {
		
		
		
		if (chart.renderer.isSVG) {

			if (animation === true) {
				animation = {};
			}
	
			
			if (init) {
				
				
				attribs = {
					translateX: center[0] + plotLeft,
					translateY: center[1] + plotTop,
					scaleX: 0.001, 
					scaleY: 0.001
				};
					
				group.attr(attribs);
				if (markerGroup) {
					markerGroup.attrSetters = group.attrSetters;
					markerGroup.attr(attribs);
				}
				
			
			} else {
				attribs = {
					translateX: plotLeft,
					translateY: plotTop,
					scaleX: 1,
					scaleY: 1
				};
				group.animate(attribs, animation);
				if (markerGroup) {
					markerGroup.animate(attribs, animation);
				}
				
				
				this.animate = null;
			}
		}
	
	
	} else {
		proceed.call(this, init);
	} 
}


wrap(seriesProto, 'animate', polarAnimate);
wrap(colProto, 'animate', polarAnimate);






wrap(seriesProto, 'setTooltipPoints', function (proceed, renew) {
		
	if (this.chart.polar) {
		extend(this.xAxis, {
			tooltipLen: 360 
		});	
	}
	
	
	return proceed.call(this, renew);
});





wrap(colProto, 'translate', function (proceed) {
		
	var xAxis = this.xAxis,
		len = this.yAxis.len,
		center = xAxis.center,
		startAngleRad = xAxis.startAngleRad,
		renderer = this.chart.renderer,
		start,
		points,
		point,
		i;
	
	this.preventPostTranslate = true;
	
	
	proceed.call(this);
	
	
	if (xAxis.isRadial) {
		points = this.points;
		i = points.length;
		while (i--) {
			point = points[i];
			start = point.barX + startAngleRad;
			point.shapeType = 'path';
			point.shapeArgs = {
				d: renderer.symbols.arc(
					center[0],
					center[1],
					len - point.plotY,
					null, 
					{
						start: start,
						end: start + point.pointWidth,
						innerR: len - pick(point.yBottom, len)
					}
				)
			};
			this.toXY(point); 
		}
	}
});





wrap(colProto, 'alignDataLabel', function (proceed, point, dataLabel, options, alignTo, isNew) {
	
	if (this.chart.polar) {
		var angle = point.rectPlotX / Math.PI * 180,
			align,
			verticalAlign;
		
		
		if (options.align === null) {
			if (angle > 20 && angle < 160) {
				align = 'left'; 
			} else if (angle > 200 && angle < 340) {
				align = 'right'; 
			} else {
				align = 'center'; 
			}
			options.align = align;
		}
		if (options.verticalAlign === null) {
			if (angle < 45 || angle > 315) {
				verticalAlign = 'bottom'; 
			} else if (angle > 135 && angle < 225) {
				verticalAlign = 'top'; 
			} else {
				verticalAlign = 'middle'; 
			}
			options.verticalAlign = verticalAlign;
		}
		
		seriesProto.alignDataLabel.call(this, point, dataLabel, options, alignTo, isNew);
	} else {
		proceed.call(this, point, dataLabel, options, alignTo, isNew);
	}
	
});





wrap(pointerProto, 'getIndex', function (proceed, e) {
	var ret,
		chart = this.chart,
		center,
		x,
		y;
	
	if (chart.polar) {
		center = chart.xAxis[0].center;
		x = e.chartX - center[0] - chart.plotLeft;
		y = e.chartY - center[1] - chart.plotTop;
		
		ret = 180 - Math.round(Math.atan2(x, y) / Math.PI * 180);
	
	} else {
	
		
		ret = proceed.call(this, e);
	}
	return ret;
});




wrap(pointerProto, 'getCoordinates', function (proceed, e) {
	var chart = this.chart,
		ret = {
			xAxis: [],
			yAxis: []
		};
	
	if (chart.polar) {	

		each(chart.axes, function (axis) {
			var isXAxis = axis.isXAxis,
				center = axis.center,
				x = e.chartX - center[0] - chart.plotLeft,
				y = e.chartY - center[1] - chart.plotTop;
			
			ret[isXAxis ? 'xAxis' : 'yAxis'].push({
				axis: axis,
				value: axis.translate(
					isXAxis ?
						Math.PI - Math.atan2(x, y) : 
						Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), 
					true
				)
			});
		});
		
	} else {
		ret = proceed.call(this, e);
	}
	
	return ret;
});
}(Highcharts));
