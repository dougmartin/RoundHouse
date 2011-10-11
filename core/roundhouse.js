window.RoundHouse = (function () {

	function App(options, apiFn) {
		var params = ko.observable({}),
			self, views, settings, api;
		
		function parseParams() {
			var parsedParams = {};
			
			jQuery.each(location.hash.substr(1).split("|"), function (i, pair) {
				var nameValue = pair.split(":"),
					name, value;
					
				if (nameValue.length >= 2) {
					name = nameValue.shift();
					value = nameValue.join(":");
					parsedParams[name] = value;
				}
			});
			
			return parsedParams;
		}
		
		function setParams(newParams) {
			var newHash = [];
				
			jQuery.each(newParams, function (name, value) {
				newHash.push(name + ":" + value);
			});
			
			window.location.hash = newHash.join("|");
		}
		
		function addParam(name, value) {
			var parsedParams = parseParams();
			parsedParams[name] = value;
			setParams(parsedParams);		
		}
		
		function removeParam(name) {
			var parsedParams = parseParams();
			delete parsedParams[name];
			setParams(parsedParams);		
		}
		
		function removeParams(names) {
			setParams({});
		}
		
		function run() {
			var $window = $(window);
			
			if (!$window.hashchange) {
				throw "Aborting!  RoundHouse depends on jquery.ba-hashchange to run (http://benalman.com/projects/jquery-hashchange-plugin/)"
			}
			
			$window.hashchange(function () {
				params(parseParams());
			});
			$window.hashchange();		
		}
		
		function init(options) {
		
			// set the default settings
			settings = jQuery.extend({
				views: [],
				api: {}
			}, options);
		
			// create the views shortcut
			views = {};
			jQuery.each(settings.views, function (name, viewData) {
				views[name] = viewData.view;
			});
			
			// set each view to have a reference
			jQuery.each(views, function (name, view) {
				view.views = views;
			});
			
			// create the initial interface
			self = {
				settings: settings,
				views: views,
				params: params,
				run: run,
				setParams: setParams,
				addParam: addParam,
				removeParam: removeParam,
				removeParams: removeParams
			};
			
			// create the api using the initial interface
			self.api = apiFn ? apiFn(self) : settings.api;
			
			// set each view to have a reference to the api
			jQuery.each(views, function (name, view) {
				view.api = view.apiFn ? view.apiFn(self, view) : view.api;
			});			
			
			// bind each view
			jQuery.each(settings.views, function (i, viewData) {
				// a view may not be bound to the DOM
				if (viewData.id) {
					$("#" + viewData.id).each(function (i, el) {
						ko.applyBindings(viewData.view, el);
					});
				}
			});
			
			// return the interface
			return self;
		}
		
		return init(options);
	}

	function View(options, apiFn) {
		var self, settings, api;
		
		function init(options) {
		
			// set the default settings
			settings = jQuery.extend({
				views: {},
				api: {}
			}, options);
		
			// create the interface.
			// the app will call apiFn after it initializes
			self = {
				settings: settings,
				apiFn: apiFn,
				api: settings.api
			};
			
			return self;
		}
		
		return init(options);
	}

	return {
		App: App,
		View: View
	}

})();
