riurik.engine.steps_definition = function() {
    
function greetingFor (subject) {
    return 'Hello, ' + subject + '!';
}

// this adds a function to process any line of text matching the regular expression
// match groups in the regular expression will be passed to the function in the order from left to right
//
// So the sentence 'The right way to greet the World is "Hello, World!" will cause DaSpec to call
// the function and pass World as the subject, and Hello, World! as the expected greeting.

defineStep(/The right way to greet the (.*) is "(.*)"/, function (subject, expectedGreeting) {
    var actualResult = greetingFor(subject);

	expect(actualResult).toEqual(expectedGreeting);
});

};