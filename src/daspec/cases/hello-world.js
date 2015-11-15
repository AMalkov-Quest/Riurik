riurik.engine.steps_definition = function() {
function greetingFor (subject) {
    return 'Hello, ' + subject + '!';
}

defineStep(/The right way to greet the (.*) is "(.*)"/, function (subject, expectedGreeting) {
    var actualResult = greetingFor(subject);

	expect(actualResult).toEqual(expectedGreeting);
});
};