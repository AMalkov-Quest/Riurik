defineStep(/Assuming the following inventory/, function (table) {
	'use strict';
	table.items.forEach(function (itemRow) {
		inventoryService.add(itemRow[0], parseFloat(itemRow[1]));
	});
});