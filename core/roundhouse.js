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
			var sortedNames = [],
				newHash = [];
				
			jQuery.each(newParams, function (name, value) {
				sortedNames.push(name);
			});
			sortedNames.sort();
			
			jQuery.each(sortedNames, function (i, name) {
				newHash.push(name + settings.paramSeparators.nameValue + newParams[name]);
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
		
		function keepParams(names) {
			var parsedParams = parseParams(),
				newParams = {};
			jQuery.each(names || [], function (i, name) {
				if (parsedParams.hasOwnProperty(name)) {
					newParams[name] = parsedParams[name];
				}
			});
			setParams(newParams);		
		}		
		
		function watchParam(name, callbackOrObservable) {
			var lastValue = null;
			
			return params.subscribe(function (newParams) {
				if (newParams[name] !== lastValue) {
					lastValue = newParams[name];
					if (ko.isObservable(callbackOrObservable)) {
						callbackOrObservable(newParams[name]);
					} else {
						callbackOrObservable(newParams[name], newParams);
					}
				}
			});
		}
		
		function getParam(name, defaultValue) {
			var parsedParams = parseParams();
			return parsedParams[name] || defaultValue;
 		}
		
		function hasParam(name) {
			var parsedParams = parseParams();
			return parsedParams.hasOwnProperty(name);
 		}		
		
		function toggleParam(name, value) {
			if (getParam(name) === value) {
				removeParam(name);
			}
			else {
				addParam(name, value);
			}		
		}
		
		function hideAllExcept() {
			var args = Array.prototype.slice.call(arguments);
			
			jQuery.each(self.views, function (name, view) {
				view.visible(jQuery.inArray(name, args) !== -1);
			});
		}
		
		function initViews(newViews) {
			jQuery.each(newViews, function (name, view) {
				view.app = self;
				view.api = view.apiFn ? view.apiFn(self, view) : view.api;
				view.created(true);
			});			
		}
		
		function addViews(viewsToAdd, context, skipApiInit) {
			var newViews = {};
			
			jQuery.each(viewsToAdd, function (name, viewData) {
				if (typeof viewData === "string") {
					views[name] = View();
					views[name].context = $(viewData, context);
				}
				else if (viewData instanceof jQuery) {
					views[name] = View();
					views[name].context = viewData;
				}
				else {
					views[name] = viewData.view || View();
					views[name].context = viewData.selector ? $(viewData.selector, context) : null;
				}
				
				views[name].visible(views[name].context ? views[name].context.is(":visible") : null);
				
				// set each view to have a reference to all the views
				views[name].views = views;
				
				newViews[name] = views[name];
			});
			
			if (skipApiInit) {
				return;
			}
			
			initViews(newViews);
		}
		
		function run() {
			var $window = $(window);
			
			if (!$window.hashchange) {
				throw "Aborting!  RoundHouse depends on jquery.ba-hashchange to run (http://benalman.com/projects/jquery-hashchange-plugin/)"
			}
			
			self.started(true);
			
			$window.hashchange(function () {
				params(parseParams());
			});
			$window.hashchange();		
		}
		
		function init(options) {
		
			// set the default settings
			settings = jQuery.extend({
				selector: "",
				views: [],
				api: {}
			}, options);
			settings.paramSeparators = jQuery.extend({ 
				pairs: "&",
				nameValue: "="
			}, settings.paramSeparators);
			
			// create the views shortcut, skipping the api
			views = {};
			addViews(settings.views, null, true);
			
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
				keepParams: keepParams,
				buildParamString: buildParamString,
				watchParam: watchParam,
				getParam: getParam,
				hasParam: hasParam,
				toggleParam: toggleParam,
				hideAllExcept: hideAllExcept,
				addViews: addViews,
				
				created: ko.observable(false),
				started: ko.observable(false)
			};
			
			// set an app instance to itself for clearer templates
			self.app = self;
			
			// create the api using the initial interface
			self.api = apiFn ? apiFn(self) : settings.api;
			
			// run the api init function across all the views
			initViews(views);

			self.created(true);
			
			if (settings.selector) {
				// apply bindings to the supplied selector elements
				$(settings.selector).each(function () {
					ko.applyBindings(self, this);
				});
			}
			else {
				// bind the app to the entire DOM
				ko.applyBindings(self);
			}
			
			// return the interface
			return self;
		}
		
		// the options are optional...
		if (jQuery.isFunction(options)) {
			apiFn = options;
			options = {};
		}
		
		return init(options || {});
	}

	function View(options, apiFn) {
		var self, settings, api, created;
		
		function visibleIfParam(param, value) {
			if (typeof value === "undefined") {
				// the value doesn't matter, just that the param exists
				self.app.params.subscribe(function (newParams) {
					self.visible(newParams.hasOwnProperty(param));
				});			
			} else {
				self.app.watchParam(param, function (paramValue, allParams) {
					if (jQuery.isFunction(value)) {
						self.visible(value(paramValue, allParams));
					} else {
						self.visible(paramValue === value);
					}
				});
			}
		}
		
		function visibleIfNoParam(param) {
			self.app.params.subscribe(function (newParams) {
				self.visible(!newParams.hasOwnProperty(param));
			});			
		}
		
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
				app: null,
				
				created: ko.observable(false),
				visible: ko.observable(),
				toggled: ko.observable(),
				firstVisible: ko.observable(),
				
				visibleIfParam: visibleIfParam,
				visibleIfNoParam: visibleIfNoParam
			};
			
			self.visible.subscribe(function (isVisible) {
				var isNowVisible;
				
				// provide an observable to flag when a view is first visible
				if (isVisible) {
					self.firstVisible(true);
				}
				
				if (self.context) {
					isNowVisible = self.context.is(":visible");
					
					self.context.toggle(isVisible);
					
					// provide a observable that updates after the visibility changes so the subscribers can use the DOM
					if (isNowVisible !== isVisible) {
						function checkVisibility() {
							if (isNowVisible !== self.context.is(":visible")) {
								self.toggled(isVisible);
							}
							else {
								setTimeout(checkVisibility, 10);
							}
						}
						checkVisibility();
					}
				}
			});
			
			return self;
		}
		
		// the options are optional...
		if (jQuery.isFunction(options)) {
			apiFn = options;
			options = {};
		}
		
		return init(options || {});
	}

	return {
		App: App,
		View: View
	}

})();
