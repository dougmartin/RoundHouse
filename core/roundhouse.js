window.RoundHouse = (function () {

	function App(options, apiFn) {
		var self, views, settings, api;
		
		function addParam(name, value) {
		}
		
		function removeParam(name) {
		}
		
		function removeParams(names) {
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
