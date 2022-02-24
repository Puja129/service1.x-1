'use strict';
(function () {
	Polymer({
		is: 'my-view1',
		handleAddZone: function (e) {
			if (e.keyCode === 13) {
				var elm = Polymer.dom(this.root).querySelector('#inputForValidation');
				this.zone = elm.value;

				if (window.location.href.indexOf('localhost') > -1) {
					this.memoryUrl = "http://localhost:8989/v1/health/memory";
					return;
				}

				var op = window.location.href.split(".");
				op.shift();

				var s = op[op.length - 1];
				s = s.substr(0, s.indexOf('/'));
				op.pop();
				op.push(s);
				
				var v1 = Polymer.dom(this.root).querySelector('#v1');
				if (v1.checked == true) {
					this.memoryUrl = 'https://' + this.zone + '.' + op.join('.') + '/v1/health/memory';
				} else {
					this.memoryUrl = 'https://' + this.zone + '.' + op.join('.') + '/beta/health/memory';
				}
			}
		},
		handleAddGateway: function (e) {
			if (e.keyCode === 13) {
				var elm = Polymer.dom(this.root).querySelector('#gatewayInputForValidation');
				this.gateway = elm.value + '/health';
			}
		},
		showGatewayCard: function (e) {
			// Declare all variables
			var card;

			// Get all elements with class="tabcontent" and hide them
			//cards = document.getElementsByClassName("card");
			card = Polymer.dom(this.root).querySelector('#Service');
			card.style.display = "none";
			
			card = Polymer.dom(this.root).querySelector('#Gateway');
			card.style.display = "block";
		},
		showServiceCard: function (e) {
			// Declare all variables
			var card;

			// Get all elements with class="tabcontent" and hide them
			//cards = document.getElementsByClassName("card");
			card = Polymer.dom(this.root).querySelector('#Gateway');
			card.style.display = "none";
			
			card = Polymer.dom(this.root).querySelector('#Service');
			card.style.display = "block";
			
		},
		properties: {
			memoryUrl: String,
			zone: String,
			gateway: String
		},
		ready: function () {
			var _this = this,
				el1 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.memContainer,
						events: {
							load: _op1
						}
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'heapTotal',
						data: []
		    }, {
						name: 'heapUsed',
						data: []
		    }]
				}),
				el2 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.rssContainer
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'rss',
						data: []
		    }]
				}),
				el3 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.usrCPUContainer,
						events: {
							load: _op2
						}
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'User CPU Usage (microsecond)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'user',
						data: []
		    }]
				}),
				el4 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.stmCPUContainer,
						events: {
							load: _op2
						}
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'System CPU Usage (microsecond)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'system',
						data: []
		    }]
				}),
					gwc = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.gwConnectionsContainer,
						events: {
							load: _gwc
						}
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Number of Connections'
						},
						maxZoom: 10
					},
					series: [{
						name: 'Superconnections',
						data: []
		    },
				{
						name: 'Client Pool',
						data: []
				}]
				}),
					gw1 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.gwAllocContainer,
						events: {
							load: _gwm
						}
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'Alloc',
						data: []
		    }]
				}),
					gw2 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.gwTotalAllocContainer
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'TotalAlloc',
						data: []
		    }]
				}),
					gw3 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.gwHeapAllocContainer
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'HeapAlloc',
						data: []
		    }]
				}),
					gw4 = new Highcharts.Chart({
					chart: {
						defaultSeriesType: 'spline',
						renderTo: this.$.gwHeapSysContainer
					},
					title: {
						text: ' - '
					},
					xAxis: {
						type: 'linear',
						tickPixelInterval: 150,
						maxZoom: 20
					},
					yAxis: {
						minPadding: 0.2,
						maxPadding: 0.2,
						title: {
							margin: 80,
							text: 'Memory Usage (Bytes)'
						},
						maxZoom: 500
					},
					series: [{
						name: 'HeapSys',
						data: []
		    }]
				});

			function _op1() {

				setTimeout(_op1, 1000);

				if (!_this.zone)
					return;

				var _ir = document.createElement('iron-request');

				_ir.send({
					url: _this.memoryUrl,
					method: 'GET'
				});

				_ir.completes.then(function (obj) {
					var series = el1.series[0],
						shift = series.data.length > 50,
						ref = JSON.parse(obj.response).data.memory; // shift if the series is 
					// longer than 20
					el1.title.textStr = 'zone id:' + _this.zone;
					el1.title.add();
					el1.series[0].addPoint(ref.heapTotal / 1024, true, shift);
					el1.series[1].addPoint(ref.heapUsed / 1024, true, shift);

					el2.title.textStr = 'zone id:' + _this.zone;
					el2.title.add();
					el2.series[0].addPoint(ref.rss / 1024, true, shift);

					// call it again after one second
					//_jElm.innerHTML=data.response;
				});
				//this.$.container.appendChild(el);
			};

			function _op2() {

				setTimeout(_op2, 1000);

				if (!_this.zone)
					return;

				var _ir = document.createElement('iron-request');

				_ir.send({
					url: _this.memoryUrl,
					method: 'GET'
				});

				_ir.completes.then(function (obj) {
					var series = el2.series[0],
						shift = series.data.length > 50,
						ref = JSON.parse(obj.response).data.cpu; // shift if the series is 
					// longer than 20
					el3.title.textStr = 'zone id:' + _this.zone;
					el3.title.add();
					el3.series[0].addPoint(ref.user, true, shift);

					el4.title.textStr = 'zone id:' + _this.zone;
					el4.title.add();
					el4.series[0].addPoint(ref.system, true, shift);

					// call it again after one second
					//_jElm.innerHTML=data.response;
				});
				//this.$.container.appendChild(el);
			};
			
			function _gwc() {

				setTimeout(_gwc, 1000);

				if (!_this.gateway)
					return;

				var _ir = document.createElement('iron-request');

				_ir.send({
					url: _this.gateway,
					method: 'GET'
				});

				_ir.completes.then(function (obj) {
					var series = gwc.series[0],
						shift = series.data.length > 50,
						ref = JSON.parse(obj.response); // shift if the series is 
					// longer than 20
					gwc.title.textStr = 'Gateway Version: ' + ref.Version;
					gwc.title.add();
					gwc.series[0].addPoint(ref.SuperConns.length, true, shift);
					gwc.series[1].addPoint(ref.ClientPool.length, true, shift);

					// call it again after one second
					//_jElm.innerHTML=data.response;
				});
				//this.$.container.appendChild(el);
			};
			
			function _gwm() {

				setTimeout(_gwm, 1000);

				if (!_this.gateway)
					return;

				var _ir = document.createElement('iron-request');

				_ir.send({
					url: _this.gateway,
					method: 'GET'
				});

				_ir.completes.then(function (obj) {
					var series = gwc.series[0],
						shift = series.data.length > 50,
						ref = JSON.parse(obj.response); // shift if the series is 
					// longer than 20
					//gw1.title.textStr = 'Alloc';
					//gw1.title.add();
					gw1.series[0].addPoint(ref.Alloc, true, shift);
					
					//gw2.title.textStr = 'TotalAlloc';
					//gw2.title.add();
					gw2.series[0].addPoint(ref.TotalAlloc, true, shift);
					
					//gw3.title.textStr = 'HeapAlloc';
					//gw3.title.add();
					gw3.series[0].addPoint(ref.HeapAlloc, true, shift);
					
					//gw4.title.textStr = 'HeapSys';
					//gw4.title.add();
					gw4.series[0].addPoint(ref.HeapSys, true, shift);

					// call it again after one second
					//_jElm.innerHTML=data.response;
				});
				//this.$.container.appendChild(el);
			};
		}
	});


})();
