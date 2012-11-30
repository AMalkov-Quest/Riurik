var gitLoginDialogID = '#git-login-dialog';
var OSX = {
	container: null,
	modal: function () {
		console.log($(gitLoginDialogID).height());
		$(gitLoginDialogID).modal({
			overlayId: 'osx-overlay',
			containerId: 'osx-container',
			closeHTML: null,
			minHeight: $(gitLoginDialogID).height() + 112,
			opacity: 65, 
			position: ['0',],
			overlayClose: true,
			onOpen: OSX.open,
			onClose: OSX.close
		});
	},
	open: function (d) {
		var self = this;
		self.container = d.container[0];
		self.container.height = $(gitLoginDialogID).height();
		d.container.slideDown('slow', function () {
			$(gitLoginDialogID, self.container).show();
		});
	},
	close: function (d) {
		var self = this; // this = SimpleModal object
		console.log($(gitLoginDialogID).height())
		d.container.animate(
			{top:"-" + (d.container.height() + 20)},
			500,
			function () {
				self.close(); // or $.modal.close();
			}
		);
	}
};
