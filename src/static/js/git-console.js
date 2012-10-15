jQuery(function ($) {
	var OSX = {
		container: null,
		init: function () {
			$("a.github").click(function (e) {
				e.preventDefault();	

				$("#git-console").modal({
					overlayId: 'osx-overlay',
					containerId: 'osx-container',
					closeHTML: null,
					minHeight: 80,
					opacity: 65, 
					position: ['0',],
					overlayClose: true,
					onOpen: OSX.open,
					onClose: OSX.close
				});
			});

		},
		__open: function (d) {
			var self = this;
			self.container = d.container[0];
			d.overlay.fadeIn('slow', function () {
				$("#git-console", self.container).show();
				var title = $("#git-console-title", self.container);
				title.show();
				d.container.slideDown('slow', function () {
					var h = $("#git-console-data", self.container).height()
						+ title.height()
						+ 20;
					d.container.animate(
						{height: h}, 
						200,
						function () {
							$("div.close", self.container).show();
							$("#git-console-data", self.container).show();
						}
					);
				});
			})
		},
		open: function (d) {
			var self = this;
			self.container = d.container[0];
			console.log(self.container);
			d.container.slideDown('slow', function () {
				$("#git-console", self.container).show();
			});
		},
		close: function (d) {
			var self = this; // this = SimpleModal object
			d.container.animate(
				{top:"-" + (d.container.height() + 20)},
				500,
				function () {
					self.close(); // or $.modal.close();
				}
			);
		}
	};

	OSX.init();

});
