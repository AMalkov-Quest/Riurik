var SalaryCalculator = function () {
    'use strict';
	var bonusTable = {
		'manager': { percent: 20, cap: 50000 },
		'lab rat': { percent: 10, cap: 20000 }
	};
	this.bonusFor = function (role, salary) {
		var bonusType = bonusTable[role.toLowerCase()];
		if (!bonusType) {
			return 0;
		}
		return Math.min(bonusType.cap, bonusType.percent * salary / 100);
	};
};

/*global defineStep, SalaryCalculator, expect*/

// each line of markdown is evaluated against a regex - and the matching parts are passed to the function

defineStep(/A (.*) with a (\d*) salary should get (\d*) as the end of year bonus/, function (role, salary, expectedBonus) {
    'use strict';
	var calculator = new SalaryCalculator();
	// this expectation is related to an argument, so it will mark only the relevant
	// part of the sentence as passed or failed
	expect(calculator.bonusFor(role, salary)).toEqual(expectedBonus);
});
defineStep(/A (.*) with a (\d*) salary should get no bonus/, function (role, salary) {
	'use strict';
	var calculator = new SalaryCalculator();
	// this will mark the entire sentence as passed or failed because
	// it's not related to a particular argument
	expect(calculator.bonusFor(role, salary)).toEqual(0);
});
