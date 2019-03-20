














(function (Highcharts) {
	var UNDEFINED,
		Axis = Highcharts.Axis,
		Chart = Highcharts.Chart,
		Point = Highcharts.Point,
		Pointer = Highcharts.Pointer,
		each = Highcharts.each,
		extend = Highcharts.extend,
		merge = Highcharts.merge,
		pick = Highcharts.pick,
		numberFormat = Highcharts.numberFormat,
		defaultOptions = Highcharts.getOptions(),
		seriesTypes = Highcharts.seriesTypes,
		plotOptions = defaultOptions.plotOptions,
		wrap = Highcharts.wrap,
		Color = Highcharts.Color,
		noop = function () {};

	

	



	function tweenColors(from, to, pos) {
		var i = 4,
			rgba = [];

		while (i--) {
			rgba[i] = Math.round(
				to.rgba[i] + (from.rgba[i] - to.rgba[i]) * (1 - pos)
			);
		}
		return 'rgba(' + rgba.join(',') + ')';
	}

	
	defaultOptions.mapNavigation = {
		buttonOptions: {
			align: 'right',
			verticalAlign: 'bottom',
			x: 0,
			width: 18,
			height: 18,
			style: {
				fontSize: '15px',
				fontWeight: 'bold',
				textAlign: 'center'
			}
		},
		buttons: {
			zoomIn: {
				onclick: function () {
					this.mapZoom(0.5);
				},
				text: '+',
				y: -32
			},
			zoomOut: {
				onclick: function () {
					this.mapZoom(2);
				},
				text: '-',
				y: 0
			}
		}
		
		
		
		

	};
	
	


	Highcharts.splitPath = function (path) {
		var i;

		
		path = path.replace(/([A-Za-z])/g, ' $1 ');
		
		path = path.replace(/^\s*/, "").replace(/\s*$/, "");
		
		
		path = path.split(/[ ,]+/);
		
		
		for (i = 0; i < path.length; i++) {
			if (!/[a-zA-Z]/.test(path[i])) {
				path[i] = parseFloat(path[i]);
			}
		}
		return path;
	};

	
	Highcharts.maps = {};
	
	



	wrap(Axis.prototype, 'getSeriesExtremes', function (proceed) {
		var isXAxis = this.isXAxis,
			dataMin,
			dataMax,
			xData = [];

		
		each(this.series, function (series, i) {
			if (series.useMapGeometry) {
				xData[i] = series.xData;
				series.xData = [];
			}
		});

		
		proceed.call(this);

		
		dataMin = pick(this.dataMin, Number.MAX_VALUE);
		dataMax = pick(this.dataMax, Number.MIN_VALUE);
		each(this.series, function (series, i) {
			if (series.useMapGeometry) {
				dataMin = Math.min(dataMin, series[isXAxis ? 'minX' : 'minY']);
				dataMax = Math.max(dataMax, series[isXAxis ? 'maxX' : 'maxY']);
				series.xData = xData[i]; 
			}
		});
		
		this.dataMin = dataMin;
		this.dataMax = dataMax;
	});
	
	


	wrap(Axis.prototype, 'setAxisTranslation', function (proceed) {
		var chart = this.chart,
			mapRatio,
			plotRatio = chart.plotWidth / chart.plotHeight,
			isXAxis = this.isXAxis,
			adjustedAxisLength,
			xAxis = chart.xAxis[0],
			padAxis;
		
		
		proceed.call(this);
		
		
		if (chart.options.chart.type === 'map' && !isXAxis && xAxis.transA !== UNDEFINED) {
			
			
			this.transA = xAxis.transA = Math.min(this.transA, xAxis.transA);
			
			mapRatio = (xAxis.max - xAxis.min) / (this.max - this.min);
			
			
			padAxis = mapRatio > plotRatio ? this : xAxis;
			
			
			adjustedAxisLength = (padAxis.max - padAxis.min) * padAxis.transA;
			padAxis.minPixelPadding = (padAxis.len - adjustedAxisLength) / 2;
		}
	});


	

	wrap(Chart.prototype, 'render', function (proceed) {
		var chart = this,
			mapNavigation = chart.options.mapNavigation;

		proceed.call(chart);

		
		chart.renderMapNavigation();

		
		if (mapNavigation.zoomOnDoubleClick) {
			Highcharts.addEvent(chart.container, 'dblclick', function (e) {
				chart.pointer.onContainerDblClick(e);
			});
		}

		
		if (mapNavigation.zoomOnMouseWheel) {
			Highcharts.addEvent(chart.container, document.onmousewheel === undefined ? 'DOMMouseScroll' : 'mousewheel', function (e) {
				chart.pointer.onContainerMouseWheel(e);
			});
		}
	});

	
	extend(Pointer.prototype, {

		


		onContainerDblClick: function (e) {
			var chart = this.chart;

			e = this.normalize(e);

			if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
				chart.mapZoom(
					0.5,
					chart.xAxis[0].toValue(e.chartX),
					chart.yAxis[0].toValue(e.chartY)
				);
			}
		},

		


		onContainerMouseWheel: function (e) {
			var chart = this.chart,
				delta;

			e = this.normalize(e);

			
			delta = e.detail || -(e.wheelDelta / 120);
			if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
				chart.mapZoom(
					delta > 0 ? 2 : 0.5,
					chart.xAxis[0].toValue(e.chartX),
					chart.yAxis[0].toValue(e.chartY)
				);
			}
		}
	});
	
	wrap(Pointer.prototype, 'init', function (proceed, chart, options) {

		proceed.call(this, chart, options);

		
		if (options.mapNavigation.enableTouchZoom) {
			this.pinchX = this.pinchHor = 
				this.pinchY = this.pinchVert = true;
		}
	});

	
	extend(Chart.prototype, {
		renderMapNavigation: function () {
			var chart = this,
				options = this.options.mapNavigation,
				buttons = options.buttons,
				n,
				button,
				buttonOptions,
				outerHandler = function () { 
					this.handler.call(chart); 
				};

			if (options.enableButtons) {
				for (n in buttons) {
					if (buttons.hasOwnProperty(n)) {
						buttonOptions = merge(options.buttonOptions, buttons[n]);

						button = chart.renderer.button(buttonOptions.text, 0, 0, outerHandler)
							.attr({
								width: buttonOptions.width,
								height: buttonOptions.height
							})
							.css(buttonOptions.style)
							.add();
						button.handler = buttonOptions.onclick;
						button.align(extend(buttonOptions, { width: button.width, height: button.height }), null, 'spacingBox');
					}
				}
			}
		},

		




		fitToBox: function (inner, outer) {
			each([['x', 'width'], ['y', 'height']], function (dim) {
				var pos = dim[0],
					size = dim[1];
				if (inner[pos] + inner[size] > outer[pos] + outer[size]) { 
					if (inner[size] > outer[size]) { 
						inner[size] = outer[size];
						inner[pos] = outer[pos];
					} else { 
						inner[pos] = outer[pos] + outer[size] - inner[size];
					}
				}
				if (inner[size] > outer[size]) {
					inner[size] = outer[size];
				}
				if (inner[pos] < outer[pos]) {
					inner[pos] = outer[pos];
				}
				
			});

			return inner;
		},

		


		mapZoom: function (howMuch, centerXArg, centerYArg) {

			if (this.isMapZooming) {
				return;
			}

			var chart = this,
				xAxis = chart.xAxis[0],
				xRange = xAxis.max - xAxis.min,
				centerX = pick(centerXArg, xAxis.min + xRange / 2),
				newXRange = xRange * howMuch,
				yAxis = chart.yAxis[0],
				yRange = yAxis.max - yAxis.min,
				centerY = pick(centerYArg, yAxis.min + yRange / 2),
				newYRange = yRange * howMuch,
				newXMin = centerX - newXRange / 2,
				newYMin = centerY - newYRange / 2,
				animation = pick(chart.options.chart.animation, true),
				delay,
				newExt = chart.fitToBox({
					x: newXMin,
					y: newYMin,
					width: newXRange,
					height: newYRange
				}, {
					x: xAxis.dataMin,
					y: yAxis.dataMin,
					width: xAxis.dataMax - xAxis.dataMin,
					height: yAxis.dataMax - yAxis.dataMin
				});

			xAxis.setExtremes(newExt.x, newExt.x + newExt.width, false);
			yAxis.setExtremes(newExt.y, newExt.y + newExt.height, false);

			
			delay = animation ? animation.duration || 500 : 0;
			if (delay) {
				chart.isMapZooming = true;
				setTimeout(function () {
					chart.isMapZooming = false;
				}, delay);
			}

			chart.redraw();
		}
	});
	
	


	plotOptions.map = merge(plotOptions.scatter, {
		animation: false, 
		nullColor: '#F8F8F8',
		borderColor: 'silver',
		borderWidth: 1,
		marker: null,
		stickyTracking: false,
		dataLabels: {
			verticalAlign: 'middle'
		},
		turboThreshold: 0,
		tooltip: {
			followPointer: true,
			pointFormat: '{point.name}: {point.y}<br/>'
		},
		states: {
			normal: {
				animation: true
			}
		}
	});

	var MapAreaPoint = Highcharts.extendClass(Point, {
		


		applyOptions: function (options, x) {

			var point = Point.prototype.applyOptions.call(this, options, x);

			if (point.path && typeof point.path === 'string') {
				point.path = point.options.path = Highcharts.splitPath(point.path);
			}

			return point;
		},
		


		onMouseOver: function () {
			clearTimeout(this.colorInterval);
			Point.prototype.onMouseOver.call(this);
		},
		





		onMouseOut: function () {
			var point = this,
				start = +new Date(),
				normalColor = Color(point.options.color),
				hoverColor = Color(point.pointAttr.hover.fill),
				animation = point.series.options.states.normal.animation,
				duration = animation && (animation.duration || 500);

			if (duration && normalColor.rgba.length === 4 && hoverColor.rgba.length === 4) {
				delete point.pointAttr[''].fill; 

				clearTimeout(point.colorInterval);
				point.colorInterval = setInterval(function () {
					var pos = (new Date() - start) / duration,
						graphic = point.graphic;
					if (pos > 1) {
						pos = 1;
					}
					if (graphic) {
						graphic.attr('fill', tweenColors(hoverColor, normalColor, pos));
					}
					if (pos >= 1) {
						clearTimeout(point.colorInterval);
					}
				}, 13);
			}
			Point.prototype.onMouseOut.call(point);
		}
	});

	


	seriesTypes.map = Highcharts.extendClass(seriesTypes.scatter, {
		type: 'map',
		pointAttrToOptions: { 
			stroke: 'borderColor',
			'stroke-width': 'borderWidth',
			fill: 'color'
		},
		colorKey: 'y',
		pointClass: MapAreaPoint,
		trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
		getSymbol: noop,
		supportsDrilldown: true,
		getExtremesFromAll: true,
		useMapGeometry: true, 
		init: function (chart) {
			var series = this,
				valueDecimals = chart.options.legend.valueDecimals,
				legendItems = [],
				name,
				from,
				to,
				fromLabel,
				toLabel,
				colorRange,
				valueRanges,
				gradientColor,
				grad,
				tmpLabel,
				horizontal = chart.options.legend.layout === 'horizontal';

			
			Highcharts.Series.prototype.init.apply(this, arguments);
			colorRange = series.options.colorRange;
			valueRanges = series.options.valueRanges;

			if (valueRanges) {
				each(valueRanges, function (range) {
					from = range.from;
					to = range.to;
					
					
					name = '';
					if (from === UNDEFINED) {
						name = '< ';
					} else if (to === UNDEFINED) {
						name = '> ';
					}
					if (from !== UNDEFINED) {
						name += numberFormat(from, valueDecimals);
					}
					if (from !== UNDEFINED && to !== UNDEFINED) {
						name += ' - ';
					}
					if (to !== UNDEFINED) {
						name += numberFormat(to, valueDecimals);
					}
					
					
					legendItems.push(Highcharts.extend({
						chart: series.chart,
						name: name,
						options: {},
						drawLegendSymbol: seriesTypes.area.prototype.drawLegendSymbol,
						visible: true,
						setState: function () {},
						setVisible: function () {}
					}, range));
				});
				series.legendItems = legendItems;

			} else if (colorRange) {

				from = colorRange.from;
				to = colorRange.to;
				fromLabel = colorRange.fromLabel;
				toLabel = colorRange.toLabel;

				
				grad = horizontal ? [0, 0, 1, 0] : [0, 1, 0, 0]; 
				if (!horizontal) {
					tmpLabel = fromLabel;
					fromLabel = toLabel;
					toLabel = tmpLabel;
				} 

				
				gradientColor = {
					linearGradient: { x1: grad[0], y1: grad[1], x2: grad[2], y2: grad[3] },
					stops: 
					[
						[0, from],
						[1, to]
					]
				};

				
				legendItems = [{
					chart: series.chart,
					options: {},
					fromLabel: fromLabel,
					toLabel: toLabel,
					color: gradientColor,
					drawLegendSymbol: this.drawLegendSymbolGradient,
					visible: true,
					setState: function () {},
					setVisible: function () {}
				}];

				series.legendItems = legendItems;
			}
		},

		


		drawLegendSymbol: seriesTypes.area.prototype.drawLegendSymbol,

		





		drawLegendSymbolGradient: function (legend, item) {
			var spacing = legend.options.symbolPadding,
				padding = pick(legend.options.padding, 8),
				positionY,
				positionX,
				gradientSize = this.chart.renderer.fontMetrics(legend.options.itemStyle.fontSize).h,
				horizontal = legend.options.layout === 'horizontal',
				box1,
				box2,
				box3,
				rectangleLength = pick(legend.options.rectangleLength, 200);

			
			if (horizontal) {
				positionY = -(spacing / 2);
				positionX = 0;
			} else {
				positionY = -rectangleLength + legend.baseline - (spacing / 2);
				positionX = padding + gradientSize;
			}

			
			item.fromText = this.chart.renderer.text(
					item.fromLabel,	
					positionX,		
					positionY		
				).attr({
					zIndex: 2
				}).add(item.legendGroup);
			box1 = item.fromText.getBBox();

			
			
			item.legendSymbol = this.chart.renderer.rect(
				horizontal ? box1.x + box1.width + spacing : box1.x - gradientSize - spacing,		
				box1.y,																				
				horizontal ? rectangleLength : gradientSize,											
				horizontal ? gradientSize : rectangleLength,										
				2																					
			).attr({
				zIndex: 1
			}).add(item.legendGroup);
			box2 = item.legendSymbol.getBBox();

			
			
			item.toText = this.chart.renderer.text(
					item.toLabel,
					box2.x + box2.width + spacing,
					horizontal ? positionY : box2.y + box2.height - spacing
				).attr({
					zIndex: 2
				}).add(item.legendGroup);
			box3 = item.toText.getBBox();

			
			if (horizontal) {
				legend.offsetWidth = box1.width + box2.width + box3.width + (spacing * 2) + padding;
				legend.itemY = gradientSize + padding;
			} else {
				legend.offsetWidth = Math.max(box1.width, box3.width) + (spacing) + box2.width + padding;
				legend.itemY = box2.height + padding;
				legend.itemX = spacing;
			}
		},

		


		getBox: function (paths) {
			var maxX = Number.MIN_VALUE, 
				minX =  Number.MAX_VALUE, 
				maxY = Number.MIN_VALUE, 
				minY =  Number.MAX_VALUE;
			
			
			
			each(paths || this.options.data, function (point) {
				var path = point.path,
					i = path.length,
					even = false, 
					pointMaxX = Number.MIN_VALUE, 
					pointMinX =  Number.MAX_VALUE, 
					pointMaxY = Number.MIN_VALUE, 
					pointMinY =  Number.MAX_VALUE;
					
				while (i--) {
					if (typeof path[i] === 'number' && !isNaN(path[i])) {
						if (even) { 
							pointMaxX = Math.max(pointMaxX, path[i]);
							pointMinX = Math.min(pointMinX, path[i]);
						} else { 
							pointMaxY = Math.max(pointMaxY, path[i]);
							pointMinY = Math.min(pointMinY, path[i]);
						}
						even = !even;
					}
				}
				
				point._maxX = pointMaxX;
				point._minX = pointMinX;
				point._maxY = pointMaxY;
				point._minY = pointMinY;

				maxX = Math.max(maxX, pointMaxX);
				minX = Math.min(minX, pointMinX);
				maxY = Math.max(maxY, pointMaxY);
				minY = Math.min(minY, pointMinY);
			});
			this.minY = minY;
			this.maxY = maxY;
			this.minX = minX;
			this.maxX = maxX;
			
		},
		
		
		
		



		translatePath: function (path) {
			
			var series = this,
				even = false, 
				xAxis = series.xAxis,
				yAxis = series.yAxis,
				i;
				
			
			path = [].concat(path);
				
			
			i = path.length;
			while (i--) {
				if (typeof path[i] === 'number') {
					if (even) { 
						path[i] = Math.round(xAxis.translate(path[i]));
					} else { 
						path[i] = Math.round(yAxis.len - yAxis.translate(path[i]));
					}
					even = !even;
				}
			}
			return path;
		},
		
		setData: function () {
			Highcharts.Series.prototype.setData.apply(this, arguments);
			this.getBox();
		},
		
		


		translate: function () {
			var series = this,
				dataMin = Number.MAX_VALUE,
				dataMax = Number.MIN_VALUE;
	
			series.generatePoints();
	
			each(series.data, function (point) {
				
				point.shapeType = 'path';
				point.shapeArgs = {
					d: series.translatePath(point.path)
				};
				
				
				if (typeof point.y === 'number') {
					if (point.y > dataMax) {
						dataMax = point.y;
					} else if (point.y < dataMin) {
						dataMin = point.y;
					}
				}
			});
			
			series.translateColors(dataMin, dataMax);
		},
		
		


		translateColors: function (dataMin, dataMax) {
			
			var seriesOptions = this.options,
				valueRanges = seriesOptions.valueRanges,
				colorRange = seriesOptions.colorRange,
				colorKey = this.colorKey,
				from,
				to;

			if (colorRange) {
				from = Color(colorRange.from);
				to = Color(colorRange.to);
			}
			
			each(this.data, function (point) {
				var value = point[colorKey],
					range,
					color,
					i,
					pos;

				if (valueRanges) {
					i = valueRanges.length;
					while (i--) {
						range = valueRanges[i];
						from = range.from;
						to = range.to;
						if ((from === UNDEFINED || value >= from) && (to === UNDEFINED || value <= to)) {
							color = range.color;
							break;
						}
							
					}
				} else if (colorRange && value !== undefined) {

					pos = 1 - ((dataMax - value) / (dataMax - dataMin));
					color = value === null ? seriesOptions.nullColor : tweenColors(from, to, pos);
				}

				if (color) {
					point.color = null; 
					point.options.color = color;
				}
			});
		},
		
		drawGraph: noop,
		
		



		drawDataLabels: noop,
		
		



		drawPoints: function () {
			var series = this,
				xAxis = series.xAxis,
				yAxis = series.yAxis,
				colorKey = series.colorKey;
			
			
			each(series.data, function (point) {
				point.plotY = 1; 
				if (point[colorKey] === null) {
					point[colorKey] = 0;
					point.isNull = true;
				}
			});
			
			
			seriesTypes.column.prototype.drawPoints.apply(series);
			
			each(series.data, function (point) {

				var dataLabels = point.dataLabels,
					minX = xAxis.toPixels(point._minX, true),
					maxX = xAxis.toPixels(point._maxX, true),
					minY = yAxis.toPixels(point._minY, true),
					maxY = yAxis.toPixels(point._maxY, true);

				point.plotX = Math.round(minX + (maxX - minX) * pick(dataLabels && dataLabels.anchorX, 0.5));
				point.plotY = Math.round(minY + (maxY - minY) * pick(dataLabels && dataLabels.anchorY, 0.5)); 
				
				
				
				if (point.isNull) {
					point[colorKey] = null;
				}
			});

			
			Highcharts.Series.prototype.drawDataLabels.call(series);
			
		},

		



		animateDrilldown: function (init) {
			var toBox = this.chart.plotBox,
				level = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1],
				fromBox = level.bBox,
				animationOptions = this.chart.options.drilldown.animation,
				scale;
				
			if (!init) {

				scale = Math.min(fromBox.width / toBox.width, fromBox.height / toBox.height);
				level.shapeArgs = {
					scaleX: scale,
					scaleY: scale,
					translateX: fromBox.x,
					translateY: fromBox.y
				};
				
				
				each(this.points, function (point) {

					point.graphic
						.attr(level.shapeArgs)
						.animate({
							scaleX: 1,
							scaleY: 1,
							translateX: 0,
							translateY: 0
						}, animationOptions);

				});

				delete this.animate;
			}
			
		},

		



		animateDrillupFrom: function (level) {
			seriesTypes.column.prototype.animateDrillupFrom.call(this, level);
		},


		



		animateDrillupTo: function (init) {
			seriesTypes.column.prototype.animateDrillupTo.call(this, init);
		}
	});


	
	plotOptions.mapline = merge(plotOptions.map, {
		lineWidth: 1,
		backgroundColor: 'none'
	});
	seriesTypes.mapline = Highcharts.extendClass(seriesTypes.map, {
		type: 'mapline',
		pointAttrToOptions: { 
			stroke: 'color',
			'stroke-width': 'lineWidth',
			fill: 'backgroundColor'
		},
		drawLegendSymbol: seriesTypes.line.prototype.drawLegendSymbol
	});

	
	plotOptions.mappoint = merge(plotOptions.scatter, {
		dataLabels: {
			enabled: true,
			format: '{point.name}',
			color: 'black',
			style: {
				textShadow: '0 0 5px white'
			}
		}
	});
	seriesTypes.mappoint = Highcharts.extendClass(seriesTypes.scatter, {
		type: 'mappoint'
	});
	

	
	


	Highcharts.Map = function (options, callback) {
		
		var hiddenAxis = {
				endOnTick: false,
				gridLineWidth: 0,
				labels: {
					enabled: false
				},
				lineWidth: 0,
				minPadding: 0,
				maxPadding: 0,
				startOnTick: false,
				tickWidth: 0,
				title: null
			},
			seriesOptions;
		
		
		seriesOptions = options.series;
		options.series = null;
		
		options = merge({
			chart: {
				type: 'map',
				panning: 'xy'
			},
			xAxis: hiddenAxis,
			yAxis: merge(hiddenAxis, { reversed: true })	
		},
		options, 
	
		{ 
			chart: {
				inverted: false
			}
		});
	
		options.series = seriesOptions;
	
	
		return new Highcharts.Chart(options, callback);
	};
}(Highcharts));
