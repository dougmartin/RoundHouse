var app, view1, view2;

module("Empty app", {
	setup: function() {
		app = RoundHouse.App();
	}
});

test("check empty app", function() {
	ok(jQuery.isEmptyObject(app.views));
});

module("Single view app", {
	setup: function() {
		view1 = RoundHouse.View();
		app = RoundHouse.App({
			views: {
				view1: {
					view: view1
				}
			}
		});
	}
});

test("check single view app", function() {
	ok(!jQuery.isEmptyObject(app.settings.views));
	ok(app.views.view1 === view1);
});

module("Two view app", {
	setup: function() {
		view1 = RoundHouse.View();
		view2 = RoundHouse.View();
		app = RoundHouse.App({
			views: {
				view1: {
					view: view1
				},
				view2: {
					view: view2
				}
			}
		});
	}
});

test("check two view app", function() {
	ok(!jQuery.isEmptyObject(app.settings.views));
	ok(app.views.view1 === view1);
	ok(app.views.view2 === view2);
});
