









(function (Highcharts) {
	
'use strict';


var defaultOptions = Highcharts.getOptions(),
	defaultPlotOptions = defaultOptions.plotOptions,
	seriesTypes = Highcharts.seriesTypes,
	merge = Highcharts.merge,
	noop = function () {},
	each = Highcharts.each;


defaultPlotOptions.funnel = merge(defaultPlotOptions.pie, {
	center: ['50%', '50%'],
	width: '90%',
	neckWidth: '30%',
	height: '100%',
	neckHeight: '25%',

	dataLabels: {
		
		connectorWidth: 1,
		connectorColor: '#606060'
	},
	size: true, 
	states: {
		select: {
			color: '#C0C0C0',
			borderColor: '#000000',
			shadow: false
		}
	}	
});


seriesTypes.funnel = Highcharts.extendClass(seriesTypes.pie, {
	
	type: 'funnel',
	animate: noop,

	


	translate: function () {
		
		var 
			
			getLength = function (length, relativeTo) {
				return (/%$/).test(length) ?
					relativeTo * parseInt(length, 10) / 100 :
					parseInt(length, 10);
			},
			
			sum = 0,
			series = this,
			chart = series.chart,
			plotWidth = chart.plotWidth,
			plotHeight = chart.plotHeight,
			cumulative = 0, 
			options = series.options,
			center = options.center,
			centerX = getLength(center[0], plotWidth),
			centerY = getLength(center[0], plotHeight),
			width = getLength(options.width, plotWidth),
			tempWidth,
			getWidthAt,
			height = getLength(options.height, plotHeight),
			neckWidth = getLength(options.neckWidth, plotWidth),
			neckHeight = getLength(options.neckHeight, plotHeight),
			neckY = height - neckHeight,
			data = series.data,
			path,
			fraction,
			half = options.dataLabels.position === 'left' ? 1 : 0,

			x1, 
			y1, 
			x2, 
			x3, 
			y3, 
			x4, 
			y5;

		
		series.getWidthAt = getWidthAt = function (y) {
			return y > height - neckHeight || height === neckHeight ?
				neckWidth :
				neckWidth + (width - neckWidth) * ((height - neckHeight - y) / (height - neckHeight));
		};
		series.getX = function (y, half) {
			return centerX + (half ? -1 : 1) * ((getWidthAt(y) / 2) + options.dataLabels.distance);
		};

		
		series.center = [centerX, centerY, height];
		series.centerX = centerX;

		





















		
		each(data, function (point) {
			sum += point.y;
		});

		each(data, function (point) {
			
			y5 = null;
			fraction = sum ? point.y / sum : 0;
			y1 = centerY - height / 2 + cumulative * height;
			y3 = y1 + fraction * height;
			
			tempWidth = getWidthAt(y1);
			x1 = centerX - tempWidth / 2;
			x2 = x1 + tempWidth;
			tempWidth = getWidthAt(y3);
			x3 = centerX - tempWidth / 2;
			x4 = x3 + tempWidth;

			
			if (y1 > neckY) {
				x1 = x3 = centerX - neckWidth / 2;
				x2 = x4 = centerX + neckWidth / 2;
			
			
			} else if (y3 > neckY) {
				y5 = y3;

				tempWidth = getWidthAt(neckY);
				x3 = centerX - tempWidth / 2;
				x4 = x3 + tempWidth;

				y3 = neckY;
			}

			
			path = [
				'M',
				x1, y1,
				'L',
				x2, y1,
				x4, y3
			];
			if (y5) {
				path.push(x4, y5, x3, y5);
			}
			path.push(x3, y3, 'Z');

			
			point.shapeType = 'path';
			point.shapeArgs = { d: path };


			
			point.percentage = fraction * 100;
			point.plotX = centerX;
			point.plotY = (y1 + (y5 || y3)) / 2;

			
			point.tooltipPos = [
				centerX,
				point.plotY
			];

			
			point.slice = noop;
			
			
			point.half = half;

			cumulative += fraction;
		});


		series.setTooltipPoints();
	},
	





	drawPoints: function () {
		var series = this,
			options = series.options,
			chart = series.chart,
			renderer = chart.renderer;

		each(series.data, function (point) {
			
			var graphic = point.graphic,
				shapeArgs = point.shapeArgs;

			if (!graphic) { 
				point.graphic = renderer.path(shapeArgs).
					attr({
						fill: point.color,
						stroke: options.borderColor,
						'stroke-width': options.borderWidth
					}).
					add(series.group);
					
			} else { 
				graphic.animate(shapeArgs);
			}
		});
	},

	


	sortByAngle: noop,
	
	


	drawDataLabels: function () {
		var data = this.data,
			labelDistance = this.options.dataLabels.distance,
			leftSide,
			sign,
			point,
			i = data.length,
			x,
			y;
		
		
		
		
		this.center[2] -= 2 * labelDistance;
		
		
		while (i--) {
			point = data[i];
			leftSide = point.half;
			sign = leftSide ? 1 : -1;
			y = point.plotY;
			x = this.getX(y, leftSide);
				
			
			point.labelPos = [
				0, 
				y, 
				x + (labelDistance - 5) * sign, 
				y, 
				x + labelDistance * sign, 
				y, 
				leftSide ? 'right' : 'left', 
				0 
			];
		}
		
		seriesTypes.pie.prototype.drawDataLabels.call(this);
	}

});


}(Highcharts));
