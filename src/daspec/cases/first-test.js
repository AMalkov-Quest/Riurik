riurik.engine.steps_definition = function() {
    
var FeedService = function () {
    'use strict';
	var self = this,
		messages = [],
		blacklists = {},
		feeds = [],
		allowedSending = function (user, sender) {
			return !blacklists[user] || blacklists[user].indexOf(sender) < 0;
		};
	self.addFeed = function (user) {
		if (feeds.indexOf(user)<0) {
			feeds.push(user);
		}
	};
	self.send = function (sender, message) {
		messages.push({text: message, destinations: feeds.filter(function (feed) {
			return allowedSending(feed, sender);
		})});
		return messages.length - 1;
	};
	self.getFeedsForMessageId = function (messageId) {
		return messages[messageId].destinations;
	};
	self.blockSender = function (user, blockedSender) {
		blacklists[user] = blacklists[user] || [];
		blacklists[user].push(blockedSender);
	};

};


/* global FeedService, defineStep, expect */
var lastMessageId,
    feedService = new FeedService();


// this example shows how a step can have in-line parameters and receive an attached list
// just define the matcher as if there was no list, and add an extra argument
// the list object has an items array, and an ordered flag - here we ignore the ordering
defineStep(/(.*) has blocked the following senders/, function (user, blockedList) {
	'use strict';
	feedService.addFeed(user);
	blockedList.items.forEach(function (blocked) {
		feedService.addFeed(blocked);
		feedService.blockSender(user, blocked);
	});
});

// in this example markdown spec, the two parts of the sentence about message sending are separate lines,
// so they require separate matchers. Formatted HTML joins consecutive lines, so it looks nice in the formatted output.
defineStep(/When (.*) sends a message/, function (sender) {
	'use strict';
	lastMessageId = feedService.send(sender, 'Some text');
});

// DaSpec .toEqualSet matcher checks for missing and additional items in a set
// you can use it on plain javascript arrays.
// The list object has the items in the items property, so we can compare that directly
defineStep(/appear in the feeds for/, function (expectedFeedsList) {
	'use strict';
	expect(feedService.getFeedsForMessageId(lastMessageId)).toEqualSet(expectedFeedsList);
});

};