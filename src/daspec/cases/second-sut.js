/* This is the system under test - the business object, production code being tested */
var InventoryService = function () {
    	'use strict';
		var items = {};
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