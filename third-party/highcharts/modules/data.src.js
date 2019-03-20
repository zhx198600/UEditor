

















































































(function (Highcharts) {	
	
	
	var each = Highcharts.each;
	
	
	
	var Data = function (dataOptions, chartOptions) {
		this.init(dataOptions, chartOptions);
	};
	
	
	Highcharts.extend(Data.prototype, {
		
	


	init: function (options, chartOptions) {
		this.options = options;
		this.chartOptions = chartOptions;
		this.columns = options.columns || this.rowsToColumns(options.rows) || [];

		
		if (this.columns.length) {
			this.dataFound();

		
		} else {

			
			this.parseCSV();
			
			
			this.parseTable();

			
			this.parseGoogleSpreadsheet();	
		}

	},

	




	getColumnDistribution: function () {
		var chartOptions = this.chartOptions,
			getValueCount = function (type) {
				return (Highcharts.seriesTypes[type || 'line'].prototype.pointArrayMap || [0]).length;
			},
			globalType = chartOptions && chartOptions.chart && chartOptions.chart.type,
			individualCounts = [];

		each((chartOptions && chartOptions.series) || [], function (series) {
			individualCounts.push(getValueCount(series.type || globalType));
		});

		this.valueCount = {
			global: getValueCount(globalType),
			individual: individualCounts
		};
	},


	dataFound: function () {
		
		this.parseTypes();
		
		
		this.findHeaderRow();
		
		
		this.parsed();
		
		
		this.complete();
		
	},
	
	


	parseCSV: function () {
		var self = this,
			options = this.options,
			csv = options.csv,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE,
			lines,
			activeRowNo = 0;
			
		if (csv) {
			
			lines = csv
				.replace(/\r\n/g, "\n") 
				.replace(/\r/g, "\n") 
				.split(options.lineDelimiter || "\n");
			
			each(lines, function (line, rowNo) {
				var trimmed = self.trim(line),
					isComment = trimmed.indexOf('#') === 0,
					isBlank = trimmed === '',
					items;
				
				if (rowNo >= startRow && rowNo <= endRow && !isComment && !isBlank) {
					items = line.split(options.itemDelimiter || ',');
					each(items, function (item, colNo) {
						if (colNo >= startColumn && colNo <= endColumn) {
							if (!columns[colNo - startColumn]) {
								columns[colNo - startColumn] = [];					
							}
							
							columns[colNo - startColumn][activeRowNo] = item;
						}
					});
					activeRowNo += 1;
				}
			});

			this.dataFound();
		}
	},
	
	


	parseTable: function () {
		var options = this.options,
			table = options.table,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE,
			colNo;
			
		if (table) {
			
			if (typeof table === 'string') {
				table = document.getElementById(table);
			}
			
			each(table.getElementsByTagName('tr'), function (tr, rowNo) {
				colNo = 0; 
				if (rowNo >= startRow && rowNo <= endRow) {
					each(tr.childNodes, function (item) {
						if ((item.tagName === 'TD' || item.tagName === 'TH') && colNo >= startColumn && colNo <= endColumn) {
							if (!columns[colNo]) {
								columns[colNo] = [];					
							}
							columns[colNo][rowNo - startRow] = item.innerHTML;
							
							colNo += 1;
						}
					});
				}
			});

			this.dataFound(); 
		}
	},

	



	parseGoogleSpreadsheet: function () {
		var self = this,
			options = this.options,
			googleSpreadsheetKey = options.googleSpreadsheetKey,
			columns = this.columns,
			startRow = options.startRow || 0,
			endRow = options.endRow || Number.MAX_VALUE,
			startColumn = options.startColumn || 0,
			endColumn = options.endColumn || Number.MAX_VALUE,
			gr, 
			gc; 

		if (googleSpreadsheetKey) {
			jQuery.getJSON('https:
				  googleSpreadsheetKey + '/' + (options.googleSpreadsheetWorksheet || 'od6') +
					  '/public/values?alt=json-in-script&callback=?',
					  function (json) {
					
				
				var cells = json.feed.entry,
					cell,
					cellCount = cells.length,
					colCount = 0,
					rowCount = 0,
					i;
			
				
				
				for (i = 0; i < cellCount; i++) {
					cell = cells[i];
					colCount = Math.max(colCount, cell.gs$cell.col);
					rowCount = Math.max(rowCount, cell.gs$cell.row);			
				}
			
				
				for (i = 0; i < colCount; i++) {
					if (i >= startColumn && i <= endColumn) {
						
						columns[i - startColumn] = [];

						
						columns[i - startColumn].length = Math.min(rowCount, endRow - startRow);
					}
				}
				
				
				
				for (i = 0; i < cellCount; i++) {
					cell = cells[i];
					gr = cell.gs$cell.row - 1; 
					gc = cell.gs$cell.col - 1; 

					
					
					if (gc >= startColumn && gc <= endColumn &&
						gr >= startRow && gr <= endRow) {
						columns[gc - startColumn][gr - startRow] = cell.content.$t;
					}
				}
				self.dataFound();
			});
		}
	},
	
	




	findHeaderRow: function () {
		var headerRow = 0;
		each(this.columns, function (column) {
			if (typeof column[0] !== 'string') {
				headerRow = null;
			}
		});
		this.headerRow = 0;			
	},
	
	


	trim: function (str) {
		return typeof str === 'string' ? str.replace(/^\s+|\s+$/g, '') : str;
	},
	
	



	parseTypes: function () {
		var columns = this.columns,
			col = columns.length, 
			row,
			val,
			floatVal,
			trimVal,
			dateVal;
			
		while (col--) {
			row = columns[col].length;
			while (row--) {
				val = columns[col][row];
				floatVal = parseFloat(val);
				trimVal = this.trim(val);

				
				if (trimVal == floatVal) { 
				
					columns[col][row] = floatVal;
					
					
					if (floatVal > 365 * 24 * 3600 * 1000) {
						columns[col].isDatetime = true;
					} else {
						columns[col].isNumeric = true;
					}					
				
				} else { 
					dateVal = this.parseDate(val);
					
					if (col === 0 && typeof dateVal === 'number' && !isNaN(dateVal)) { 
						columns[col][row] = dateVal;
						columns[col].isDatetime = true;
					
					} else { 
						columns[col][row] = trimVal === '' ? null : trimVal;
					}
				}
				
			}
		}
	},
	
	dateFormats: {
		'YYYY-mm-dd': {
			regex: '^([0-9]{4})-([0-9]{2})-([0-9]{2})$',
			parser: function (match) {
				return Date.UTC(+match[1], match[2] - 1, +match[3]);
			}
		}
	},
	
	


	parseDate: function (val) {
		var parseDate = this.options.parseDate,
			ret,
			key,
			format,
			match;

		if (parseDate) {
			ret = parseDate(val);
		}
			
		if (typeof val === 'string') {
			for (key in this.dateFormats) {
				format = this.dateFormats[key];
				match = val.match(format.regex);
				if (match) {
					ret = format.parser(match);
				}
			}
		}
		return ret;
	},
	
	


	rowsToColumns: function (rows) {
		var row,
			rowsLength,
			col,
			colsLength,
			columns;

		if (rows) {
			columns = [];
			rowsLength = rows.length;
			for (row = 0; row < rowsLength; row++) {
				colsLength = rows[row].length;
				for (col = 0; col < colsLength; col++) {
					if (!columns[col]) {
						columns[col] = [];
					}
					columns[col][row] = rows[row][col];
				}
			}
		}
		return columns;
	},
	
	


	parsed: function () {
		if (this.options.parsed) {
			this.options.parsed.call(this, this.columns);
		}
	},
	
	



	complete: function () {
		
		var columns = this.columns,
			firstCol,
			type,
			options = this.options,
			valueCount,
			series,
			data,
			i,
			j,
			seriesIndex;
			
		
		if (options.complete) {

			this.getColumnDistribution();
			
			
			if (columns.length > 1) {
				firstCol = columns.shift();
				if (this.headerRow === 0) {
					firstCol.shift(); 
				}
				
				
				if (firstCol.isDatetime) {
					type = 'datetime';
				} else if (!firstCol.isNumeric) {
					type = 'category';
				}
			}

			
			for (i = 0; i < columns.length; i++) {
				if (this.headerRow === 0) {
					columns[i].name = columns[i].shift();
				}
			}
			
			
			series = [];
			for (i = 0, seriesIndex = 0; i < columns.length; seriesIndex++) {

				
				valueCount = Highcharts.pick(this.valueCount.individual[seriesIndex], this.valueCount.global);
				
				
				data = [];
				for (j = 0; j < columns[i].length; j++) {
					data[j] = [
						firstCol[j], 
						columns[i][j] !== undefined ? columns[i][j] : null
					];
					if (valueCount > 1) {
						data[j].push(columns[i + 1][j] !== undefined ? columns[i + 1][j] : null);
					}
					if (valueCount > 2) {
						data[j].push(columns[i + 2][j] !== undefined ? columns[i + 2][j] : null);
					}
					if (valueCount > 3) {
						data[j].push(columns[i + 3][j] !== undefined ? columns[i + 3][j] : null);
					}
					if (valueCount > 4) {
						data[j].push(columns[i + 4][j] !== undefined ? columns[i + 4][j] : null);
					}
				}

				
				series[seriesIndex] = {
					name: columns[i].name,
					data: data
				};

				i += valueCount;
			}
			
			
			options.complete({
				xAxis: {
					type: type
				},
				series: series
			});
		}
	}
	});
	
	
	Highcharts.Data = Data;
	Highcharts.data = function (options, chartOptions) {
		return new Data(options, chartOptions);
	};

	
	
	Highcharts.wrap(Highcharts.Chart.prototype, 'init', function (proceed, userOptions, callback) {
		var chart = this;

		if (userOptions && userOptions.data) {
			Highcharts.data(Highcharts.extend(userOptions.data, {
				complete: function (dataOptions) {
					
					
					if (userOptions.series) {
						each(userOptions.series, function (series, i) {
							userOptions.series[i] = Highcharts.merge(series, dataOptions.series[i]);
						});
					}

					
					userOptions = Highcharts.merge(dataOptions, userOptions);

					proceed.call(chart, userOptions, callback);
				}
			}), userOptions);
		} else {
			proceed.call(chart, userOptions, callback);
		}
	});

}(Highcharts));
