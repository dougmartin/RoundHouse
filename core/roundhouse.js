//
// RoundHouse v0.1
// (c) Doug Martin - https://github.com/dougmartin/RoundHouse
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
//

window.RoundHouse = (function () {

	function App(options, apiFn) {
		var params = ko.observable({}),
			self, views, settings, api;
		
		function parseParams() {
			var parsedParams = {};
			
			jQuery.each(location.hash.substr(1).split(settings.paramSeparators.pairs), function (i, pair) {
				var nameValue = pair.split(settings.paramSeparators.nameValue),
					name, value;
					
				if (nameValue.length >= 2) {
					name = nameValue.shift();
					value = nameValue.join(settings.paramSeparators.nameValue);
					parsedParams[name] = value;
				}
			});
			
			return parsedParams;
		}
		
		function buildParamString(newParams) {
			var newHash = [];
				
			jQuery.each(newParams, function (name, value) {
				newHash.push(name + settings.paramSeparators.nameValue + value);
			});
			
			return newHash.join(settings.paramSeparators.pairs);
		}
		
		function setParams(newParams) {
			window.location.hash = buildParamString(newParams);
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
			if (!names) {
				setParams({});
			}
			else {
				var parsedParams = parseParams();
				jQuery.each(names, function (i, name) {
					delete parsedParams[name];
				});
				setParams(parsedParams);		
			}
		}
		
		function watchParam(name, callback) {
			var lastValue = undefined;
			
			return params.subscribe(function (newParams) {
				if (newParams[name] !== lastValue) {
					lastValue = newParams[name];
					callback(newParams[name], newParams);
				}
			});
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
			settings.paramSeparators = jQuery.extend({ 
				pairs: "&",
				nameValue: "="
			}, settings.paramSeparators);
			
		
			// create the views shortcut
			views = {};
			jQuery.each(settings.views, function (name, viewData) {
				views[name] = viewData.view;
				views[name].context = viewData.id ? $("#" + viewData.id) : null;
			});
			
			// set each view to have a reference to all the views
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
				removeParams: removeParams,
				buildParamString: buildParamString,
				watchParam: watchParam
			};
			
			// create the api using the initial interface
			self.api = apiFn ? apiFn(self) : settings.api;
			
			// run the api init function across all the views
			jQuery.each(views, function (name, view) {
				view.api = view.apiFn ? view.apiFn(self, view) : view.api;
				view.app = self;
			});			
			
			// bind each view after they all have been inited so they can reference each other's api
			jQuery.each(views, function (name, view) {
				 
				// only bind views that exist in the DOM
				if (view.context) {
				
					view.context.each(function (i, el) {
						ko.applyBindings(view, el);
					});
				}
			});
			
			// return the interface
			return self;
		}
		
		// the options are optional...
		if (jQuery.isFunction(options)) {
			apiFn = options;
			options = {};
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
				context: null,
				settings: settings,
				apiFn: apiFn,
				api: settings.api,
				app: null
			};
			
			return self;
		}
		
		// the options are optional...
		if (jQuery.isFunction(options)) {
			apiFn = options;
			options = {};
		}
		
		return init(options);
	}

	return {
		App: App,
		View: View
	}

})();
