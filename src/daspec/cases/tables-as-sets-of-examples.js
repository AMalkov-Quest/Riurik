riurik.engine.steps_definition = function() {
var VATCalculator = function () {
    'use strict';
	var euCodes =
		['BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'GR', 'ES', 'FR', 'HR', 'IT', 'CY',
		 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK',
		 'FI', 'SE', 'GB'];
	this.getDesignatedVATCountry = function (ipCountry, deliveryCountry, billingCountry) {
      var isIpEU = euCodes.indexOf(ipCountry) >= 0,
		  isDeliveryEU = euCodes.indexOf(deliveryCountry) >=0,
		  isBillingEU = euCodes.indexOf(billingCountry) >=0;
	  if (!isIpEU && !isDeliveryEU && !isBillingEU) {
		return false;
	  }
	  if (isIpEU && (ipCountry === deliveryCountry || ipCountry === billingCountry)) {
		  return ipCountry;
	  }
	  if (isBillingEU && billingCountry === deliveryCountry) {
		  return billingCountry;
	  }
	  if (isDeliveryEU) {
		  return deliveryCountry;
	  }
	  if (isBillingEU) {
		  return billingCountry;
	  }
	  if (isIpEU) {
		  return ipCountry;
	  }
	  return deliveryCountry;
	};
};

/*global defineStep, VATCalculator, expect */

var underTest = new VATCalculator();

// a step matching the header row will receive all data rows, from top to bottom, with cell values as arguments.
// this matcher expects the Use EU Vat? column to be the last in the table
defineStep(/Use EU VAT\?\s*\|$/, function (ipAddress, billing, delivery, shouldUseVAT) {
    'use strict';
	var designated = underTest.getDesignatedVATCountry(ipAddress, delivery, billing),
	usingVAT = designated ? 'Yes' : 'No';

	expect(usingVAT).toEqual(shouldUseVAT);

});

// this matcher expects the Use EU Vat? column to be followed by the Expected EU VAT Country column
defineStep(/Use EU VAT\?\s*\|\s*Expected EU VAT Country/, function (ipAddress, billing, delivery, shouldUseVAT, expectedCountry) {
	'use strict';
	var designated = underTest.getDesignatedVATCountry(ipAddress, delivery, billing),
	usingVAT = designated ? 'Yes' : 'No';

	// a table can have multiple output columns, just assert several times for different columns
	expect(usingVAT).toEqual(shouldUseVAT);
	expect(designated).toEqual(expectedCountry);
});
};
