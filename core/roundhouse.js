window.RoundHouse = (function () {

	function App(options) {
		var views, settings;
	
		settings = jQuery.extend({
		}, options);
		
		views = settings.views || [];
		
		return {
			settings: settings,
			views: views
		}
	}

	function View(options) {
	}

	return {
		App: App,
		View: View
	}

})();
