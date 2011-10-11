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
		view1 = RoundHouse.View()
		app = RoundHouse.App({
			views: {
				"#view1": view1
			}
		});
	}
});

test("check single view app", function() {
	ok(!jQuery.isEmptyObject(app.settings.views));
	ok(app.views["#view1"] === view1);
});

