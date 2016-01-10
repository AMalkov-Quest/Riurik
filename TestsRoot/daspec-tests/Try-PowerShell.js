/* This is the system under test - the business object, production code being tested */


var InventoryService = function () {
        'use strict';
    	var items = {};
        var edge = require('edge');
        
        this.create =  edge.func('ps', function () {/*
            "PowerShell welcomes $inputFromJS on $(Get-Date)"
        */});
        
		this.add = function (item, quantity) {
			items[item] = quantity;
		};
		this.fulfill = function (orderList) {
			var result = { exception: {}, shipped: {}};
			Object.keys(orderList).forEach(function (key) {
				if (!items[key]) {
					result.exception[key] = orderList[key];
				} else if (items[key] < orderList[key]) {
					result.exception[key] = orderList[key] - items[key];
					result.shipped[key] = items[key];
					items[key] = 0;
				} else {
					result.shipped[key] = orderList[key];
					items[key] -= orderList[key];
				}
			});
			return result;
		};
	};

/*global defineStep, InventoryService, expect */
var inventoryService = new InventoryService(), orderResult;

defineStep(/Assuming the following inventory/, function (table) {
	'use strict';
    
    inventoryService.create();
    
	table.items.forEach(function (itemRow) {
		inventoryService.add(itemRow[0], parseFloat(itemRow[1]));
	});
});
defineStep(/When a customer order with the following items is processed/, function (table) {
	'use strict';
	var order = {};
	table.items.forEach(function (itemRow) {
		order[itemRow[0]] = itemRow[1];
	});
	orderResult = inventoryService.fulfill(order);
});
defineStep(/The following items will be (.*):/, function (status, tableOfItems) {
	'use strict';
	var itemsToCheck, actualTable;
	if (status == 'shipped') {
		itemsToCheck = orderResult.shipped;
	} else if (status == 'added to the exception queue') {
		itemsToCheck = orderResult.exception;
	}
	actualTable = Object.keys(itemsToCheck).map(function (key) {
		return {item: key, quantity: itemsToCheck[key]};
	});
	// .toEqualUnorderedTable compares whole tables
	expect(actualTable).toEqualUnorderedTable(tableOfItems);
});