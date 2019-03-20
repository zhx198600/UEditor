









(function (H) { 
	
	var seriesTypes = H.seriesTypes,
		chartPrototype = H.Chart.prototype,
		defaultOptions = H.getOptions(),
		extend = H.extend;

	
	extend(defaultOptions.lang, {
		noData: 'No data to display'
	});
	
	
	defaultOptions.noData = {
		position: {
			x: 0,
			y: 0,			
			align: 'center',
			verticalAlign: 'middle'
		},
		attr: {						
		},
		style: {	
			fontWeight: 'bold',		
			fontSize: '12px',
			color: '#60606a'		
		}
	};

	

	
	function hasDataPie() {
		return !!this.points.length; 
	}

	seriesTypes.pie.prototype.hasData = hasDataPie;

	if (seriesTypes.gauge) {
		seriesTypes.gauge.prototype.hasData = hasDataPie;
	}

	if (seriesTypes.waterfall) {
		seriesTypes.waterfall.prototype.hasData = hasDataPie;
	}

	H.Series.prototype.hasData = function () {
		return this.dataMax !== undefined && this.dataMin !== undefined;
	};
	
	




	chartPrototype.showNoData = function (str) {
		var chart = this,
			options = chart.options,
			text = str || options.lang.noData,
			noDataOptions = options.noData;

		if (!chart.noDataLabel) {
			chart.noDataLabel = chart.renderer.label(text, 0, 0, null, null, null, null, null, 'no-data')
				.attr(noDataOptions.attr)
				.css(noDataOptions.style)
				.add();
			chart.noDataLabel.align(extend(chart.noDataLabel.getBBox(), noDataOptions.position), false, 'plotBox');
		}
	};

	

	
	chartPrototype.hideNoData = function () {
		var chart = this;
		if (chart.noDataLabel) {
			chart.noDataLabel = chart.noDataLabel.destroy();
		}
	};

	

	
	chartPrototype.hasData = function () {
		var chart = this,
			series = chart.series,
			i = series.length;

		while (i--) {
			if (series[i].hasData() && !series[i].options.isInternal) { 
				return true;
			}	
		}

		return false;
	};

	


	function handleNoData() {
		var chart = this;
		if (chart.hasData()) {
			chart.hideNoData();
		} else {
			chart.showNoData();
		}
	}

	


	chartPrototype.callbacks.push(function (chart) {
		H.addEvent(chart, 'load', handleNoData);
		H.addEvent(chart, 'redraw', handleNoData);
	});

}(Highcharts));
